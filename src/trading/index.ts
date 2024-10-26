import { messageToJson } from "../utils";
import {
  StartTrading,
  RecommendationsListItem,
  PlaceOrder,
  _CreatePackageOfOrders,
  _CreatePackageOfOrdersResult,
} from "./interface";
import { tickers } from "../tickers";
import { SETTING } from "..";
import chalk from "chalk";
import { price } from "../price";
import { coins } from "../coins";
import { wallet } from "../wallet";
import { OrderTimeInForceV5 } from "bybit-api";
import { order } from "../order";

const numberOfCoinsToBuy = () => SETTING.NUMBER_OF_POSITIONS;

const startTrading: StartTrading = async (message) => {
  const data = messageToJson<RecommendationsListItem[]>(message);
  for (const coin of [data[0]]) {
    await _placeOrder(coin);
  }
};

const _placeOrder: PlaceOrder = async (data) => {
  const capital = 100;
  const orders = _createPackageOfOrders({ data, capital });

  if (!orders) {
    console.log(
      chalk.yellow(
        `Не удалось сгенерировать данные для открыть ордеров: ${data.symbol}`
      )
    );
    return;
  }

  const result = order.batchCreate(orders);
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

export { startTrading };
