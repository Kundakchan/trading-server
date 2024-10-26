export interface WalletGetAmountParams {
  balance: number;
  prices: number[];
  qtyStep: number;
}
export interface WalletGetAmount {
  (params: WalletGetAmountParams): number[];
}

export interface WalletCanBuyCoinsParams {
  amounts: number[];
  symbol: string;
}
export interface WalletCanBuyCoins {
  (params: WalletCanBuyCoinsParams): boolean;
}
