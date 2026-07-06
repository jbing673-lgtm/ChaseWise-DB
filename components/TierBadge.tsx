'use client';

import type { Tier } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TierBadgeProps { tier: Tier; }

const TIER_CONFIG = {
  R1: { label: 'Polite Reminder', className: 'bg-primary-500 text-white' },
  R2: { label: 'Firm Pressure', className: 'bg-warning-400 text-black' },
  R3: { label: 'Final Notice', className: 'bg-danger-500 text-white' },
};

export function TierBadge({ tier }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  return <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', config.className)}>{config.label}</span>;
}