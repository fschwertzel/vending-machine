import { selectUserBalance, updateUserBalance } from "../db/queries/Balance.ts";
import { getLogger } from "../index.ts";

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
  const proposedBalance = userBalance + amount;
  if (proposedBalance > Number.MAX_SAFE_INTEGER) {
    const err = new Error(
      `Preventing attempted balance top up for user: ${id}\nProposed balance: ¥${proposedBalance}`,
    );
    getLogger().log({
      level: "warn",
      message: err.message,
    });
    throw err;
  }
  const updatedBalance = updateUserBalance(id, proposedBalance);
  if (!updatedBalance) {
    const err = new Error(`Failed to add ¥${amount} to user: ${id}`);
    getLogger().log({
      level: "error",
      message: err.message,
      exitOnError: true,
    });
    throw err;
  }
  return updatedBalance;
}

export function removeUserBalance(id: number, amount: number): number {
  const userBalance = getUserBalance(id);
  getLogger().log({
    level: "info",
    message: `Removing ¥${amount} from user: ${id}`,
  });
  const proposedBalance = userBalance - amount;
  if (userBalance - amount < 0) {
    const err = new Error(
      `Preventing attempted balance removal for user: ${id}\nProposed balance: ¥${proposedBalance}`,
    );
    getLogger().log({
      level: "warn",
      message: err.message,
    });
    throw err;
  }
  const updatedBalance = updateUserBalance(id, proposedBalance);
  if (!updatedBalance) {
    const err = new Error(`Failed to remove ¥${amount} from user: ${id}`);
    getLogger().log({
      level: "error",
      message: err.message,
      exitOnError: true,
    });
    throw err;
  }
  return updatedBalance;
}
