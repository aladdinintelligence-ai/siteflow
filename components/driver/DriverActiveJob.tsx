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
  const [scanMode, setScanMode] = useState<'entry' | 'exit'>('entry');

  const { scanIn, scanOut } = useAppStore();

  const handleScanSuccess = () => {
    setIsScanning(false);
    if (scanMode === 'exit') {
      scanOut(job.visitId);
      if (onJobCompleted) {
        onJobCompleted();
      }
    } else {
      scanIn(job.visitId, job.gateId);
    }
  };

  const handleStartEntryScan = () => {
    setScanMode('entry');
    setIsScanning(true);
  };

  const handleStartExitScan = () => {
    setScanMode('exit');
    setIsScanning(true);
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

      {/* PHASE 1: EN ROUTE / SCHEDULED - Approach Telematics & Primary Scan Action */}
      {(job.status === 'en_route' || job.status === 'scheduled') && (
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
            onClick={handleStartEntryScan}
            className="w-full h-12 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
          >
            <QrCode className="w-4 h-4 text-[#F5B301]" />
            <span>Scan site gate QR</span>
          </button>
        </div>
      )}

      {/* PHASE 2: AT GATE - QR Scanned, Awaiting Marshal Entry Authorisation */}
      {job.status === 'at_gate' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5B301] animate-pulse" />
                <span className="font-semibold text-[#14171A]">Checked in at gate</span>
              </div>
              <span className="text-[#6B7280] font-mono">{formatDateTime(job.gateEntryAt)}</span>
            </div>
            <p className="text-[#6B7280] leading-relaxed">
              QR scan recorded at {job.gateName}. Traffic marshal Gary O&apos;Connor is matching vehicle{' '}
              <strong className="text-[#14171A] font-mono">{job.vehicleReg}</strong> to the booking ledger.
            </p>
            <div className="p-2.5 bg-[#F7F7F5] rounded-lg text-[11px] text-[#4B5563] flex items-center gap-2 border border-[#E7E5E0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              <span>Awaiting marshal entry authorisation. Site route will unlock shortly.</span>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: ON SITE - Entry Authorised, Booking-Specific Route Map & Direct Scan Out */}
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

          {/* Booking-Specific Site Route Plan */}
          <SitePlan
            site={site}
            activeGateId={job.gateId}
            activeDestinationId={job.destinationId}
            isDriverNavigating={true}
          />

          {/* Operational Guidance */}
          <div className="p-3 sm:p-4 bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] text-xs text-[#6B7280] shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-1">
            <span className="font-medium text-[#14171A] block">
              Direct Route to {job.destinationName}
            </span>
            <p>
              Follow the site route map above. Once delivery or service is complete, return to gate and scan the marshal&apos;s gate QR code to record exit and complete your visit.
            </p>
          </div>

          {/* Primary Action Button: 48px Scan Marshal's QR to Exit */}
          <button
            onClick={handleStartExitScan}
            className="w-full h-12 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
          >
            <QrCode className="w-4 h-4 text-[#F5B301]" />
            <span>Scan marshal&apos;s gate QR to exit</span>
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
          mode={scanMode}
          title={scanMode === 'exit' ? 'Scan Marshal Gate QR (Exit)' : 'Scan Gate QR (Entry)'}
          onScanSuccess={handleScanSuccess}
          onClose={() => setIsScanning(false)}
        />
      )}
    </div>
  );
};
