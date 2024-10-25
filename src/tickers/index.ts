import chalk from "chalk";
import WebSocket from "ws";
import { coins } from "../coins";
import { messageToJson } from "../utils";
import { _Data, _Update, Ticker, WSTickerResult } from "./interface";

const WEBSOCKET_URL = process.env.API_PUBLIC_WEBSOCKET;
if (!WEBSOCKET_URL) throw new Error("Отсутствует адрес веб-сокета tickers");

const _data: _Data = {};

const _getSubscriptionOptions = () => {
  const args = coins.getSymbols().map((symbol) => `tickers.${symbol}`);
  const subscribe = {
    op: "subscribe",
    args: args,
  };
  return JSON.stringify(subscribe);
};

const _update: _Update = (message) => {
  const { data } = messageToJson<WSTickerResult>(message);
  if (!data) {
    console.log(chalk.red("Tickers не предоставил данные"));
    return;
  }
  _data[data.symbol] = { ..._data[data.symbol], ...data };
};

const get = (symbol: string) => _data[symbol];

const init = () => {
  const ws = new WebSocket(WEBSOCKET_URL);

  ws.on("error", (error) => {
    console.log(chalk.red("Ошибка соединения с сервером tickers:"), error);
    throw error;
  });

  ws.on("open", function open() {
    console.log(chalk.green("Успешное соединение с сервером tickers"));
    ws.send(_getSubscriptionOptions());
  });

  ws.on("message", _update);
};

export const tickers = { init, get };
