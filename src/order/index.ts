import { client, setHandlerWS, ws } from "../client";
import type {
  AccountOrderV5,
  BatchCreateOrderResultV5,
  OrderStatusV5,
} from "bybit-api";
import {
  _AllOrderIdsFilled,
  _LocaleRemove,
  BatchCancelOrdersResponse,
  BatchOrderCreate,
  BatchOrderRemove,
  BatchOrderRemoveResult,
  LocaleGet,
  OrderCreate,
  OrderData,
  OrderLocaleSet,
  OrderRemove,
} from "./interface";
import chalk from "chalk";
import { position } from "../position";
import { calculateMarkupPrice } from "../utils";
import { SETTING } from "..";
import { Side } from "../trading/interface";

let _data: OrderData[] = [];

const _localeSet: OrderLocaleSet = (params) => {
  const index = _data.findIndex((item) => item.orderId === params.orderId);
  if (index === -1) {
    _data.push(params);
  } else {
    _data[index] = { ..._data[index], ...params };
  }
};

const localeGet: LocaleGet = (args) => {
  return _data.filter((item) =>
    Object.entries(args).every(([key, value]) => item[key] === value)
  );
};
const localeHas = (symbol) => !!localeGet({ symbol: symbol }).length;
const _localeRemove: _LocaleRemove = (params) => {
  _data = _data.filter((item) => item.orderId !== params.orderId);
};
const create: OrderCreate = async ({
  symbol,
  side,
  qty,
  price,
  orderType = "Limit",
  timeInForce = "PostOnly",
}) => {
  try {
    const { retMsg, result } = await client.submitOrder({
      category: "linear",
      orderType,
      symbol,
      side,
      qty,
      price,
      timeInForce,
    });

    if (retMsg !== "OK")
      throw new Error(`Не удалось добавить ордер: ${symbol}`);

    _localeSet({
      orderId: result.orderId,
      placementType: "close",
      symbol: symbol,
    });

    return localeGet({ symbol: symbol, orderId: result.orderId });
  } catch (error) {
    throw error;
  }
};
const update = async () => {};

const remove: OrderRemove = async (order) => {
  try {
    const { retMsg } = await client.cancelOrder({
      category: "linear",
      symbol: order.symbol,
      orderId: order.orderId,
    });

    if (retMsg !== "OK") {
      console.log(
        chalk.red(
          `Не удалось отменить ордер: ${order.symbol} - order id: ${order.orderId}, ${retMsg}`
        )
      );
    }
    _localeRemove(order);
  } catch (error) {
    console.log(
      chalk.red(
        `Не удалось отменить ордер: ${order.symbol} - order id: ${order.orderId}`
      )
    );
  }
};

const batchRemove: BatchOrderRemove = async (params) => {
  const orders = params.map((item) => ({
    orderId: item.orderId,
    symbol: item.symbol,
  }));
  try {
    const { retMsg, result, retExtInfo } = (await client.batchCancelOrders(
      "linear",
      orders
    )) as unknown as BatchCancelOrdersResponse;

    if (retMsg !== "OK") {
      throw new Error(
        `Не удалось выполнить пакетную отмену ордеров: ${retMsg}`
      );
    }

    const cancel: BatchOrderRemoveResult = {
      success: [],
      error: [],
    };

    retExtInfo.list.forEach((item, index) => {
      if (item.msg === "OK") {
        _localeRemove({ orderId: result.list[index].orderId });
        console.log(
          chalk.green(
            `Ордер успешно отменён: ${result.list[index].symbol} - order id: ${result.list[index].orderId}`
          )
        );
        cancel.success.push(result.list[index].orderId);
      } else {
        console.log(
          chalk.red(
            `Не удалось полностью выполнить отмену пакетного ордера: ${result.list[index].symbol} - order id: ${result.list[index].orderId}`
          )
        );
        cancel.error.push(result.list[index].orderId);
      }
    });
    return cancel;
  } catch (error) {
    throw error;
  }
};

const batchCreate: BatchOrderCreate = async (orders) => {
  try {
    const { retMsg, result } = await client.batchSubmitOrders("linear", orders);

    if (retMsg !== "OK")
      throw new Error(
        `Не удалось выполнить пакетное размещение ордеров: ${retMsg}`
      );

    const { list } = result as unknown as { list: BatchCreateOrderResultV5[] };

    if (!_allOrderIdsFilled(list)) {
      console.log(chalk.red("Не удалось создать все ордера"));
      await batchRemove(list);
      throw new Error("Не удалось создать все ордера");
    } else {
      list.forEach((order) => {
        _localeSet({
          orderId: order.orderId,
          placementType: "open",
          symbol: order.symbol,
        });
      });
      return localeGet({ symbol: list[0].symbol, placementType: "open" });
    }
  } catch (error) {
    throw error;
  }
};

const _allOrderIdsFilled: _AllOrderIdsFilled = (orders) => {
  return orders.every((order) => order.orderId.trim() !== "");
};

const groupOrdersRemove = async (params: string[]) => {
  try {
    for (const symbol of params) {
      const openOrders = localeGet({ symbol: symbol, placementType: "open" });
      if (!openOrders.length) continue;
      await batchRemove(openOrders);
    }
  } catch (error) {
    throw error;
  }
};

interface OrderActionsMap
  extends Partial<Record<OrderStatusV5, _LocaleRemove | OrderLocaleSet>> {}

const _actionsMap: OrderActionsMap = {
  New: _localeSet,
  PartiallyFilled: _localeSet,
  Untriggered: _localeSet,
  Rejected: _localeRemove,
  PartiallyFilledCanceled: _localeRemove,
  Filled: _localeRemove,
  Cancelled: _localeRemove,
  Triggered: _localeRemove,
  Deactivated: _localeRemove,
};

interface OrderWatchParams {
  afterFilled?: (params: AccountOrderV5[]) => void;
  beforeFilled?: (params: AccountOrderV5[]) => void;
}

const watch = (params: OrderWatchParams) => {
  setHandlerWS({
    topic: "order",
    handler: (message) => {
      const { afterFilled, beforeFilled } = params;
      const data = message.data as unknown as AccountOrderV5[];
      if (beforeFilled) {
        beforeFilled(data);
      }
      data.forEach((order) => {
        const action = _actionsMap[order.orderStatus as OrderStatusV5];
        if (action) {
          action(order);
        }
      });
      if (afterFilled) afterFilled(data);
    },
  });

  ws.subscribeV5("order", "linear");
};

const init = () => {
  watch({});
};

const getData = () => _data;

const setTakingProfit = async (params: string[]) => {
  for (const symbol of params) {
    const data = position.localeGet(symbol);

    const price = calculateMarkupPrice({
      avgPrice: parseFloat(data.avgPrice),
      leverage: parseFloat(data.leverage ?? SETTING.LEVERAGE.toString()),
      side: data.side as Side,
      pnl: SETTING.SUCCESS_CLOSED_POSITION_PNL,
    });

    try {
      await create({
        symbol: symbol,
        side: data.side === "Buy" ? "Sell" : "Buy",
        qty: data.size,
        price: price.toString(),
        orderType: "Limit",
        timeInForce: "GTC",
      });
    } catch (error) {
      console.error(error);
      continue;
    }
  }
};

export const order = {
  getData,
  create,
  update,
  remove,
  localeGet,
  localeHas,
  batchCreate,
  init,
  groupOrdersRemove,
  setTakingProfit,
};
