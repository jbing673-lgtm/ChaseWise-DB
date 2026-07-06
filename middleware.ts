import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|auth/callback).*)'],
};

export default async function middleware(request: NextRequest) {
  const { response } = await updateSession(request);
  return response;
}