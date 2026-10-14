# Manus AI agent product API

The site exposes a server-side product-management API for Manus agents. Set `MANUS_AGENT_API_TOKEN` only in the deployment environment, never in the browser or repository. Requests use HTTPS and the header `Authorization: Bearer <token>`.

## Read the public catalog

`GET /api/products` returns `{ "products": [...] }`. This route is public and read-only.

`GET /api/settings` returns the public settings: WhatsApp number, inside/outside delivery fees, and product categories. It never returns the admin password.

## Update store settings

`POST /api/settings` with the bearer token and `{ "settings": { ... } }` merges any supplied public setting fields. Supported fields are `whatsapp`, `deliveryCharge`, `outsideDeliveryCharge`, and `categories`. Example:

```json
{
  "settings": {
    "whatsapp": "8801630871105",
    "deliveryCharge": 70,
    "outsideDeliveryCharge": 130,
    "categories": ["flag", "keychain", "face mask", "miniature"]
  }
}
```

The browser store refreshes shared settings on load. `adminPassword` is deliberately excluded; configure the website's admin password separately to match `PRODUCT_ADMIN_API_TOKEN`.

## Create or update one product

`POST /api/products` with `Content-Type: application/json` and an authenticated bearer token:

```json
{
  "product": {
    "id": "p-new-001",
    "title": "Product name",
    "sku": "SKU-001",
    "price": 450,
    "images": ["https://<project>.supabase.co/storage/v1/object/public/product-media/photo.webp"],
    "category": "keychain",
    "description": "Accurate product description",
    "inStock": true,
    "stock": 8,
    "preOrder": false
  }
}
```

Use real product details and genuine product media URLs. Up to 15 image/video URLs are accepted per product.

## Bulk import / reorder

`POST /api/products` with `{ "products": [<product>, ...] }` upserts and orders up to 500 products. It does not delete omitted rows.

## Delete

`DELETE /api/products?id=<product-id>` removes that product by its exact ID. This is irreversible; agents should only call it when specifically directed.

## Upload media

1. `POST /api/media-upload` with the same bearer token and JSON `{ "name":"front.webp", "type":"image/webp", "size":12345 }`.
2. The response includes `signedUrl`, `token`, `path`, and `publicUrl`. POST the raw file bytes to `signedUrl` with `Content-Type` matching the file's MIME type and `x-upsert: false`.
3. Use `publicUrl` in the product's `images` array; image/video upload URLs expire and should not be saved.

Supported image types: JPEG, PNG, WebP, AVIF and GIF (25 MB maximum each). Supported video types: MP4, WebM and MOV/QuickTime (100 MB maximum each). The storage bucket and database migration must be applied before these endpoints can persist data.
