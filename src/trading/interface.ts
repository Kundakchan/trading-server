import { OrderTimeInForceV5 } from "bybit-api";
import { BatchOrderCreateParams } from "../order/interface";

export type Side = "Sell" | "Buy";

export interface RecommendationsListItem {
  symbol: string;
  value: number;
  side: Side;
}
export interface StartTrading {
  (params: Buffer): void;
}

export interface PlaceOrder {
  (data: RecommendationsListItem): Promise<void>;
}

export interface _CreatePackageOfOrdersParams {
  data: RecommendationsListItem;
  capital: number;
}
export interface _CreatePackageOfOrdersResult {
  symbol: string;
  side: Side;
  prices: number;
  amounts: number;
  timeInForce: OrderTimeInForceV5;
}
export interface _CreatePackageOfOrders {
  (params: _CreatePackageOfOrdersParams): _CreatePackageOfOrdersResult[] | null;
}
