/**
 * Streaming, single-pass technical indicators.
 *
 * Each factory returns an object with an `update(value)` method that
 * folds the new value into internal state and returns the current
 * indicator reading (or `null` while warming up).
 */

export interface Indicator<T = number> {
  update(value: number): T | null;
}

/* ---------------- EMA ---------------- */

export function createEMA(period: number): Indicator {
  if (period < 1) throw new Error("EMA period must be >= 1");
  const k = 2 / (period + 1);
  let ema: number | null = null;
  let warmup = 0;
  let warmupSum = 0;
  return {
    update(value: number): number | null {
      if (!Number.isFinite(value)) return ema;
      if (ema === null) {
        warmup += 1;
        warmupSum += value;
        if (warmup >= period) {
          ema = warmupSum / period;
          return ema;
        }
        return null;
      }
      ema = value * k + ema * (1 - k);
      return ema;
    },
  };
}

/* ---------------- RSI (Wilder) ---------------- */

export function createRSI(period: number): Indicator {
  if (period < 2) throw new Error("RSI period must be >= 2");
  let prev: number | null = null;
  let avgGain: number | null = null;
  let avgLoss: number | null = null;
  let warmupGain = 0;
  let warmupLoss = 0;
  let count = 0;

  return {
    update(value: number): number | null {
      if (!Number.isFinite(value)) return null;
      if (prev === null) {
        prev = value;
        return null;
      }
      const change = value - prev;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;
      prev = value;
      count += 1;

      if (avgGain === null || avgLoss === null) {
        warmupGain += gain;
        warmupLoss += loss;
        if (count >= period) {
          avgGain = warmupGain / period;
          avgLoss = warmupLoss / period;
        } else {
          return null;
        }
      } else {
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
      }

      if (avgLoss === 0) return 100;
      const rs = avgGain / avgLoss;
      return 100 - 100 / (1 + rs);
    },
  };
}

/* ---------------- Realised Vol ---------------- */

export function createRealisedVol(window: number): Indicator {
  if (window < 2) throw new Error("Realised vol window must be >= 2");
  const returns: number[] = [];
  let prev: number | null = null;
  return {
    update(value: number): number | null {
      if (!Number.isFinite(value) || value <= 0) return null;
      if (prev === null) {
        prev = value;
        return null;
      }
      const r = Math.log(value / prev);
      prev = value;
      returns.push(r);
      if (returns.length > window) returns.shift();
      if (returns.length < window) return null;
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      let sse = 0;
      for (const x of returns) sse += (x - mean) * (x - mean);
      return Math.sqrt(sse / (returns.length - 1));
    },
  };
}

/* ---------------- CUSUM ---------------- */

export interface CUSUM {
  update(value: number): number;
  updateWithBreach(value: number): { value: number; breach: 1 | -1 | 0 };
}

export function createCUSUM(threshold: number, drift: number): CUSUM {
  let prev: number | null = null;
  let posCusum = 0;
  let negCusum = 0;
  let lastDisplay = 0;

  function step(value: number): { value: number; breach: 1 | -1 | 0 } {
    if (!Number.isFinite(value) || value <= 0) {
      return { value: lastDisplay, breach: 0 };
    }
    if (prev === null) {
      prev = value;
      return { value: 0, breach: 0 };
    }
    const ret = Math.log(value / prev);
    prev = value;

    posCusum = Math.max(0, posCusum + ret - drift);
    negCusum = Math.min(0, negCusum + ret + drift);

    let breach: 1 | -1 | 0 = 0;
    if (posCusum >= threshold) {
      breach = 1;
      posCusum = 0;
    } else if (negCusum <= -threshold) {
      breach = -1;
      negCusum = 0;
    }
    lastDisplay = posCusum + negCusum;
    return { value: lastDisplay, breach };
  }

  return {
    update(value: number) {
      return step(value).value;
    },
    updateWithBreach(value: number) {
      return step(value);
    },
  };
}
