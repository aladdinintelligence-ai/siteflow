'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { UserAccountMenu } from './UserAccountMenu';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TopNav: React.FC = () => {
  const { sites, currentSiteId, setCurrentSite } = useAppStore();

  const [siteOpen, setSiteOpen] = useState(false);
  const siteRef = useRef<HTMLDivElement>(null);

  const currentSite = sites.find((s) => s.id === currentSiteId) || sites[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (siteRef.current && !siteRef.current.contains(event.target as Node)) {
        setSiteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-[#FFFFFF]/95 backdrop-blur-xs border-b border-[#E7E5E0] h-14 sticky top-0 z-50 select-none">
      <div className="max-w-[1280px] h-full mx-auto px-3 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Product Logo & Site Context */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md overflow-hidden bg-[#14171A] flex items-center justify-center shrink-0 border border-[#E7E5E0]">
              <img src="/logo.png" alt="DJ Civil" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-[#14171A]">
                DJ Civil
              </span>
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-[#6B7280] hidden xs:inline">
                SiteFlow
              </span>
            </div>
          </Link>

          {/* Compact Site Selector on desktop */}
          <div className="hidden md:flex items-center border-l border-[#E7E5E0] pl-4 relative" ref={siteRef}>
            <button
              type="button"
              onClick={() => setSiteOpen(!siteOpen)}
              className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#14171A] font-medium transition-colors cursor-pointer py-1"
            >
              <span>{currentSite.name}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {siteOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setSiteOpen(false)}
                />
                <div className="absolute left-4 top-full mt-2 w-72 bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] shadow-[0_10px_30px_rgba(20,23,26,0.12)] p-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    Active Construction Sites
                  </div>
                  {sites.map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => {
                        setCurrentSite(site.id);
                        setSiteOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer',
                        site.id === currentSiteId
                          ? 'bg-[#F7F7F5] text-[#14171A] font-semibold'
                          : 'hover:bg-[#F7F7F5] text-[#4B5563]'
                      )}
                    >
                      <span>{site.name}</span>
                      {site.id === currentSiteId && <Check className="w-3.5 h-3.5 text-[#14171A]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: User Account Menu (Strict Authenticated Access) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <UserAccountMenu />
        </div>
      </div>
    </header>
  );
};
