
import { useEffect, useState } from 'react';
import useCart from '../hooks/useCart';
import storeConfig from '../config/storeConfig';

export default function Cart({ onClose }) {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    total,
    cartCount,
  } = useCart();
  const [email, setEmail] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentState, setPaymentState] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasReference = searchParams.has('reference') || searchParams.has('trxref');
    return hasReference
      ? { status: 'verifying', message: 'Verifying your payment...' }
      : { status: 'idle', message: '' };
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) return undefined;

    let isCurrent = true;

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/paystack/verify/${encodeURIComponent(reference)}`,
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Payment could not be verified.');
        }

        if (!isCurrent) return;
        clearCart();
        setPaymentState({
          status: 'success',
          message: 'Payment confirmed. Thank you for your order.',
        });

        searchParams.delete('reference');
        searchParams.delete('trxref');
        const remainingQuery = searchParams.toString();
        window.history.replaceState(
          {},
          '',
          `${window.location.pathname}${remainingQuery ? `?${remainingQuery}` : ''}${window.location.hash}`,
        );
      } catch (error) {
        if (!isCurrent) return;
        setPaymentState({
          status: 'error',
          message: error.message || 'Payment could not be verified. Contact the store before retrying.',
        });
      }
    };

    verifyPayment();
    return () => {
      isCurrent = false;
    };
  }, [clearCart]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: storeConfig.currency,
      maximumFractionDigits: 0,
    }).format(price);

  const handlePayment = async (event) => {
    event.preventDefault();
    if (isPaying) return;

    setIsPaying(true);
    setPaymentState({ status: 'idle', message: '' });

    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: cart.map(({ id, quantity }) => ({ id, quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Could not start checkout.');
      }

      const authorizationUrl = new URL(result.authorizationUrl);
      if (
        authorizationUrl.protocol !== 'https:' ||
        authorizationUrl.hostname !== 'checkout.paystack.com'
      ) {
        throw new Error('Paystack returned an invalid checkout link.');
      }

      window.location.assign(authorizationUrl.toString());
    } catch (error) {
      setPaymentState({
        status: 'error',
        message: error.message || 'Could not connect to Paystack. Try again.',
      });
      setIsPaying(false);
    }
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside
        className="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-header">
          <div>
            <p className="eyebrow">YOUR SELECTION</p>
            <h2 id="cart-title">Shopping Cart</h2>
            <p>{cartCount} items in your cart</p>
          </div>

          <button
            type="button"
            className="cart-close-button"
            onClick={onClose}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {paymentState.message && (
          <p
            className={`payment-message payment-message-${paymentState.status}`}
            role="status"
          >
            {paymentState.message}
          </p>
        )}

        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon" aria-hidden="true">
              🛍️
            </span>
            <h3>{paymentState.status === 'success' ? 'Payment complete' : 'Your cart is empty'}</h3>
            <p>
              {paymentState.status === 'success'
                ? 'Your order has been confirmed.'
                : "Looks like you haven't found your favourites yet."}
            </p>
            <button
              type="button"
              className="checkout-button"
              onClick={onClose}
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <article className="cart-item" key={item.id}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>{formatPrice(item.price)}</p>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <strong>
                      {formatPrice(item.price * item.quantity)}
                    </strong>

                    <button
                      type="button"
                      className="remove-item-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-footer">
              <button
                type="button"
                className="clear-cart-button"
                onClick={clearCart}
              >
                Clear cart
              </button>

              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <p className="cart-note">
                Shipping and any applicable fees are calculated at checkout.
              </p>

              <form className="payment-form" onSubmit={handlePayment}>
                <label htmlFor="checkout-email">Email address</label>
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
                <button
                  type="submit"
                  className="checkout-button"
                  disabled={isPaying}
                >
                  {isPaying ? 'Connecting to Paystack...' : 'Pay with Paystack'}
                </button>
              </form>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
