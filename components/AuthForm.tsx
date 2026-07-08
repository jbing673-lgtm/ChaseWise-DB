'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type AuthFormMode = 'login' | 'signup';

interface AuthFormProps { mode: AuthFormMode; }

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createBrowserClient(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push('/login?check_email=true');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.refresh();
      router.push('/dashboard');
    }
  };

  return (
    <div className="card w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </h1>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}
      {mode === 'login' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('reset_success') && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          Your password has been reset successfully. Please sign in with your new password.
        </div>
      )}
      {mode === 'login' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('check_email') && !new URLSearchParams(window.location.search).get('reset_success') && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          Check your email for a confirmation link.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {mode === 'login' && (
            <div className="mt-1 text-right">
              <a href="/forgot-password" className="text-xs text-primary-600 hover:underline">
                Forgot Password?
              </a>
            </div>
          )}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading
            ? mode === 'login'
              ? 'Signing in...'
              : 'Creating account...'
            : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-500">
        {mode === 'login' ? (
          <>Don&apos;t have an account? <a href="/signup" className="text-primary-600 hover:underline">Sign up</a></>
        ) : (
          <>Already have an account? <a href="/login" className="text-primary-600 hover:underline">Sign in</a></>
        )}
      </div>
    </div>
  );
}