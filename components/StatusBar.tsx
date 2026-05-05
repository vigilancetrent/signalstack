"use client";

import { useEffect, useState } from "react";
import type { ConnectionState, Regime } from "@/lib/types";

interface Props {
  status: ConnectionState;
  latency: number;
  ticks: number;
  regime: Regime | null;
}

const STATUS_META: Record<
  ConnectionState,
  { label: string; dot: string; tone: string; glow: string }
> = {
  connecting: {
    label: "CONNECTING",
    dot: "bg-cyber-amber",
    tone: "text-cyber-amber",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.5)]",
  },
  connected: {
    label: "CONNECTED",
    dot: "bg-cyber-green",
    tone: "text-cyber-green text-glow-green",
    glow: "shadow-glow-green",
  },
  reconnecting: {
    label: "RECONNECTING",
    dot: "bg-cyber-red",
    tone: "text-cyber-red text-glow-red",
    glow: "shadow-glow-red",
  },
};

function clock(d: Date): string {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}Z`;
}

export default function StatusBar({ status, latency, ticks, regime }: Props) {
  const meta = STATUS_META[status];
  const [now, setNow] = useState<string>(() => clock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(clock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="panel panel-corner glow-cyan flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 font-mono text-xs animate-flicker">
      <div className="flex items-center gap-3">
        <span className="text-cyber-cyan text-glow-cyan tracking-[0.3em] text-sm sm:text-base">
          signalstack
        </span>
        <span className="text-cyber-dim">//</span>
        <span className="text-cyber-violet text-glow-violet uppercase tracking-[0.25em]">
          live
        </span>
      </div>

      <div className="hidden flex-1 items-center justify-center gap-6 sm:flex">
        <Metric label="utc" value={now} tone="text-cyber-ink" />
        <Metric
          label="latency"
          value={`${latency.toString().padStart(2, "0")}ms`}
          tone={
            latency < 250
              ? "text-cyber-green text-glow-green"
              : latency < 600
                ? "text-cyber-amber"
                : "text-cyber-red text-glow-red"
          }
        />
        <Metric
          label="ticks"
          value={ticks.toLocaleString()}
          tone="text-cyber-cyan"
        />
        <Metric
          label="regime"
          value={regime ? regime.toUpperCase() : "—"}
          tone={
            regime === "calm"
              ? "text-cyber-green"
              : regime === "volatile"
                ? "text-cyber-red"
                : regime === "trending"
                  ? "text-cyber-violet"
                  : "text-cyber-dim"
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${meta.dot} ${meta.glow} animate-pulse-slow`}
          aria-hidden
        />
        <span className={`uppercase tracking-[0.25em] ${meta.tone}`}>
          {meta.label}
        </span>
      </div>
    </header>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] uppercase tracking-[0.25em] text-cyber-dim">
        {label}
      </span>
      <span className={`tabular-nums ${tone}`}>{value}</span>
    </div>
  );
}
