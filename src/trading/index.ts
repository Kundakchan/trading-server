import { messageToJson } from "../utils";
import { StartTrading, RecommendationsListItem } from "./interface";
import { tickers } from "../tickers";

const startTrading: StartTrading = async (message) => {
  const data = messageToJson<RecommendationsListItem[]>(message);
  data.forEach((item) => {
    console.log({
      symbol: item.symbol,
      price: tickers.get(item.symbol).lastPrice,
    });
  });
};

export { startTrading };
