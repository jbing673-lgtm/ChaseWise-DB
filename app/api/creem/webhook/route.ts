import { Webhook } from '@creem_io/nextjs';
import { createClient } from '@supabase/supabase-js';

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onGrantAccess: async ({ customer, metadata }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const userId = metadata?.referenceId as string | undefined;
    if (userId) {
      await supabase.from('profiles').update({ is_pro: true }).eq('id', userId);
    }
  },

  onRevokeAccess: async ({ customer, metadata }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const userId = metadata?.referenceId as string | undefined;
    if (userId) {
      await supabase.from('profiles').update({ is_pro: false }).eq('id', userId);
    }
  },
});