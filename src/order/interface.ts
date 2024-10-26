import type {
  BatchCreateOrderResultV5,
  BatchOrderParamsV5,
  OrderParamsV5,
} from "bybit-api";

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
  (params: BatchOrderCreateParams[]): Promise<OrderData[]>;
}

export interface _AllOrderIdsFilled {
  (params: BatchCreateOrderResultV5[]): boolean;
}

export interface _LocaleCreateParams
  extends Pick<BatchCreateOrderResultV5, "orderId" | "symbol"> {
  placementType: "open" | "close";
}
export interface _LocaleCreate {
  (params: _LocaleCreateParams): void;
}
export interface _LocaleRemoveParams {
  orderId: string;
}
export interface _LocaleRemove {
  (params: _LocaleRemoveParams): void;
}

export interface OrderData extends _LocaleCreateParams {}

export interface BatchOrderRemoveResult {
  success: string[];
  error: string[];
}
export interface BatchOrderRemove {
  (params: BatchCreateOrderResultV5[]): Promise<BatchOrderRemoveResult>;
}

export interface BatchCancelOrdersResponse {
  retMsg: string;
  result: { list: BatchCreateOrderResultV5[] };
  retExtInfo: { list: { code: number; msg: string }[] };
}

export interface LocaleGet {
  (params: LocaleGetParams): OrderData[];
}
export interface LocaleGetParams {
  [key: string]: string;
}
