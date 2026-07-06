'use client';

import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps { size?: Size; }

const sizeClasses: Record<Size, string> = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-2' };

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return <div className={cn('animate-spin rounded-full border-primary-600 border-t-transparent', sizeClasses[size])} />;
}