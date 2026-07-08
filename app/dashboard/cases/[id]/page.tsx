'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { RoundTimeline } from '@/components/RoundTimeline';
import { NewRoundForm } from '@/components/NewRoundForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatUSD, calcCurrentOverdueDays } from '@/lib/utils';
import type { Case, Round } from '@/lib/types';

interface CaseDetailResponse {
  case: Case;
  rounds: Round[];
  profile: { is_pro: boolean };
}

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const [data, setData] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createBrowserClient(), []);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchCase = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      const res = await fetch(`/api/cases/${caseId}`, {
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
        signal: controller.signal,
      });
      if (!mountedRef.current) return;
      if (!res.ok) throw new Error('Failed to load case details');
      const json = await res.json();
      if (!mountedRef.current) return;
      setData(json ?? null);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && (err as DOMException).name === 'AbortError') return;
      if (mountedRef.current) {
        setError((err as Error)?.message ?? 'Unknown error');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [caseId, supabase]);

  useEffect(() => {
    mountedRef.current = true;
    fetchCase();
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [fetchCase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="card">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error ?? 'Case data is still loading or failed to load.'}
          </div>
          <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const caseItem = data?.case;
  const rounds = data?.rounds ?? [];
  const profile = data?.profile ?? { is_pro: false };
  const currentOverdue = calcCurrentOverdueDays(caseItem?.overdue_days ?? 0, caseItem?.created_at ?? '');
  const canAddRound = (profile?.is_pro ?? false) || (rounds?.length ?? 0) < 3;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-primary-600 hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-gray-900">{caseItem?.opponent_name ?? 'Loading...'}</h1>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="text-xl font-bold text-gray-900">{formatUSD(caseItem?.amount ?? 0)}</span>
            <span className="text-sm text-gray-500 border border-gray-200 px-2 py-1 rounded-md">{currentOverdue ?? 0} {currentOverdue === 1 ? 'day' : 'days'} overdue</span>
            <span className="text-sm text-gray-500 border border-gray-200 px-2 py-1 rounded-md">{rounds?.length ?? 0} {(rounds?.length ?? 0) === 1 ? 'round' : 'rounds'} sent</span>
            {profile?.is_pro && <span className="badge bg-green-100 text-green-700">Pro</span>}
          </div>
        </div>
      </div>

      {(rounds?.length ?? 0) > 0 && (
        <div className="mb-10"><RoundTimeline rounds={rounds} /></div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {(rounds?.length ?? 0) === 0 ? 'Round 1 — Generate First Email' : `Round ${(rounds?.length ?? 0) + 1} — Add Next Response`}
        </h2>
        {canAddRound ? (
          <NewRoundForm caseId={caseId ?? ''} nextRoundNumber={(rounds?.length ?? 0) + 1} onRoundCreated={fetchCase} />
        ) : (
          <p className="text-gray-500">
            Free plan limit reached (3 rounds). <a href="/pricing" className="text-primary-600 hover:underline">Upgrade to Pro</a> for unlimited rounds.
          </p>
        )}
      </div>
    </div>
  );
}