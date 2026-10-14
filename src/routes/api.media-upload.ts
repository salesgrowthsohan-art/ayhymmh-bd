import { createFileRoute } from "@tanstack/react-router";
import {
  adminPasswordFromRequest,
  authorized,
  BackendError,
  createMediaUpload,
} from "@/lib/product-backend.server";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const Route = createFileRoute("/api/media-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
        try {
          const body = (await request.json()) as { name?: unknown; type?: unknown; size?: unknown };
          const name = typeof body.name === "string" ? body.name : "media";
          const type = typeof body.type === "string" ? body.type : "";
          const size = Number(body.size);
          const allowed = /^(image\/(jpeg|png|webp|avif|gif)|video\/(mp4|webm|quicktime))$/i.test(
            type,
          );
          const maxBytes = type.startsWith("video/") ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
          if (!allowed || !Number.isFinite(size) || size <= 0 || size > maxBytes) {
            return json(
              {
                error: type.startsWith("video/")
                  ? "Videos must be MP4/WebM/MOV and at most 100 MB."
                  : "Images must be JPG/PNG/WebP/AVIF/GIF and at most 25 MB.",
              },
              400,
            );
          }
          const result = await createMediaUpload(
            name,
            type,
            size,
            adminPasswordFromRequest(request),
          );
          return json(result);
        } catch (error) {
          const status = error instanceof BackendError ? error.status : 503;
          return json(
            { error: error instanceof Error ? error.message : "Could not prepare media upload." },
            status,
          );
        }
      },
    },
  },
});
