import { client } from "../client";
import type {
  APIResponseV3WithTime,
  BatchCreateOrderResultV5,
} from "bybit-api";
import {
  _AllOrderIdsFilled,
  _LocaleCreate,
  _LocaleRemove,
  BatchCancelOrdersResponse,
  BatchOrderCreate,
  BatchOrderRemove,
  BatchOrderRemoveResult,
  LocaleGet,
  OrderCreate,
  OrderData,
} from "./interface";
import chalk from "chalk";

let _data: OrderData[] = [];
const _localeCreate: _LocaleCreate = (order) => {
  _data.push(order);
};
const _localeUpdate = () => {};

const localeGet: LocaleGet = (args) => {
  return _data.filter((item) =>
    Object.entries(args).every(([key, value]) => item[key] === value)
  );
};
const _localeRemove: _LocaleRemove = (order) => {
  _data = _data.filter((item) => item.orderId !== order.orderId);
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
    const data = client.submitOrder({
      category: "linear",
      orderType,
      symbol,
      side,
      qty,
      price,
      timeInForce,
    });
  } catch (error) {
  } finally {
  }
};
const update = async () => {};

interface OrderRemove {
  (params: OrderData): Promise<void>;
}
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

const batchRemove: BatchOrderRemove = async (orders) => {
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
        _localeCreate({
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
export const order = {
  create,
  update,
  remove,
  batchCreate,
};
