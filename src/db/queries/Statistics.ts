import { getDatabaseInterface } from "../../index.ts";


export type UserStatisticsResult = {
  username: string,
  product_amount: number;
  spent_amount: number;
};

export function selectUserStatistics():  UserStatisticsResult[] | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `SELECT us.product_amount, us.spent_amount, ud.username
    FROM user_statistics AS us
    INNER JOIN user_data AS ud
    ON us.user_id = ud.user_id;`
  );
  return stmt.all() as UserStatisticsResult[];
}

export function setUserStatistics(
  userId: number,
  productAmount: number,
  spentAmount: number,
): boolean {
  const stmt = getDatabaseInterface().getDatabase().prepare(`
    INSERT INTO user_statistics (user_id, product_amount, spent_amount)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id)
    DO UPDATE SET
      product_amount = product_amount + excluded.product_amount,
      spent_amount = spent_amount + excluded.spent_amount;
  `);
  return stmt.run(userId, productAmount, spentAmount).changes > 0;
}
