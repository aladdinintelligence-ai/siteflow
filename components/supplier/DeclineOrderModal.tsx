'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Order } from '@/lib/types';
import { X, AlertTriangle } from 'lucide-react';

interface DeclineOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_REASONS = [
  'Plant batching capacity full for requested time slot',
  'Fleet haulage unavailable / no certified HGV drivers open',
  'Specified aggregate grade / mix currently out of stock',
  'Requested slot outside approved site logistics window',
  'Other / Custom reason',
];

export const DeclineOrderModal: React.FC<DeclineOrderModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { declineOrder } = useAppStore();
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      selectedReason === 'Other / Custom reason'
        ? customReason.trim()
        : selectedReason;

    if (!finalReason) {
      setError('Please provide a reason for declining this order.');
      return;
    }

    declineOrder(order.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] w-full max-w-md shadow-[0_4px_12px_rgba(20,23,26,0.08)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#14171A]">
                Decline Order
              </h3>
              <p className="text-xs text-[#6B7280]">
                Order <span className="font-mono text-[#14171A]">{order.orderNumber}</span>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-[#6B7280]">
            Declining this order will notify the DJ Civil ordering team so they can reschedule or reallocate to another supplier.
          </p>

          {error && (
            <div className="p-2.5 bg-[#FEE2E2] text-[#DC2626] rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
              Reason for Non-Fulfilment
            </label>
            <div className="space-y-2">
              {COMMON_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded-lg border border-[#E7E5E0] hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="declineReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-[#14171A]"
                  />
                  <span className="text-xs text-[#14171A]">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Other / Custom reason' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                Provide specifics
              </label>
              <textarea
                rows={2}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter details regarding plant disruption or logistical constraint..."
                className="w-full p-2.5 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
              />
            </div>
          )}

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
              Confirm Decline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

