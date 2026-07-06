import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|auth/callback).*)'],
};

export default async function middleware(request: NextRequest) {
  const { response, session } = await updateSession(request);

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', request.nextUrl.pathname);
      return Response.redirect(url);
    }
  }

  return response;
}