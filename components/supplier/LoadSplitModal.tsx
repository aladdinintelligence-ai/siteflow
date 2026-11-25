'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Order } from '@/lib/types';
import { X, Split, Truck, Check, AlertCircle, Info, Layers } from 'lucide-react';

interface LoadSplitModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onLoadsGenerated?: () => void;
}

export const LoadSplitModal: React.FC<LoadSplitModalProps> = ({
  order,
  isOpen,
  onClose,
  onLoadsGenerated,
}) => {
  const { acceptAndSplitOrder, vehicles, activeSupplierId } = useAppStore();
  const [payloadPerLoad, setPayloadPerLoad] = useState<number>(18); // Default 18 tonnes prototype assumption

  if (!isOpen || !order) return null;

  const supplierVehicles = vehicles.filter((v) => v.supplierId === (order.supplierId || activeSupplierId));

  const lines = order.lines && order.lines.length > 0 ? order.lines : [
    {
      id: 'line-1',
      category: order.category,
      description: order.description,
      requestedQty: order.orderedQty,
      unit: order.unit,
      estimatedLoads: order.estimatedLoads || 1,
    },
  ];

  // Calculate loads based on payloadPerLoad
  const calculatedSplits = lines.map((line) => {
    const capacity = line.unit === 'tonnes' ? payloadPerLoad : line.unit === 'litres' ? 5000 : line.unit === 'units' ? 4 : 1;
    const loads = Math.max(1, Math.ceil(line.requestedQty / capacity));
    return {
      ...line,
      calculatedLoads: loads,
      loadWeight: Number((line.requestedQty / loads).toFixed(1)),
    };
  });

  const totalCalculatedLoads = calculatedSplits.reduce((sum, item) => sum + item.calculatedLoads, 0);

  const handleConfirm = () => {
    acceptAndSplitOrder(order.id);
    if (onLoadsGenerated) onLoadsGenerated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E5E0] rounded-[16px] w-full max-w-xl shadow-[0_8px_24px_rgba(20,23,26,0.12)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E0]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#14171A]">
                Load Split & Truck Allocation
              </h3>
              <p className="text-xs text-[#6B7280]">
                Order <span className="font-mono font-medium text-[#14171A]">{order.orderNumber}</span> • Customer: {order.customerName || 'DJ Civils Ltd'}
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

        {/* Prototype Assumption Notice */}
        <div className="p-4 bg-[#F8F8F6] border-b border-[#E7E5E0] text-xs space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-[#14171A]">Vehicle Capacity Assumption</span>
              <p className="text-[#6B7280] leading-relaxed">
                Prototype baseline assumes <strong className="text-[#14171A]">18 tonnes</strong> per standard 8-wheel rigid tipper. Actual load count adapts dynamically to vehicle payload capacity.
              </p>
            </div>
          </div>

          {order.unit === 'tonnes' && (
            <div className="flex items-center gap-3 pt-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Assigned Vehicle Payload:
              </label>
              <div className="flex items-center gap-1.5">
                {[16, 18, 20, 24].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setPayloadPerLoad(cap)}
                    className={`h-7 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      payloadPerLoad === cap
                        ? 'bg-[#14171A] text-white border-[#14171A]'
                        : 'bg-white text-[#14171A] border-[#E7E5E0] hover:bg-[#F7F7F5]'
                    }`}
                  >
                    {cap}t
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Line Items Split Breakdown */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Ordered Material Lines ({lines.length})
            </span>
            <span className="text-xs font-semibold text-[#14171A]">
              Estimated Loads: <strong className="text-[#2563EB] text-sm">{totalCalculatedLoads} Loads</strong>
            </span>
          </div>

          <div className="space-y-3">
            {calculatedSplits.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 bg-white border border-[#E7E5E0] rounded-xl flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#14171A] bg-[#F7F7F5] px-1.5 py-0.5 rounded">
                      Line {idx + 1}
                    </span>
                    <strong className="text-xs font-semibold text-[#14171A]">{item.category}</strong>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">{item.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-[#14171A] block">
                    {item.requestedQty} {item.unit}
                  </span>
                  <span className="text-[11px] font-medium text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {item.calculatedLoads} load{item.calculatedLoads === 1 ? '' : 's'} (~{item.loadWeight} {item.unit}/load)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Destination & Order Summary */}
          <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E7E5E0] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Destination Site</span>
              <span className="font-semibold text-[#14171A]">{order.siteName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Offload Location</span>
              <span className="font-semibold text-[#14171A]">{order.destinationName}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#E7E5E0]">
              <span className="text-[#6B7280]">Total Quantity</span>
              <span className="font-semibold text-[#14171A]">
                {order.orderedQty} {order.unit} ({totalCalculatedLoads} individual delivery loads)
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#E7E5E0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 bg-white hover:bg-[#F7F7F5] text-[#14171A] border border-[#E7E5E0] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-10 px-5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4 text-[#F5B301]" />
            <span>Accept & Split into {totalCalculatedLoads} Loads</span>
          </button>
        </div>
      </div>
    </div>
  );
};

