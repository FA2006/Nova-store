import dotenv from 'dotenv';
import express from 'express';
import process from 'node:process';
import storeConfig from './src/config/storeConfig.js';
import products from './src/data/products.js';

dotenv.config({ path: '.env.local' });

const app = express();
const port = Number(process.env.API_PORT || 3001);

app.use(express.json({ limit: '16kb' }));

function hasPaystackKey(response) {
  if (process.env.PAYSTACK_SECRET_KEY) return true;

  response.status(503).json({
    message:
      'Payment service is not configured. Set PAYSTACK_SECRET_KEY in .env.local.',
  });

  return false;
}

function getCallbackUrl(request) {
  if (process.env.STORE_FRONTEND_URL) {
    return new URL('/', process.env.STORE_FRONTEND_URL).toString();
  }

  try {
    const origin = new URL(request.get('origin'));

    if (
      origin.protocol === 'http:' &&
      ['localhost', '127.0.0.1'].includes(origin.hostname)
    ) {
      return new URL('/', origin).toString();
    }
  } catch {
    // Use the default local frontend URL below.
  }

  return 'http://localhost:5173/';
}

function calculateOrder(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return null;
  }

  const normalizedItems = [];
  let totalNaira = 0;

  for (const item of items) {
    const product = products.find(
      (entry) => entry.id === Number(item?.id)
    );

    const quantity = Number(item?.quantity);

    if (
      !product ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return null;
    }

    normalizedItems.push({
      id: product.id,
      quantity,
    });

    totalNaira += product.price * quantity;
  }

  const amountKobo = totalNaira * 100;

  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    return null;
  }

  return {
    items: normalizedItems,
    amountKobo,
  };
}

// Initialize a Paystack transaction.
app.post('/api/paystack/initialize', async (request, response) => {
  if (!hasPaystackKey(response)) return;

  const email =
    typeof request.body?.email === 'string'
      ? request.body.email.trim()
      : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({
      message: 'Enter a valid email address.',
    });

    return;
  }

  const order = calculateOrder(request.body?.items);

  if (!order) {
    response.status(400).json({
      message: 'Your cart is empty or invalid.',
    });

    return;
  }

  try {
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: String(order.amountKobo),
          currency: storeConfig.currency,
          callback_url: getCallbackUrl(request),
          metadata: {
            store_id: 'nova-store',
            cart_items: order.items,
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    const result = await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !result.status ||
      !result.data?.authorization_url
    ) {
      response.status(502).json({
        message: 'Could not start Paystack checkout.',
      });

      return;
    }

    response.json({
      authorizationUrl: result.data.authorization_url,
    });
  } catch {
    response.status(502).json({
      message: 'Paystack could not be reached. Try again.',
    });
  }
});

// Verify a Paystack transaction.
app.get('/api/paystack/verify/:reference', async (request, response) => {
  if (!hasPaystackKey(response)) return;

  const { reference } = request.params;

  if (!/^[A-Za-z0-9=._-]{1,100}$/.test(reference)) {
    response.status(400).json({
      message: 'Invalid payment reference.',
    });

    return;
  }

  try {
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    const result = await paystackResponse.json();
    const transaction = result.data;

    if (!paystackResponse.ok || !result.status || !transaction) {
      response.status(502).json({
        message: 'Could not verify the Paystack payment.',
      });

      return;
    }

    let metadata = transaction.metadata;

    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        metadata = null;
      }
    }

    const order = calculateOrder(metadata?.cart_items);

    if (
      !order ||
      metadata?.store_id !== 'nova-store' ||
      transaction.reference !== reference
    ) {
      response.status(404).json({
        message:
          'This payment reference does not belong to a valid Nova Store order.',
      });

      return;
    }

    const isSuccessful =
      transaction.status === 'success' &&
      transaction.amount === order.amountKobo &&
      transaction.currency === storeConfig.currency;

    if (!isSuccessful) {
      response.status(409).json({
        message:
          'Payment is not complete or the amount did not match.',
      });

      return;
    }

    response.json({
      status: 'success',
      reference,
      amount: transaction.amount,
      currency: transaction.currency,
    });
  } catch {
    response.status(502).json({
      message: 'Paystack could not be reached. Try again.',
    });
  }
});

app.listen(port, () => {
  console.log(`Paystack API listening on http://localhost:${port}`);
});
