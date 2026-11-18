'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Visit } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MarshalFlagModal } from '@/components/marshal/MarshalFlagModal';
import { MarshalManualEntryModal } from '@/components/marshal/MarshalManualEntryModal';
import { formatDateTime } from '@/lib/utils';
import {
  ShieldCheck,
  ShieldAlert,
  Truck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  MapPin,
  Calendar,
  LogOut,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type MarshalTab = 'expected' | 'onsite' | 'exits';

export default function MarshalPage() {
  const { visits, sites, currentSiteId, setCurrentSite, scanOut } = useAppStore();

  const [activeTab, setActiveTab] = useState<MarshalTab>('expected');
  const [selectedGateId, setSelectedGateId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [flagVisit, setFlagVisit] = useState<Visit | null>(null);
  const [entryVisit, setEntryVisit] = useState<Visit | null>(null);

  const currentSite = sites.find((s) => s.id === currentSiteId) || sites[0];

  // Filter visits for current site
  const siteVisits = useMemo(() => {
    return visits.filter((v) => !currentSiteId || v.siteId === currentSiteId);
  }, [visits, currentSiteId]);

  // Gate-filtered visits
  const gateFilteredVisits = useMemo(() => {
    return siteVisits.filter((v) => {
      const matchesGate = selectedGateId === 'all' || v.gateId === selectedGateId;
      const matchesSearch =
        v.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.vehicleReg && v.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.driverName && v.driverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.destinationName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGate && matchesSearch;
    });
  }, [siteVisits, selectedGateId, searchQuery]);

  // Tab categorization
  const expectedVisits = useMemo(() => {
    return gateFilteredVisits.filter((v) =>
      ['scheduled', 'en_route'].includes(v.status) && !v.gateEntryAt
    );
  }, [gateFilteredVisits]);

  const onSiteVisits = useMemo(() => {
    return gateFilteredVisits.filter((v) =>
      ['on_site', 'verified'].includes(v.status) && !v.gateExitAt
    );
  }, [gateFilteredVisits]);

  const exitLogs = useMemo(() => {
    return gateFilteredVisits.filter((v) =>
      v.status === 'completed' || v.status === 'flagged' || Boolean(v.gateExitAt)
    );
  }, [gateFilteredVisits]);

  // KPI Calculations
  const expectedCount = siteVisits.filter(
    (v) => ['scheduled', 'en_route'].includes(v.status) && !v.gateEntryAt
  ).length;

  const onSiteCount = siteVisits.filter(
    (v) => ['on_site', 'verified'].includes(v.status) && !v.gateExitAt
  ).length;

  const exitedCount = siteVisits.filter(
    (v) => v.status === 'completed' || Boolean(v.gateExitAt)
  ).length;

  const flaggedCount = siteVisits.filter(
    (v) => v.marshalFlagged || v.status === 'flagged'
  ).length;

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#14171A] tracking-tight">
              Gate Operations & Traffic Control
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              Live Gate Feed
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Automated QR gate clearance, security exceptions, and real-time site headcount for {currentSite.name}.
          </p>
        </div>

        {/* Gate Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#E7E5E0] rounded-lg p-1.5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] pl-2 hidden sm:inline">
            Active Gate:
          </span>
          <select
            value={selectedGateId}
            onChange={(e) => setSelectedGateId(e.target.value)}
            className="h-8 px-2.5 bg-[#F7F7F5] border border-[#E7E5E0] rounded-md text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
          >
            <option value="all">All Site Gates</option>
            {currentSite.gates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Row (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Expected Today
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#14171A] tabular-nums mt-0.5 block truncate">
            {expectedCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Booked slot windows
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            On Site Now
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#2563EB] tabular-nums mt-0.5 block truncate">
            {onSiteCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Vehicles inside perimeter
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Exited Today
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#16A34A] tabular-nums mt-0.5 block truncate">
            {exitedCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Turnaround verified
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Security Flags
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#DC2626] tabular-nums mt-0.5 block truncate">
            {flaggedCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Exceptions held at gate
          </span>
        </div>
      </div>

      {/* Tabs & Search Container */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E7E5E0] gap-4 sm:gap-6 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('expected')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'expected'
                ? 'text-[#14171A] font-semibold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <span>Expected Arrivals</span>
            {expectedVisits.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#FEF3C7] text-[#B45309] text-[10px] font-semibold rounded-full">
                {expectedVisits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('onsite')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'onsite'
                ? 'text-[#14171A] font-semibold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <span>Currently On Site</span>
            {onSiteVisits.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#DBEAFE] text-[#2563EB] text-[10px] font-semibold rounded-full">
                {onSiteVisits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('exits')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'exits'
                ? 'text-[#14171A] font-semibold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <span>Gate Logs & Exits</span>
            <span className="px-1.5 py-0.2 bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold rounded-full">
              {exitLogs.length}
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3 sm:p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search VRN, driver name, supplier, or order ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
          </div>

          <div className="flex items-center gap-2 text-[#6B7280] text-xs">
            <QrCode className="w-4 h-4 text-[#14171A]" />
            <span>Gate Totem QR Code Active</span>
          </div>
        </div>
      </div>

      {/* Tab 1: Expected Arrivals */}
      {activeTab === 'expected' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">VRN / Booking</th>
                  <th className="px-4 py-2">Driver & Supplier</th>
                  <th className="px-4 py-2">Offload Destination</th>
                  <th className="px-4 py-2">Cargo / Spec</th>
                  <th className="px-4 py-2">Slot & Telematics</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Gate Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {expectedVisits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#16A34A] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          No pending arrivals in queue
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          Dispatched supplier vehicles approaching the gate will appear here with live ETA tracking.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expectedVisits.map((visit) => {
                    const hasTracking = Boolean(visit.tracking);

                    return (
                      <tr key={visit.id} className="h-14 hover:bg-[#F7F7F5] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-semibold text-sm text-[#14171A] block">
                            {visit.vehicleReg}
                          </span>
                          <span className="font-mono text-[11px] text-[#6B7280]">
                            {visit.orderNumber}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A]">
                            {visit.driverName || 'Driver Unassigned'}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF]">
                            {visit.supplierName}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A] max-w-[180px] truncate">
                            {visit.destinationName}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>Gate 1 Access Route</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-[#14171A]">
                            {visit.orderedQty} {visit.unit}
                          </span>
                          <span className="text-[11px] text-[#6B7280] block max-w-[160px] truncate">
                            {visit.category}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {hasTracking && visit.status === 'en_route' ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB]">
                                <Radio className="w-3 h-3 animate-pulse" />
                                ETA {visit.tracking?.estimatedArrivalMinutes}m ({visit.tracking?.distanceRemainingKm}km)
                              </span>
                              <span className="text-[10px] text-[#9CA3AF] block">
                                Inbound arterial haul road
                              </span>
                            </div>
                          ) : (
                            <div className="font-mono text-[#6B7280]">
                              Booked slot
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={visit.status} size="sm" />
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setFlagVisit(visit)}
                              className="h-8 px-2.5 bg-white border border-[#E7E5E0] hover:bg-[#FEE2E2] hover:text-[#DC2626] text-[#6B7280] rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                              title="Flag security exception"
                            >
                              Flag
                            </button>
                            <button
                              onClick={() => setEntryVisit(visit)}
                              className="h-8 px-3 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
                            >
                              Authorise Entry
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Currently On Site */}
      {activeTab === 'onsite' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">VRN / Ref</th>
                  <th className="px-4 py-2">Driver & Supplier</th>
                  <th className="px-4 py-2">Zone & Destination</th>
                  <th className="px-4 py-2">Entry Authorized At</th>
                  <th className="px-4 py-2">Cargo / Service</th>
                  <th className="px-4 py-2">Perimeter Status</th>
                  <th className="px-4 py-2 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {onSiteVisits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Truck className="w-8 h-8 text-[#9CA3AF] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          Perimeter clear
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          No delivery vehicles are currently discharging or navigating on site.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  onSiteVisits.map((visit) => (
                    <tr key={visit.id} className="h-14 hover:bg-[#F7F7F5] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-semibold text-sm text-[#14171A] block">
                          {visit.vehicleReg}
                        </span>
                        <span className="font-mono text-[11px] text-[#6B7280]">
                          {visit.orderNumber}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A]">
                          {visit.driverName || 'Driver'}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF]">
                          {visit.supplierName}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[180px] truncate">
                          {visit.destinationName}
                        </div>
                        <span className="text-[10px] text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.2 rounded-full font-medium inline-block mt-0.5">
                          Approved haul route
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[#6B7280]">
                        {visit.gateEntryAt ? formatDateTime(visit.gateEntryAt) : 'Gate 1 auto'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-[#14171A]">
                          {visit.orderedQty} {visit.unit}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF] block truncate max-w-[150px]">
                          {visit.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={visit.status} size="sm" />
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => scanOut(visit.id)}
                          className="h-8 px-3 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded-md text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5 text-[#6B7280]" />
                          <span>Exit Gate</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Gate Logs & Exits */}
      {activeTab === 'exits' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">VRN / Ref</th>
                  <th className="px-4 py-2">Driver & Supplier</th>
                  <th className="px-4 py-2">Site Offload Zone</th>
                  <th className="px-4 py-2">Gate In</th>
                  <th className="px-4 py-2">Gate Out</th>
                  <th className="px-4 py-2">Turnaround Duration</th>
                  <th className="px-4 py-2 text-right">Event Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {exitLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Clock className="w-8 h-8 text-[#9CA3AF] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          No historical departures today
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          Completed visits and recorded security exceptions will appear in this audit log.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  exitLogs.map((visit) => {
                    const isFlagged = visit.marshalFlagged || visit.status === 'flagged';

                    return (
                      <tr key={visit.id} className="h-14 hover:bg-[#F7F7F5] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-semibold text-sm text-[#14171A] block">
                            {visit.vehicleReg}
                          </span>
                          <span className="font-mono text-[11px] text-[#6B7280]">
                            {visit.orderNumber}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A]">
                            {visit.driverName || 'Driver'}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF]">
                            {visit.supplierName}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A] max-w-[180px] truncate">
                            {visit.destinationName}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF] truncate max-w-[180px]">
                            {visit.category}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[#6B7280]">
                          {visit.gateEntryAt ? formatDateTime(visit.gateEntryAt) : '—'}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[#6B7280]">
                          {visit.gateExitAt ? formatDateTime(visit.gateExitAt) : '—'}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {visit.durationMinutes ? (
                            <span className="font-medium text-[#14171A] tabular-nums">
                              {visit.durationMinutes} mins
                            </span>
                          ) : (
                            <span className="text-[#9CA3AF]">Turnaround logged</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {isFlagged ? (
                            <div className="text-right">
                              <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Flagged Exception</span>
                              </span>
                              {visit.marshalFlagReason && (
                                <p className="text-[10px] text-[#DC2626] mt-0.5 max-w-[180px] truncate ml-auto">
                                  {visit.marshalFlagReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <StatusBadge status={visit.status} size="sm" />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <MarshalFlagModal
        visit={flagVisit}
        isOpen={Boolean(flagVisit)}
        onClose={() => setFlagVisit(null)}
      />

      <MarshalManualEntryModal
        visit={entryVisit}
        isOpen={Boolean(entryVisit)}
        onClose={() => setEntryVisit(null)}
      />
    </div>
  );
}
