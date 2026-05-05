"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ConnectionState, SignalEvent, Tick } from "@/lib/types";
import PriceChart from "./PriceChart";
import RegimeIndicator from "./RegimeIndicator";
import MetricsPanel from "./MetricsPanel";
import SignalLog from "./SignalLog";
import StatusBar from "./StatusBar";

const MAX_HISTORY = 600;
const MAX_SIGNALS = 80;

export default function Dashboard() {
  const [tick, setTick] = useState<Tick | null>(null);
  const [history, setHistory] = useState<Tick[]>([]);
  const [signals, setSignals] = useState<SignalEvent[]>([]);
  const [status, setStatus] = useState<ConnectionState>("connecting");
  const [latency, setLatency] = useState<number>(0);
  const [tickCount, setTickCount] = useState<number>(0);

  const lastSeenAt = useRef<number>(Date.now());

  useEffect(() => {
    const es = new EventSource("/api/stream");

    es.onopen = () => setStatus("connected");
    es.onerror = () => setStatus("reconnecting");

    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as Tick;
        const now = Date.now();
        setLatency(Math.max(0, now - parsed.t));
        lastSeenAt.current = now;
        setStatus("connected");
        setTick(parsed);
        setTickCount((c) => c + 1);
        setHistory((prev) => {
          const next = prev.length >= MAX_HISTORY ? prev.slice(1) : prev.slice();
          next.push(parsed);
          return next;
        });
        if (parsed.signal) {
          setSignals((prev) => {
            const event: SignalEvent = {
              t: parsed.t,
              kind: parsed.signal!,
              price: parsed.price,
              regime: parsed.regime,
            };
            const next = [event, ...prev];
            return next.length > MAX_SIGNALS ? next.slice(0, MAX_SIGNALS) : next;
          });
        }
      } catch {
        // malformed payload — ignore
      }
    };

    return () => es.close();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastSeenAt.current > 3000 && status === "connected") {
        setStatus("reconnecting");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  const priceSeries = useMemo(
    () => history.map((h) => ({ time: h.t / 1000, value: h.price })),
    [history],
  );

  const ema20Series = useMemo(
    () =>
      history
        .filter((h) => Number.isFinite(h.indicators.ema20))
        .map((h) => ({ time: h.t / 1000, value: h.indicators.ema20 })),
    [history],
  );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
      <StatusBar
        status={status}
        latency={latency}
        ticks={tickCount}
        regime={tick?.regime ?? null}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="panel panel-corner glow-cyan lg:col-span-2 overflow-hidden">
          <header className="flex items-center justify-between border-b border-cyber-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyber-dim">
            <span>
              <span className="text-cyber-cyan text-glow-cyan">price</span>{" "}
              · QF/USD · 1s
            </span>
            <span className="hidden sm:inline">
              {tick ? `last ${tick.price.toFixed(2)}` : "—"}
            </span>
          </header>
          <div className="h-[420px] sm:h-[460px]">
            <PriceChart priceSeries={priceSeries} ema20Series={ema20Series} />
          </div>
        </section>

        <section className="panel panel-corner glow-violet flex flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-cyber-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyber-dim">
            <span>
              <span className="text-cyber-violet text-glow-violet">metrics</span>
            </span>
            <RegimeIndicator regime={tick?.regime ?? null} compact />
          </header>
          <div className="flex-1 p-4">
            <MetricsPanel tick={tick} history={history} />
          </div>
        </section>
      </div>

      <section className="panel panel-corner glow-magenta overflow-hidden">
        <header className="flex items-center justify-between border-b border-cyber-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyber-dim">
          <span>
            <span className="text-cyber-magenta text-glow-magenta">signal log</span>{" "}
            · {signals.length} events
          </span>
          <span className="hidden sm:inline">cusum &gt; threshold · regime shift</span>
        </header>
        <SignalLog signals={signals} />
      </section>
    </div>
  );
}
