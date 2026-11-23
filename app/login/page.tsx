'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Building2, Truck, HardHat, FileSpreadsheet, ShieldAlert, BarChart3, UserCheck } from 'lucide-react';
import { RoleId } from '@/lib/types';
import { ROLES } from '@/config/roles';
import { cn } from '@/lib/utils';

interface SeedPersona {
  role: RoleId;
  name: string;
  email: string;
  org: string;
  icon: any;
  desc: string;
}

const SEED_PERSONAS: SeedPersona[] = [
  {
    role: 'director',
    name: 'Sarah Jenkins',
    email: 'director@djcivil.co.uk',
    org: 'DJ Civil Engineering Ltd',
    icon: Building2,
    desc: 'Commercial spend, orders table, discrepancy rates',
  },
  {
    role: 'ordering',
    name: 'Callum Vance',
    email: 'ordering@djcivil.co.uk',
    org: 'DJ Civil Procurement',
    icon: FileSpreadsheet,
    desc: 'New purchase orders, laydown destination booking',
  },
  {
    role: 'supplier',
    name: 'Marcus Bell',
    email: 'dispatch@cemex.co.uk',
    org: 'CEMEX UK',
    icon: Truck,
    desc: 'Incoming order acceptance, driver dispatch',
  },
  {
    role: 'driver',
    name: 'Dave Miller',
    email: 'dave.miller@cemex.co.uk',
    org: 'CEMEX Haulage (LK72 GFX)',
    icon: HardHat,
    desc: 'Zero-price jobs, camera QR entry, on-site route',
  },
  {
    role: 'marshal',
    name: 'Gary O\'Connor',
    email: 'gate1.marshal@djcivil.co.uk',
    org: 'Battersea Gate 1 Security',
    icon: ShieldCheck,
    desc: 'Gate clearance, expected visits, safety exception flags',
  },
  {
    role: 'supervisor',
    name: 'Raj Patel',
    email: 'supervisor.patel@djcivil.co.uk',
    org: 'Battersea Laydown 2B',
    icon: ShieldAlert,
    desc: 'Delivery quantity sign-off, shortage credit notes',
  },
  {
    role: 'analyst',
    name: 'Emma Richardson',
    email: 'analyst@djcivil.co.uk',
    org: 'DJ Civil Sustainability',
    icon: BarChart3,
    desc: 'Turnaround duration histogram, SLA scorecard',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, user } = useAuth();

  const redirectPath = searchParams.get('redirect') || null;
  const isDenied = searchParams.get('denied') === 'true';

  const [email, setEmail] = useState<string>('director@djcivil.co.uk');
  const [password, setPassword] = useState<string>('SiteFlow2026!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<RoleId>('director');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = await login(email, password, redirectPath);
    if (!result.success) {
      setErrorMsg(result.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleSelectPersona = (p: SeedPersona) => {
    setSelectedPersona(p.role);
    setEmail(p.email);
    setPassword('SiteFlow2026!');
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Left Column: Official Sign In Form */}
      <div className="md:col-span-6 bg-white border border-[#E7E5E0] rounded-[16px] shadow-[0_4px_20px_rgba(20,23,26,0.06)] p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#14171A] text-white flex items-center justify-center text-xs font-bold">
              DF
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-base tracking-tight text-[#14171A]">DJ Civil</span>
              <span className="font-semibold text-base tracking-tight text-[#6B7280]">SiteFlow</span>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-[#14171A] tracking-tight">Operations Portal Sign In</h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Enter authorized site credentials to access role portal and traceable gate logs.
          </p>
        </div>

        {/* Security Alert if Redirected from Unauthorized Route */}
        {isDenied && (
          <div className="p-3 bg-[#FEE2E2] border border-[#DC2626]/20 rounded-lg flex items-start gap-2 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Access Restricted</span>
              Your current account role does not have authorization for that portal. Please sign in with an authorized role.
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 bg-[#FEE2E2] border border-[#DC2626]/20 rounded-lg flex items-center gap-2 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#14171A] uppercase tracking-wider block">
              Official Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. director@djcivil.co.uk"
              className="w-full h-10 px-3 bg-[#F8F8F6] border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] outline-none focus:border-[#14171A] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#14171A] uppercase tracking-wider">
                Security Password
              </label>
              <span className="text-[11px] text-[#9CA3AF]">SiteFlow2026!</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 bg-[#F8F8F6] border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] outline-none focus:border-[#14171A] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-[#F5B301]" />
                <span>Enter Official Portal</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#E7E5E0] text-[11px] text-[#6B7280] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Strict RBAC Session Protection</span>
          </div>
          <span>JWT HMAC-SHA256</span>
        </div>
      </div>

      {/* Right Column: Authorized Operational Accounts Selector */}
      <div className="md:col-span-6 bg-white/90 backdrop-blur-xs border border-[#E7E5E0] rounded-[16px] shadow-[0_4px_20px_rgba(20,23,26,0.04)] p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#14171A]">Authorized Operational Accounts</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Select an operational role account to populate verified credentials and inspect strict RBAC boundaries.
          </p>
        </div>

        <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
          {SEED_PERSONAS.map((p) => {
            const isSelected = p.role === selectedPersona;
            const Icon = p.icon;

            return (
              <button
                key={p.role}
                type="button"
                onClick={() => handleSelectPersona(p)}
                className={cn(
                  'w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-3',
                  isSelected
                    ? 'border-[#14171A] bg-[#F8F8F6] shadow-xs'
                    : 'border-[#E7E5E0] bg-white hover:bg-[#F8F8F6]/60'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    isSelected ? 'bg-[#14171A] text-white' : 'bg-[#F3F4F6] text-[#4B5563]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-[#14171A] truncate">{p.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E5E7EB] text-[#14171A] shrink-0 uppercase tracking-wider">
                      {p.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] truncate mt-0.5">{p.org}</p>
                  <p className="text-[11px] text-[#9CA3AF] line-clamp-1 mt-1">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-[#FEF3C7] text-[#B45309] rounded-lg p-3 text-[11px] leading-relaxed">
          <span className="font-semibold block mb-0.5">Role Scoping Rules:</span>
          Drivers are firewalled from commercial pricing. Supervisors are restricted to discharge verification. Suppliers only see their own company orders.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 w-full civil-blueprint-bg min-h-[calc(100vh-56px)] flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={<div className="text-xs text-[#6B7280]">Loading access portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

