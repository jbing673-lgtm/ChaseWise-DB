'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
          <div className="text-sm text-gray-500">Contact: <a href="mailto:support@yourdomain" className="hover:text-gray-900 transition-colors">support@yourdomain</a></div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} ChaseWise. All rights reserved.</div>
      </div>
    </footer>
  );
}