'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewCasePage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [amountOwed, setAmountOwed] = useState('');
  const [initialOverdueDays, setInitialOverdueDays] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          amount_owed: parseFloat(amountOwed),
          initial_overdue_days: parseInt(initialOverdueDays, 10),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create case');
      }

      router.push(`/dashboard/cases/${data.case.id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Create New Collection Case
      </h1>
      <p className="text-gray-500 mb-8">
        Enter your customer details to get started. We&apos;ll generate the first collection email automatically.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name
          </label>
          <input
            type="text"
            required
            className="input-field"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Acme Wholesale Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Owed (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              className="input-field pl-8"
              value={amountOwed}
              onChange={(e) => setAmountOwed(e.target.value)}
              placeholder="1250.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days Overdue
          </label>
          <input
            type="number"
            min="0"
            required
            className="input-field"
            value={initialOverdueDays}
            onChange={(e) => setInitialOverdueDays(e.target.value)}
            placeholder="5"
          />
          <p className="mt-1 text-sm text-gray-500">
            How many days has this invoice been overdue already?
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Case'}
          </button>
        </div>
      </form>
    </div>
  );
}
