import { createFileRoute } from "@tanstack/react-router";
import { BackendError, verifyAdminPassword } from "@/lib/product-backend.server";

export const Route = createFileRoute("/api/admin-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { password?: unknown };
          if (
            typeof body.password !== "string" ||
            body.password.length < 16 ||
            body.password.length > 256
          )
            return Response.json({ error: "Invalid password." }, { status: 401 });
          if (!(await verifyAdminPassword(body.password)))
            return Response.json({ error: "Incorrect password." }, { status: 401 });
          return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          const status = error instanceof BackendError ? error.status : 503;
          return Response.json(
            {
              error:
                error instanceof Error ? error.message : "Admin login is temporarily unavailable.",
            },
            { status, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
