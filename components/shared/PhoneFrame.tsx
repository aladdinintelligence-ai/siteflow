'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, className }) => {
  const [isFramed, setIsFramed] = useState<boolean>(true);

  return (
    <div className={cn('w-full flex flex-col items-center justify-start', className)}>
      {/* Desktop view-mode toggle */}
      <div className="hidden sm:flex w-full max-w-[390px] items-center justify-between mb-4 px-1">
        <span className="text-xs font-medium text-[#6B7280]">Mobile preview</span>
        <button
          onClick={() => setIsFramed(!isFramed)}
          className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#14171A] font-medium transition-colors cursor-pointer"
        >
          {isFramed ? (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span>Full width</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Device frame</span>
            </>
          )}
        </button>
      </div>

      {/* Frame on desktop; full-bleed with no outer frame on mobile */}
      {isFramed ? (
        <div className="w-full sm:w-[390px] bg-transparent sm:bg-white sm:border sm:border-[#E7E5E0] sm:rounded-[24px] sm:shadow-[0_1px_3px_rgba(20,23,26,0.04)] overflow-hidden flex flex-col">
          {children}
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden p-6">
          {children}
        </div>
      )}
    </div>
  );
};
