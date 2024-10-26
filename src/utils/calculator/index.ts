import {
  CalculateMarkupPrice,
  CalculatePercentage,
  CalculatePnL,
  CalculatePnLPercentage,
} from "./interface";

const calculatePercentage: CalculatePercentage = ({ target, percent }) =>
  target * (percent / 100);

/**
 * Рассчитывает PnL позиции (в USDT).
 *
 * @param {number} size - Размер позиции
 * @param {number} avgPrice - Цена входа в позицию (в USDT)
 * @param {number} markPrice - Цена маркировки (в USDT)
 * @return {number} PnL позиции (в USDT)
 */
const calculatePnL: CalculatePnL = ({ size, avgPrice, markPrice }) =>
  (avgPrice - markPrice) * size;

/**
 * Рассчитывает PnL позиции (в процентах).
 *
 * @param {number} size - Размер позиции
 * @param {number} avgPrice - Цена входа в позицию (в USDT)
 * @param {number} markPrice - Цена маркировки (в USDT)
 * @param {number} leverage - Торговое плечо
 * @return {number} PnL позиции (в процентах)
 */
const calculatePnLPercentage: CalculatePnLPercentage = ({
  size,
  avgPrice,
  markPrice,
  leverage,
}) => {
  const pnl = calculatePnL({ size, avgPrice, markPrice });
  return ((pnl * leverage) / (avgPrice * size)) * 100;
};

/**
 * Рассчитывает цену маркировки на основе желаемого процента PnL.
 *
 * @param {number} avgPrice - Цена входа в позицию (в USDT)
 * @param {number} leverage - Торговое плечо
 * @param {'Buy' | 'Sell'} side - Направления позиции
 * @param {number} pnl - Желаемый процент PnL (в процентах)
 * @return {number} Цена маркировки
 */
const calculateMarkupPrice: CalculateMarkupPrice = ({
  avgPrice,
  leverage,
  side,
  pnl,
}) => {
  if (side === "Buy") {
    return avgPrice + (pnl * avgPrice) / (100 * leverage);
  } else {
    return avgPrice - (pnl * avgPrice) / (100 * leverage);
  }
};

export {
  calculatePercentage,
  calculatePnL,
  calculatePnLPercentage,
  calculateMarkupPrice,
};
