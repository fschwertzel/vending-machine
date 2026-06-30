import { getDatabaseInterface } from "../../index.ts";

export interface UserData {
  id: number;
  username: string;
  created_at: string;
}

export function insertUserData(username: string): UserData | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO user_data (username) VALUES (?) RETURNING *;",
  );
  return stmt.get(username) as UserData | undefined;
}

export function selectUserData(username: string): UserData | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare("SELECT * FROM user_data WHERE username = ?");
  return stmt.get(username) as UserData | undefined;
}
