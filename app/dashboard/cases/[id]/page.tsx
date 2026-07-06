'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RoundTimeline } from '@/components/RoundTimeline';
import { NewRoundForm } from '@/components/NewRoundForm';
import { formatUSD } from '@/lib/utils';
import { calcCurrentOverdueDays } from '@/lib/utils';
import type { Case, Round } from '@/lib/types';

interface CaseDetailResponse {
  case: Case;
  rounds: Round[];
  profile: {
    is_pro: boolean;
  };
}

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [data, setData] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchCase() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (!res.ok) {
        throw new Error('Failed to load case details');
      }
      const data = await res.json();
      setData(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const handleRoundCreated = () => {
    fetchCase();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
        <div className="mt-6">
          <Link href="/dashboard" className="btn-primary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { case: caseItem, rounds, profile } = data;
  const currentOverdue = calcCurrentOverdueDays(
    caseItem.initial_overdue_days,
    caseItem.created_at
  );

  const canAddRound = profile.is_pro || rounds.length < 3;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-primary-600 mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {caseItem.customer_name}
          </h1>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="text-xl font-bold text-gray-900">
              {formatUSD(caseItem.amount_owed)}
            </span>
            <span className="text-sm text-gray-500 border border-gray-200 px-2 py-1 rounded-md">
              {currentOverdue} {currentOverdue === 1 ? 'day' : 'days'} overdue
            </span>
            <span className="text-sm text-gray-500 border border-gray-200 px-2 py-1 rounded-md">
              {rounds.length} {rounds.length === 1 ? 'round' : 'rounds'} sent
            </span>
            {profile.is_pro && (
              <span className="badge bg-green-100 text-green-700">Pro</span>
            )}
          </div>
        </div>
      </div>

      {rounds.length > 0 && (
        <div className="mb-10">
          <RoundTimeline rounds={rounds} />
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {rounds.length === 0
            ? 'Round 1 — Generate First Email'
            : `Round ${rounds.length + 1} — Add Next Response`}
        </h2>

        {!canAddRound && (
          <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-warning-800 font-medium">
              Free plan limit reached.
            </p>
            <p className="text-warning-700 mt-1 text-sm">
              You can only add up to 3 rounds per case on the Free plan. Upgrade to Pro to continue with this case.
            </p>
            <div className="mt-3">
              <Link href="/pricing" className="btn-primary">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}

        {canAddRound && (
          <NewRoundForm
            caseId={caseId}
            nextRoundNumber={rounds.length + 1}
            onRoundCreated={handleRoundCreated}
          />
        )}
      </div>
    </div>
  );
}
