export type HandlersMapKey = "position" | "wallet" | "order" | "tickers";

export interface HandlerWsParams {
  id: string;
  topic: HandlersMapKey;
  creationTime: number;
  data: Record<string, string | number>[];
  wsKey: string;
}

export interface HandlerWs {
  (params: HandlerWsParams): void;
}
export interface HandlersMap
  extends Partial<Record<HandlersMapKey, HandlerWs>> {}

export interface SetHandlerWSParams {
  topic: HandlersMapKey;
  handler: HandlerWs;
}
