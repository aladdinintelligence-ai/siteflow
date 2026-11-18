'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Order } from '@/lib/types';
import { X, Truck, Calendar, MapPin, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AssignDriverModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { drivers, assignDriver, activeSupplierId, suppliers } = useAppStore();

  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [vehicleReg, setVehicleReg] = useState<string>('');
  const [dispatchSlot, setDispatchSlot] = useState<string>('Immediate dispatch');
  const [driverNotes, setDriverNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Filter available drivers for this supplier
  const supplierDrivers = drivers.filter(
    (d) => !activeSupplierId || d.supplierId === (order?.supplierId || activeSupplierId)
  );

  const activeSupplier = suppliers.find(
    (s) => s.id === (order?.supplierId || activeSupplierId)
  );

  // Set default driver and default vehicle reg when modal opens or order changes
  useEffect(() => {
    if (order && supplierDrivers.length > 0) {
      const defaultDrv = supplierDrivers[0];
      setSelectedDriverId(defaultDrv.id);
      setVehicleReg(defaultDrv.defaultVehicleReg);
      setDispatchSlot(order.timeSlot || 'Immediate dispatch');
      setDriverNotes('Follow approved site access route. Standard PPE mandatory on discharge.');
      setError(null);
    }
  }, [order, activeSupplierId]);

  // When driver selection changes, update default vehicle registration
  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    const drv = supplierDrivers.find((d) => d.id === driverId);
    if (drv) {
      setVehicleReg(drv.defaultVehicleReg);
    }
  };

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDriverId) {
      setError('Please select an authorized driver from your fleet.');
      return;
    }

    if (!vehicleReg.trim()) {
      setError('Please provide a valid vehicle registration.');
      return;
    }

    assignDriver(order.id, selectedDriverId, vehicleReg.trim().toUpperCase());
    onClose();
  };

  const selectedDriver = supplierDrivers.find((d) => d.id === selectedDriverId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] w-full max-w-lg shadow-[0_4px_12px_rgba(20,23,26,0.08)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E0]">
          <div>
            <h3 className="text-base font-semibold text-[#14171A]">
              Assign Driver & Vehicle
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Confirm logistics allocation for order{' '}
              <span className="font-mono font-medium text-[#14171A]">{order.orderNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#14171A] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-[#FEE2E2] text-[#DC2626] rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Order Summary Card */}
          <div className="bg-[#F7F7F5] border border-[#E7E5E0] rounded-lg p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                  Material / Service
                </span>
                <span className="font-semibold text-[#14171A] text-sm">
                  {order.category}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
                  Quantity
                </span>
                <span className="font-semibold text-[#14171A] text-sm tabular-nums">
                  {order.orderedQty} {order.unit}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E7E5E0] text-[11px] text-[#6B7280]">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                <span className="truncate">{order.siteName}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Calendar className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                <span className="font-mono">{order.timeSlot}</span>
              </div>
            </div>
          </div>

          {/* Driver Fleet Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
              Authorized Driver <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => handleDriverChange(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
            >
              {supplierDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.hgvClass}
                </option>
              ))}
            </select>
            {selectedDriver && (
              <p className="text-[11px] text-[#6B7280]">
                CSCS / CPCS: <span className="font-mono text-[#14171A]">{selectedDriver.cscsCardNumber}</span> | Contact: {selectedDriver.phone}
              </p>
            )}
          </div>

          {/* Vehicle Registration */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
              Vehicle Registration (VRN) <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <Truck className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                placeholder="e.g. LK21 WZP"
                className="w-full h-10 pl-9 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-mono font-medium text-[#14171A] uppercase focus:outline-none focus:ring-1 focus:ring-[#14171A]"
              />
            </div>
          </div>

          {/* Delivery Slot / Departure Time */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
              Confirmed Delivery Slot / ETA
            </label>
            <input
              type="text"
              value={dispatchSlot}
              onChange={(e) => setDispatchSlot(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
          </div>

          {/* Instructions for Driver */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block">
              Dispatch Instructions (Driver View)
            </label>
            <textarea
              rows={2}
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              placeholder="e.g. Slump test required on discharge. Check in at Gate 1."
              className="w-full p-2.5 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
            <p className="text-[11px] text-[#9CA3AF]">
              Note: Commercial pricing is strictly suppressed from all driver handsets.
            </p>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E5E0]">
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
              Confirm & Dispatch Driver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

