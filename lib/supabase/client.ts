/**
 * CLIENT-ONLY — do NOT import this file in Server Components, Route Handlers, or Middleware.
 * Uses NEXT_PUBLIC_ environment variables exposed to the browser.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};