'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useRef, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function NewCasePage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [opponentName, setOpponentName] = useState('');
  const [opponentEmail, setOpponentEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [overdueDays, setOverdueDays] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          opponent_name: (opponentName ?? '').trim(),
          opponent_email: (opponentEmail ?? '').trim(),
          amount: parseFloat(amount ?? '0'),
          overdue_days: parseInt(overdueDays ?? '0', 10),
        }),
        signal: controller.signal,
      });

      if (!mountedRef.current) return;
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to create case');
      }

      if (!mountedRef.current) return;
      setLoading(false);
      router.push(`/dashboard/cases/${data?.case?.id ?? ''}`);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof DOMException && (err as DOMException).name === 'AbortError') return;
      if (mountedRef.current) {
        setError((err as Error)?.message ?? 'Unknown error');
        setLoading(false);
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Collection Case</h1>
      <p className="text-gray-500 mb-8">Enter your customer details to get started. We&apos;ll generate the first collection email automatically.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Opponent Name</label>
          <input type="text" required className="input-field" value={opponentName} onChange={(e) => setOpponentName(e.target.value)} placeholder="Acme Wholesale Inc." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Opponent Email</label>
          <input type="email" required className="input-field" value={opponentEmail} onChange={(e) => setOpponentEmail(e.target.value)} placeholder="billing@acme.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount Owed (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input type="number" step="0.01" min="0" required className="input-field pl-8" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1250.00" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Days Overdue</label>
          <input type="number" min="0" required className="input-field" value={overdueDays} onChange={(e) => setOverdueDays(e.target.value)} placeholder="5" />
          <p className="mt-1 text-sm text-gray-500">How many days has this invoice been overdue already?</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" className="btn-secondary flex-1" onClick={() => router.back()} disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Creating...' : 'Create Case'}</button>
        </div>
      </form>
    </div>
  );
}