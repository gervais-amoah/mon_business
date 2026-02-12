/**
 * Secure localStorage utilities with validation
 * All data is validated against the expected schema
 * No backward compatibility with old formats
 */

import type { BusinessData, BusinessSettings } from "@/types";
import {
  isValidDailyEntry as typeIsValidDailyEntry,
  isValidStockItem as typeIsValidStockItem,
} from "@/types";

const STORAGE_KEY = "mon_business_data";

/**
 * Default empty business data structure
 */
function getDefaultData(): BusinessData {
  return {
    settings: {
      name: "",
      dailyTarget: undefined,
    },
    entries: [],
    stock: [],
  };
}

/**
 * Validates that BusinessSettings has required fields with correct types
 */
function isValidBusinessSettings(
  settings: unknown,
): settings is BusinessSettings {
  if (typeof settings !== "object" || settings === null) return false;
  const s = settings as Record<string, unknown>;
  return (
    typeof s.name === "string" &&
    (s.dailyTarget === undefined ||
      (typeof s.dailyTarget === "number" && s.dailyTarget >= 0))
  );
}

/**
 * Validates the entire BusinessData structure
 */
function isValidBusinessData(data: unknown): data is BusinessData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;

  // Basic structure check
  if (!d.settings || !Array.isArray(d.entries) || !Array.isArray(d.stock)) {
    return false;
  }

  // Validate settings
  if (!isValidBusinessSettings(d.settings)) {
    return false;
  }

  // Validate entries (using type guard from types/index.ts)
  if (!d.entries.every(typeIsValidDailyEntry)) {
    console.error("Invalid entries found in storage data");
    return false;
  }

  // Validate stock (using type guard from types/index.ts)
  if (!d.stock.every(typeIsValidStockItem)) {
    console.error("Invalid stock items found in storage data");
    return false;
  }

  return true;
}

/**
 * Safely loads business data from localStorage
 * Returns default structure if not found or invalid
 */
export function loadData(): BusinessData {
  try {
    if (typeof window === "undefined") {
      return getDefaultData();
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultData();
    }

    const parsed = JSON.parse(stored);

    if (!isValidBusinessData(parsed)) {
      console.warn("Invalid stored data structure, returning defaults");
      return getDefaultData();
    }

    return parsed as BusinessData;
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
    return getDefaultData();
  }
}

/**
 * Safely saves business data to localStorage
 * Validates data before saving to prevent corruption
 */
export function saveData(data: BusinessData): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    if (!isValidBusinessData(data)) {
      console.error("Cannot save invalid business data", data); // Added data logging for debugging
      return false;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
    return false;
  }
}

/**
 * Clears all business data from localStorage
 */
export function clearData(): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear data from localStorage:", error);
    return false;
  }
}
