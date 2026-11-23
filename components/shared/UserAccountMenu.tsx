'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, ROLE_HOME_PATHS } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, ChevronDown, Shield, Building, Truck, ExternalLink, RefreshCw } from 'lucide-react';
import { ROLES } from '@/config/roles';
import { cn } from '@/lib/utils';

export const UserAccountMenu: React.FC = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-8 sm:h-9 w-24 bg-[#F8F8F6] border border-[#E7E5E0] rounded-lg animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="h-8 sm:h-9 px-3 bg-[#14171A] hover:bg-[#2A2F35] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <User className="w-3.5 h-3.5 text-[#F5B301]" />
        <span>Sign in</span>
      </Link>
    );
  }

  const roleConfig = ROLES[user.role] || ROLES.director;
  const homePath = ROLE_HOME_PATHS[user.role] || '/';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Official User Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 sm:h-9 inline-flex items-center gap-1.5 sm:gap-2 bg-[#FFFFFF] hover:bg-[#F8F8F6] text-[#14171A] border border-[#E7E5E0] px-2 sm:px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
      >
        <div className="w-5 h-5 rounded-full bg-[#14171A] text-white flex items-center justify-center text-[10px] font-semibold">
          {user.name.charAt(0)}
        </div>
        <div className="flex flex-col text-left leading-tight hidden xs:flex">
          <span className="font-semibold text-[#14171A] max-w-[90px] sm:max-w-[120px] truncate">
            {user.name}
          </span>
          <span className="text-[10px] text-[#6B7280] font-normal capitalize">
            {user.role}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
      </button>

      {/* Account Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-[#FFFFFF] border border-[#E7E5E0] rounded-[16px] shadow-[0_10px_30px_rgba(20,23,26,0.12)] p-2 z-50 animate-in fade-in duration-150">
            {/* User Identity Header */}
            <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E7E5E0]/60 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-xs text-[#14171A] truncate">{user.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E5E7EB] text-[#14171A] uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] truncate">{user.email}</p>
              <div className="flex items-center gap-1 text-[11px] text-[#4B5563] pt-1">
                <Building className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                <span className="truncate">{user.organization}</span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1.5 space-y-0.5">
              <Link
                href={homePath}
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-[#14171A] hover:bg-[#F8F8F6] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>My Authorized Portal ({roleConfig.name.split(' / ')[0]})</span>
                </div>
                <ExternalLink className="w-3 h-3 text-[#9CA3AF]" />
              </Link>

              <Link
                href="/login?switch=true"
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between text-[#4B5563] hover:bg-[#F8F8F6] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>Switch Operational Account</span>
                </div>
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="pt-1 border-t border-[#E7E5E0]">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-[#DC2626] hover:bg-[#FEE2E2]/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out of SiteFlow</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

