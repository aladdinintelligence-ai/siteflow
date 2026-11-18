'use client';

import React from 'react';
import { LiveTrackingData } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveTrackingCardProps {
  visitId: string;
  tracking?: LiveTrackingData;
  allowDriverToggle?: boolean;
  compact?: boolean;
  className?: string;
}

export const LiveTrackingCard: React.FC<LiveTrackingCardProps> = ({
  visitId,
  tracking,
  allowDriverToggle = false,
  compact = false,
  className,
}) => {
  const toggleConsent = useAppStore((s) => s.toggleDriverTrackingConsent);

  if (!tracking) return null;

  const isConsentOn = tracking.consentGranted;
  const progressPercent = Math.max(10, Math.min(95, 100 - (tracking.distanceRemainingKm / 10) * 100));

  if (compact) {
    return (
      <div className={cn('bg-white border border-[#E7E5E0] rounded-[12px] p-3 text-xs shadow-[0_1px_2px_rgba(20,23,26,0.04)]', className)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Radio className="w-3.5 h-3.5 text-[#14171A] shrink-0" />
            <span className="font-medium text-[#14171A] truncate">ETA {tracking.estimatedArrivalMinutes} min</span>
            <span className="text-[#6B7280] shrink-0">· {tracking.distanceRemainingKm} km</span>
          </div>
          <span className="text-[11px] text-[#6B7280] shrink-0">
            {isConsentOn ? 'GPS on' : 'Paused'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 min-w-0">
          <Radio className="w-4 h-4 text-[#14171A] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Vehicle Approach Telematics
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-[#14171A] mt-0.5 leading-snug break-words">
              {tracking.currentLocationName}
            </p>
          </div>
        </div>

        {allowDriverToggle && (
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6B7280] select-none shrink-0 self-start sm:self-auto">
            <span>Location consent</span>
            <input
              type="checkbox"
              checked={isConsentOn}
              onChange={(e) => toggleConsent(visitId, e.target.checked)}
              className="accent-[#14171A] h-4 w-4 rounded cursor-pointer"
            />
          </label>
        )}
      </div>

      {isConsentOn ? (
        <div className="space-y-3 pt-1">
          {/* Progress bar: calm neutral with ink fill */}
          <div className="space-y-1.5">
            <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#14171A] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#6B7280]">
              <span>Dispatched</span>
              <span className="font-semibold text-[#14171A]">
                {tracking.estimatedArrivalMinutes} min ETA ({tracking.distanceRemainingKm} km)
              </span>
              <span>Site gate</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#6B7280] pt-1">
          Location sharing paused by driver. Booking will be retrieved on gate QR scan.
        </p>
      )}

      <p className="text-[11px] text-[#9CA3AF] mt-3 pt-3 border-t border-[#E7E5E0]">
        Note: Telematics are indicative only. Site access remains subject to manager validation.
      </p>
    </div>
  );
};
