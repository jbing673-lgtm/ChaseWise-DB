'use client';

import { useState } from 'react';
import type { OpponentResponse } from '@/lib/types';
import { OPPONENT_RESPONSE_LABELS } from '@/lib/types';
import { LoadingSpinner } from './LoadingSpinner';

interface NewRoundFormProps { caseId: string; nextRoundNumber: number; onRoundCreated: () => void; }

export function NewRoundForm({ caseId, nextRoundNumber, onRoundCreated }: NewRoundFormProps) {
  const [opponentResponse, setOpponentResponse] = useState<OpponentResponse>('next_week');
  const [customResponse, setCustomResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCustom = opponentResponse === 'custom';
  const canSubmit = !isCustom || (isCustom && customResponse.trim().length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const body: any = { opponent_response: opponentResponse };
    if (isCustom && customResponse.trim()) body.opponent_response_custom = customResponse.trim();
    try {
      const res = await fetch(`/api/cases/${caseId}/rounds`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { throw new Error(data.error || 'Failed to create round'); }
      onRoundCreated();
      setError(null);
    } catch (err) { setError((err as Error).message); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What did they respond?</label>
        <select className="input-field" value={opponentResponse} onChange={(e) => setOpponentResponse(e.target.value as OpponentResponse)} required>
          {Object.entries(OPPONENT_RESPONSE_LABELS).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
        </select>
      </div>
      {isCustom && (<div><label className="block text-sm font-medium text-gray-700 mb-2">Custom Response</label><textarea className="input-field min-h-[80px] resize-y" value={customResponse} onChange={(e) => setCustomResponse(e.target.value)} placeholder="Describe their custom response..." required /></div>)}
      <button type="submit" disabled={loading || !canSubmit} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading && <LoadingSpinner size="sm" />}
        {loading ? 'Generating...' : `Generate Round ${nextRoundNumber} Email`}
      </button>
      {!loading && nextRoundNumber > 1 && (<p className="text-sm text-gray-500 text-center">We will automatically calculate the correct tone based on how overdue this is.</p>)}
    </form>
  );
}