import { getMapStatusPayload } from "@/lib/map-features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TICK_MS = 3_000;

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let lastUpdated = "";
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );
      };

      send({ type: "connected" });

      const tick = async () => {
        if (closed) return;
        try {
          const data = await getMapStatusPayload();
          if (!data) {
            send({ type: "error", message: "unavailable" });
            return;
          }
          if (data.updatedAt !== lastUpdated) {
            lastUpdated = data.updatedAt;
            send({ type: "update", payload: data });
          } else {
            send({ type: "heartbeat", updatedAt: data.updatedAt });
          }
        } catch {
          send({ type: "error", message: "read_failed" });
        }
      };

      void tick();
      const id = setInterval(() => void tick(), TICK_MS);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(id);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
