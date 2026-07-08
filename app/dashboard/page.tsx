'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { CaseCard } from '@/components/CaseCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Case } from '@/lib/types';

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCases = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (!session) { router.push('/login'); return; }

        const res = await fetch('/api/cases', {
          headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
          signal: controller.signal,
        });
        if (!isMounted) return;
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (!isMounted) return;
          setError(errData?.error ?? 'Failed to load cases');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!isMounted) return;
        setCases(data?.cases ?? []);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof DOMException && (err as DOMException).name === 'AbortError') return;
        if (!isMounted) return;
        setError('Network error. Please try again.');
        setLoading(false);
      }
    };
    fetchCases();

    return () => {
      isMounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="card">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          <button onClick={() => { setError(null); setLoading(true); window.location.reload(); }} className="btn-secondary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Cases</h1>
        <a href="/dashboard/cases/new" className="btn-primary">+ New Case</a>
      </div>
      {cases?.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(cases ?? []).map((c) => <CaseCard key={c?.id ?? ''} caseItem={c} />)}
        </div>
      )}
    </div>
  );
}