import React from 'react';
import { DiscrepancyRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface QuantityCompareProps {
  orderedQty: number;
  dispatchedQty?: number;
  receivedQty?: number;
  unit: string;
  discrepancy?: DiscrepancyRecord;
  compact?: boolean;
  className?: string;
}

export const QuantityCompare: React.FC<QuantityCompareProps> = ({
  orderedQty,
  dispatchedQty,
  receivedQty,
  unit,
  discrepancy,
  compact = false,
  className,
}) => {
  const disp = dispatchedQty !== undefined ? dispatchedQty : orderedQty;
  const isReceivedRecorded = receivedQty !== undefined;
  const variance = isReceivedRecorded ? receivedQty - orderedQty : 0;
  const hasShortage = isReceivedRecorded && variance < -0.01;
  const hasOverDelivery = isReceivedRecorded && variance > 0.01;
  const isMatch = isReceivedRecorded && Math.abs(variance) <= 0.01;

  if (compact) {
    return (
      <div className={cn('inline-flex items-center gap-1.5 text-xs', className)}>
        <span className="text-[#6B7280]">
          {orderedQty} {unit}
        </span>
        <ArrowRight className="w-3 h-3 text-[#9CA3AF]" />
        <span className="font-semibold text-[#14171A]">
          {isReceivedRecorded ? `${receivedQty} ${unit}` : `${disp} ${unit}`}
        </span>
        {hasShortage && (
          <span className="text-[11px] font-medium text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full">
            {variance} {unit}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
          Quantity Reconciliation
        </span>
        {isReceivedRecorded && (
          <div>
            {isMatch && (
              <span className="text-xs font-medium text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                100% matched
              </span>
            )}
            {hasShortage && (
              <span className="text-xs font-medium text-[#DC2626] bg-[#FEE2E2] px-2.5 py-0.5 rounded-full">
                Short {Math.abs(variance)} {unit}
              </span>
            )}
            {hasOverDelivery && (
              <span className="text-xs font-medium text-[#B45309] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full">
                +{variance} {unit} over
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-left">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#6B7280] font-medium block">
            1. Ordered
          </span>
          <span className="text-lg font-semibold text-[#14171A] tabular-nums mt-0.5 block">
            {orderedQty} <span className="text-xs font-normal text-[#6B7280]">{unit}</span>
          </span>
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#6B7280] font-medium block">
            2. Dispatched
          </span>
          <span className="text-lg font-semibold text-[#14171A] tabular-nums mt-0.5 block">
            {disp} <span className="text-xs font-normal text-[#6B7280]">{unit}</span>
          </span>
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#6B7280] font-medium block">
            3. Received
          </span>
          <span
            className={cn(
              'text-lg font-semibold tabular-nums mt-0.5 block',
              isReceivedRecorded
                ? hasShortage
                  ? 'text-[#DC2626]'
                  : 'text-[#14171A]'
                : 'text-[#9CA3AF]'
            )}
          >
            {isReceivedRecorded ? (
              <>
                {receivedQty} <span className="text-xs font-normal text-[#6B7280]">{unit}</span>
              </>
            ) : (
              'Pending'
            )}
          </span>
        </div>
      </div>

      {discrepancy && (
        <div className="mt-4 pt-3 border-t border-[#E7E5E0] flex items-start justify-between text-xs">
          <div>
            <span className="font-medium text-[#14171A]">Discrepancy note: </span>
            <span className="text-[#6B7280]">{discrepancy.notes}</span>
          </div>
          <span className="text-[11px] text-[#9CA3AF] shrink-0 ml-3">
            Logged by {discrepancy.flaggedBy}
          </span>
        </div>
      )}
    </div>
  );
};
