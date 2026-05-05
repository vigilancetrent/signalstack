"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";

type Point = { time: number; value: number };

interface Props {
  priceSeries: Point[];
  ema20Series: Point[];
}

export default function PriceChart({ priceSeries, ema20Series }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const priceRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7aa8",
        fontFamily:
          "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(28, 37, 71, 0.6)", style: LineStyle.Dotted },
        horzLines: { color: "rgba(28, 37, 71, 0.6)", style: LineStyle.Dotted },
      },
      rightPriceScale: {
        borderColor: "rgba(28, 37, 71, 0.9)",
        scaleMargins: { top: 0.1, bottom: 0.12 },
      },
      timeScale: {
        borderColor: "rgba(28, 37, 71, 0.9)",
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: {
        vertLine: {
          color: "rgba(34, 211, 238, 0.6)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0d1228",
        },
        horzLine: {
          color: "rgba(34, 211, 238, 0.6)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0d1228",
        },
      },
    });

    const priceSeries = chart.addLineSeries({
      color: "#22d3ee",
      lineWidth: 2,
      priceLineVisible: true,
      priceLineColor: "rgba(34, 211, 238, 0.55)",
      priceLineStyle: LineStyle.Dotted,
      priceLineWidth: 1,
      lastValueVisible: true,
      crosshairMarkerBorderColor: "#22d3ee",
      crosshairMarkerBackgroundColor: "#0a0e1f",
    });

    const emaSeries = chart.addLineSeries({
      color: "#a78bfa",
      lineWidth: 1,
      lineStyle: LineStyle.Solid,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    chartRef.current = chart;
    priceRef.current = priceSeries;
    emaRef.current = emaSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      priceRef.current = null;
      emaRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = priceRef.current;
    if (!series || priceSeries.length === 0) return;
    const data: LineData[] = priceSeries.map((p) => ({
      time: Math.floor(p.time) as UTCTimestamp,
      value: p.value,
    }));
    series.setData(dedupeByTime(data));
  }, [priceSeries]);

  useEffect(() => {
    const series = emaRef.current;
    if (!series) return;
    const data: LineData[] = ema20Series.map((p) => ({
      time: Math.floor(p.time) as UTCTimestamp,
      value: p.value,
    }));
    series.setData(dedupeByTime(data));
  }, [ema20Series]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="img"
      aria-label="Live price chart with EMA(20) overlay"
    />
  );
}

function dedupeByTime(data: LineData[]): LineData[] {
  if (data.length <= 1) return data;
  const out: LineData[] = [];
  let prev: number | null = null;
  for (const d of data) {
    const t = d.time as number;
    if (prev === null || t > prev) {
      out.push(d);
      prev = t;
    } else if (t === prev) {
      out[out.length - 1] = d;
    }
  }
  return out;
}
