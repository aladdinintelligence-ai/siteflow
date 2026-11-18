'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ROLES } from '@/config/roles';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleId } from '@/lib/types';

export interface WorkflowStep {
  step: number;
  label: string;
  role: RoleId;
  targetPath: string;
  instruction: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    label: 'Order',
    role: 'ordering',
    targetPath: '/ordering',
    instruction: 'Create or select a purchase order.',
  },
  {
    step: 2,
    label: 'Supplier',
    role: 'supplier',
    targetPath: '/supplier',
    instruction: 'Supplier accepts order and assigns a driver.',
  },
  {
    step: 3,
    label: 'Driver',
    role: 'driver',
    targetPath: '/driver',
    instruction: 'Driver reviews operational job details (zero pricing).',
  },
  {
    step: 4,
    label: 'Gate entry',
    role: 'driver',
    targetPath: '/driver',
    instruction: 'Scan site QR code. Booking is retrieved and entry auto-authorised.',
  },
  {
    step: 5,
    label: 'Navigation',
    role: 'driver',
    targetPath: '/driver',
    instruction: 'Follow approved site route to designated laydown / pit.',
  },
  {
    step: 6,
    label: 'Verify',
    role: 'supervisor',
    targetPath: '/supervisor',
    instruction: 'Supervisor confirms delivered quantity and logs any shortage.',
  },
  {
    step: 7,
    label: 'Exit',
    role: 'director',
    targetPath: '/director',
    instruction: 'Driver scans out. Lifecycle audit reflects on Director dashboard.',
  },
];

export const GuidedDemoBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const {
    guidedStep,
    guidedModeActive,
    setGuidedStep,
    nextGuidedStep,
    prevGuidedStep,
    toggleGuidedMode,
    setCurrentRole,
  } = useAppStore();

  if (!guidedModeActive) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => toggleGuidedMode(true)}
          className="inline-flex items-center gap-2 bg-[#14171A] text-white px-3.5 py-2 rounded-lg shadow-md hover:bg-[#2A2F35] text-xs font-medium transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F5B301]" />
          <span>Resume demo ({guidedStep}/7)</span>
        </button>
      </div>
    );
  }

  const currentStep = WORKFLOW_STEPS[guidedStep - 1] || WORKFLOW_STEPS[0];
  const roleConfig = ROLES[currentStep.role];

  const handleStepJump = (stepNumber: number) => {
    const target = WORKFLOW_STEPS[stepNumber - 1];
    if (target) {
      setGuidedStep(stepNumber);
      setCurrentRole(target.role);
      router.push(target.targetPath);
    }
  };

  const handleGoToRole = () => {
    setCurrentRole(currentStep.role);
    router.push(currentStep.targetPath);
  };

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#E7E5E0] sticky top-14 z-30 select-none">
      <div className="max-w-[1280px] w-full mx-auto px-3 sm:px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-2 text-xs">
        {/* Step Indicator Pills with proper CSS scroll container */}
        <div className="w-full md:w-auto min-w-0 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1 w-max">
            <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mr-1 hidden sm:inline shrink-0">
              Walkthrough
            </span>

            {WORKFLOW_STEPS.map((s) => {
              const isCurrent = s.step === guidedStep;
              const isDone = s.step < guidedStep;

              return (
                <button
                  key={s.step}
                  onClick={() => handleStepJump(s.step)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs transition-colors shrink-0 cursor-pointer',
                    isCurrent
                      ? 'bg-[#14171A] text-white font-medium'
                      : isDone
                      ? 'bg-[#F3F4F6] text-[#14171A] hover:bg-[#E5E7EB]'
                      : 'text-[#9CA3AF] hover:text-[#6B7280]'
                  )}
                >
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#F5B301]" />}
                  {isDone && <Check className="w-3 h-3 text-[#16A34A]" />}
                  <span>
                    {s.step}. {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Guidance & Action Controls */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 w-full md:w-auto min-w-0 shrink-0">
          <div className="text-[11px] sm:text-xs text-[#6B7280] truncate flex-1 md:flex-none min-w-0">
            <span className="font-semibold text-[#14171A]">{roleConfig.name.split(' / ')[0]}:</span>{' '}
            <span className="truncate">{currentStep.instruction}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {pathname !== currentStep.targetPath && (
              <button
                onClick={handleGoToRole}
                className="h-7 sm:h-8 px-2 sm:px-2.5 bg-[#F5B301] text-[#14171A] font-semibold text-[11px] sm:text-xs rounded-lg hover:bg-[#D49B00] transition-colors cursor-pointer whitespace-nowrap"
              >
                View
              </button>
            )}

            <button
              onClick={prevGuidedStep}
              disabled={guidedStep === 1}
              className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg border border-[#E7E5E0] text-[#6B7280] hover:text-[#14171A] disabled:opacity-40 disabled:pointer-events-none hover:bg-[#F7F7F5] transition-colors cursor-pointer shrink-0"
              title="Previous step"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={nextGuidedStep}
              disabled={guidedStep === 7}
              className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg border border-[#E7E5E0] text-[#6B7280] hover:text-[#14171A] disabled:opacity-40 disabled:pointer-events-none hover:bg-[#F7F7F5] transition-colors cursor-pointer shrink-0"
              title="Next step"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={() => toggleGuidedMode(false)}
              className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#14171A] transition-colors cursor-pointer shrink-0"
              title="Hide guided bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
