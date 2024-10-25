import { MessageToJson } from "./interface";

const messageToJson: MessageToJson = (data) => JSON.parse(data.toString());

export { messageToJson };
