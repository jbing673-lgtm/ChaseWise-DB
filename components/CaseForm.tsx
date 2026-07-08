'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type CustomerType = 'wholesaler' | 'agent' | 'service_provider' | 'other';
const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  wholesaler: 'Wholesaler', agent: 'Agent', service_provider: 'Service Provider', other: 'Other'
};

interface CaseFormProps { onSuccess?: (caseId: string) => void; }

export function CaseForm({ onSuccess }: CaseFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [opponentName, setOpponentName] = useState('');
  const [opponentEmail, setOpponentEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [overdueDays, setOverdueDays] = useState('5');
  const [customerType, setCustomerType] = useState<CustomerType>('wholesaler');
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
    const amt = parseFloat(amount ?? '0');
    const days = parseInt(overdueDays ?? '0', 10);
    if (amt <= 0) { setError('Amount must be greater than 0'); setLoading(false); return; }
    if (days < 0 || !Number.isInteger(days)) { setError('Days overdue must be a non-negative integer'); setLoading(false); return; }
    if (!(opponentName ?? '').trim()) { setError('Opponent name is required'); setLoading(false); return; }
    if (!(opponentEmail ?? '').trim()) { setError('Opponent email is required'); setLoading(false); return; }

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
          amount: amt,
          overdue_days: days,
          customer_type: customerType ?? 'wholesaler',
        }),
        signal: controller.signal,
      });
      if (!mountedRef.current) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to create case');
      if (!mountedRef.current) return;
      setLoading(false);
      if (onSuccess) { onSuccess(data?.case?.id ?? ''); } else { router.push(`/dashboard/cases/${data?.case?.id ?? ''}`); }
    } catch (err: unknown) {
      if (err instanceof DOMException && (err as DOMException).name === 'AbortError') return;
      if (mountedRef.current) {
        setError((err as Error)?.message ?? 'Unknown error');
        setLoading(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Opponent Name</label><input type="text" required className="input-field" value={opponentName} onChange={(e) => setOpponentName(e.target.value)} placeholder="Acme Wholesale Inc." /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Opponent Email</label><input type="email" required className="input-field" value={opponentEmail} onChange={(e) => setOpponentEmail(e.target.value)} placeholder="billing@acme.com" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label><select className="input-field" value={customerType} onChange={(e) => setCustomerType(e.target.value as CustomerType)}>{Object.entries(CUSTOMER_TYPE_LABELS).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}</select></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Amount Owed (USD)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span><input type="number" step="0.01" min="0" required className="input-field pl-8" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1500.00" /></div></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Days Overdue</label><input type="number" min="0" required className="input-field" value={overdueDays} onChange={(e) => setOverdueDays(e.target.value)} placeholder="5" /><p className="mt-1 text-sm text-gray-500">How many days has this invoice been overdue?</p></div>
      <div className="flex gap-3 pt-2"><button type="button" className="btn-secondary flex-1" onClick={() => router.back()} disabled={loading}>Cancel</button><button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create Case'}</button></div>
    </form>
  );
}