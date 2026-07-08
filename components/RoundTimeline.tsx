'use client';

import { useState } from 'react';
import type { Round } from '@/lib/types';
import { OPPONENT_RESPONSE_LABELS } from '@/lib/types';
import { TierBadge } from './TierBadge';
import { cn } from '@/lib/utils';

interface RoundTimelineProps { rounds: Round[]; }

export function RoundTimeline({ rounds }: RoundTimelineProps) {
  return (
    <div className="relative pl-8 space-y-8">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
      {rounds.map((round, index) => (
        <div key={round?.id ?? index} className="relative">
          <div className={cn('absolute left-[-31px] top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center', round?.tier === 'R1' ? 'bg-primary-100 border-white' : round?.tier === 'R2' ? 'bg-warning-100 border-white' : 'bg-danger-100 border-white')}>
            <span className={cn('w-2 h-2 rounded-full', round?.tier === 'R1' ? 'bg-primary-600' : round?.tier === 'R2' ? 'bg-warning-600' : 'bg-danger-600')} />
          </div>
          <RoundItem round={round} isLast={index === rounds.length - 1} />
        </div>
      ))}
    </div>
  );
}

function RoundItem({ round, isLast }: { round: Round; isLast: boolean }) {
  const [expanded, setExpanded] = useState(!isLast);
  const responseLabel = round?.opponent_response_type
    ? OPPONENT_RESPONSE_LABELS[round.opponent_response_type as keyof typeof OPPONENT_RESPONSE_LABELS]
    : round?.opponent_response ?? '';

  return (
    <div className="card">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3"><span className="text-lg font-bold text-gray-900">Round {round?.round_number ?? '?'}</span><TierBadge tier={round?.tier ?? 'R1'} /></div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          {expanded ? (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>) : (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>)}
        </button>
      </div>
      {round?.opponent_response && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">Their last response:</p>
          <p className="mt-1 text-sm text-gray-700">{responseLabel ?? round?.opponent_response ?? ''}</p>
        </div>
      )}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Generated Email:</p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{round?.email_content ?? ''}</div>
        </div>
      )}
    </div>
  );
}