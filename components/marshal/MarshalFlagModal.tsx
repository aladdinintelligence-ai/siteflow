'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Visit } from '@/lib/types';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface MarshalFlagModalProps {
  visit: Visit | null;
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_FLAG_REASONS = [
  'VRN mismatch: Vehicle registration does not match advance booking',
  'Driver PPE non-compliant: Missing 5-point PPE or safety boots',
  'Safety induction expired / CSCS credential invalid at gate',
  'Unscheduled delivery: Vehicle arrived >60 mins outside booked slot',
  'Vehicle condition hazard: Hydraulic fluid leak or load insecure',
  'Custom security / access exception',
];

export const MarshalFlagModal: React.FC<MarshalFlagModalProps> = ({
  visit,
  isOpen,
  onClose,
}) => {
  const { marshalFlagException } = useAppStore();
  const [selectedReason, setSelectedReason] = useState(COMMON_FLAG_REASONS[0]);
  const [customDetails, setCustomDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !visit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      selectedReason === 'Custom security / access exception'
        ? customDetails.trim()
        : customDetails.trim()
        ? `${selectedReason}: ${customDetails.trim()}`
        : selectedReason;

    if (!finalReason) {
      setError('Please provide specific details regarding this gate exception.');
      return;
    }

    marshalFlagException(visit.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] w-full max-w-lg shadow-[0_4px_12px_rgba(20,23,26,0.08)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#14171A]">
                Flag Gate Exception
              </h3>
              <p className="text-xs text-[#6B7280]">
                Vehicle <span className="font-mono font-medium text-[#14171A]">{visit.vehicleReg}</span> • {visit.supplierName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#14171A] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-[#F7F7F5] border border-[#E7E5E0] rounded-lg p-3 text-[11px] text-[#6B7280] space-y-1">
            <div className="flex justify-between">
              <span>Driver: <strong className="text-[#14171A]">{visit.driverName || 'Unassigned'}</strong></span>
              <span>Order: <strong className="font-mono text-[#14171A]">{visit.orderNumber}</strong></span>
            </div>
            <div>Destination: <strong className="text-[#14171A]">{visit.destinationName}</strong></div>
          </div>

          {error && (
            <div className="p-2.5 bg-[#FEE2E2] text-[#DC2626] rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
              Exception Classification
            </label>
            <div className="space-y-1.5">
              {COMMON_FLAG_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2 rounded-lg border border-[#E7E5E0] hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="flagReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-[#14171A]"
                  />
                  <span className="text-xs text-[#14171A]">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
              Marshal Notes & Corrective Action
            </label>
            <textarea
              rows={2}
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder="e.g. Vehicle held in bay 2 pending Project Manager authorisation..."
              className="w-full p-2.5 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E5E0]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Confirm Gate Exception
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

