'use client';

import React, { useState } from 'react';
import { DeliveryLoad } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { Truck, MapPin, QrCode, CheckCircle2, Clock, Send, ShieldCheck, ChevronRight, User } from 'lucide-react';

interface LoadDispatchCardProps {
  load: DeliveryLoad;
  onTrackLoad?: (load: DeliveryLoad) => void;
}

export const LoadDispatchCard: React.FC<LoadDispatchCardProps> = ({ load, onTrackLoad }) => {
  const { drivers, vehicles, assignDriverToLoad, dispatchLoad, updateLoadStatus } = useAppStore();
  const [isEditingDriver, setIsEditingDriver] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(load.driverId || '');
  const [selectedVehicleReg, setSelectedVehicleReg] = useState(load.vehicleReg || '');
  const [showQrModal, setShowQrModal] = useState(false);

  const supplierDrivers = drivers.filter((d) => d.supplierId === load.supplierId);
  const supplierVehicles = vehicles.filter((v) => v.supplierId === load.supplierId);

  const handleDriverSave = () => {
    if (selectedDriverId) {
      assignDriverToLoad(load.id, selectedDriverId, selectedVehicleReg);
      setIsEditingDriver(false);
    }
  };

  const getStatusBadge = () => {
    switch (load.status) {
      case 'dispatched':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[11px] font-semibold flex items-center gap-1 border border-[#BFDBFE]">
            <Clock className="w-3 h-3 animate-spin" /> In Transit (ETA ~12m)
          </span>
        );
      case 'at_gate':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-[11px] font-semibold flex items-center gap-1 border border-[#FDE68A]">
            <ShieldCheck className="w-3 h-3" /> At Gate 1
          </span>
        );
      case 'on_site':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#F3E8FF] text-[#7E22CE] text-[11px] font-semibold flex items-center gap-1 border border-[#E9D5FF]">
            <Truck className="w-3 h-3" /> Discharging on Site
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold flex items-center gap-1 border border-[#BBF7D0]">
            <CheckCircle2 className="w-3 h-3" /> Delivery Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#4B5563] text-[11px] font-semibold border border-[#E5E7EB]">
            Assigned • Ready for Dispatch
          </span>
        );
    }
  };

  return (
    <>
      <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(20,23,26,0.05)] hover:border-[#14171A]/30 transition-all flex flex-col justify-between gap-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-[#14171A] tracking-tight">
                {load.loadNumber}
              </span>
              <span className="text-xs text-[#6B7280]">
                • Order <strong className="text-[#14171A] font-mono">{load.orderNumber}</strong>
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Customer: <strong className="text-[#14171A]">{load.customerName}</strong>
            </p>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Material & Destination Info */}
        <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E7E5E0] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] font-medium uppercase tracking-wider text-[10px]">
              Material / Service
            </span>
            <span className="font-bold text-[#14171A] text-sm">
              {load.quantity} {load.unit}
            </span>
          </div>
          <div className="font-semibold text-[#14171A] text-xs">{load.material}</div>

          <div className="pt-2 border-t border-[#E7E5E0] grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#6B7280] block text-[10px]">Site Destination</span>
              <span className="font-medium text-[#14171A]">{load.siteName}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[10px]">Specific Offload Point</span>
              <span className="font-medium text-[#14171A] truncate block" title={load.destinationName}>
                {load.destinationName}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Driver & Vehicle Section */}
        <div className="flex items-center justify-between p-3 bg-white border border-[#E7E5E0] rounded-xl text-xs">
          {!isEditingDriver ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] border border-[#E7E5E0] flex items-center justify-center text-[#14171A]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-[#14171A] block">
                  {load.driverName || 'Unassigned Driver'}
                </span>
                <span className="font-mono text-[11px] text-[#6B7280]">
                  {load.vehicleReg || 'No Vehicle Reg'} {load.vehicleCapacity ? `(${load.vehicleCapacity}t)` : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedDriverId}
                  onChange={(e) => {
                    setSelectedDriverId(e.target.value);
                    const d = supplierDrivers.find((drv) => drv.id === e.target.value);
                    if (d) setSelectedVehicleReg(d.defaultVehicleReg);
                  }}
                  className="h-8 px-2 bg-white border border-[#E7E5E0] rounded-md text-xs font-medium"
                >
                  <option value="">Select Driver</option>
                  {supplierDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Vehicle Reg"
                  value={selectedVehicleReg}
                  onChange={(e) => setSelectedVehicleReg(e.target.value.toUpperCase())}
                  className="h-8 px-2 bg-white border border-[#E7E5E0] rounded-md text-xs font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingDriver(false)}
                  className="h-7 px-2.5 text-[11px] text-[#6B7280] hover:text-[#14171A]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDriverSave}
                  className="h-7 px-3 bg-[#14171A] text-white rounded text-[11px] font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {!isEditingDriver && load.status !== 'completed' && load.status !== 'dispatched' && (
            <button
              type="button"
              onClick={() => setIsEditingDriver(true)}
              className="text-[11px] text-[#2563EB] hover:underline font-medium cursor-pointer"
            >
              Reassign
            </button>
          )}
        </div>

        {/* Action Controls & QR Code Link */}
        <div className="pt-2 border-t border-[#E7E5E0] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="h-9 px-3 bg-white hover:bg-[#F7F7F5] border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#14171A] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Load QR</span>
          </button>

          <div className="flex items-center gap-2">
            {load.status === 'assigned' && (
              <button
                type="button"
                onClick={() => dispatchLoad(load.id)}
                className="h-9 px-4 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch / Start Journey</span>
              </button>
            )}

            {(load.status === 'dispatched' || load.status === 'at_gate' || load.status === 'on_site') && onTrackLoad && (
              <button
                type="button"
                onClick={() => onTrackLoad(load)}
                className="h-9 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Live Tracking</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Inspection Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E7E5E0] rounded-[16px] w-full max-w-sm p-6 text-center shadow-xl space-y-4">
            <div className="space-y-1">
              <span className="font-mono text-base font-bold text-[#14171A]">{load.loadNumber}</span>
              <p className="text-xs text-[#6B7280]">Dispatch Entry Gate Token</p>
            </div>

            {/* Simulated Vector QR Graphic */}
            <div className="w-48 h-48 mx-auto bg-white border-2 border-[#14171A] rounded-xl p-3 flex flex-col items-center justify-center relative shadow-sm">
              <QrCode className="w-36 h-36 text-[#14171A]" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <span className="font-mono text-[9px] font-bold tracking-widest text-[#14171A] bg-white px-1">
                  SITEFLOW-GATE
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#6B7280] space-y-0.5">
              <div>
                Driver: <strong className="text-[#14171A]">{load.driverName}</strong> ({load.vehicleReg})
              </div>
              <div>
                Cargo: <strong className="text-[#14171A]">{load.material}</strong> ({load.quantity} {load.unit})
              </div>
              <div className="font-mono text-[10px] text-[#9CA3AF] pt-1">
                {load.qrCode || `SF-LOAD:${load.loadNumber}|${load.vehicleReg}`}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full h-9 bg-[#14171A] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
