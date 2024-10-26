import { Side } from "../../trading/interface";

export interface CalculatePercentage {
  (params: { target: number; percent: number }): number;
}

export interface CalculatePnL {
  (params: { size: number; avgPrice: number; markPrice: number }): number;
}

export interface CalculatePnLPercentage {
  (params: {
    size: number;
    avgPrice: number;
    markPrice: number;
    leverage: number;
  }): number;
}

export interface CalculateMarkupPrice {
  (params: {
    avgPrice: number;
    leverage: number;
    side: Side;
    pnl: number;
  }): number;
}
