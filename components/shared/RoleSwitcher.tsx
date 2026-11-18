'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ROLES } from '@/config/roles';
import { RoleId } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RoleSwitcher: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { currentRole, setCurrentRole } = useAppStore();
  const currentConfig = ROLES[currentRole] || ROLES.driver;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (roleId: RoleId) => {
    setCurrentRole(roleId);
    setIsOpen(false);
    router.push(ROLES[roleId].path);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 sm:h-9 inline-flex items-center gap-1 sm:gap-1.5 bg-[#FFFFFF] hover:bg-[#F7F7F5] text-[#14171A] border border-[#E7E5E0] px-2 sm:px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer"
      >
        <span className="text-[#6B7280] hidden md:inline">Role:</span>
        <span className="font-semibold text-[#14171A] max-w-[70px] sm:max-w-none truncate">
          {currentConfig.name.split(' / ')[0]}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-68 sm:w-72 bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] shadow-[0_4px_12px_rgba(20,23,26,0.08)] py-1.5 z-50 animate-in fade-in duration-150">
          <div className="px-3 py-1.5 border-b border-[#E7E5E0]">
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Switch Perspective
            </p>
          </div>

          <div className="p-1 space-y-0.5">
            {(Object.keys(ROLES) as RoleId[]).map((roleId) => {
              const role = ROLES[roleId];
              const isSelected = roleId === currentRole;

              return (
                <button
                  key={roleId}
                  onClick={() => handleSelectRole(roleId)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-[#F7F7F5] text-[#14171A] font-semibold'
                      : 'hover:bg-[#F7F7F5] text-[#4B5563]'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#F5B301]" />}
                      <span>{role.name}</span>
                    </div>
                    <span className="text-[11px] text-[#9CA3AF] font-normal block pl-3">
                      {role.deviceFocus} view
                    </span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#14171A]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
