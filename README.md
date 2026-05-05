# signalstack

> Live cyberpunk dashboard for the **quantflow** ecosystem.

A real-time trading visualization demo built with Next.js 15, TypeScript, and lightweight-charts. Streams synthetic market data via Server-Sent Events with a regime-switching GBM model, streaming indicators, and a neon HUD.

```
┌─ STATUSBAR ──────────────────────────────────────┐
│ signalstack//live  latency 23ms  ● CONNECTED     │
├──────────────────────────────────────────────────┤
│ ┌──────────────────┐  ┌──────────────────┐       │
│ │  PRICE CHART     │  │  METRICS PANEL   │       │
│ │  [TV charts]     │  │  PX VOL DD       │       │
│ │                  │  │  REGIME ●        │       │
│ │                  │  │  SPARKLINES      │       │
│ └──────────────────┘  └──────────────────┘       │
│ ┌──────────────────────────────────────────────┐ │
│ │  SIGNAL LOG (scrolling)                      │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## What you'll see

- Live price tape rendered with **TradingView lightweight-charts**
- Regime classifier (calm / volatile / trending) with pulsing indicator
- Streaming EMA(20), RSI(14), realised volatility, and CUSUM signals
- Signal log of long/short/exit events as the regime shifts
- Inline SVG sparklines for at-a-glance metrics
- Cyberpunk HUD: scanlines, grid background, neon glow

## Stack

`Next.js 15` · `React 19` · `TypeScript` · `Tailwind CSS` · `lightweight-charts` · `Server-Sent Events` · `Vercel Fluid Compute`

## Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
vercel deploy
```

The SSE route runs on Fluid Compute with the Node.js runtime — no extra config required.

## Sibling repos

Part of the **quantflow** portfolio:

- [`quantflow`](https://github.com/vigilancetrent/quantflow) — backtesting engine
- [`synthflow`](https://github.com/vigilancetrent/synthflow) — synthetic data toolkit
- [`regimecast`](https://github.com/vigilancetrent/regimecast) — regime forecasting

## Swap in real data

The synthetic feed is fully isolated. To plug in a real source:

1. Replace `lib/syntheticData.ts` with a class exposing `next(): Tick`.
2. Or rewrite `app/api/stream/route.ts` to bridge a broker WebSocket into the SSE stream.
3. The UI consumes the `Tick` shape defined in `lib/types.ts` — keep that contract and nothing else changes.

## License

MIT — see [LICENSE](./LICENSE).
