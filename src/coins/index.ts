import chalk from "chalk";
import { client } from "../client";

const _data = {};

const init = async () => {
  try {
    const { retMsg, result } = await client.getInstrumentsInfo({
      category: "linear",
      status: "Trading",
    });
    if (retMsg !== "OK")
      throw new Error(`Ошибка загрузки списка монет: ${retMsg}`);

    result.list.forEach((coin) => {
      if (coin.quoteCoin === "USDT") {
        _data[coin.symbol] = coin;
      }
    });

    console.log(chalk.green("Список монет успешно получен"));
  } catch (error) {
    console.log(chalk.red("Не удалось получить список монет"));
    throw error;
  }
};

const getSymbols = () => Object.keys(_data);

export const coins = {
  init,
  getSymbols,
};
