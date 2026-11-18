'use client';

import React from 'react';
import { Visit, Order } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { QuantityCompare } from '@/components/shared/QuantityCompare';
import { VisitTimeline } from '@/components/shared/VisitTimeline';
import {
  X,
  MapPin,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ClipboardCheck,
  User,
  Shield,
} from 'lucide-react';

interface SupervisorDetailDrawerProps {
  visit: Visit | null;
  order?: Order;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (visit: Visit) => void;
}

export const SupervisorDetailDrawer: React.FC<SupervisorDetailDrawerProps> = ({
  visit,
  order,
  isOpen,
  onClose,
  onVerify,
}) => {
  if (!isOpen || !visit) return null;

  const hasDiscrepancy = Boolean(visit.discrepancy);
  const variance = visit.discrepancy?.varianceQty ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-[#E7E5E0] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E7E5E0] flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-[#14171A]">
                {visit.orderNumber}
              </span>
              <StatusBadge status={visit.status} size="sm" />
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Receiving Ledger • {visit.destinationName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#14171A] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Material Specification */}
          <div className="bg-[#F7F7F5] border border-[#E7E5E0] rounded-[12px] p-4 space-y-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                Delivered Material / Specification
              </span>
              <h4 className="text-sm font-semibold text-[#14171A] mt-0.5">
                {visit.category}
              </h4>
              <p className="text-xs text-[#6B7280] mt-1">{visit.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E7E5E0] text-[11px]">
              <div>
                <span className="text-[#6B7280] block">Supplier</span>
                <span className="font-medium text-[#14171A]">{visit.supplierName}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block">Site Zone</span>
                <span className="font-medium text-[#14171A]">{visit.destinationName}</span>
                <span className="text-[#9CA3AF] block">{visit.siteName}</span>
              </div>
            </div>
          </div>

          {/* Quantity Reconciliation */}
          <div>
            <QuantityCompare
              orderedQty={visit.orderedQty}
              dispatchedQty={visit.dispatchedQty}
              receivedQty={visit.receivedQty}
              unit={visit.unit}
              discrepancy={visit.discrepancy}
            />
          </div>

          {/* Supervisor Sign-Off & Discrepancy Record */}
          {hasDiscrepancy && visit.discrepancy && (
            <div className="bg-[#FFFFFF] border border-[#DC2626]/20 rounded-[12px] p-4 space-y-2 bg-[#FEE2E2]/20">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold text-xs uppercase tracking-wider">
                  Logged Discrepancy Record
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[#6B7280] block">Variance:</span>
                  <span className="font-semibold text-[#DC2626]">
                    {variance} {visit.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Reason:</span>
                  <span className="font-medium text-[#14171A] capitalize">
                    {visit.discrepancy.reasonCode.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E7E5E0] text-[11px] text-[#6B7280]">
                <p>
                  <strong>Notes:</strong> {visit.discrepancy.notes}
                </p>
                <p className="mt-1 text-[#9CA3AF]">
                  Flagged by: {visit.discrepancy.flaggedBy}
                </p>
              </div>
            </div>
          )}

          {/* Haulage Details */}
          <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-2">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
              Haulage Logistics
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#6B7280] block">Vehicle VRN:</span>
                <span className="font-mono font-medium text-[#14171A]">
                  {visit.vehicleReg}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] block">Driver:</span>
                <span className="font-medium text-[#14171A]">
                  {visit.driverName || 'Driver'}
                </span>
              </div>
            </div>
          </div>

          {/* Chain of Custody Timeline */}
          <div>
            <VisitTimeline visit={visit} order={order} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7E5E0] bg-[#F7F7F5] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="h-10 px-4 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>

          {visit.status === 'on_site' ? (
            <button
              onClick={() => {
                onClose();
                onVerify(visit);
              }}
              className="h-10 px-5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex items-center gap-1.5"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Verify Delivery</span>
            </button>
          ) : (
            <span className="text-xs text-[#16A34A] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified & Certified</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

