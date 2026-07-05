import { selectUserBalance, updateUserBalance } from "../db/queries/Balance.ts";
import { getLanguageHandler, getLogger } from "../index.ts";

export function validateInputAmount(
  id: number,
  amount: number,
): boolean | string {
  if (amount <= 0 || !Number.isSafeInteger(amount)) {
    return getLanguageHandler().getTranslation("menu.balance.input.invalid");
  }
  if (!Number.isSafeInteger(getUserBalance(id) + amount)) {
    return getLanguageHandler().getTranslation("menu.balance.input.overflow");
  }
  return true;
}

export function getUserBalance(id: number): number {
  const userBalance = selectUserBalance(id);
  if (userBalance !== undefined) {
    return userBalance;
  }
  const err = new Error(`Failed to retrieve user balance for: ${id}`);
  getLogger().log({
    level: "error",
    message: err.message,
    exitOnError: true,
  });
  throw err;
}

export function addUserBalance(id: number, amount: number): number {
  const userBalance = getUserBalance(id);
  getLogger().log({
    level: "info",
    message: `Adding balance to user: ${id}`,
  });
  const updatedBalance = updateUserBalance(id, userBalance + amount);
  if (updatedBalance !== undefined) {
    return updatedBalance;
  }
  const err = new Error(`Failed to add ¥${amount} to user: ${id}`);
  getLogger().log({
    level: "error",
    message: err.message,
  });
  throw err;
}

export function removeUserBalance(id: number, amount: number): number {
  const userBalance = getUserBalance(id);
  getLogger().log({
    level: "info",
    message: `Removing ¥${amount} from user: ${id}`,
  });
  const proposedBalance = userBalance - amount <= 0 ? 0 : userBalance - amount;
  const updatedBalance = updateUserBalance(id, proposedBalance);
  if (updatedBalance !== undefined) {
    return updatedBalance;
  }
  const err = new Error(`Failed to remove ¥${amount} from user: ${id}`);
  getLogger().log({
    level: "error",
    message: err.message,
  });
  throw err;
}
