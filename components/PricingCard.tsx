'use client';

import { useRouter } from 'next/navigation';
import { CreemCheckout } from '@creem_io/nextjs';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  ctaHref?: string;
  disabled?: boolean;
  featured?: boolean;
  productId?: string;
  referenceId?: string;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  ctaText,
  ctaHref,
  disabled,
  featured = false,
  productId,
  referenceId,
}: PricingCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (disabled) return;
    if (!ctaHref) return;
    if (ctaHref.startsWith('/api/')) return; // handled by CreemCheckout
    router.push(ctaHref);
  };

  const buttonContent = (
    <button
      onClick={productId ? undefined : handleClick}
      disabled={disabled}
      className={cn(
        'w-full py-3 px-6 rounded-lg font-semibold transition-colors',
        featured
          ? 'bg-primary-600 text-white hover:bg-primary-700'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {ctaText}
    </button>
  );

  return (
    <div
      className={cn(
        'card relative',
        featured
          ? 'border-primary-200 shadow-lg ring-1 ring-primary-200 scale-105'
          : 'border-gray-200'
      )}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-extrabold text-gray-900">{price}</span>
        <span className="text-gray-500">{period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 010 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      {productId && !disabled ? (
        <CreemCheckout
          productId={productId}
          referenceId={referenceId}
          successUrl="/dashboard?upgraded=true"
          checkoutPath="/api/creem/create-checkout"
        >
          {buttonContent}
        </CreemCheckout>
      ) : (
        buttonContent
      )}
    </div>
  );
}