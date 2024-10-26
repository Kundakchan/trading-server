import { Side } from "../trading/interface";

export interface PriceGenerationParams {
  entryPrice: number;
  side: Side;
  percentage: number;
}

export interface PriceGeneration {
  (params: PriceGenerationParams): number[];
}
