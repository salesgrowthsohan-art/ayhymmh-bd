# Store management API

The store's server routes call a Supabase Edge Function that holds all privileged database and storage access. Public catalog reads require only the site's public read path; every change requires the administrator's password in `Authorization: Bearer <admin-password>`. The password is verified server-side against a SHA-256 hash and is never stored in browser localStorage or returned by the API.

This installation does not configure a separate unattended Manus-agent token. Do not share the owner's admin password with automation.

## Read the public catalog

`GET /api/products` returns `{ "products": [...] }`. This route is public and read-only.

`GET /api/settings` returns only the public settings: WhatsApp number, inside/outside delivery fees, and product categories. It never returns admin credentials.

## Update store settings

`POST /api/settings` with the admin bearer password and `{ "settings": { ... } }` merges supplied public setting fields. Supported fields are `whatsapp`, `deliveryCharge`, `outsideDeliveryCharge`, and `categories`.

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

Admin password changes are made from the Admin page. New passwords must be 16–256 characters and are stored only as a hash.

## Create or update one product

`POST /api/products` with `Content-Type: application/json` and the admin bearer password:

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

Use accurate product details and genuine product media URLs. Up to 15 image/video URLs are accepted per product.

## Bulk import / reorder

`POST /api/products` with `{ "products": [<product>, ...] }` upserts and orders up to 500 products. It does not delete omitted rows.

## Delete

`DELETE /api/products?id=<product-id>` removes that product by its exact ID. This is irreversible; only do it when explicitly directed.

## Upload media

1. `POST /api/media-upload` with the admin bearer password and JSON `{ "name":"front.webp", "type":"image/webp", "size":12345 }`.
2. The response includes `signedUrl`, `token`, `path`, and `publicUrl`. Upload the raw file bytes to `signedUrl` using **HTTP PUT**, with `Content-Type` matching the file MIME type and header `x-upsert: false`.
3. Use `publicUrl` in the product's `images` array. Signed upload URLs expire and should not be saved.

Supported image types: JPEG, PNG, WebP, AVIF and GIF (25 MB maximum each). Supported video types: MP4, WebM and MOV/QuickTime (100 MB maximum each). The `product-media` bucket allows public reads but does not allow anonymous uploads; signed upload tickets are issued only after the server verifies the administrator password.
