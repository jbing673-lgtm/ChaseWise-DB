import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    let response = NextResponse.redirect(new URL(next, request.url));

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storageKey: 'sb-chasewise-auth-token',
          storage: {
            getItem: (key: string) => request.cookies.get(key)?.value ?? null,
            setItem: (key: string, value: string) => {
              response.cookies.set(key, value, {
                path: '/',
                sameSite: 'lax',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
              });
            },
            removeItem: (key: string) => {
              response.cookies.set(key, '', { path: '/', maxAge: 0 });
            },
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message);
      return NextResponse.redirect(
        new URL(`/login?error=auth_callback_failed&reason=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    console.log('[auth/callback] Success, redirecting to:', next);
    return response;
  }

  console.error('[auth/callback] Missing code parameter');
  return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
}