/**
 * Free-tier usage validator.
 * Checks whether a free user is within their monthly limits.
 * Pro users always pass through.
 *
 * Limits for free users:
 *   - Max 2 cases per calendar month
 *   - Max 3 rounds per case
 */
import { createServerClient } from '@/lib/supabase/server';
import type { UsageCheckResult } from '@/lib/types';

export async function checkCaseCreationLimit(
  userId: string
): Promise<UsageCheckResult> {
  const supabase = createServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', userId)
    .single();

  if (profile?.is_pro) {
    return { allowed: true };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count, error } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth);

  if (error) {
    throw new Error(`Failed to check case limit: ${error.message}`);
  }

  if (count !== null && count >= 2) {
    return {
      allowed: false,
      error_code: 'case_limit_reached',
      message:
        'Free plan allows up to 2 cases per month. Upgrade to Pro for unlimited cases.',
    };
  }

  return { allowed: true };
}

export async function checkRoundCreationLimit(
  userId: string,
  caseId: string
): Promise<UsageCheckResult> {
  const supabase = createServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', userId)
    .single();

  if (profile?.is_pro) {
    return { allowed: true };
  }

  const { count, error } = await supabase
    .from('rounds')
    .select('*', { count: 'exact', head: true })
    .eq('case_id', caseId);

  if (error) {
    throw new Error(`Failed to check round limit: ${error.message}`);
  }

  if (count !== null && count >= 3) {
    return {
      allowed: false,
      error_code: 'round_limit_reached',
      message:
        'Free plan allows up to 3 rounds per case. Upgrade to Pro for unlimited rounds.',
    };
  }

  return { allowed: true };
}