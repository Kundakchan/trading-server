import { LinearInverseInstrumentInfoV5 } from "bybit-api";

export interface CoinsData
  extends Partial<Record<string, LinearInverseInstrumentInfoV5>> {}

export interface GetCoinInfo {
  (symbol: string): LinearInverseInstrumentInfoV5 | undefined;
}
