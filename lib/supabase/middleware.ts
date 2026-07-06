/**
 * Supabase middleware helper for Next.js App Router.
 * Handles cookie-based session refresh in Edge runtime.
 * Called by the root middleware.ts to keep auth sessions alive.
 */
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storageKey: 'sb-chasewise-auth-token',
        storage: {
          getItem: (key: string) => {
            return request.cookies.get(key)?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            response.cookies.set(key, value, {
              path: '/',
              sameSite: 'lax',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            });
          },
          removeItem: (key: string) => {
            response.cookies.set(key, '', {
              path: '/',
              maxAge: 0,
            });
          },
        },
      },
    }
  );

  await supabase.auth.getSession();

  return response;
}