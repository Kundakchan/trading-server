import chalk from "chalk";
import WebSocket from "ws";
import { startTrading } from "./trading";

const SETTING = {
  LEVERAGE: 10, // Торговое плечо (число)
  FIELD: "lastPrice", // Поле, содержащее цену монеты
  TIMER_ORDER_CANCEL: 1, // Время отмены ордеров если он не выполнился (мин)
  DIFFERENCE_BETWEEN_PRICE: 0.5, // Разница между ценами для установки ордеров на закупку монеты (%)
  PRICE_DIFFERENCE_MULTIPLIER: 250, // На сколько процентов будет увеличен процент разницы между ценами (%)
  NUMBER_OF_POSITIONS: 1, // Количество закупаемых монет (шт)
  NUMBER_OF_ORDERS: 5, // Количество создаваемых ордеров для каждой монеты (шт)
} as const;

const WEBSOCKET_URL = process.env.API_ANALYTICS_WEBSOCKET;
if (!WEBSOCKET_URL) throw new Error("Отсутствует адрес веб-сокета аналитики");

const ws = new WebSocket(WEBSOCKET_URL);

ws.on("error", (error) => {
  console.log(chalk.red("Ошибка соединения с сервером аналитики:"), error);
});

ws.on("open", function open() {
  console.log(chalk.green("Успешное соединение с сервером аналитики"));
});

ws.on("message", startTrading);
