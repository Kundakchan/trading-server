import type { TickerLinearInverseV5 } from "bybit-api";

export interface Ticker extends Partial<TickerLinearInverseV5> {
  symbol: string;
}
export interface WSTickerResult {
  topic: string;
  type: string;
  data: Ticker;
  cs: number;
  ts: number;
}

export interface _Data extends Record<string, Ticker> {}

export interface _Update {
  (params: Buffer): void;
}
