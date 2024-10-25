const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

const { RestClientV5, WebsocketClient } = require("bybit-api");

import type {
  RestClientV5 as RestClientV5Type,
  WebsocketClient as WebsocketClientType,
} from "bybit-api";
import type {
  HandlersMap,
  HandlerWsParams,
  SetHandlerWSParams,
} from "./interface";

const client: RestClientV5Type = new RestClientV5({
  key: API_KEY,
  secret: API_SECRET,
  demoTrading: IS_DEVELOPMENT,
});

const ws: WebsocketClientType = new WebsocketClient({
  key: API_KEY,
  secret: API_SECRET,
  demoTrading: IS_DEVELOPMENT,
  market: "v5",
});

const HANDLERS_MAP: HandlersMap = {};
const setHandlerWS = ({ topic, handler }: SetHandlerWSParams) => {
  HANDLERS_MAP[topic] = handler;
};

ws.on("update", (message: HandlerWsParams) => {
  const handler = HANDLERS_MAP[message.topic];
  if (handler) {
    handler(message);
  }
});

export { client, ws, setHandlerWS };
