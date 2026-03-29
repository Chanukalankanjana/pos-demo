import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting utility for LKR (Sri Lankan Rupees)
export function formatCurrency(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Format currency for display in cards and tables
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return `LKR ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `LKR ${(amount / 1000).toFixed(1)}K`;
  } else {
    return `LKR ${amount.toFixed(2)}`;
  }
}
