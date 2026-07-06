/**
 * SERVER-ONLY — uses SUPABASE_SERVICE_ROLE_KEY with full database access bypassing RLS.
 * Only import in Server Components, Route Handlers, and Middleware.
 * Never expose this client to the browser.
 */
import { createClient } from '@supabase/supabase-js';

export const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};