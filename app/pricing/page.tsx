'use client';

import { useState, useEffect } from 'react';
import { PricingCard } from '@/components/PricingCard';
import { createBrowserClient } from '@/lib/supabase/client';

export default function PricingPage() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getSession();
      setLoading(false);
    }

    checkProfile();
  }, []);

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
          ctaText={isPro ? 'Your current plan' : 'Start Free'}
          ctaHref={isPro ? undefined : '/signup'}
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
          ctaText={isPro ? 'Current Plan' : 'Upgrade to Pro'}
          ctaHref="/api/creem/create-checkout"
          disabled={isPro}
        />
      </div>

      <div className="mt-16 text-center text-sm text-gray-500 max-w-2xl mx-auto">
        <p>
          Secure payments powered by Creem. Cancel anytime. 7-day refund guarantee for new subscribers.
        </p>
      </div>
    </div>
  );
}
