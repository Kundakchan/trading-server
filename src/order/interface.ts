import type {
  AccountOrderV5,
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
  (params: OrderCreateParams): Promise<OrderData[]>;
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

export interface _LocaleRemoveParams {
  orderId: string;
}
export interface _LocaleRemove {
  (params: _LocaleRemoveParams): void;
}

export interface OrderData extends Partial<AccountOrderV5> {
  orderId: string;
  symbol: string;
  placementType?: "open" | "close";
}

export interface BatchOrderRemoveResult {
  success: { code: number; msg: string; id: string }[];
  error: { code: number; msg: string; id: string }[];
}
export interface BatchOrderRemove {
  (params: OrderData[]): Promise<BatchOrderRemoveResult>;
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

export interface OrderRemove {
  (params: OrderData): Promise<void>;
}

export interface OrderLocaleSet {
  (params: OrderData): void;
}
