import { client } from "../client";
import type { APIResponseV3WithTime } from "bybit-api";
import { BatchOrderCreate, OrderCreate } from "./interface";

const orders = [];
const _localeCreate = () => {};
const _localeUpdate = () => {};
const _localeRemove = () => {};
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
const remove = async () => {};

const batchCreate: BatchOrderCreate = async (orders) => {
  try {
    const data = await client.batchSubmitOrders("linear", orders);
  } catch (error) {
  } finally {
  }
};
export const order = {
  orders,
  create,
  update,
  remove,
  batchCreate,
};
