import React from 'react';
import { Visit, Order } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VisitTimelineProps {
  visit?: Visit;
  order?: Order;
  compact?: boolean;
}

export const VisitTimeline: React.FC<VisitTimelineProps> = ({
  visit,
  order,
  compact = false,
}) => {
  const steps = [
    {
      key: 'ordered',
      label: 'Ordered',
      sublabel: 'Commercial',
      timestamp: order?.createdAt,
      isDone: Boolean(order?.createdAt),
      isCurrent: order?.status === 'pending',
    },
    {
      key: 'accepted',
      label: 'Accepted',
      sublabel: visit?.supplierName ? 'Confirmed' : 'Supplier',
      timestamp: visit?.scheduledAt,
      isDone: ['accepted', 'dispatched', 'on_site', 'verified', 'completed', 'disputed'].includes(
        order?.status || ''
      ) || Boolean(visit),
      isCurrent: order?.status === 'accepted' && !visit?.driverId,
    },
    {
      key: 'dispatched',
      label: 'Dispatched',
      sublabel: visit?.vehicleReg || 'Driver',
      timestamp: visit?.dispatchedAt,
      isDone: ['dispatched', 'on_site', 'verified', 'completed', 'disputed'].includes(
        order?.status || ''
      ) && Boolean(visit?.dispatchedAt),
      isCurrent: visit?.status === 'en_route',
    },
    {
      key: 'gate_in',
      label: 'Gate in',
      sublabel: 'Auto QR',
      timestamp: visit?.gateEntryAt,
      isDone: Boolean(visit?.gateEntryAt),
      isCurrent: visit?.status === 'on_site',
    },
    {
      key: 'verified',
      label: 'Verified',
      sublabel: visit?.discrepancy ? `${visit.discrepancy.varianceQty} ${visit.unit}` : 'Received',
      timestamp: visit?.verifiedAt,
      isDone: Boolean(visit?.verifiedAt),
      isCurrent: visit?.status === 'verified' && !visit?.gateExitAt,
      discrepancy: Boolean(visit?.discrepancy),
    },
    {
      key: 'gate_out',
      label: 'Gate out',
      sublabel: visit?.durationMinutes ? `${visit.durationMinutes}m` : 'Exit',
      timestamp: visit?.gateExitAt,
      isDone: Boolean(visit?.gateExitAt),
      isCurrent: false,
    },
  ];

  if (compact) {
    return (
      <div className="w-full py-1">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[1px] bg-[#E7E5E0] -z-0" />
          {steps.map((s) => (
            <div key={s.key} className="flex flex-col items-center z-10">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  s.isCurrent
                    ? 'bg-[#F5B301] ring-2 ring-[#FEF3C7]'
                    : s.isDone
                    ? 'bg-[#14171A]'
                    : 'bg-[#FFFFFF] border border-[#D1D5DB]'
                )}
                title={`${s.label}: ${s.timestamp ? formatDateTime(s.timestamp) : 'Pending'}`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
          Chain of custody timeline
        </span>
        <span className="text-xs text-[#9CA3AF] font-mono">
          Ref: {visit?.id || order?.orderNumber || 'Pending'}
        </span>
      </div>

      <div className="relative">
        {/* Subtle connector line */}
        <div className="hidden sm:block absolute left-4 right-4 top-2 h-[1px] bg-[#E7E5E0] -z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
          {steps.map((s) => (
            <div key={s.key} className="flex flex-col sm:items-center sm:text-center">
              <div
                className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center mb-2 transition-all',
                  s.isCurrent
                    ? 'bg-[#F5B301] ring-4 ring-[#FEF3C7]'
                    : s.isDone
                    ? 'bg-[#14171A]'
                    : 'bg-[#FFFFFF] border border-[#D1D5DB]'
                )}
              >
                {s.isDone && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

              <span className="text-xs font-semibold text-[#14171A]">{s.label}</span>
              <span className="text-[11px] text-[#6B7280]">{s.sublabel}</span>
              <span className="text-[11px] font-mono text-[#9CA3AF] mt-0.5">
                {s.timestamp ? formatDateTime(s.timestamp) : '—'}
              </span>

              {s.discrepancy && (
                <span className="mt-1 text-[11px] font-medium text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.5 rounded-full">
                  Discrepancy
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
