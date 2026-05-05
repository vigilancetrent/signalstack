import type { NextRequest } from "next/server";
import { MarketSimulator } from "@/lib/syntheticData";
import type { Tick } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TICK_MS = Number(process.env.SIGNALSTACK_TICK_MS ?? 200);
const SEED = process.env.SIGNALSTACK_SEED
  ? Number(process.env.SIGNALSTACK_SEED)
  : undefined;

const encoder = new TextEncoder();

function format(tick: Tick): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(tick)}\n\n`);
}

export async function GET(req: NextRequest) {
  const sim = new MarketSimulator(SEED);
  let interval: ReturnType<typeof setInterval> | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode(`: signalstack stream open ${Date.now()}\n\n`),
      );

      try {
        controller.enqueue(format(sim.next()));
      } catch {
        /* controller may already be closed */
      }

      interval = setInterval(() => {
        try {
          controller.enqueue(format(sim.next()));
        } catch {
          if (interval) clearInterval(interval);
          if (heartbeat) clearInterval(heartbeat);
        }
      }, TICK_MS);

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
        } catch {
          if (heartbeat) clearInterval(heartbeat);
        }
      }, 15_000);

      const abort = () => {
        if (interval) clearInterval(interval);
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      req.signal.addEventListener("abort", abort);
    },
    cancel() {
      if (interval) clearInterval(interval);
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
