import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|auth/callback).*)'],
};

export default async function middleware(request: NextRequest) {
  const { response, session } = await updateSession(request);

  // Logged-in users accessing /dashboard or /login should pass through
  // No redirect to /login for authenticated users
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}