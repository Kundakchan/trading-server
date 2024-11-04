import { SETTING } from "..";
import { client } from "../client";
import { coins } from "../coins";
import { trading } from "../trading";
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

const getWallet = async () => {
  try {
    const { retMsg, result } = await client.getWalletBalance({
      accountType: "UNIFIED",
      coin: "USDT",
    });

    if (retMsg !== "OK") {
      throw new Error(`Не удалось получить данные кошелька: ${retMsg}`);
    }

    return result.list[0];
  } catch (error) {
    throw error;
  }
};

const getBalance = async () => {
  try {
    const { totalMarginBalance } = await getWallet();

    if (totalMarginBalance) {
      return (
        parseFloat(totalMarginBalance) /
        SETTING.PART_OF_BALANCE /
        SETTING.NUMBER_OF_POSITIONS
      );
    } else {
      return 0;
    }
  } catch (error) {
    throw error;
  }
};

export const wallet = {
  getBalance,
  getWallet,
  getAmount,
  canBuyCoins,
};
