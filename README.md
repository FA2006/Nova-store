# Nova Store

A responsive demo storefront built with React, Vite, and Zustand. Browse a curated product collection, filter and search items, manage a persistent shopping cart, and test checkout with Paystack.

## Features

- Browse products by category and search by name, category, or description.
- Add products to the cart, change quantities, remove items, or clear the cart.
- Cart contents persist in `localStorage` between visits.
- View item counts and a subtotal formatted in Nigerian naira (NGN).
- Responsive layout with Home, Shop, and About navigation.
- Paystack hosted checkout in test mode; the server recalculates cart totals and verifies completed payments.

## Requirements

- Node.js and npm

## Getting started

From the project directory, install dependencies and start the development server:

```sh
npm install
npm run dev
```

The root `.env.local` contains the Paystack test secret and local server settings. Keep the secret server-only: do not prefix it with `VITE_` or expose it in frontend code. The file is excluded by the `*.local` rule in `.gitignore`.

Open the local URL printed by Vite in your terminal. The `dev` command starts both Vite and the payment API; API requests are proxied to port 3001.

Paystack redirects back to the storefront, where the server verifies the reference, status, currency, and amount before the cart is cleared. The API keeps pending references in memory for local testing; production deployments should persist orders and verify payments through a webhook as well.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite and the payment API together. |
| `npm run dev:api` | Start only the payment API on port 3001. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint across the project. |

## Project structure

```text
src/
	components/  Navigation, product grid/cards, and cart UI
	config/      Store name, currency, announcement, and categories
	data/        Local product catalog
	hooks/       Shared cart selectors and actions
	store/       Zustand cart store with localStorage persistence
	App.jsx      Store page composition
	App.css      Store and component styles
	index.css    Global styles and browser defaults
server.js      Server-side Paystack initialization and verification
```

Edit `src/data/products.js` to update the product catalog and `src/config/storeConfig.js` to change store settings.
