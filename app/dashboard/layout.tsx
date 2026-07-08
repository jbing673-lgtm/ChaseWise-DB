'use client';

import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!loading && !user && mountedRef.current) {
      router.replace('/login');
    }
    return () => { mountedRef.current = false; };
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}