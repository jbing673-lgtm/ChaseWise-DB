'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCard } from '@/components/PricingCard';
import { createBrowserClient } from '@/lib/supabase/client';

export default function PricingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', session.user.id)
        .single();

      if (!cancelled) {
        setIsPro(profile?.is_pro ?? false);
        setLoading(false);
      }
    };

    fetchUser();
    return () => { cancelled = true; };
  }, [supabase]);

  const productId = process.env.NEXT_PUBLIC_CREEM_PRODUCT_MONTHLY_ID;

  const handleUpgradeClick = () => {
    if (!userId) {
      router.push('/login?redirect=/pricing');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-500">
          Start free. Upgrade when you need more.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            period="/month"
            features={[
              'Up to 2 cases per month',
              'Up to 3 rounds per case',
              'AI-generated collection emails',
              'Full case timeline',
              '3 rebuttal suggestions per round',
            ]}
            ctaText={isPro ? 'Downgrade' : 'Start Free'}
            ctaHref="/signup"
            disabled={isPro}
          />

          <PricingCard
            name="Pro"
            price="$4.90"
            period="/month"
            featured
            features={[
              'Unlimited cases per month',
              'Unlimited rounds per case',
              'AI-generated collection emails',
              'Full case timeline',
              '3 rebuttal suggestions per round',
              'Priority email support',
            ]}
            ctaText={isPro ? 'Current Plan' : userId ? 'Upgrade to Pro' : 'Sign In to Upgrade'}
            ctaHref={userId ? undefined : '/login?redirect=/pricing'}
            disabled={isPro}
            productId={!isPro && userId && productId ? productId : undefined}
            referenceId={!isPro && userId ? userId : undefined}
          />
        </div>
      )}

      <div className="mt-16 text-center text-sm text-gray-500 max-w-2xl mx-auto">
        <p>
          Secure payments powered by Creem. Cancel anytime. 7-day refund guarantee for new subscribers.
        </p>
      </div>
    </div>
  );
}