import { messageToJson } from "../utils";
import {
  StartTrading,
  RecommendationsListItem,
  PlaceOrder,
  _CreatePackageOfOrders,
  _CreatePackageOfOrdersResult,
  _SetTimerForOutstandingOrders,
  TimerForPendingOrders,
} from "./interface";
import { tickers } from "../tickers";
import { SETTING } from "..";
import chalk from "chalk";
import { price } from "../price";
import { coins } from "../coins";
import { wallet } from "../wallet";
import { OrderTimeInForceV5 } from "bybit-api";
import { order } from "../order";
import { position } from "../position";

const timerForPendingOrders: TimerForPendingOrders = {};

const isAvailableSlots = () => {
  return getAvailableSlots() > 0;
};

const getAvailableSlots = () => {
  const positionAllOpenSymbol = position.localeGetAllSymbol();
  const ordersAllOpenSymbol = order.localeGetAllSymbol();
  const positionAndOrders = [
    ...new Set([...positionAllOpenSymbol, ...ordersAllOpenSymbol]),
  ];
  return SETTING.NUMBER_OF_POSITIONS - positionAndOrders.length;
};

const startTrading: StartTrading = async (message) => {
  const data = messageToJson<RecommendationsListItem[]>(message);
  for (const coin of data) {
    if (!isAvailableSlots()) {
      console.log(chalk.yellow("Лимит на покупку монет превышен"), coin.symbol);
      console.log({
        position: position.localeGetAllSymbol(),
        orders: order.localeGetAllSymbol(),
      });
      continue;
    }

    if (position.localeHas(coin.symbol)) {
      console.log(
        chalk.yellow(`Данная позиция уже размещена position: ${coin.symbol}`)
      );
      continue;
    } else if (order.localeHas(coin.symbol)) {
      console.log(
        chalk.yellow(`Данная позиция уже размещена order: ${coin.symbol}`)
      );
      continue;
    } else {
      await _placeOrder(coin);
    }
  }
};

const _placeOrder: PlaceOrder = async (data) => {
  try {
    const capital = await wallet.getBalance();

    console.log(`Покупка монет осуществляется на сумму: ${capital}`);

    const orders = _createPackageOfOrders({ data, capital });

    if (!orders) {
      console.log(
        chalk.yellow(
          `Не удалось сгенерировать данные для открыть ордеров: ${data.symbol}`
        )
      );
      return;
    }

    const createdOrders = await order.batchCreate(orders);
    _setTimerForOutstandingOrders(createdOrders);
    console.log(
      chalk.green(`Ордера позиции успешно установлены: ${data.symbol}`)
    );
  } catch (error) {
    console.log(chalk.red(`Не удалось установить ордера: ${data.symbol}`));
  }
};

const _createPackageOfOrders: _CreatePackageOfOrders = ({ data, capital }) => {
  const currentPrice = tickers.get(data.symbol)?.lastPrice;
  if (!currentPrice) {
    console.log(chalk.red(`Не удалось получить текущую цену: ${data.symbol}`));
    return null;
  }
  const prices = price.generation({
    entryPrice: parseFloat(currentPrice),
    side: data.side,
    percentage: SETTING.DIFFERENCE_BETWEEN_PRICE,
  });

  const instrumentInfo = coins.getCoinInfo(data.symbol);
  const qtyStep = instrumentInfo?.lotSizeFilter?.qtyStep;
  if (!qtyStep) {
    console.log(
      chalk.red(`Не удалось получить свойство qtyStep: ${data.symbol}`)
    );
    return null;
  }

  const amounts = wallet.getAmount({
    balance: capital,
    prices,
    qtyStep: parseFloat(qtyStep),
  });

  if (!wallet.canBuyCoins({ amounts, symbol: data.symbol })) {
    console.log(
      chalk.red(`Объём закупок не удовлетворяет требованиям: ${data.symbol}`)
    );
    return null;
  }

  if (prices.length !== amounts.length) {
    console.log(
      chalk.red(
        `Некорректно рассчитана цена и количество монеты: ${data.symbol}`
      )
    );
    return null;
  }

  return prices.map((price, index) => ({
    symbol: data.symbol,
    side: data.side,
    price: price.toString(),
    qty: amounts[index].toString(),
    timeInForce: "GTC" as OrderTimeInForceV5,
    orderType: "Limit",
  }));
};

const _setTimerForOutstandingOrders: _SetTimerForOutstandingOrders = (
  orders
) => {
  orders.forEach((item, index) => {
    const timerId = setTimeout(async () => {
      if (position.localeHas(item.symbol)) {
        return;
      } else {
        await order.remove(item);
        console.log(`Ордер удалён по таймеру: ${item.symbol}`);
      }
    }, 1000 * 60 * SETTING.TIMER_ORDER_CANCEL + 1000 * index);
    timerForPendingOrders[item.orderId] = { ...item, timerId };
  });
};
const localeRemoveTimer = (symbol: string) => {
  const ids = Object.keys(timerForPendingOrders).filter(
    (item) => timerForPendingOrders[item].symbol === symbol
  );
  ids.forEach((item) => {
    clearTimeout(timerForPendingOrders[item].timerId);
    delete timerForPendingOrders[item];
  });
};

export const trading = { startTrading, getAvailableSlots, localeRemoveTimer };
