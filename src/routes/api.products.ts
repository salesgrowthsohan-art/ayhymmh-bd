import { createFileRoute } from "@tanstack/react-router";
import {
  authorized,
  backendReady,
  deleteProduct,
  listProducts,
  saveProduct,
  saveProducts,
} from "@/lib/product-backend.server";
import type { Product } from "@/lib/store";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const configuredError = () =>
  json(
    { error: "Shared catalog is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
    503,
  );
const validProduct = (value: unknown): value is Product => {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Product>;
  return (
    typeof p.id === "string" &&
    typeof p.title === "string" &&
    typeof p.sku === "string" &&
    typeof p.price === "number" &&
    Array.isArray(p.images) &&
    p.images.length <= 15 &&
    p.images.every((image) => typeof image === "string") &&
    typeof p.category === "string" &&
    typeof p.description === "string" &&
    typeof p.inStock === "boolean"
  );
};

export const Route = createFileRoute("/api/products")({
  server: {
    handlers: {
      GET: async () => {
        if (!backendReady()) return configuredError();
        try {
          return json({ products: await listProducts() });
        } catch (error) {
          console.error("Catalog read failed", error);
          return json({ error: "Catalog is temporarily unavailable." }, 503);
        }
      },
      POST: async ({ request }) => {
        if (!backendReady()) return configuredError();
        if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
        try {
          const body = (await request.json()) as { product?: unknown; products?: unknown };
          if (Array.isArray(body.products)) {
            if (body.products.length > 500 || !body.products.every(validProduct))
              return json({ error: "Products must contain valid entries (maximum 500)." }, 400);
            await saveProducts(body.products);
            return json({ ok: true, count: body.products.length });
          }
          if (!validProduct(body.product))
            return json({ error: "A valid product is required (up to 15 media URLs)." }, 400);
          await saveProduct(body.product);
          return json({ ok: true, product: body.product });
        } catch (error) {
          console.error("Catalog write failed", error);
          return json({ error: "Could not save product." }, 500);
        }
      },
      DELETE: async ({ request }) => {
        if (!backendReady()) return configuredError();
        if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
        const key = new URL(request.url).searchParams.get("id");
        if (!key || key.length > 160)
          return json({ error: "A product id or SKU is required." }, 400);
        try {
          await deleteProduct(key);
          return json({ ok: true });
        } catch (error) {
          console.error("Catalog delete failed", error);
          return json({ error: "Could not delete product." }, 500);
        }
      },
    },
  },
});
