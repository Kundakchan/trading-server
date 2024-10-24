import WebSocket from "ws";

// Подключаемся к WebSocket серверу
const ws = new WebSocket("ws://localhost:8080");

// Событие при успешном подключении
ws.on("open", () => {
  console.log("Соединение установлено с сервером.");
});

// Событие при получении сообщения от сервера
ws.on("message", (message: string) => {
  console.log(`Сообщение от сервера:`);
  console.log(JSON.parse(message));
});

// Событие при закрытии соединения
ws.on("close", () => {
  console.log("Соединение с сервером закрыто");
});
