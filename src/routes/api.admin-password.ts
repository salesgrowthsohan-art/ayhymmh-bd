import { createFileRoute } from "@tanstack/react-router";
import {
  adminPasswordFromRequest,
  authorized,
  BackendError,
  changeAdminPassword,
} from "@/lib/product-backend.server";

export const Route = createFileRoute("/api/admin-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
        try {
          const body = (await request.json()) as { newPassword?: unknown };
          if (
            typeof body.newPassword !== "string" ||
            body.newPassword.length < 7 ||
            body.newPassword.length > 256
          )
            return Response.json(
              { error: "New password must be 7–256 characters." },
              { status: 400 },
            );
          await changeAdminPassword(adminPasswordFromRequest(request), body.newPassword);
          return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          const status = error instanceof BackendError ? error.status : 503;
          return Response.json(
            { error: error instanceof Error ? error.message : "Could not update admin password." },
            { status, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
