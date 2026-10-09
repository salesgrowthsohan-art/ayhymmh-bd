# ayhymmh store

## Local development

Requirements: Node.js 22+.

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

This is a TanStack Start server-rendered React application built with Nitro for Vercel.

## Routes

- `/` — store catalogue
- `/product/:sku` — product details
- `/admin` — client-side store management

## Data and integrations

There are no server-side environment variables or external backend integrations configured. Product data, cart, settings, and admin state are stored in each visitor's browser localStorage. Order checkout opens WhatsApp using the store number configured in the app.

## Production notes

- The app is a TanStack Start SSR app and is Vercel-ready through Nitro; do not add a static SPA rewrite.
- Product data, cart state, settings, and the admin session currently live in each visitor's browser `localStorage`. This is suitable for a single-device prototype, not shared multi-admin production data.
- The current admin password is stored in client code and is therefore not a secure production authentication mechanism. Replace the client-side admin flow with a real backend auth system before using it for sensitive operations.
- Replace `public/social-preview-placeholder.svg` and `public/favicon.svg` with the final approved brand assets before launch.
