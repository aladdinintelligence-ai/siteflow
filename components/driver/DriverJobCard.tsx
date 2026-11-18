import React from 'react';
import { DriverJobView } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface DriverJobCardProps {
  job: DriverJobView;
  isActive?: boolean;
  onSelect?: () => void;
}

export const DriverJobCard: React.FC<DriverJobCardProps> = ({
  job,
  isActive = false,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'w-full bg-[#FFFFFF] border rounded-[12px] p-5 transition-all text-left cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]',
        isActive ? 'border-[#14171A] ring-1 ring-[#14171A]' : 'border-[#E7E5E0] hover:border-[#D1D5DB]'
      )}
    >
      {/* Top: Status and Order number */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs font-semibold text-[#14171A]">
          {job.orderNumber}
        </span>
        <StatusBadge status={job.status} size="sm" />
      </div>

      {/* Item & Quantity Big */}
      <div className="space-y-0.5 mb-4">
        <h3 className="text-base font-semibold text-[#14171A] leading-tight">
          {job.category}
        </h3>
        <p className="text-xl font-semibold text-[#14171A] tabular-nums">
          {job.dispatchedQty} <span className="text-sm font-normal text-[#6B7280]">{job.unit}</span>
        </p>
      </div>

      {/* Label / Value Rows: Site, Time, Destination */}
      <div className="space-y-1.5 text-xs border-t border-[#E7E5E0] pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[#6B7280]">Site</span>
          <span className="font-medium text-[#14171A] truncate max-w-[200px]">{job.siteName}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#6B7280]">Destination</span>
          <span className="font-medium text-[#14171A] truncate max-w-[200px]">{job.destinationName}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#6B7280]">Gate / Slot</span>
          <span className="font-medium text-[#14171A]">{job.gateName} · {job.timeSlot}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#6B7280]">Vehicle</span>
          <span className="font-mono text-[#14171A]">{job.vehicleReg}</span>
        </div>
      </div>
    </div>
  );
};
