import "dotenv/config";
import winston, { Logger } from "winston";
import { VendingMachine } from "./utils/VendingMachine.ts";
import { LanguageHandler } from "./handlers/LanguageHandler.ts";
import { DatabaseInterface } from "./db/DatabaseInterface.ts";

const LOGGER = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "logs/runtime_errors.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/runtime_information.log",
      level: "info",
    }),
    new winston.transports.File({ filename: "logs/db.log", level: "info" }),
  ],
});
export function getLogger(): Logger {
  return LOGGER;
}

const LANGUAGE_PROCESSOR = new LanguageHandler();
export function getLanguageHandler(): LanguageHandler {
  return LANGUAGE_PROCESSOR;
}

const DATABASE_INTERFACE = new DatabaseInterface();
export function getDatabaseInterface() {
  return DATABASE_INTERFACE;
}

VendingMachine.create();
