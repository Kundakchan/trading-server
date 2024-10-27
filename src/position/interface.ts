import { PositionInfoParamsV5, PositionV5 } from "bybit-api";

export interface PositionGet {
  (params: PositionInfoParamsV5): Promise<PositionV5[]>;
}

export interface PositionLocalUpdate {
  (params: PositionV5[]): void;
}

export interface PositionData {
  [index: string]: PositionV5;
}

export interface PositionLocaleGet {
  (symbol: string): PositionV5;
}

export interface PositionLocaleHas {
  (symbol: string): boolean;
}
