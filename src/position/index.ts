import { client } from "../client";
import {
  PositionData,
  PositionGet,
  PositionLocaleGet,
  PositionLocaleHas,
  PositionLocalUpdate,
} from "./interface";

let _data: PositionData = {};

const init = async () => {
  _watch();
};

const _watch = () => {
  setTimeout(async () => {
    try {
      const data = await get({ category: "linear", settleCoin: "USDT" });
      _localeUpdate(data);
    } catch (error) {
      console.error(error);
    } finally {
      _watch();
    }
  }, 0);
};

const _localeUpdate: PositionLocalUpdate = (params) => {
  _data = {};
  params.forEach((item) => {
    _data[item.symbol] = item;
  });
};

const localeGet: PositionLocaleGet = (symbol) => _data[symbol];

const localeHas: PositionLocaleHas = (symbol) => !!localeGet(symbol);
const closed = () => {};

const get: PositionGet = async (params) => {
  try {
    const { retMsg, result } = await client.getPositionInfo(params);

    if (retMsg !== "OK") {
      throw new Error(
        `Не удалось получить данные открытой позиции: ${
          params.symbol || params.baseCoin || params.settleCoin
        }, ${retMsg}`
      );
    }

    return result.list;
  } catch (error) {
    throw error;
  }
};

export const position = {
  closed,
  get,
  localeGet,
  init,
  localeHas,
};
