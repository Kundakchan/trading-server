import { SETTING } from "..";
import { calculatePercentage } from "../utils";
import { PriceGeneration } from "./interface";

/**
 * @param {number} entryPrice - Текущая цена монеты
 * @param {number} side - Сторона для которой необходимо рассчитать цены
 * @param {number} percentage - Разница между ценами в процентах
 * @return {number} - Массив цен для указанного направления
 */
const generation: PriceGeneration = ({ entryPrice, side, percentage }) => {
  let multiplier = percentage;

  // const firstPrice =
  //   side === "Buy"
  //     ? entryPrice -
  //       calculatePercentage({ target: entryPrice, percent: multiplier / 5 })
  //     : entryPrice +
  //       calculatePercentage({ target: entryPrice, percent: multiplier / 5 });

  const firstPrice = entryPrice;

  const prices: number[] = Array.from({
    length: SETTING.NUMBER_OF_ORDERS,
  }).reduce<number[]>((acc, current, index) => {
    if (index === 0) {
      acc.push(firstPrice);
    } else {
      const price =
        side === "Buy"
          ? acc[index - 1] -
            calculatePercentage({ target: acc[index - 1], percent: multiplier })
          : acc[index - 1] +
            calculatePercentage({
              target: acc[index - 1],
              percent: multiplier,
            });
      multiplier =
        multiplier +
        calculatePercentage({
          target: multiplier,
          percent: SETTING.PRICE_DIFFERENCE_MULTIPLIER,
        });
      acc.push(price);
    }
    return acc;
  }, []);

  return prices;
};

export const price = {
  generation,
};
