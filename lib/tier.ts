/**
 * Pure-function tier calculator. No API calls, no side effects.
 * Determines the collection tone tier based on overdue days and round number.
 *
 * Rules:
 *   R1 = overdue 1-7 days OR round 1 → polite reminder
 *   R2 = overdue 8-30 days OR round 2 → firm but cooperative
 *   R3 = overdue 30+ days OR round >= 3 → final notice + legal
 */
import type { Tier } from '@/lib/types';

export function calcCurrentOverdueDays(
  initialOverdueDays: number,
  caseCreatedAt: string | Date
): number {
  const created = typeof caseCreatedAt === 'string' ? new Date(caseCreatedAt) : caseCreatedAt;
  const now = Date.now();
  const elapsedDays = Math.floor((now - created.getTime()) / 86_400_000);
  return initialOverdueDays + elapsedDays;
}

export function computeTier(
  currentOverdueDays: number,
  roundNumber: number
): Tier {
  if (currentOverdueDays >= 30 || roundNumber >= 3) {
    return 'R3';
  }

  if (currentOverdueDays >= 8 || roundNumber === 2) {
    return 'R2';
  }

  return 'R1';
}