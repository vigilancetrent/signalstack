import {
  createCUSUM,
  createEMA,
  createRealisedVol,
  createRSI,
} from "./indicators";
import type { Regime, Tick, SignalKind } from "./types";

interface RegimeParams {
  mu: number;
  sigma: number;
  minDwell: number;
  maxDwell: number;
}

const REGIMES: Record<Regime, RegimeParams> = {
  calm: { mu: 0.00002, sigma: 0.0009, minDwell: 120, maxDwell: 280 },
  volatile: { mu: -0.00005, sigma: 0.0042, minDwell: 80, maxDwell: 200 },
  trending: { mu: 0.00045, sigma: 0.0018, minDwell: 100, maxDwell: 260 },
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-12);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export class MarketSimulator {
  private rng: () => number;
  private price: number;
  private regime: Regime;
  private dwell: number;
  private dwellTarget: number;
  private prevPrice: number | null;

  private ema20 = createEMA(20);
  private rsi14 = createRSI(14);
  private rv = createRealisedVol(30);
  private cusum = createCUSUM(0.0035, 0.0002);

  private lastSignalAt = 0;
  private stepIndex = 0;
  private trendingDirection: 1 | -1 = 1;

  constructor(seed?: number) {
    const s = seed ?? Math.floor(Math.random() * 0x7fffffff);
    this.rng = mulberry32(s);
    this.price = 100 + this.rng() * 5;
    this.regime = "calm";
    this.dwell = 0;
    this.dwellTarget = this.pickDwell(this.regime);
    this.prevPrice = null;
  }

  private pickDwell(r: Regime): number {
    const p = REGIMES[r];
    return Math.floor(p.minDwell + this.rng() * (p.maxDwell - p.minDwell));
  }

  private switchRegime(): void {
    const choices: Regime[] = (["calm", "volatile", "trending"] as Regime[])
      .filter((r) => r !== this.regime);
    let next: Regime;
    if (this.regime === "volatile" && this.rng() < 0.6) {
      next = "calm";
    } else {
      next = choices[Math.floor(this.rng() * choices.length)] ?? "calm";
    }
    this.regime = next;
    this.dwell = 0;
    this.dwellTarget = this.pickDwell(this.regime);
    if (next === "trending") {
      this.trendingDirection = this.rng() < 0.5 ? -1 : 1;
    }
  }

  next(): Tick {
    this.dwell += 1;
    this.stepIndex += 1;
    if (this.dwell >= this.dwellTarget) {
      this.switchRegime();
    }

    const params = REGIMES[this.regime];
    let drift = params.mu;
    if (this.regime === "trending") {
      drift = Math.abs(params.mu) * this.trendingDirection;
    }

    const z = gauss(this.rng);
    const fatTail = this.regime === "volatile" && this.rng() < 0.02 ? 3 : 1;
    const logRet = drift + params.sigma * z * fatTail;
    const newPrice = Math.max(1, this.price * Math.exp(logRet));
    this.prevPrice = this.price;
    this.price = newPrice;

    const ema = this.ema20.update(newPrice);
    const rsi = this.rsi14.update(newPrice);
    const rv = this.rv.update(newPrice);
    const { value: cusumValue, breach } = this.cusum.updateWithBreach(newPrice);

    const signal = this.maybeEmitSignal(rsi, breach);

    return {
      t: Date.now(),
      price: roundTo(newPrice, 4),
      regime: this.regime,
      indicators: {
        ema20: ema !== null ? roundTo(ema, 4) : Number.NaN,
        rsi14: rsi !== null ? roundTo(rsi, 2) : Number.NaN,
        rv: rv !== null ? roundTo(rv, 5) : Number.NaN,
        cusum: roundTo(cusumValue, 4),
      },
      signal,
    };
  }

  private maybeEmitSignal(
    rsi: number | null,
    cusumBreach: 1 | -1 | 0,
  ): SignalKind | null {
    if (this.stepIndex - this.lastSignalAt < 25) return null;

    let kind: SignalKind | null = null;

    if (cusumBreach === 1 && rsi !== null && rsi < 75) {
      kind = "long";
    } else if (cusumBreach === -1 && rsi !== null && rsi > 25) {
      kind = "short";
    } else if (rsi !== null && (rsi > 78 || rsi < 22)) {
      kind = "exit";
    } else if (this.regime === "volatile" && this.rng() < 0.008) {
      kind = "exit";
    }

    if (kind) this.lastSignalAt = this.stepIndex;
    return kind;
  }
}

function roundTo(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
