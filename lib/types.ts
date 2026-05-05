export type Regime = "calm" | "volatile" | "trending";

export type SignalKind = "long" | "short" | "exit";

export type ConnectionState = "connecting" | "connected" | "reconnecting";

export interface IndicatorReadings {
  ema20: number;
  rsi14: number;
  rv: number;
  cusum: number;
}

export interface Tick {
  t: number;
  price: number;
  regime: Regime;
  indicators: IndicatorReadings;
  signal: SignalKind | null;
}

export interface SignalEvent {
  t: number;
  kind: SignalKind;
  price: number;
  regime: Regime;
}
