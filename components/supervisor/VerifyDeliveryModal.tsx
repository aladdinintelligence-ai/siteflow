'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Visit, DiscrepancyRecord } from '@/lib/types';
import { X, CheckCircle2, AlertTriangle, Scale, ClipboardCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifyDeliveryModalProps {
  visit: Visit | null;
  isOpen: boolean;
  onClose: () => void;
}

const REASON_CODES: { code: DiscrepancyRecord['reasonCode']; label: string }[] = [
  { code: 'shortage', label: 'Delivery Shortage (weighed / counted shortfall)' },
  { code: 'rejected_spec', label: 'Rejected Spec (failed slump / cube / quality test)' },
  { code: 'damaged', label: 'Transit Damage (broken packaging / bent units)' },
  { code: 'moisture_loss', label: 'Moisture / Evaporation Loss during transit' },
  { code: 'over_delivery', label: 'Over-Delivery (quantity exceeds purchase order)' },
  { code: 'late_arrival', label: 'Late Arrival (missed concrete pour window)' },
];

export const VerifyDeliveryModal: React.FC<VerifyDeliveryModalProps> = ({
  visit,
  isOpen,
  onClose,
}) => {
  const { verifyDelivery } = useAppStore();

  const [receivedQty, setReceivedQty] = useState<number>(0);
  const [isDisputed, setIsDisputed] = useState<boolean>(false);
  const [reasonCode, setReasonCode] = useState<DiscrepancyRecord['reasonCode']>('shortage');
  const [proofNote, setProofNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visit) {
      const defaultQty = visit.receivedQty ?? visit.dispatchedQty ?? visit.orderedQty;
      setReceivedQty(defaultQty);
      setIsDisputed(visit.serviceCompletedStatus === 'disputed' || visit.status === 'flagged');
      setReasonCode(visit.discrepancy?.reasonCode || 'shortage');
      setProofNote(
        visit.discrepancy?.notes ||
          'Material physically inspected at offload point. Ticket signed & verified against purchase order.'
      );
      setError(null);
    }
  }, [visit]);

  if (!isOpen || !visit) return null;

  const targetQty = visit.orderedQty;
  const variance = Number((receivedQty - targetQty).toFixed(2));
  const hasVariance = Math.abs(variance) > 0.001;

  const handleFullDelivery = () => {
    setReceivedQty(visit.orderedQty);
    setIsDisputed(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (receivedQty < 0) {
      setError('Received quantity cannot be negative.');
      return;
    }

    if (hasVariance && !proofNote.trim()) {
      setError('Please provide supervisor notes documenting the discrepancy.');
      return;
    }

    verifyDelivery(
      visit.id,
      receivedQty,
      isDisputed,
      proofNote.trim(),
      hasVariance ? reasonCode : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] w-full max-w-lg shadow-[0_4px_12px_rgba(20,23,26,0.08)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#14171A]">
                Verify Delivery & Sign Off
              </h3>
              <p className="text-xs text-[#6B7280]">
                Order <span className="font-mono text-[#14171A]">{visit.orderNumber}</span> • {visit.destinationName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-[#FEE2E2] text-[#DC2626] rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Delivery Item Summary Card */}
          <div className="bg-[#F7F7F5] border border-[#E7E5E0] rounded-lg p-3.5 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                  Material / Cargo Specification
                </span>
                <span className="font-semibold text-sm text-[#14171A]">
                  {visit.category}
                </span>
                <p className="text-xs text-[#6B7280] mt-0.5">{visit.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E7E5E0] text-[11px]">
              <div>
                <span className="text-[#6B7280] block">Supplier</span>
                <span className="font-medium text-[#14171A] truncate block">{visit.supplierName}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block">Vehicle VRN</span>
                <span className="font-mono font-medium text-[#14171A]">{visit.vehicleReg}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block">Driver</span>
                <span className="font-medium text-[#14171A] truncate block">{visit.driverName || 'Driver'}</span>
              </div>
            </div>
          </div>

          {/* Side-by-side Ordered vs Dispatched vs Actual Received */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Delivered Quantity Verification <span className="text-[#DC2626]">*</span>
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleFullDelivery}
                  className="h-6 px-2 bg-white border border-[#E7E5E0] hover:bg-[#DCFCE7] hover:text-[#16A34A] text-[#14171A] rounded text-[10px] font-medium transition-colors cursor-pointer"
                >
                  Match Ordered Quantity
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#FFFFFF] border border-[#E7E5E0] p-3 rounded-lg">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                  1. Ordered
                </span>
                <span className="text-base font-semibold text-[#14171A] tabular-nums mt-0.5 block">
                  {visit.orderedQty} <span className="text-xs font-normal text-[#6B7280]">{visit.unit}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                  2. Dispatched
                </span>
                <span className="text-base font-semibold text-[#14171A] tabular-nums mt-0.5 block">
                  {visit.dispatchedQty ?? visit.orderedQty} <span className="text-xs font-normal text-[#6B7280]">{visit.unit}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#14171A] block">
                  3. Actual Received
                </span>
                <div className="relative mt-0.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={receivedQty}
                    onChange={(e) => setReceivedQty(parseFloat(e.target.value) || 0)}
                    className="w-full h-8 px-2 bg-[#F7F7F5] border border-[#E7E5E0] rounded text-sm font-semibold text-[#14171A] tabular-nums focus:outline-none focus:ring-1 focus:ring-[#14171A]"
                  />
                </div>
              </div>
            </div>

            {/* Reconciliation Variance Callout */}
            <div className="pt-1">
              {!hasVariance && !isDisputed ? (
                <div className="flex items-center gap-2 p-2.5 bg-[#DCFCE7] text-[#16A34A] rounded-lg">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-medium">100% Reconciled: Received matches ordered volume exactly.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-[#FEE2E2] text-[#DC2626] rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="font-medium">
                      Discrepancy: {variance > 0 ? `+${variance}` : variance} {visit.unit} {variance < 0 ? 'shortfall' : 'over-delivery'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-white/60 rounded">
                    Variance Logged
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reason Code Dropdown (shown when discrepancy exists) */}
          {hasVariance && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                Discrepancy Classification
              </label>
              <select
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value as DiscrepancyRecord['reasonCode'])}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                {REASON_CODES.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Service completion / dispute toggle (if service type) */}
          {visit.type === 'service' && (
            <div className="space-y-2 p-3 bg-[#F7F7F5] rounded-lg border border-[#E7E5E0]">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                Service Performance Sign-Off
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisputed(false)}
                  className={cn(
                    'flex-1 h-9 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center justify-center gap-1.5',
                    !isDisputed
                      ? 'bg-[#14171A] text-white border-[#14171A]'
                      : 'bg-white text-[#6B7280] border-[#E7E5E0] hover:bg-[#F7F7F5]'
                  )}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Certified Complete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDisputed(true)}
                  className={cn(
                    'flex-1 h-9 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center justify-center gap-1.5',
                    isDisputed
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-white text-[#6B7280] border-[#E7E5E0] hover:bg-[#FEE2E2]'
                  )}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Contested / Disputed</span>
                </button>
              </div>
            </div>
          )}

          {/* Supervisor Notes & Proof */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
              Supervisor Notes & Delivery Receipt Reference
            </label>
            <textarea
              rows={2}
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="e.g. Weighbridge ticket #8841 recorded 18.5t net. Driver signed shortage voucher..."
              className="w-full p-2.5 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
          </div>

          {/* Supervisor Sign-Off Badge */}
          <div className="flex items-center justify-between p-2.5 bg-[#F7F7F5] rounded-lg text-[11px] text-[#6B7280]">
            <span>Receiving Officer: <strong className="text-[#14171A]">Gary Nolan (Supervisor)</strong></span>
            <span className="font-mono text-[#9CA3AF]">CSCS-440219</span>
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
              className="h-10 px-4 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
            >
              Confirm Verification & Sign Off
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

