'use client';

import React from 'react';
import { Order, Visit } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VisitTimeline } from '@/components/shared/VisitTimeline';
import { QuantityCompare } from '@/components/shared/QuantityCompare';
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils';
import { X, ArrowRight, Building2, Truck, Calendar, Clock, FileText } from 'lucide-react';

interface OrderDetailDrawerProps {
  order: Order | null;
  visit?: Visit;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  visit,
  onClose,
}) => {
  const { setCurrentRole } = useAppStore();

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#14171A]/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-[#E7E5E0] flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E7E5E0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-[#14171A]">
                {order.orderNumber}
              </span>
              <StatusBadge status={order.status} size="sm" />
            </div>
            <h2 className="text-base font-semibold text-[#14171A] mt-1">
              {order.category}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#9CA3AF] hover:text-[#14171A] hover:bg-[#F7F7F5] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Timeline */}
          <VisitTimeline order={order} visit={visit} />

          {/* Volume Reconciliation */}
          <QuantityCompare
            orderedQty={order.orderedQty}
            dispatchedQty={visit?.dispatchedQty}
            receivedQty={visit?.receivedQty}
            unit={order.unit}
            discrepancy={visit?.discrepancy}
          />

          {/* Logistics & Location Details */}
          <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#6B7280] block">
              Site & Booking Allocation
            </span>

            <div className="space-y-2 border-t border-[#E7E5E0] pt-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Project site</span>
                <span className="font-medium text-[#14171A]">{order.siteName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Unloading destination</span>
                <span className="font-medium text-[#14171A]">{order.destinationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Date & slot</span>
                <span className="font-medium text-[#14171A]">
                  {formatDate(order.requestedDate)} · {order.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Assigned haulier / driver</span>
                <span className="font-medium text-[#14171A]">
                  {visit?.driverName ? `${visit.driverName} (${visit.vehicleReg})` : 'Pending allocation'}
                </span>
              </div>
            </div>
          </div>

          {/* Commercial Terms (Ordering & Supplier Only) */}
          <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#6B7280] block">
              Commercial Terms
            </span>

            <div className="space-y-2 border-t border-[#E7E5E0] pt-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Contractor / Supplier</span>
                <span className="font-medium text-[#14171A]">{order.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Agreed unit rate</span>
                <span className="font-mono text-[#14171A]">
                  £{order.unitPrice} / {order.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Committed order value</span>
                <span className="font-semibold text-[#14171A] text-sm tabular-nums">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Payment conditions</span>
                <span className="text-[#6B7280] max-w-[240px] text-right">{order.commercialTerms}</span>
              </div>
            </div>
          </div>

          {/* Cross-role shortcut button if order is pending */}
          {order.status === 'pending' && (
            <div className="p-4 bg-[#FEF3C7] rounded-[12px] text-xs text-[#B45309] flex items-center justify-between">
              <div>
                <span className="font-semibold block">Awaiting supplier response</span>
                <span>Switch to Supplier role to accept this booking and assign a vehicle.</span>
              </div>
              <button
                onClick={() => {
                  setCurrentRole('supplier');
                  window.location.href = '/supplier';
                }}
                className="h-8 px-3 bg-[#14171A] text-white rounded-lg text-xs font-medium hover:bg-[#2A2F35] transition-colors shrink-0 ml-3 cursor-pointer"
              >
                Go to Supplier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

