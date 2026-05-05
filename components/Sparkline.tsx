"use client";

import { useMemo } from "react";

type Tone = "cyan" | "violet" | "magenta" | "green" | "red" | "ink";

interface Props {
  values: number[];
  tone?: Tone;
  fixedDomain?: [number, number];
  height?: number;
}

const TONE_STROKE: Record<Tone, string> = {
  cyan: "#22d3ee",
  violet: "#a78bfa",
  magenta: "#f0abfc",
  green: "#4ade80",
  red: "#f87171",
  ink: "#cbd5ff",
};

export default function Sparkline({
  values,
  tone = "cyan",
  fixedDomain,
  height = 28,
}: Props) {
  const { path, area, last, lastY, viewW, viewH } = useMemo(() => {
    const W = 200;
    const H = height;
    if (values.length < 2) {
      return {
        path: "",
        area: "",
        last: null as number | null,
        lastY: H / 2,
        viewW: W,
        viewH: H,
      };
    }
    const lo = fixedDomain ? fixedDomain[0] : Math.min(...values);
    const hi = fixedDomain ? fixedDomain[1] : Math.max(...values);
    const span = hi - lo || 1;
    const stepX = W / (values.length - 1);

    let d = "";
    let lastY = H / 2;
    values.forEach((v, i) => {
      const x = i * stepX;
      const y = H - ((v - lo) / span) * (H - 4) - 2;
      d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      if (i === values.length - 1) lastY = y;
    });

    const lastValue = values[values.length - 1] ?? null;
    const areaPath = `${d} L ${W} ${H} L 0 ${H} Z`;

    return { path: d, area: areaPath, last: lastValue, lastY, viewW: W, viewH: H };
  }, [values, fixedDomain, height]);

  const stroke = TONE_STROKE[tone];
  const gradId = `spark-grad-${tone}`;

  if (!path) {
    return (
      <div
        className="h-7 w-full rounded-sm border border-dashed border-cyber-border"
        aria-hidden
      />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="none"
      className="h-7 w-full"
      role="img"
      aria-label={`Sparkline last value ${last?.toFixed(2) ?? ""}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={viewW}
        cy={lastY}
        r={1.8}
        fill={stroke}
        style={{ filter: `drop-shadow(0 0 3px ${stroke})` }}
      />
    </svg>
  );
}
