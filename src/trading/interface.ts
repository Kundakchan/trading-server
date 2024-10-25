export type Side = "Sell" | "Buy";

export interface RecommendationsListItem {
  symbol: string;
  value: number;
  side: Side;
}
export interface StartTrading {
  (params: Buffer): void;
}
