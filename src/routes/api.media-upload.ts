import { createFileRoute } from "@tanstack/react-router";
import { authorized, backendReady, createMediaUpload } from "@/lib/product-backend.server";

export const Route = createFileRoute("/api/media-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!backendReady())
          return Response.json(
            { error: "Shared media storage is not configured." },
            { status: 503 },
          );
        if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
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
            return Response.json(
              {
                error: type.startsWith("video/")
                  ? "Videos must be MP4/WebM/MOV and at most 100 MB."
                  : "Images must be JPG/PNG/WebP/AVIF/GIF and at most 25 MB.",
              },
              { status: 400 },
            );
          }
          return Response.json(await createMediaUpload(name, type), {
            headers: { "Cache-Control": "no-store" },
          });
        } catch (error) {
          console.error("Media upload URL failed", error);
          return Response.json({ error: "Could not prepare media upload." }, { status: 500 });
        }
      },
    },
  },
});
