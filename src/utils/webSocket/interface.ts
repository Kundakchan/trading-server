export interface MessageToJson {
  <T = unknown>(data: Buffer): T;
}
