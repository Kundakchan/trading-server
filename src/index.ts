import { analytics } from "./analytics";
import { tickers } from "./tickers";
import { coins } from "./coins";
import { position } from "./position";
import { order } from "./order";

export const SETTING = {
  LEVERAGE: 10, // Торговое плечо (число)
  FIELD: "lastPrice", // Поле, содержащее цену монеты
  TIMER_ORDER_CANCEL: 3, // Время отмены ордеров если он не выполнился (мин)
  DIFFERENCE_BETWEEN_PRICE: 5, // Разница между ценами для установки ордеров на закупку монеты (%)
  PRICE_DIFFERENCE_MULTIPLIER: 200, // На сколько процентов будет увеличен процент разницы между ценами (%)
  NUMBER_OF_POSITIONS: 10, // Количество закупаемых монет (шт)
  NUMBER_OF_ORDERS: 1, // Количество создаваемых ордеров для каждой монеты (шт)
  SUCCESS_CLOSED_POSITION_PNL: 50, // Положительный pnl при котором закрывается позиция
  PART_OF_BALANCE: 2, // Какую часть баланса использовать для торговля
  SINGLE_MODE: true, // Одиночный режим
} as const;

const app = async () => {
  try {
    await coins.init();
    tickers.init();
    position.init();
    analytics.init();
    order.init();
  } catch (error) {
    throw error;
  }
};

app();
