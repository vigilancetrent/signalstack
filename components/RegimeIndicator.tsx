"use client";

import type { Regime } from "@/lib/types";

interface Props {
  regime: Regime | null;
  compact?: boolean;
}

const REGIME_META: Record<
  Regime,
  { label: string; color: string; glow: string; ring: string }
> = {
  calm: {
    label: "CALM",
    color: "bg-cyber-green",
    glow: "shadow-glow-green",
    ring: "text-cyber-green text-glow-green",
  },
  volatile: {
    label: "VOLATILE",
    color: "bg-cyber-red",
    glow: "shadow-glow-red",
    ring: "text-cyber-red text-glow-red",
  },
  trending: {
    label: "TRENDING",
    color: "bg-cyber-violet",
    glow: "shadow-glow-violet",
    ring: "text-cyber-violet text-glow-violet",
  },
};

export default function RegimeIndicator({ regime, compact = false }: Props) {
  const meta = regime ? REGIME_META[regime] : null;

  return (
    <div
      className={`flex items-center gap-2 font-mono ${
        compact ? "text-[10px]" : "text-xs"
      } uppercase tracking-[0.2em]`}
    >
      <span
        className={`inline-block rounded-full ${
          compact ? "h-2 w-2" : "h-2.5 w-2.5"
        } ${meta?.color ?? "bg-cyber-dim"} ${
          meta?.glow ?? ""
        } animate-regime-pulse`}
        aria-hidden
      />
      <span className={meta?.ring ?? "text-cyber-dim"}>
        {meta?.label ?? "—"}
      </span>
    </div>
  );
}
