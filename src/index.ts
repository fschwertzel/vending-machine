import "dotenv/config";
import winston, { Logger } from "winston";
import { VendingMachine } from "./utils/VendingMachine.ts";

const LOGGER = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "runtime_errors.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "runtime_information.log",
      level: "info",
    }),
  ],
});

export function getLogger(): Logger {
  return LOGGER;
}

new VendingMachine();
