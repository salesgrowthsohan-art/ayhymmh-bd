import { createFileRoute } from "@tanstack/react-router";
import {
  adminPasswordFromRequest,
  authorized,
  BackendError,
  getStoreSettings,
  saveStoreSettings,
} from "@/lib/product-backend.server";
import type { Settings } from "@/lib/store";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const statusOf = (error: unknown) => (error instanceof BackendError ? error.status : 503);
const allowedKeys = new Set(["whatsapp", "deliveryCharge", "outsideDeliveryCharge", "categories"]);
function validSettings(value: unknown): value is Partial<Settings> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value as Record<string, unknown>;
  if (Object.keys(settings).some((key) => !allowedKeys.has(key))) return false;
  if (
    "whatsapp" in settings &&
    (typeof settings["whatsapp"] !== "string" || settings["whatsapp"].length > 32)
  )
    return false;
  for (const key of ["deliveryCharge", "outsideDeliveryCharge"] as const) {
    const charge = settings[key];
    if (
      key in settings &&
      (typeof charge !== "number" || !Number.isFinite(charge) || charge < 0 || charge > 1_000_000)
    )
      return false;
  }
  if (
    "categories" in settings &&
    (!Array.isArray(settings["categories"]) ||
      settings["categories"].length > 30 ||
      !settings["categories"].every(
        (item) => typeof item === "string" && item.trim().length > 0 && item.length <= 40,
      ))
  )
    return false;
  return true;
}

export const Route = createFileRoute("/api/settings")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return json({ settings: await getStoreSettings() });
        } catch {
          return json({ error: "Store settings are temporarily unavailable." }, 503);
        }
      },
      POST: async ({ request }) => {
        if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
        try {
          const body = (await request.json()) as { settings?: unknown };
          if (!validSettings(body.settings))
            return json(
              { error: "Provide valid public settings; admin credentials are never exposed." },
              400,
            );
          const settings = await saveStoreSettings(
            body.settings,
            adminPasswordFromRequest(request),
          );
          return json({ ok: true, settings });
        } catch (error) {
          return json(
            { error: error instanceof Error ? error.message : "Could not save store settings." },
            statusOf(error),
          );
        }
      },
    },
  },
});
