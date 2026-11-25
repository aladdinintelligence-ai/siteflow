'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DirectorRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/manager');
  }, [router]);

  return (
    <div className="flex-1 w-full min-h-[50vh] flex items-center justify-center text-xs text-[#6B7280]">
      Redirecting to Site Manager Dashboard...
    </div>
  );
}
