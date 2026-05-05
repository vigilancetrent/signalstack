"use client";

import type { SignalEvent } from "@/lib/types";

interface Props {
  signals: SignalEvent[];
}

const KIND_META: Record<
  SignalEvent["kind"],
  { label: string; tone: string; arrow: string }
> = {
  long: {
    label: "LONG",
    tone: "text-cyber-green text-glow-green",
    arrow: "▲",
  },
  short: {
    label: "SHORT",
    tone: "text-cyber-red text-glow-red",
    arrow: "▼",
  },
  exit: {
    label: "EXIT",
    tone: "text-cyber-amber",
    arrow: "■",
  },
};

const REGIME_TONE: Record<SignalEvent["regime"], string> = {
  calm: "text-cyber-green",
  volatile: "text-cyber-red",
  trending: "text-cyber-violet",
};

function ts(t: number): string {
  const d = new Date(t);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

export default function SignalLog({ signals }: Props) {
  return (
    <div className="log-scroll max-h-64 overflow-y-auto px-4 py-3 font-mono text-xs">
      {signals.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-[11px] uppercase tracking-[0.2em] text-cyber-dim">
          awaiting first signal…
        </div>
      ) : (
        <ul className="space-y-1">
          {signals.map((s, i) => {
            const meta = KIND_META[s.kind];
            return (
              <li
                key={`${s.t}-${i}`}
                className="flex items-center gap-3 border-l-2 border-cyber-border px-3 py-1 transition-colors hover:bg-cyber-bg2/60 hover:border-cyber-cyan"
              >
                <span className="w-24 text-cyber-dim tabular-nums">
                  {ts(s.t)}
                </span>
                <span className={`w-16 ${meta.tone} tabular-nums`}>
                  {meta.arrow} {meta.label}
                </span>
                <span className="w-24 text-cyber-ink tabular-nums">
                  @ {s.price.toFixed(2)}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${REGIME_TONE[s.regime]}`}
                >
                  regime · {s.regime}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
