/**
 * Helper functions for calculating totals from new DailyEntry structure
 * Used throughout the app to get sales and expenses totals
 */

import type { DailyEntry } from "@/types";

/**
 * Get total sales from an entry
 * Returns entry.amount if type is SALE, 0 otherwise
 */
export function getSalesCompat(entry: DailyEntry): number {
  return entry.type === "SALE" ? entry.amount : 0;
}

/**
 * Get total expenses from an entry
 * Returns entry.amount if type is EXPENSE, 0 otherwise
 */
export function getExpensesCompat(entry: DailyEntry): number {
  return entry.type === "EXPENSE" ? entry.amount : 0;
}

/**
 * Calculate profit from an entry
 */
export function getEntryProfit(entry: DailyEntry): number {
  return getSalesCompat(entry) - getExpensesCompat(entry);
}

/**
 * Break down expenses by category
 * Returns object: { category: totalAmount, ... }
 */
export function getExpensesByCategory(
  entries: DailyEntry[],
): Record<string, number> {
  const breakdown: Record<string, number> = {
    Stock: 0,
    Transport: 0,
    Loyer: 0,
    Salaire: 0,
    Internet: 0,
    Autre: 0,
  };

  entries.forEach((entry) => {
    if (entry.type === "EXPENSE" && entry.category) {
      breakdown[entry.category] =
        (breakdown[entry.category] || 0) + entry.amount;
    }
  });

  return breakdown;
}

/**
 * Get total sales from all entries in a date range
 */
export function getTotalSalesInRange(entries: DailyEntry[]): number {
  return entries.reduce((sum, entry) => sum + getSalesCompat(entry), 0);
}

/**
 * Get total expenses from all entries in a date range
 */
export function getTotalExpensesInRange(entries: DailyEntry[]): number {
  return entries.reduce((sum, entry) => sum + getExpensesCompat(entry), 0);
}
