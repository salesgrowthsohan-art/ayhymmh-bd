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
- `/admin` — store management

## Data and integrations

Cart state remains in each visitor's browser localStorage. Product catalog and public store settings (WhatsApp contact, delivery fees, categories) load from the shared API when Supabase is configured, with the existing browser state retained as a graceful fallback. Product images/videos upload directly to Supabase Storage using short-lived signed URLs rather than being placed in localStorage or sent through the application server.

1. Copy `.env.example` to `.env` for local use and provide the server-only Supabase project URL and service-role key. Set `PRODUCT_ADMIN_API_TOKEN` to the exact admin login password configured in store settings, and set a separate long random `MANUS_AGENT_API_TOKEN`.
2. Apply `supabase/migrations/20261014000000_shared_catalog_and_media.sql` to create the shared product table and public media bucket.
3. Add these variables to the Vercel deployment environment and redeploy. Never expose or prefix the service-role key with `VITE_`.
4. Give a Manus agent the token through its secure environment and the REST contract in `docs/manus-agent-product-api.md`.

Without backend credentials, API routes return a safe unavailable response and the site continues using its browser-local fallback. Cross-browser product sharing and cloud uploads require completing the setup above.

## Production notes

- The app is a TanStack Start SSR app and is Vercel-ready through Nitro; do not add a static SPA rewrite.
- The existing admin password settings remain client-side. Use a strong `PRODUCT_ADMIN_API_TOKEN` and keep it matched to the admin login password to authorize admin writes; do not rely on the repository's demo password for production.
- `GET /api/products` and `GET /api/settings` are public; product changes, public setting changes, and media-signing operations require a bearer token. The admin password is never returned or agent-editable through these APIs. See `docs/manus-agent-product-api.md`.
- `public/favicon.svg` remains the project's existing icon; social cards now use the branded `public/social-preview.svg` asset.
