import { createClient } from "@supabase/supabase-js";
import type { Product, Settings } from "@/lib/store";

const url = process.env["SUPABASE_URL"];
const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const bucket = process.env["SUPABASE_MEDIA_BUCKET"] || "product-media";

export function backendReady() {
  return Boolean(url && serviceKey);
}

function supabase() {
  if (!url || !serviceKey) throw new Error("Shared product storage is not configured.");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function constantTimeEquals(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return difference === 0;
}

export function authorized(request: Request) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const allowed = [
    process.env["PRODUCT_ADMIN_API_TOKEN"],
    process.env["MANUS_AGENT_API_TOKEN"],
  ].filter((value): value is string => Boolean(value));
  return Boolean(supplied && allowed.some((token) => constantTimeEquals(supplied, token)));
}

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase()
    .from("store_products")
    .select("product")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => row.product as Product);
}

export async function saveProducts(products: Product[]) {
  const client = supabase();
  for (const [index, product] of products.entries()) {
    const { error } = await client
      .from("store_products")
      .upsert({ id: product.id, sku: product.sku, position: index, product }, { onConflict: "id" });
    if (error) throw error;
  }
}

export async function saveProduct(product: Product) {
  const client = supabase();
  const { data: existing, error: readError } = await client
    .from("store_products")
    .select("position")
    .eq("id", product.id)
    .maybeSingle();
  if (readError) throw readError;
  const position = existing?.position ?? 0;
  const { error } = await client
    .from("store_products")
    .upsert({ id: product.id, sku: product.sku, position, product }, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const client = supabase();
  const { error } = await client.from("store_products").delete().eq("id", id);
  if (error) throw error;
}

const publicSettings = (settings: Partial<Settings>) => ({
  ...(typeof settings.whatsapp === "string" ? { whatsapp: settings.whatsapp } : {}),
  ...(typeof settings.deliveryCharge === "number"
    ? { deliveryCharge: settings.deliveryCharge }
    : {}),
  ...(typeof settings.outsideDeliveryCharge === "number"
    ? { outsideDeliveryCharge: settings.outsideDeliveryCharge }
    : {}),
  ...(Array.isArray(settings.categories) ? { categories: settings.categories } : {}),
});

export async function getStoreSettings(): Promise<Partial<Settings>> {
  const { data, error } = await supabase()
    .from("store_settings")
    .select("settings")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data?.settings ? publicSettings(data.settings as Partial<Settings>) : {};
}

export async function saveStoreSettings(settings: Partial<Settings>) {
  const client = supabase();
  const { data, error: readError } = await client
    .from("store_settings")
    .select("settings")
    .eq("id", 1)
    .maybeSingle();
  if (readError) throw readError;
  const merged = {
    ...publicSettings((data?.settings ?? {}) as Partial<Settings>),
    ...publicSettings(settings),
  };
  const { error } = await client.from("store_settings").upsert({ id: 1, settings: merged });
  if (error) throw error;
  return merged;
}

export async function createMediaUpload(name: string, contentType: string) {
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "media";
  const path = `${crypto.randomUUID()}-${safeName}`;
  const { data, error } = await supabase().storage.from(bucket).createSignedUploadUrl(path);
  if (error) throw error;
  const { data: publicData } = supabase().storage.from(bucket).getPublicUrl(path);
  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl: publicData.publicUrl,
    contentType,
  };
}
