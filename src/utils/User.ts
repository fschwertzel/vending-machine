import type { UserData } from "../db/queries/Authentication.ts";
import {
  addUserBalance,
  getUserBalance,
  removeUserBalance,
} from "../handlers/BalanceHandler.ts";

export class User {
  private user_id: number;
  private username: string;
  private balance: number;
  constructor(userData: UserData) {
    this.user_id = userData.user_id;
    this.username = userData.username;
    this.balance = getUserBalance(userData.user_id);
  }

  public getUserID(): number {
    return this.user_id;
  }

  public getUsername(): string {
    return this.username;
  }

  public addBalance(amount: number): boolean {
    try {
      this.balance = addUserBalance(this.user_id, amount);
      return true;
    } catch (e) {
      return false;
    }
  }

  public removeBalance(amount: number): boolean {
    try {
      this.balance = removeUserBalance(this.user_id, amount);
      return true;
    } catch (e) {
      return false;
    }
  }

  public getBalance(): number {
    return this.balance;
  }
}
