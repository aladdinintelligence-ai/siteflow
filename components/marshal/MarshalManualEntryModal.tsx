'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Visit } from '@/lib/types';
import { X, CheckCircle2, ShieldCheck, MapPin, Truck, Calendar } from 'lucide-react';

interface MarshalManualEntryModalProps {
  visit: Visit | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MarshalManualEntryModal: React.FC<MarshalManualEntryModalProps> = ({
  visit,
  isOpen,
  onClose,
}) => {
  const { scanIn, sites, currentSiteId } = useAppStore();

  if (!isOpen || !visit) return null;

  const currentSite = sites.find((s) => s.id === visit.siteId) || sites[0];
  const primaryGate = currentSite?.gates[0]?.id || 'gate-btr-1';

  const handleAuthorise = () => {
    scanIn(visit.id, primaryGate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] w-full max-w-md shadow-[0_4px_12px_rgba(20,23,26,0.08)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#14171A]">
                Authorise Site Entry
              </h3>
              <p className="text-xs text-[#6B7280]">
                Gate Access Verification
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-[#6B7280]">
            Confirm that the physical vehicle and driver match the pre-registered purchase order booking.
          </p>

          <div className="bg-[#F7F7F5] border border-[#E7E5E0] rounded-lg p-3.5 space-y-2.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                  Vehicle Registration
                </span>
                <span className="font-mono text-base font-semibold text-[#14171A]">
                  {visit.vehicleReg}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                  Order Reference
                </span>
                <span className="font-mono text-xs font-medium text-[#14171A]">
                  {visit.orderNumber}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E7E5E0] space-y-1 text-[11px]">
              <div className="flex justify-between text-[#6B7280]">
                <span>Driver:</span>
                <strong className="text-[#14171A]">{visit.driverName || 'Authorized Driver'}</strong>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Supplier:</span>
                <span className="text-[#14171A]">{visit.supplierName}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Destination:</span>
                <span className="text-[#14171A] font-medium">{visit.destinationName}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Cargo:</span>
                <span className="text-[#14171A]">{visit.orderedQty} {visit.unit} • {visit.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-[#DCFCE7] text-[#16A34A] rounded-lg text-[11px]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Pre-booking verified. Automated induction & gate clearance valid.</span>
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
              type="button"
              onClick={handleAuthorise}
              className="h-10 px-4 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Entry & Open Barrier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

