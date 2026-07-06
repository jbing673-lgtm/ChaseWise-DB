'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CustomerType = 'wholesaler' | 'agent' | 'service_provider';
const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = { wholesaler: 'Wholesaler', agent: 'Agent', service_provider: 'Service Provider' };

interface CaseFormProps { onSuccess?: (caseId: string) => void; }

export function CaseForm({ onSuccess }: CaseFormProps) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [amountOwed, setAmountOwed] = useState('');
  const [initialOverdueDays, setInitialOverdueDays] = useState('5');
  const [customerType, setCustomerType] = useState<CustomerType>('wholesaler');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const amount = parseFloat(amountOwed);
    const days = parseInt(initialOverdueDays, 10);
    if (amount <= 0) { setError('Amount must be greater than 0'); setLoading(false); return; }
    if (days < 0 || !Number.isInteger(days)) { setError('Days overdue must be a non-negative integer'); setLoading(false); return; }
    if (!customerName.trim()) { setError('Customer name is required'); setLoading(false); return; }
    try {
      const res = await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_name: customerName.trim(), amount_owed: amount, initial_overdue_days: days }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create case');
      if (onSuccess) { onSuccess(data.case.id); } else { router.push(`/dashboard/cases/${data.case.id}`); router.refresh(); }
    } catch (err) { setError((err as Error).message); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label><input type="text" required className="input-field" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Acme Wholesale Inc." /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label><select className="input-field" value={customerType} onChange={(e) => setCustomerType(e.target.value as CustomerType)}>{Object.entries(CUSTOMER_TYPE_LABELS).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}</select></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Amount Owed (USD)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span><input type="number" step="0.01" min="0" required className="input-field pl-8" value={amountOwed} onChange={(e) => setAmountOwed(e.target.value)} placeholder="1500.00" /></div></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Days Overdue</label><input type="number" min="0" required className="input-field" value={initialOverdueDays} onChange={(e) => setInitialOverdueDays(e.target.value)} placeholder="5" /><p className="mt-1 text-sm text-gray-500">How many days has this invoice been overdue already?</p></div>
      <div className="flex gap-3 pt-2"><button type="button" className="btn-secondary flex-1" onClick={() => router.back()} disabled={loading}>Cancel</button><button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create Case'}</button></div>
    </form>
  );
}