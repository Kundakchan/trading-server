import WebSocket from "ws";

const WEBSOCKET_URL = process.env.API_ANALYTICS_WEBSOCKET;
if (!WEBSOCKET_URL) throw new Error("Отсутствует адрес веб-сокета аналитики");

const ws = new WebSocket(WEBSOCKET_URL);

ws.on("error", console.error);

ws.on("open", function open() {
  ws.send("something");
});

ws.on("message", function message(data) {
  console.log("received: %s", data);
});
