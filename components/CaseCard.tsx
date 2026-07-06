'use client';

import Link from 'next/link';
import { formatUSD, calcCurrentOverdueDays } from '@/lib/utils';
import { computeTier } from '@/lib/tier';
import type { Case } from '@/lib/types';
import { TierBadge } from './TierBadge';
import { cn } from '@/lib/utils';

interface CaseCardProps { caseItem: Case; }

export function CaseCard({ caseItem }: CaseCardProps) {
  const currentOverdue = calcCurrentOverdueDays(caseItem.initial_overdue_days, caseItem.created_at);
  const tier = computeTier(currentOverdue, 1);

  return (
    <Link href={`/dashboard/cases/${caseItem.id}`} className={cn('block card hover:shadow-md hover:border-primary-300 transition-all', 'hover:-translate-y-0.5')}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{caseItem.customer_name}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Amount:</span><span className="font-bold text-gray-900">{formatUSD(caseItem.amount_owed)}</span></div>
        <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Days Overdue:</span><span className="text-sm text-gray-700 font-medium">{currentOverdue} {currentOverdue === 1 ? 'day' : 'days'}</span></div>
        <div className="flex items-center justify-between pt-2"><span className="text-sm text-gray-500">Current Tier:</span><TierBadge tier={tier} /></div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-primary-600 font-medium">View Details →</div>
    </Link>
  );
}