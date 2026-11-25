'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Order } from '@/lib/types';
import { X, MessageSquare, Send, AlertCircle, Building2, MapPin } from 'lucide-react';

interface ClarificationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { requestClarification } = useAppStore();
  const [notes, setNotes] = useState(
    'Please clarify access conditions: is a dedicated banksman mandatory for 8-wheel tippers reversing into Phase 2A Link Road Delivery Bay 1?'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide clarification details or questions for the site manager.');
      return;
    }
    requestClarification(order.id, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E5E0] rounded-[16px] w-full max-w-lg shadow-[0_8px_24px_rgba(20,23,26,0.12)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E0]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#B45309]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#14171A]">
                Request Order Clarification
              </h3>
              <p className="text-xs text-[#6B7280]">
                Send technical or delivery inquiry to <span className="font-medium text-[#14171A]">{order.orderedBy || 'Chris (Site Manager)'}</span>
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

        {/* Order Reference Box */}
        <div className="px-6 py-3.5 bg-[#F8F8F6] border-b border-[#E7E5E0] text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold text-[#14171A]">{order.orderNumber}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-semibold uppercase">
              {order.status.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B7280]">
            <div>
              <span>Customer:</span> <strong className="text-[#14171A]">{order.customerName || 'DJ Civils Ltd'}</strong>
            </div>
            <div>
              <span>Destination:</span> <strong className="text-[#14171A]">{order.destinationName}</strong>
            </div>
          </div>
        </div>

        {/* Clarification Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg flex items-center gap-2 text-xs text-[#B91C1C]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1.5">
              Inquiry / Clarification Notes
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specify questions regarding discharge window, vehicle dimensions, access permits, or unloading bay restrictions..."
              className="w-full p-3 bg-white border border-[#E7E5E0] rounded-xl text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] resize-none leading-relaxed"
            />
            <p className="text-[11px] text-[#9CA3AF] mt-1.5">
              This message will be logged on the order audit history and notified directly to Chris Jones.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E7E5E0]">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 bg-white hover:bg-[#F7F7F5] text-[#14171A] border border-[#E7E5E0] rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Clarification Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
