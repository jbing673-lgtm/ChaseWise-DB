/**
 * Shared utility functions.
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution.
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as a USD currency string.
 * Example: 1234.5 → "$1,234.50"
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate the current number of overdue days for a case.
 * This is the initial overdue days plus the days elapsed since case creation.
 */
export function calcCurrentOverdueDays(
  initialOverdueDays: number,
  caseCreatedAt: string | Date
): number {
  const created =
    typeof caseCreatedAt === 'string' ? new Date(caseCreatedAt) : caseCreatedAt;
  const now = Date.now();
  const elapsedDays = Math.floor((now - created.getTime()) / 86_400_000);
  return initialOverdueDays + elapsedDays;
}