import { client } from "../client";
import { order } from "../order";
import { trading } from "../trading";
import {
  PositionData,
  PositionGet,
  PositionLocaleGet,
  PositionLocaleHas,
  PositionLocalUpdate,
} from "./interface";

let _data: PositionData = {};
let _dataOld: string[] = [];

const init = async () => {
  _watch({
    beforeFilled: async (params) => {
      if (params.closed.length) {
        await order.groupOrdersRemove(params.closed);
        params.closed.forEach((symbol) => {
          _localeRemove(symbol);
          trading.localeRemoveTimer(symbol);
        });
      }

      if (params.new.length) {
        await order.setTakingProfit(params.new);
      }

      if (params.opened.length) {
        await order.updateTakingProfit(params.opened);
      }
    },
  });
};

interface PositionCheckForPosition {
  (params: { new: string[]; old: string[] }): string[];
}
const _checkForAClosedPosition: PositionCheckForPosition = (params) => {
  if (params.new.length) {
    return params.old.filter((item) => !params.new.includes(item));
  } else {
    return params.old;
  }
};
const _checkForAOpenPosition: PositionCheckForPosition = (params) => {
  return _checkForAClosedPosition({ new: params.old, old: params.new });
};

interface PositionWatchParams {
  beforeFilled?: (params: {
    new: string[];
    opened: string[];
    closed: string[];
  }) => Promise<void>;
}
const _watch = (params: PositionWatchParams) => {
  setTimeout(async () => {
    try {
      const { beforeFilled } = params;
      _dataOld = Object.keys(_data);
      const data = await get({ category: "linear", settleCoin: "USDT" });
      _localeUpdate(data);

      const positions = {
        new: _checkForAOpenPosition({
          new: Object.keys(_data),
          old: _dataOld,
        }),
        opened: Object.keys(_data),
        closed: _checkForAClosedPosition({
          new: Object.keys(_data),
          old: _dataOld,
        }),
      };

      if (beforeFilled) {
        await beforeFilled(positions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      _watch(params);
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
const localeGetAllSymbol = () => Object.keys(_data);

const localeHas: PositionLocaleHas = (symbol) => !!localeGet(symbol);
const _localeRemove = (symbol: string) => {
  delete _data[symbol];
};

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
  get,
  localeGet,
  init,
  localeHas,
  localeGetAllSymbol,
};
