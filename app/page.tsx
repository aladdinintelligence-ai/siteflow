'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ROLES } from '@/config/roles';
import { RoleId } from '@/lib/types';
import {
  Briefcase,
  ClipboardList,
  Truck,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const { setCurrentRole, setGuidedStep, toggleGuidedMode, orders, sites, visits } = useAppStore();

  const handleStartGuidedDemo = () => {
    setGuidedStep(1);
    setCurrentRole('ordering');
    toggleGuidedMode(true);
    router.push('/ordering');
  };

  const handleSelectRole = (roleId: RoleId, path: string) => {
    setCurrentRole(roleId);
    router.push(path);
  };

  const getRoleIcon = (roleId: RoleId) => {
    const props = { className: 'w-4 h-4 text-[#14171A]', strokeWidth: 1.5 };
    switch (roleId) {
      case 'director':
        return <Briefcase {...props} />;
      case 'ordering':
        return <ClipboardList {...props} />;
      case 'supplier':
        return <Truck {...props} />;
      case 'driver':
        return <HardHat {...props} />;
      case 'marshal':
        return <ShieldCheck {...props} />;
      case 'supervisor':
        return <CheckCircle2 {...props} />;
      case 'analyst':
        return <BarChart3 {...props} />;
    }
  };

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <div className="max-w-2xl space-y-5 sm:space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#6B7280]">
          <span className="w-2 h-2 rounded-full bg-[#F5B301]" />
          <span>Interactive Prototype for DJ Civil</span>
        </div>

        <h1 className="text-2xl sm:text-[32px] font-semibold text-[#14171A] leading-tight tracking-tight">
          Traceable gate access and delivery operations in one shared record.
        </h1>

        <p className="text-sm sm:text-base text-[#6B7280] font-normal leading-relaxed">
          Connects DJ Civil purchase orders, Tier 1 suppliers, drivers, automated gate check-in,
          and receiving verifications to replace duplicate paper tickets with clean digital custody.
        </p>

        {/* Action Buttons: 40px tall, 8px radius */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={handleStartGuidedDemo}
            className="h-10 px-4 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer text-center"
          >
            Start guided demo
          </button>

          <a
            href="#roles"
            className="h-10 px-4 bg-white hover:bg-[#F7F7F5] text-[#14171A] border border-[#E7E5E0] rounded-lg text-sm font-medium transition-colors cursor-pointer inline-flex items-center justify-center text-center"
          >
            Explore by role
          </a>
        </div>
      </div>

      {/* Restrained Key Facts / Summary Bar: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Orders Seeded
          </span>
          <span className="text-[28px] font-semibold text-[#14171A] tabular-nums mt-1 block">
            {orders.length}
          </span>
          <span className="text-xs text-[#9CA3AF] mt-0.5 block">Across 3 live schemes</span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Traceability Steps
          </span>
          <span className="text-[28px] font-semibold text-[#14171A] tabular-nums mt-1 block">
            7
          </span>
          <span className="text-xs text-[#9CA3AF] mt-0.5 block">Full chain of custody</span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Discrepancy Capture
          </span>
          <span className="text-[28px] font-semibold text-[#14171A] tabular-nums mt-1 block">
            3
          </span>
          <span className="text-xs text-[#9CA3AF] mt-0.5 block">Shortages & damage logged</span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Driver Privacy
          </span>
          <span className="text-[28px] font-semibold text-[#14171A] tabular-nums mt-1 block">
            100%
          </span>
          <span className="text-xs text-[#9CA3AF] mt-0.5 block">Zero commercial leakage</span>
        </div>
      </div>

      {/* Role Picker Section: 3-column clean card grid */}
      <div id="roles" className="space-y-6 pt-2">
        <div>
          <h2 className="text-lg font-semibold text-[#14171A]">Explore by role</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Select a role to inspect its purpose-built screens, isolated data access, and live synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(ROLES) as RoleId[]).map((roleId) => {
            const role = ROLES[roleId];
            return (
              <div
                key={roleId}
                onClick={() => handleSelectRole(roleId, role.path)}
                className="bg-white border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] hover:border-[#14171A] transition-colors cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] flex items-center justify-center">
                      {getRoleIcon(roleId)}
                    </div>
                    <span className="text-[11px] font-medium text-[#6B7280] capitalize">
                      {role.deviceFocus}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#14171A]">
                    {role.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E7E5E0] flex items-center justify-between text-xs font-medium text-[#14171A]">
                  <span>Open view</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
