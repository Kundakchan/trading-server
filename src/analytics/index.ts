import chalk from "chalk";
import WebSocket from "ws";
import { trading } from "../trading";

const WEBSOCKET_URL = process.env.API_ANALYTICS_WEBSOCKET;
if (!WEBSOCKET_URL) throw new Error("Отсутствует адрес веб-сокета аналитики");

const init = () => {
  const ws = new WebSocket(WEBSOCKET_URL);

  ws.on("error", (error) => {
    console.log(chalk.red("Ошибка соединения с сервером аналитики:"), error);
    throw error;
  });

  ws.on("open", function open() {
    console.log(chalk.green("Успешное соединение с сервером аналитики"));
  });

  ws.on("message", trading.startTrading);
};

export const analytics = { init };
