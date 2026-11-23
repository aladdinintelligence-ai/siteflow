'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, ROLE_HOME_PATHS } from '@/context/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user && user.role) {
      const target = ROLE_HOME_PATHS[user.role] || '/director';
      router.replace(target);
    } else {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex-1 w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-6 h-6 border-2 border-[#14171A] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-[#6B7280] font-medium">Connecting to operations portal...</p>
    </div>
  );
}
