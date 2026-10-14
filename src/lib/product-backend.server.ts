import type { Product, Settings } from "@/lib/store";

// This is a legacy Supabase anon JWT: it is intentionally public and is only used to
// invoke the JWT-verified Edge Function. All privileged database/storage work stays there.
const SUPABASE_URL = "https://sgetgzwemvolwrorzkxq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZXRnendlbXZvbHdyb3J6a3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NjI4MTMsImV4cCI6MjEwNzUzODgxM30.9eO-Xem1AUQCQTfus_M3N8TUVL-lF6oj5X4G3KFtcIY";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/store-admin`;

export class BackendError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

export function backendReady() {
  return true;
}

export function adminPasswordFromRequest(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
}

export function authorized(request: Request) {
  return adminPasswordFromRequest(request).length >= 7;
}

async function invoke<T>(
  action: string,
  payload: Record<string, unknown> = {},
  password?: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(FUNCTION_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        ...(password ? { "x-admin-password": password } : {}),
      },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    throw new BackendError("Shared storage is temporarily unreachable.", 503);
  }
  const result = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok)
    throw new BackendError(result.error || "Shared storage request failed.", response.status);
  return result;
}

export async function verifyAdminPassword(password: string) {
  try {
    const result = await invoke<{ ok?: boolean }>("login", {}, password);
    return result.ok === true;
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) return false;
    throw error;
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  return invoke<{ ok: boolean }>("change-password", { newPassword }, currentPassword);
}

export async function listProducts(): Promise<Product[]> {
  const result = await invoke<{ products?: Product[] }>("get-products");
  return Array.isArray(result.products) ? result.products : [];
}

export async function saveProducts(products: Product[], password: string) {
  return invoke<{ ok: boolean; count: number }>("save-products", { products }, password);
}

export async function saveProduct(product: Product, password: string) {
  return invoke<{ ok: boolean; product: Product }>("save-product", { product }, password);
}

export async function deleteProduct(id: string, password: string) {
  return invoke<{ ok: boolean }>("delete-product", { id }, password);
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
  const result = await invoke<{ settings?: Partial<Settings> }>("get-settings");
  return publicSettings(result.settings ?? {});
}

export async function saveStoreSettings(settings: Partial<Settings>, password: string) {
  const result = await invoke<{ ok: boolean; settings?: Partial<Settings> }>(
    "save-settings",
    { settings: publicSettings(settings) },
    password,
  );
  return publicSettings(result.settings ?? {});
}

export async function createMediaUpload(
  name: string,
  contentType: string,
  size: number,
  password: string,
) {
  return invoke<{
    signedUrl: string;
    token: string;
    path: string;
    publicUrl: string;
  }>("create-upload", { name, type: contentType, size }, password);
}
