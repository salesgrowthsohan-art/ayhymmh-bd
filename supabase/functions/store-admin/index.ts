import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BUCKET = "product-media";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

type Product = {
  id: string;
  title: string;
  sku: string;
  price: number;
  images: string[];
  category: string;
  description: string;
  inStock: boolean;
  stock?: number;
  preOrder?: boolean;
};

type PublicSettings = {
  whatsapp?: string;
  deliveryCharge?: number;
  outsideDeliveryCharge?: number;
  categories?: string[];
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: CORS });

function client() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Function service unavailable");
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function constantTimeEquals(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return diff === 0;
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyAdmin(password: string) {
  if (password.length < 16 || password.length > 256) return false;
  const { data, error } = await client()
    .from("store_admin_auth")
    .select("password_hash")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data?.password_hash) return false;
  return constantTimeEquals(await sha256Hex(password), data.password_hash);
}

function publicSettings(value: unknown): PublicSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  return {
    ...(typeof source.whatsapp === "string" ? { whatsapp: source.whatsapp } : {}),
    ...(typeof source.deliveryCharge === "number" ? { deliveryCharge: source.deliveryCharge } : {}),
    ...(typeof source.outsideDeliveryCharge === "number"
      ? { outsideDeliveryCharge: source.outsideDeliveryCharge }
      : {}),
    ...(Array.isArray(source.categories) &&
    source.categories.every((item) => typeof item === "string")
      ? { categories: source.categories as string[] }
      : {}),
  };
}

function validProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    p.id.length <= 160 &&
    typeof p.title === "string" &&
    p.title.length <= 240 &&
    typeof p.sku === "string" &&
    p.sku.length <= 100 &&
    typeof p.price === "number" &&
    Number.isFinite(p.price) &&
    p.price >= 0 &&
    Array.isArray(p.images) &&
    p.images.length > 0 &&
    p.images.length <= 15 &&
    p.images.every((image) => typeof image === "string" && image.length <= 2048) &&
    typeof p.category === "string" &&
    p.category.length <= 40 &&
    typeof p.description === "string" &&
    p.description.length <= 5000 &&
    typeof p.inStock === "boolean" &&
    (p.stock === undefined ||
      (typeof p.stock === "number" && Number.isFinite(p.stock) && p.stock >= 0)) &&
    (p.preOrder === undefined || typeof p.preOrder === "boolean")
  );
}

function validPublicSettings(value: unknown): value is PublicSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  const allowed = new Set(["whatsapp", "deliveryCharge", "outsideDeliveryCharge", "categories"]);
  if (Object.keys(input).some((key) => !allowed.has(key))) return false;
  if ("whatsapp" in input && (typeof input.whatsapp !== "string" || input.whatsapp.length > 32))
    return false;
  for (const key of ["deliveryCharge", "outsideDeliveryCharge"]) {
    const item = input[key];
    if (
      key in input &&
      (typeof item !== "number" || !Number.isFinite(item) || item < 0 || item > 1_000_000)
    )
      return false;
  }
  if (
    "categories" in input &&
    (!Array.isArray(input.categories) ||
      input.categories.length > 30 ||
      !input.categories.every(
        (item) => typeof item === "string" && item.trim().length > 0 && item.length <= 40,
      ))
  )
    return false;
  return true;
}

async function handle(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY)
    return json({ error: "Private storage service is unavailable." }, 503);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return json({ error: "Invalid request." }, 400);
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  const action = typeof body.action === "string" ? body.action : "";
  const db = client();

  if (action === "get-products") {
    const { data, error } = await db
      .from("store_products")
      .select("product")
      .order("position", { ascending: true });
    if (error) return json({ error: "Catalog is temporarily unavailable." }, 503);
    return json({ products: (data ?? []).map((row) => row.product as Product) });
  }

  if (action === "get-settings") {
    const { data, error } = await db
      .from("store_settings")
      .select("settings")
      .eq("id", 1)
      .maybeSingle();
    if (error) return json({ error: "Store settings are temporarily unavailable." }, 503);
    return json({ settings: publicSettings(data?.settings) });
  }

  const password = req.headers.get("x-admin-password") ?? "";
  const authenticated = await verifyAdmin(password);
  if (!authenticated) return json({ error: "Unauthorized" }, 401);

  if (action === "login") return json({ ok: true });

  if (action === "create-upload") {
    const name = typeof body.name === "string" ? body.name : "media";
    const type = typeof body.type === "string" ? body.type : "";
    const size = Number(body.size);
    const allowed = /^(image\/(jpeg|png|webp|avif|gif)|video\/(mp4|webm|quicktime))$/i.test(type);
    const maxBytes = type.startsWith("video/") ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
    if (!allowed || !Number.isFinite(size) || size <= 0 || size > maxBytes)
      return json(
        {
          error: type.startsWith("video/")
            ? "Videos must be MP4/WebM/MOV and at most 100 MB."
            : "Images must be JPG/PNG/WebP/AVIF/GIF and at most 25 MB.",
        },
        400,
      );
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "media";
    const path = `${crypto.randomUUID()}-${safeName}`;
    const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) return json({ error: "Could not prepare media upload." }, 503);
    const { data: publicData } = db.storage.from(BUCKET).getPublicUrl(path);
    return json({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      publicUrl: publicData.publicUrl,
    });
  }

  if (action === "save-product") {
    if (!validProduct(body.product)) return json({ error: "Invalid product." }, 400);
    const product = body.product;
    const { data: existing, error: readError } = await db
      .from("store_products")
      .select("position")
      .eq("id", product.id)
      .maybeSingle();
    if (readError) return json({ error: "Could not read product position." }, 503);
    const { error } = await db
      .from("store_products")
      .upsert(
        { id: product.id, sku: product.sku, position: existing?.position ?? 0, product },
        { onConflict: "id" },
      );
    if (error) return json({ error: "Could not save product." }, 503);
    return json({ ok: true, product });
  }

  if (action === "save-products") {
    const products = body.products;
    if (!Array.isArray(products) || products.length > 500 || !products.every(validProduct))
      return json({ error: "Products must contain valid entries (maximum 500)." }, 400);
    const rows = products.map((product, position) => ({
      id: product.id,
      sku: product.sku,
      position,
      product,
    }));
    if (rows.length) {
      const { error } = await db.from("store_products").upsert(rows, { onConflict: "id" });
      if (error) return json({ error: "Could not synchronize catalog." }, 503);
    }
    return json({ ok: true, count: rows.length });
  }

  if (action === "delete-product") {
    const id = typeof body.id === "string" ? body.id : "";
    if (!id || id.length > 160) return json({ error: "A product id is required." }, 400);
    const { error } = await db.from("store_products").delete().eq("id", id);
    if (error) return json({ error: "Could not delete product." }, 503);
    return json({ ok: true });
  }

  if (action === "save-settings") {
    if (!validPublicSettings(body.settings)) return json({ error: "Invalid store settings." }, 400);
    const { data: existing, error: readError } = await db
      .from("store_settings")
      .select("settings")
      .eq("id", 1)
      .maybeSingle();
    if (readError) return json({ error: "Could not read store settings." }, 503);
    const merged = { ...publicSettings(existing?.settings), ...publicSettings(body.settings) };
    const { error } = await db.from("store_settings").upsert({ id: 1, settings: merged });
    if (error) return json({ error: "Could not save store settings." }, 503);
    return json({ ok: true, settings: merged });
  }

  if (action === "change-password") {
    const nextPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (nextPassword.length < 16 || nextPassword.length > 256)
      return json({ error: "New password must be 16–256 characters." }, 400);
    const { error } = await db.from("store_admin_auth").upsert({
      id: 1,
      password_hash: await sha256Hex(nextPassword),
      updated_at: new Date().toISOString(),
    });
    if (error) return json({ error: "Could not update admin password." }, 503);
    return json({ ok: true });
  }

  return json({ error: "Unknown action." }, 400);
}

Deno.serve(async (req: Request) => {
  try {
    return await handle(req);
  } catch {
    return json({ error: "Request failed." }, 500);
  }
});
