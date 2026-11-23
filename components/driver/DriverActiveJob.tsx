'use client';

import React, { useState } from 'react';
import { DriverJobView, Site } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { CameraQrScanner } from './CameraQrScanner';
import { LiveTrackingCard } from '@/components/shared/LiveTrackingCard';
import { SitePlan } from '@/components/shared/SitePlan';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { QrCode, LogOut, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverActiveJobProps {
  job: DriverJobView;
  site: Site;
  onJobCompleted?: () => void;
}

export const DriverActiveJob: React.FC<DriverActiveJobProps> = ({
  job,
  site,
  onJobCompleted,
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const { scanIn, scanOut } = useAppStore();

  const handleScanSuccess = () => {
    setIsScanning(false);
    scanIn(job.visitId, job.gateId);
  };

  const handleScanOut = () => {
    scanOut(job.visitId);
    if (onJobCompleted) {
      onJobCompleted();
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Clean White Job Card: Item & Quantity Big, then Label/Value Rows */}
      <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3 sm:space-y-4">
        {/* Top Header: Order Number & Status Pill */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-[#14171A]">
            {job.orderNumber}
          </span>
          <StatusBadge status={job.status} size="sm" />
        </div>

        {/* Item & Quantity Big */}
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-semibold text-[#14171A] leading-snug">
            {job.category}
          </h2>
          <p className="text-xl sm:text-2xl font-semibold text-[#14171A] tabular-nums">
            {job.dispatchedQty} <span className="text-sm font-normal text-[#6B7280]">{job.unit}</span>
          </p>
          <p className="text-xs text-[#6B7280] pt-0.5 leading-relaxed">{job.description}</p>
        </div>

        {/* Label / Value Rows */}
        <div className="space-y-2 text-xs border-t border-[#E7E5E0] pt-3 sm:pt-4">
          <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-0.5 xs:gap-3">
            <span className="text-[#6B7280] shrink-0">Site</span>
            <span className="font-medium text-[#14171A] xs:text-right break-words">
              {job.siteName}
            </span>
          </div>

          <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-0.5 xs:gap-3">
            <span className="text-[#6B7280] shrink-0">Destination</span>
            <span className="font-medium text-[#14171A] xs:text-right break-words">
              {job.destinationName}
            </span>
          </div>

          <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-0.5 xs:gap-3">
            <span className="text-[#6B7280] shrink-0">Gate & slot</span>
            <span className="font-medium text-[#14171A] xs:text-right break-words">
              {job.gateName} · {job.timeSlot}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[#6B7280] shrink-0">Vehicle registration</span>
            <span className="font-mono font-medium text-[#14171A]">{job.vehicleReg}</span>
          </div>
        </div>
      </div>

      {/* PHASE 1: EN ROUTE - Approach Telematics & Primary Scan Action */}
      {job.status === 'en_route' && (
        <div className="space-y-3 sm:space-y-4">
          {job.tracking && (
            <LiveTrackingCard
              visitId={job.visitId}
              tracking={job.tracking}
              allowDriverToggle={true}
            />
          )}

          {/* Primary Action Button: 48px in driver view */}
          <button
            onClick={() => setIsScanning(true)}
            className="w-full h-12 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
          >
            <QrCode className="w-4 h-4 text-[#F5B301]" />
            <span>Scan site gate QR</span>
          </button>
        </div>
      )}

      {/* PHASE 2 & 3: ON SITE - Entry Authorised & Route Map */}
      {job.status === 'on_site' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Calm Status Confirmation */}
          <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] p-3 sm:p-4 flex items-center justify-between text-xs shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span className="font-medium text-[#14171A]">Gate entry authorised</span>
            </div>
            <span className="text-[#6B7280] font-mono">{formatDateTime(job.gateEntryAt)}</span>
          </div>

          {/* Site Route Plan */}
          <SitePlan
            site={site}
            activeGateId={job.gateId}
            activeDestinationId={job.destinationId}
            isDriverNavigating={true}
          />

          {/* Subdued supervisor notice */}
          <div className="p-3 sm:p-4 bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] text-xs text-[#6B7280] shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
            <span className="font-medium text-[#14171A] block mb-0.5">
              Awaiting delivery verification
            </span>
            Please offload at {job.destinationName}. The receiving supervisor will sign off the actual
            quantity on their tablet.
          </div>
        </div>
      )}

      {/* PHASE 4: VERIFIED - Supervisor Signed Off, Ready to Scan Out */}
      {job.status === 'verified' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#16A34A] flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Delivery verified
              </span>
              <span className="text-[#6B7280] font-mono">{formatDateTime(job.verifiedAt)}</span>
            </div>
            <p className="text-[#6B7280]">
              Supervisor sign-off confirmed. Proceed to gate exit.
            </p>
          </div>

          {/* Primary Action Button: 48px Scan Out */}
          <button
            onClick={handleScanOut}
            className="w-full h-12 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
          >
            <LogOut className="w-4 h-4 text-[#F5B301]" />
            <span>Scan out (exit site)</span>
          </button>
        </div>
      )}

      {/* PHASE 5: COMPLETED */}
      {job.status === 'completed' && (
        <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#14171A]">Trip completed</span>
            <span className="text-xs font-medium text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
              Closed
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-[#E7E5E0] pt-3 text-center">
            <div>
              <span className="text-[11px] text-[#6B7280] block">Gate in</span>
              <span className="font-mono text-[#14171A] font-medium">{formatDateTime(job.gateEntryAt)}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#6B7280] block">Gate out</span>
              <span className="font-mono text-[#14171A] font-medium">{formatDateTime(job.gateExitAt)}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#6B7280] block">Duration</span>
              <span className="font-mono text-[#14171A] font-semibold">{job.durationMinutes || 32} min</span>
            </div>
          </div>
        </div>
      )}

      {/* Real Device Camera QR Scanner with Simulation Fallback */}
      {isScanning && (
        <CameraQrScanner
          orderNumber={job.orderNumber}
          gateName={job.gateName}
          onScanSuccess={handleScanSuccess}
          onClose={() => setIsScanning(false)}
        />
      )}
    </div>
  );
};
