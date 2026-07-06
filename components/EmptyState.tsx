'use client';

import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-xl">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
      <h3 className="mt-2 text-lg font-semibold text-gray-900">No cases yet</h3>
      <p className="mt-1 text-gray-500">No cases created yet. Create your first collection case to get started.</p>
      <div className="mt-6"><Link href="/dashboard/cases/new" className="btn-primary">+ Create New Case</Link></div>
    </div>
  );
}