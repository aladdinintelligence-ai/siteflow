'use client';

import React from 'react';
import { Order, Visit } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { QuantityCompare } from '@/components/shared/QuantityCompare';
import { VisitTimeline } from '@/components/shared/VisitTimeline';
import { formatCurrency } from '@/lib/utils';
import {
  X,
  Building2,
  Calendar,
  Truck,
  CreditCard,
  FileText,
  User,
  AlertTriangle,
  CheckCircle2,
  Phone,
} from 'lucide-react';

interface SupplierOrderDetailsDrawerProps {
  order: Order | null;
  visit?: Visit;
  isOpen: boolean;
  onClose: () => void;
  onAssignDriver: (order: Order) => void;
  onDeclineOrder: (order: Order) => void;
}

export const SupplierOrderDetailsDrawer: React.FC<SupplierOrderDetailsDrawerProps> = ({
  order,
  visit,
  isOpen,
  onClose,
  onAssignDriver,
  onDeclineOrder,
}) => {
  if (!isOpen || !order) return null;

  const hasDiscrepancy = Boolean(visit?.discrepancy);
  const variance = visit?.discrepancy?.varianceQty ?? 0;
  const unitPrice = order.unitPrice || 0;
  const creditNoteAmount = hasDiscrepancy ? Math.abs(variance * unitPrice) : 0;
  const netInvoiced = Math.max(0, order.totalPrice - creditNoteAmount);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-[#E7E5E0] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E7E5E0] flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-[#14171A]">
                {order.orderNumber}
              </span>
              <StatusBadge status={order.status} size="sm" />
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Client: DJ Civil Engineering Ltd • {order.siteName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#14171A] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Order Item Details */}
          <div className="bg-[#F7F7F5] border border-[#E7E5E0] rounded-[12px] p-4 space-y-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                Ordered Item / Specification
              </span>
              <h4 className="text-sm font-semibold text-[#14171A] mt-0.5">
                {order.category}
              </h4>
              <p className="text-xs text-[#6B7280] mt-1">{order.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E7E5E0] text-[11px]">
              <div>
                <span className="text-[#6B7280] block">Site & Offload Destination</span>
                <span className="font-medium text-[#14171A]">{order.destinationName}</span>
                <span className="text-[#9CA3AF] block">{order.siteName}</span>
              </div>
              <div>
                <span className="text-[#6B7280] block">Delivery Window</span>
                <span className="font-mono font-medium text-[#14171A]">{order.timeSlot}</span>
                <span className="text-[#9CA3AF] block">{order.requestedDate}</span>
              </div>
            </div>
          </div>

          {/* Quantity Reconciliation */}
          <div>
            <QuantityCompare
              orderedQty={order.orderedQty}
              dispatchedQty={visit?.dispatchedQty ?? (order.status !== 'pending' ? order.orderedQty : undefined)}
              receivedQty={visit?.receivedQty}
              unit={order.unit}
              discrepancy={visit?.discrepancy}
            />
          </div>

          {/* Sales Value & Credit Note Settlement */}
          <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
              Commercial Settlement
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#6B7280]">
                <span>Contract Unit Rate:</span>
                <span className="font-mono text-[#14171A]">
                  {formatCurrency(unitPrice)} / {order.unit}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#6B7280]">
                <span>Ordered Total Value ({order.orderedQty} {order.unit}):</span>
                <span className="font-medium text-[#14171A] tabular-nums">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>

              {hasDiscrepancy && (
                <div className="flex justify-between items-center text-[#DC2626] bg-[#FEE2E2] p-2 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Credit Note Adjustment ({variance} {order.unit}):</span>
                  </div>
                  <span className="font-mono font-semibold tabular-nums">
                    -{formatCurrency(creditNoteAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-[#E7E5E0] font-semibold text-sm text-[#14171A]">
                <span>Net Invoiced Value:</span>
                <span className="tabular-nums font-mono text-base">
                  {formatCurrency(netInvoiced)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#9CA3AF] pt-1">
              Terms: {order.commercialTerms}
            </p>
          </div>

          {/* Assigned Driver & Vehicle */}
          <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Logistics Allocation
              </span>
              {visit?.driverName && (
                <button
                  onClick={() => onAssignDriver(order)}
                  className="text-[11px] font-medium text-[#14171A] hover:underline cursor-pointer"
                >
                  Change driver
                </button>
              )}
            </div>

            {visit?.driverName ? (
              <div className="flex items-center gap-3 bg-[#F7F7F5] p-3 rounded-lg border border-[#E7E5E0]">
                <div className="w-10 h-10 rounded-full bg-white border border-[#E7E5E0] flex items-center justify-center text-[#14171A] font-semibold text-xs shrink-0">
                  <User className="w-5 h-5 text-[#6B7280]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-[#14171A] block truncate">
                    {visit.driverName}
                  </span>
                  <span className="text-[11px] text-[#6B7280] flex items-center gap-1.5 mt-0.5">
                    <Truck className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span className="font-mono font-medium text-[#14171A]">
                      {visit.vehicleReg}
                    </span>
                  </span>
                </div>
                <div className="text-right">
                  <StatusBadge status={visit.status} size="sm" />
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-[#F7F7F5] rounded-lg border border-dashed border-[#E7E5E0]">
                <p className="text-xs text-[#6B7280]">No driver currently assigned.</p>
                <button
                  onClick={() => onAssignDriver(order)}
                  className="mt-2 h-8 px-3 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Assign Driver Now
                </button>
              </div>
            )}
          </div>

          {/* Chain of Custody Timeline */}
          <div>
            <VisitTimeline visit={visit} order={order} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E7E5E0] bg-[#F7F7F5] flex items-center justify-between gap-3 shrink-0">
          {order.status === 'pending' ? (
            <>
              <button
                onClick={() => onDeclineOrder(order)}
                className="h-10 px-4 bg-white border border-[#E7E5E0] hover:bg-[#FEE2E2] hover:text-[#DC2626] text-[#6B7280] rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Decline Order
              </button>
              <button
                onClick={() => onAssignDriver(order)}
                className="h-10 px-5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
              >
                Accept & Assign Driver
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">
                Status:{' '}
                <span className="font-medium text-[#14171A] capitalize">
                  {order.status.replace('_', ' ')}
                </span>
              </span>
              <button
                onClick={onClose}
                className="h-10 px-4 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

