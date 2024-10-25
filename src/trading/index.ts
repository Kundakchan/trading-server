import { StartTrading, RecommendationsListItem } from "./interface";

const startTrading: StartTrading = async (message) => {
  const recommendationsList = JSON.parse(
    message.toString()
  ) as RecommendationsListItem[];
  console.log(recommendationsList);
};

export { startTrading };
