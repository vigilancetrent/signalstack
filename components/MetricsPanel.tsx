"use client";

import { useMemo } from "react";
import type { Tick } from "@/lib/types";
import Sparkline from "./Sparkline";

interface Props {
  tick: Tick | null;
  history: Tick[];
}

function fmt(n: number | null | undefined, digits = 2): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

function pct(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

export default function MetricsPanel({ tick, history }: Props) {
  const stats = useMemo(() => {
    if (history.length < 2) {
      return {
        change: 0,
        changePct: 0,
        high: tick?.price ?? 0,
        low: tick?.price ?? 0,
        drawdown: 0,
        priceSpark: [] as number[],
        volSpark: [] as number[],
        rsiSpark: [] as number[],
      };
    }
    const first = history[0]!.price;
    const last = history[history.length - 1]!.price;
    let high = -Infinity;
    let low = Infinity;
    let peak = -Infinity;
    let maxDD = 0;
    for (const h of history) {
      if (h.price > high) high = h.price;
      if (h.price < low) low = h.price;
      if (h.price > peak) peak = h.price;
      const dd = peak > 0 ? (h.price - peak) / peak : 0;
      if (dd < maxDD) maxDD = dd;
    }
    return {
      change: last - first,
      changePct: first !== 0 ? (last - first) / first : 0,
      high,
      low,
      drawdown: maxDD,
      priceSpark: history.slice(-80).map((h) => h.price),
      volSpark: history
        .slice(-80)
        .map((h) =>
          Number.isFinite(h.indicators.rv) ? h.indicators.rv : 0,
        ),
      rsiSpark: history
        .slice(-80)
        .map((h) =>
          Number.isFinite(h.indicators.rsi14) ? h.indicators.rsi14 : 50,
        ),
    };
  }, [history, tick]);

  const upish = stats.changePct >= 0;

  return (
    <div className="flex h-full flex-col gap-4 font-mono">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="last" value={fmt(tick?.price)} tone="cyan" big />
        <Stat
          label="change"
          value={pct(stats.changePct)}
          tone={upish ? "green" : "red"}
          big
        />
        <Stat label="high" value={fmt(stats.high)} tone="ink" />
        <Stat label="low" value={fmt(stats.low)} tone="ink" />
        <Stat
          label="ema(20)"
          value={fmt(tick?.indicators.ema20)}
          tone="violet"
        />
        <Stat
          label="rsi(14)"
          value={fmt(tick?.indicators.rsi14, 1)}
          tone={
            tick && tick.indicators.rsi14 > 70
              ? "red"
              : tick && tick.indicators.rsi14 < 30
                ? "green"
                : "ink"
          }
        />
        <Stat
          label="r-vol"
          value={pct(tick?.indicators.rv)}
          tone="magenta"
        />
        <Stat
          label="max dd"
          value={pct(stats.drawdown)}
          tone={stats.drawdown < -0.02 ? "red" : "ink"}
        />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-3 border-t border-cyber-border pt-4">
        <SparkRow
          label="price"
          tone="cyan"
          values={stats.priceSpark}
          tail={fmt(tick?.price)}
        />
        <SparkRow
          label="r-vol"
          tone="magenta"
          values={stats.volSpark}
          tail={pct(tick?.indicators.rv)}
        />
        <SparkRow
          label="rsi"
          tone="violet"
          values={stats.rsiSpark}
          tail={fmt(tick?.indicators.rsi14, 1)}
          fixedDomain={[0, 100]}
        />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-cyber-border pt-3 text-[10px] uppercase tracking-[0.2em] text-cyber-dim">
        <span>cusum</span>
        <span className="text-cyber-amber">
          {fmt(tick?.indicators.cusum, 3)}
        </span>
      </div>
    </div>
  );
}

type Tone = "cyan" | "violet" | "magenta" | "green" | "red" | "ink";

function toneClass(tone: Tone): string {
  switch (tone) {
    case "cyan":
      return "text-cyber-cyan text-glow-cyan";
    case "violet":
      return "text-cyber-violet text-glow-violet";
    case "magenta":
      return "text-cyber-magenta text-glow-magenta";
    case "green":
      return "text-cyber-green text-glow-green";
    case "red":
      return "text-cyber-red text-glow-red";
    default:
      return "text-cyber-ink";
  }
}

function Stat({
  label,
  value,
  tone,
  big = false,
}: {
  label: string;
  value: string;
  tone: Tone;
  big?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-cyber-dim">
        {label}
      </span>
      <span
        className={`${big ? "text-xl sm:text-2xl" : "text-base"} ${toneClass(
          tone,
        )} tabular-nums`}
      >
        {value}
      </span>
    </div>
  );
}

function SparkRow({
  label,
  tone,
  values,
  tail,
  fixedDomain,
}: {
  label: string;
  tone: Tone;
  values: number[];
  tail: string;
  fixedDomain?: [number, number];
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-[10px] uppercase tracking-[0.2em] text-cyber-dim">
        {label}
      </span>
      <div className="flex-1">
        <Sparkline values={values} tone={tone} fixedDomain={fixedDomain} />
      </div>
      <span className={`w-16 text-right text-[11px] tabular-nums ${toneClass(tone)}`}>
        {tail}
      </span>
    </div>
  );
}
