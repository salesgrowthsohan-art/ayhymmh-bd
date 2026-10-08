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

## Before launch

Replace `YOUR STORE NAME` and each `TODO:` SEO text in `src/routes`. Replace `/social-preview-placeholder.svg` and `/favicon.svg` with your approved production social image and favicon.
