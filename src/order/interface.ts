import type { BatchOrderParamsV5, OrderParamsV5 } from "bybit-api";

export interface OrderCreateParams
  extends Pick<
    OrderParamsV5,
    "symbol" | "side" | "qty" | "price" | "orderType" | "timeInForce"
  > {}
export interface OrderCreate {
  (params: OrderCreateParams): void;
}

export interface BatchOrderCreateParams
  extends Pick<
    BatchOrderParamsV5,
    "symbol" | "side" | "orderType" | "qty" | "price" | "timeInForce"
  > {}
export interface BatchOrderCreate {
  (params: BatchOrderCreateParams[]): void;
}
