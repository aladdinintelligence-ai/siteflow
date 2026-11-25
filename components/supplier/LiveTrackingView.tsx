'use client';

import React, { useState } from 'react';
import { DeliveryLoad } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Radio,
  ArrowRight,
  Play,
  RotateCcw,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';

interface LiveTrackingViewProps {
  initialLoadId?: string;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({ initialLoadId }) => {
  const { deliveryLoads, updateLoadStatus } = useAppStore();
  const [selectedLoadId, setSelectedLoadId] = useState<string>(
    initialLoadId || deliveryLoads[0]?.id || ''
  );
  const [locationSharingConsent, setLocationSharingConsent] = useState(true);

  // Active load to track
  const activeLoad =
    deliveryLoads.find((l) => l.id === selectedLoadId) ||
    deliveryLoads.find((l) => l.status === 'dispatched') ||
    deliveryLoads[0];

  if (!activeLoad) {
    return (
      <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-8 text-center text-xs text-[#6B7280]">
        No active delivery loads found. Create or dispatch an order to initiate live tracking.
      </div>
    );
  }

  // Stepper State Calculation
  const getStepIndex = (status: DeliveryLoad['status']) => {
    switch (status) {
      case 'dispatched':
        return 1; // In transit
      case 'at_gate':
        return 2; // Arrived at gate
      case 'on_site':
        return 2.5; // On site discharging
      case 'completed':
        return 3; // Completed
      default:
        return 0; // Assigned / Pre-dispatch
    }
  };

  const currentStep = getStepIndex(activeLoad.status);

  // Simulation handler to advance journey stage
  const handleAdvanceStage = () => {
    if (activeLoad.status === 'assigned') {
      updateLoadStatus(activeLoad.id, 'dispatched');
    } else if (activeLoad.status === 'dispatched') {
      updateLoadStatus(activeLoad.id, 'at_gate');
    } else if (activeLoad.status === 'at_gate') {
      updateLoadStatus(activeLoad.id, 'on_site');
    } else if (activeLoad.status === 'on_site') {
      updateLoadStatus(activeLoad.id, 'completed');
    } else if (activeLoad.status === 'completed') {
      updateLoadStatus(activeLoad.id, 'dispatched');
    }
  };

  return (
    <div className="space-y-6">
      {/* Load Selector Bar */}
      <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-semibold text-[#14171A]">Select Tracked Delivery Load:</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeLoad.id}
            onChange={(e) => setSelectedLoadId(e.target.value)}
            className="h-9 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
          >
            {deliveryLoads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.loadNumber} • {l.material} ({l.quantity} {l.unit}) • {l.driverName || 'Driver'} ({l.status.toUpperCase()})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAdvanceStage}
            className="h-9 px-4 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            title="Step through journey stages: Dispatched -> In Transit -> At Gate -> Completed"
          >
            <Play className="w-3.5 h-3.5 text-[#F5B301]" />
            <span>Simulate Progress</span>
          </button>
        </div>
      </div>

      {/* Main Tracking Card (Figure 2 UI Layout) */}
      <div className="bg-white border border-[#E7E5E0] rounded-[16px] shadow-[0_1px_3px_rgba(20,23,26,0.05)] overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-[#E7E5E0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAFAFA]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-[#14171A] tracking-tight">
                {activeLoad.loadNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold border border-[#BFDBFE]">
                Order {activeLoad.orderNumber}
              </span>
              <span className="text-xs text-[#6B7280]">
                • Customer: <strong className="text-[#14171A]">{activeLoad.customerName}</strong>
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Destination: <strong className="text-[#14171A]">{activeLoad.siteName}</strong> — {activeLoad.destinationName}
            </p>
          </div>

          {/* Telematics Consent Toggle */}
          <div className="flex items-center gap-3 bg-white border border-[#E7E5E0] px-3.5 py-2 rounded-xl text-xs">
            <Radio className={`w-4 h-4 ${locationSharingConsent ? 'text-[#16A34A] animate-pulse' : 'text-[#9CA3AF]'}`} />
            <div>
              <span className="font-semibold text-[#14171A] block text-[11px]">
                Driver Location Sharing
              </span>
              <span className="text-[10px] text-[#6B7280]">
                {locationSharingConsent ? 'Active GPS Ping (Consent granted)' : 'Disabled by Driver'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLocationSharingConsent(!locationSharingConsent)}
              className="text-[#6B7280] hover:text-[#14171A] cursor-pointer ml-1"
            >
              {locationSharingConsent ? (
                <ToggleRight className="w-6 h-6 text-[#16A34A]" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-[#9CA3AF]" />
              )}
            </button>
          </div>
        </div>

        {/* 4-Stage Journey Stepper (Figure 2) */}
        <div className="p-6 border-b border-[#E7E5E0]">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {/* Stage 1 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  currentStep >= 1
                    ? 'bg-[#14171A] text-white ring-4 ring-[#F7F7F5]'
                    : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]'
                }`}
              >
                1
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#14171A] block">Dispatched</span>
                <span className="text-[11px] text-[#6B7280] block">From supplier depot</span>
                <span className="text-[10px] font-mono text-[#9CA3AF] block">
                  {activeLoad.dispatchedAt ? new Date(activeLoad.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:15 AM'}
                </span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  currentStep >= 1 && currentStep < 2
                    ? 'bg-[#2563EB] text-white ring-4 ring-[#EFF6FF] animate-pulse'
                    : currentStep >= 2
                    ? 'bg-[#14171A] text-white ring-4 ring-[#F7F7F5]'
                    : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]'
                }`}
              >
                2
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#14171A] block">In Transit</span>
                <span className="text-[11px] text-[#2563EB] font-semibold block">
                  {currentStep >= 2 ? 'En route completed' : 'Sample ETA ~12 min'}
                </span>
                <span className="text-[10px] font-mono text-[#9CA3AF] block">
                  Live location sharing
                </span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  currentStep === 2 || currentStep === 2.5
                    ? 'bg-[#B45309] text-white ring-4 ring-[#FEF3C7]'
                    : currentStep > 2.5
                    ? 'bg-[#14171A] text-white ring-4 ring-[#F7F7F5]'
                    : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]'
                }`}
              >
                3
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#14171A] block">Arrived at Site</span>
                <span className="text-[11px] text-[#6B7280] block">Gate 1 Checkpoint</span>
                <span className="text-[10px] font-mono text-[#9CA3AF] block">
                  {currentStep >= 2 ? 'Scanned at Totem' : 'Awaiting arrival'}
                </span>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  currentStep >= 3
                    ? 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7]'
                    : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]'
                }`}
              >
                4
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#14171A] block">Delivery Completed</span>
                <span className="text-[11px] text-[#6B7280] block">Exit Gate Scanned</span>
                <span className="text-[10px] font-mono text-[#9CA3AF] block">
                  {currentStep >= 3 ? 'Turnaround logged' : 'Pending offload'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Tracking Map & Telematics Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#E7E5E0]">
          {/* Telematics Metrics */}
          <div className="p-6 space-y-5 text-xs bg-white">
            <span className="font-semibold uppercase tracking-wider text-[#6B7280] text-[11px] block">
              Real-Time Telematics Telemetry
            </span>

            <div className="space-y-3">
              <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E7E5E0] flex items-center justify-between">
                <div>
                  <span className="text-[#6B7280] block text-[11px]">Estimated Arrival</span>
                  <span className="text-lg font-bold text-[#14171A] tabular-nums">
                    {currentStep >= 2 ? 'Arrived on site' : '12 mins'}
                  </span>
                </div>
                <Clock className="w-5 h-5 text-[#2563EB]" />
              </div>

              <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E7E5E0] flex items-center justify-between">
                <div>
                  <span className="text-[#6B7280] block text-[11px]">Distance Remaining</span>
                  <span className="text-lg font-bold text-[#14171A] tabular-nums">
                    {currentStep >= 2 ? '0.0 km' : '4.2 km'}
                  </span>
                </div>
                <Navigation className="w-5 h-5 text-[#16A34A]" />
              </div>

              <div className="p-3.5 bg-[#F8F8F6] rounded-xl border border-[#E7E5E0]">
                <span className="text-[#6B7280] block text-[11px]">Current Telematics Location</span>
                <span className="font-semibold text-[#14171A] block mt-0.5">
                  {currentStep >= 3
                    ? 'Chatham Gate 1 — Completed Scan-Out'
                    : currentStep >= 2
                    ? 'Chatham Capstone — Phase 2A Link Road'
                    : locationSharingConsent
                    ? 'A2 Rochester Way approaching East Hill'
                    : 'Location sharing offline (status only)'}
                </span>
                <span className="text-[10px] text-[#9CA3AF] block mt-1">
                  Speed: {currentStep >= 2 ? '0 mph' : '34 mph'} • Heading: East (Medway Corridor)
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#FEF3C7]/40 rounded-xl border border-[#FDE68A] text-[11px] text-[#B45309] space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Telematics Disclaimer
              </span>
              <p className="leading-relaxed">
                Live vehicle telematics are subject to driver consent and active connectivity. Official check-in and check-out are certified by Gate 1 Marshal scans.
              </p>
            </div>
          </div>

          {/* Simulated Moving Map Graphic */}
          <div className="lg:col-span-2 p-6 flex flex-col justify-between bg-[#F8F8F6] min-h-[320px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B91C1C]" />
                <span className="text-xs font-semibold text-[#14171A]">
                  Route Map: Chatham Capstone — Phase 2A Link Road
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#6B7280]">
                Gate 1 Checkpoint (CH-G01)
              </span>
            </div>

            {/* Vector Map Simulation Diagram */}
            <div className="relative my-4 w-full h-56 bg-[#FFFFFF] border border-[#E7E5E0] rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4">
              <svg viewBox="0 0 500 220" className="w-full h-full">
                {/* Background Roads */}
                <path
                  d="M 20 180 L 120 140 L 250 140 L 380 90 L 470 60"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                {/* Active Haul Road Corridor */}
                <path
                  d="M 20 180 L 120 140 L 250 140 L 380 90 L 470 60"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                {/* Gate 1 Checkpoint marker */}
                <circle cx="250" cy="140" r="14" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
                <text x="250" y="170" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#14171A">
                  Gate 1 Checkpoint
                </text>

                {/* Phase 2A Delivery Bay 1 Destination */}
                <circle cx="470" cy="60" r="14" fill="#DCFCE7" stroke="#15803D" strokeWidth="2" />
                <text x="440" y="45" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#15803D">
                  Delivery Bay 1
                </text>

                {/* Moving Truck Icon Based on Step */}
                {currentStep < 2 && (
                  <g transform={`translate(${currentStep === 1 ? 140 : 50}, ${currentStep === 1 ? 140 : 170})`}>
                    <circle cx="0" cy="0" r="12" fill="#2563EB" />
                    <circle cx="0" cy="0" r="18" fill="none" stroke="#2563EB" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" />
                    <text x="0" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#2563EB">
                      {activeLoad.vehicleReg} (~12m ETA)
                    </text>
                  </g>
                )}

                {currentStep === 2 && (
                  <g transform="translate(250, 140)">
                    <circle cx="0" cy="0" r="12" fill="#B45309" />
                    <text x="0" y="-18" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#B45309">
                      At Gate 1 Check-In
                    </text>
                  </g>
                )}

                {currentStep > 2 && (
                  <g transform="translate(470, 60)">
                    <circle cx="0" cy="0" r="12" fill="#15803D" />
                    <text x="0" y="-18" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#15803D">
                      {currentStep >= 3 ? 'Completed' : 'Offloading on Site'}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
              <span>Assigned Driver: <strong className="text-[#14171A]">{activeLoad.driverName}</strong></span>
              <span>Vehicle: <strong className="text-[#14171A] font-mono">{activeLoad.vehicleReg}</strong></span>
              <span>Cargo: <strong className="text-[#14171A]">{activeLoad.material}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

