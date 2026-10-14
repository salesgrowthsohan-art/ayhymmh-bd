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
- `/admin` — store management and media uploads

## Shared catalog and media storage

The shop uses Supabase for its shared product catalog, public store settings, and product media. The Vercel app does **not** need a Supabase service-role key or any database write credential. It proxies requests to the `store-admin` Supabase Edge Function, where privileged database access and signed uploads stay server-side.

The Edge Function allows public, read-only catalog/settings responses. Product changes, settings changes, admin login, password updates, and signed upload-ticket creation require the administrator's password. The password hash is stored in the private `store_admin_auth` table; the password itself is never stored in the repository, Vercel variables, or browser localStorage. Actual media bytes go directly from the browser to the public-read `product-media` bucket using the short-lived signed URL; anonymous uploads are not allowed.

For a fresh Supabase setup, apply migrations in filename order and deploy `supabase/functions/store-admin/index.ts` with JWT verification enabled. Supabase supplies its service-role credential to the function runtime; do not paste it into Vercel or commit it. The existing production function and schema have already been provisioned for this shop. No manual secret setup is required in Vercel.

The owner signs in at `/admin` using the private password supplied during setup. Use the **Change admin password** section to rotate it later; new passwords must be at least 16 characters. The admin session is held only in memory and automatically expires after five minutes of inactivity.

## API

- `GET /api/products` and `GET /api/settings` expose only public catalog/settings data.
- Product, settings, password, and media-ticket writes require `Authorization: Bearer <admin-password>` and are checked by the Supabase Edge Function.
- `POST /api/media-upload` returns a short-lived signed upload URL. Upload raw file bytes to that URL with **HTTP PUT**, then use the returned public URL in the product.
- See [`docs/manus-agent-product-api.md`](docs/manus-agent-product-api.md) for request examples and limits.

Cart state remains in each visitor's browser localStorage. Public product media is served from Supabase Storage. The browser's existing catalog can be migrated with the Admin panel's cloud-sync action; sync upserts and reorders products without deleting remote rows omitted from this browser.

## Production notes

- The app is a TanStack Start SSR app and is Vercel-ready through Nitro; do not add a static SPA rewrite.
- Keep the admin password private. Do not give it to unattended automation; this installation has no separate automation token.
- `public/favicon.svg` remains the project's existing icon; social cards use the branded `public/social-preview.svg` asset.
