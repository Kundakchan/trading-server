import { SETTING } from "..";
import { coins } from "../coins";
import { WalletCanBuyCoins, WalletGetAmount } from "./interface";

const getAmount: WalletGetAmount = ({ balance, prices, qtyStep }) => {
  const money = balance * SETTING.LEVERAGE;
  const digitsAfterDecimal = qtyStep.toString().split(".")[1]?.length ?? 0;

  return prices
    .map((price) => money / price)
    .map((coin, index) => _calculatePowerOfTwo(coin, prices.length - index))
    .map((coin) => {
      const value = Math.trunc(coin / qtyStep) * qtyStep;

      if (digitsAfterDecimal) {
        return Math.floor(value * 10) / (10 * digitsAfterDecimal);
      } else {
        return Math.floor(value);
      }
    });
};

const _calculatePowerOfTwo = (number: number, power: number): number =>
  number / 2 ** power;

const canBuyCoins: WalletCanBuyCoins = ({ amounts, symbol }) => {
  const instrumentsInfo = coins.getCoinInfo(symbol);
  if (instrumentsInfo) {
    const { lotSizeFilter } = instrumentsInfo;
    return amounts.every(
      (num) =>
        num >= parseFloat(lotSizeFilter.minOrderQty) &&
        num <= parseFloat(lotSizeFilter.maxOrderQty)
    );
  } else {
    return false;
  }
};

export const wallet = {
  getAmount,
  canBuyCoins,
};
