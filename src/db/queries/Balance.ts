import { getDatabaseInterface } from "../../index.ts";

export function selectUserBalance(id: number): number | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    "SELECT balance FROM user_balances WHERE user_id = ?",
  );
  return stmt.get(id) as number | undefined;
}

export function updateUserBalance(
  id: number,
  balance: number,
): number | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    "UPDATE user_balances SET balance = ? WHERE user_id = ? RETURNING balance",
  );
  return stmt.get(balance, id) as number | undefined;
}
