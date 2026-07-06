'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from './Providers';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const supabase = createBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</span>
          <span className="text-xl font-bold text-gray-900">ChaseWise</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className={cn('text-sm font-medium transition-colors', pathname === '/pricing' ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900')}>Pricing</Link>
          {user && <Link href="/dashboard" className={cn('text-sm font-medium transition-colors', pathname.startsWith('/dashboard') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900')}>Dashboard</Link>}
        </nav>
        <div className="flex items-center gap-4">
          {!loading && !user ? (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </>
          ) : user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign Out</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}