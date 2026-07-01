import path from "path";
import Database from "better-sqlite3";
import { getLogger } from "../index.ts";

export class DatabaseInterface {
  private db: Database.Database;
  constructor() {
    try {
      this.db = new Database(
        `${path.resolve(process.cwd())}/vending_machine.db`,
        {
          readonly: false,
          fileMustExist: false,
          timeout: 5000,
        },
      );
      this.db.pragma("journal_mode = WAL;");
      this.db.pragma("foreign_keys = ON;");
      this.createDatabaseSchema();
    } catch (e) {
      const err = new Error(`Failed to initiate database interface: ${e}`);
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    }
  }

  private createDatabaseSchema() {
    const statements = [
      `CREATE TABLE IF NOT EXISTS user_data (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        username VARCHAR(16) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS user_balances (
        balance_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        user_id INTEGER NOT NULL UNIQUE REFERENCES user_data(user_id),
        balance INTEGER DEFAULT 10000 NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS user_statistics (
        statistic_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        user_id INTEGER NOT NULL UNIQUE REFERENCES user_data(user_id),
        product_amount INTEGER DEFAULT 0 NOT NULL,
        spent_amount INTEGER DEFAULT 0 NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS product_data (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        product_name VARCHAR(128) NOT NULL,
        product_description VARCHAR(256) NOT NULL,
        stock_amount INTEGER DEFAULT 0 NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS shopping_carts (
        card_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        user_id INTEGER NOT NULL REFERENCES user_data(user_id),
        product_id INTEGER  NOT NULL REFERENCES product_data(product_id),
        amount INTEGER NOT NULL DEFAULT 1,
        UNIQUE (user_id, product_id)
      );`,
      `
      CREATE TRIGGER IF NOT EXISTS create_user_defaults
      AFTER INSERT ON user_data
      BEGIN
          INSERT INTO user_balances (user_id)
          VALUES (NEW.user_id);
          INSERT INTO user_statistics (user_id)
          VALUES (NEW.user_id);
      END;
      `,
    ];
    this.db.transaction(() => {
      for (const sql of statements) {
        this.db.prepare(sql).run();
      }
    })();
  }

  public getDatabase() {
    return this.db;
  }
}
