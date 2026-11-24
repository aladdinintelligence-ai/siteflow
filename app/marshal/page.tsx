'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Visit } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MarshalFlagModal } from '@/components/marshal/MarshalFlagModal';
import { MarshalManualEntryModal } from '@/components/marshal/MarshalManualEntryModal';
import { PresentGateQrModal } from '@/components/marshal/PresentGateQrModal';
import { formatDateTime } from '@/lib/utils';
import {
  ShieldCheck,
  ShieldAlert,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  MapPin,
  LogOut,
  Radio,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type MarshalTab = 'expected' | 'onsite' | 'exits';

export default function MarshalPage() {
  const { visits, sites, currentSiteId, scanOut, marshalAuthoriseEntry } = useAppStore();

  const [activeTab, setActiveTab] = useState<MarshalTab>('expected');
  const [selectedGateId, setSelectedGateId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [flagVisit, setFlagVisit] = useState<Visit | null>(null);
  const [entryVisit, setEntryVisit] = useState<Visit | null>(null);
  const [isPresentQrOpen, setIsPresentQrOpen] = useState(false);

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
        v.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGate && matchesSearch;
    });
  }, [siteVisits, selectedGateId, searchQuery]);

  // Tab categorization
  // Tab 1: Gate Clearance Queue (at_gate shown first, then en_route / scheduled)
  const queueVisits = useMemo(() => {
    return gateFilteredVisits
      .filter((v) => ['at_gate', 'scheduled', 'en_route'].includes(v.status) && !v.entryAuthorised)
      .sort((a, b) => {
        if (a.status === 'at_gate' && b.status !== 'at_gate') return -1;
        if (b.status === 'at_gate' && a.status !== 'at_gate') return 1;
        return 0;
      });
  }, [gateFilteredVisits]);

  // Tab 2: Currently On Site (inside perimeter, authorized, navigating or offloading)
  const onSiteVisits = useMemo(() => {
    return gateFilteredVisits.filter(
      (v) => (v.status === 'on_site' || (v.entryAuthorised && !v.gateExitAt)) && v.status !== 'completed'
    );
  }, [gateFilteredVisits]);

  // Tab 3: Completed Exits & Gate Audit
  const exitLogs = useMemo(() => {
    return gateFilteredVisits.filter(
      (v) => v.status === 'completed' || v.status === 'flagged' || Boolean(v.gateExitAt)
    );
  }, [gateFilteredVisits]);

  // KPI Calculations
  const atGateCount = siteVisits.filter((v) => v.status === 'at_gate').length;
  const expectedCount = siteVisits.filter(
    (v) => ['scheduled', 'en_route'].includes(v.status) && !v.gateEntryAt
  ).length;
  const onSiteCount = siteVisits.filter(
    (v) => (v.status === 'on_site' || (v.entryAuthorised && !v.gateExitAt)) && v.status !== 'completed'
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
            QR gate check-in, booking matching, route authorisation, and site exit logging for {currentSite.name}.
          </p>
        </div>

        {/* Header Actions: Present QR & Active Gate Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPresentQrOpen(true)}
            className="h-9 px-3.5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
          >
            <QrCode className="w-4 h-4 text-[#F5B301]" />
            <span>Present Gate QR</span>
          </button>

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
      </div>

      {/* KPI Row (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Arrivals Queue
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl sm:text-[28px] font-semibold text-[#14171A] tabular-nums block truncate">
              {queueVisits.length}
            </span>
            {atGateCount > 0 && (
              <span className="text-[11px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse" />
                {atGateCount} At Gate
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            {expectedCount} en-route · {atGateCount} checked in
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
            Attendance complete
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
            <span>Gate Clearance Queue</span>
            {queueVisits.length > 0 && (
              <span className={cn(
                'px-1.5 py-0.2 text-[10px] font-semibold rounded-full',
                atGateCount > 0 ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#F3F4F6] text-[#4B5563]'
              )}>
                {queueVisits.length}
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
            <span>Gate Logs & Completed Exits</span>
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
              placeholder="Search booking ref, vehicle reg, driver, supplier, material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
          </div>

          <div className="flex items-center gap-2 text-[#6B7280] text-xs">
            <button
              onClick={() => setIsPresentQrOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#14171A] hover:underline font-medium cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#F5B301]" />
              <span>Show Gate Totem QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: GATE CLEARANCE QUEUE (Expected, Checked In at Gate) */}
      {activeTab === 'expected' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[780px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Booking ID</th>
                  <th className="px-4 py-2">Site & Destination</th>
                  <th className="px-4 py-2">Supplier & Driver</th>
                  <th className="px-4 py-2">Material / Service</th>
                  <th className="px-4 py-2">Vehicle / Unique ID</th>
                  <th className="px-4 py-2">Status & Timestamps</th>
                  <th className="px-4 py-2 text-right">Gate Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {queueVisits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#16A34A] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          Gate queue is clear
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          Arriving drivers scanning the gate QR code will appear here instantly for entry clearance.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  queueVisits.map((visit) => {
                    const isAtGate = visit.status === 'at_gate';
                    const hasTracking = Boolean(visit.tracking);

                    return (
                      <tr
                        key={visit.id}
                        className={cn(
                          'h-15 transition-colors',
                          isAtGate
                            ? 'bg-[#FEF3C7]/25 hover:bg-[#FEF3C7]/40 border-l-4 border-l-[#F5B301]'
                            : 'hover:bg-[#F7F7F5]'
                        )}
                      >
                        {/* 1. Booking / Order ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-semibold text-xs text-[#14171A] block">
                            {visit.orderNumber}
                          </span>
                          <span className="text-[10px] font-mono text-[#6B7280]">
                            {visit.id}
                          </span>
                        </td>

                        {/* 2. Site & Destination */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A] max-w-[200px] truncate">
                            {visit.destinationName}
                          </div>
                          <div className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#9CA3AF]" />
                            <span className="truncate max-w-[170px]">{visit.siteName}</span>
                          </div>
                        </td>

                        {/* 3. Supplier & Driver */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A] truncate max-w-[170px]">
                            {visit.driverName || 'Driver Unassigned'}
                          </div>
                          <div className="text-[11px] text-[#6B7280] truncate max-w-[170px]">
                            {visit.supplierName}
                          </div>
                        </td>

                        {/* 4. Material or Service */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-[#14171A] tabular-nums">
                            {visit.orderedQty} {visit.unit}
                          </span>
                          <span className="text-[11px] text-[#6B7280] block max-w-[170px] truncate">
                            {visit.category}
                          </span>
                        </td>

                        {/* 5. Vehicle / Unique ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-semibold text-xs text-[#14171A] bg-[#F7F7F5] border border-[#E7E5E0] px-2 py-0.5 rounded-md inline-block">
                            {visit.vehicleReg || 'REG-PENDING'}
                          </span>
                        </td>

                        {/* 6. Status and Timestamps */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isAtGate ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[11px] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse" />
                                Checked In (At Gate)
                              </span>
                              <span className="font-mono text-[10px] text-[#6B7280] block">
                                In: {visit.gateEntryAt ? formatDateTime(visit.gateEntryAt) : 'Just now'}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <StatusBadge status={visit.status} size="sm" />
                              {hasTracking && visit.status === 'en_route' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#2563EB] block">
                                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                                  ETA {visit.tracking?.estimatedArrivalMinutes}m
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 7. Gate Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setFlagVisit(visit)}
                              className="h-8 px-2.5 bg-white border border-[#E7E5E0] hover:bg-[#FEE2E2] hover:text-[#DC2626] text-[#6B7280] rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                              title="Flag security exception"
                            >
                              Flag
                            </button>

                            {isAtGate ? (
                              <button
                                onClick={() => marshalAuthoriseEntry(visit.id)}
                                className="h-8 px-3 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-md text-[11px] font-semibold transition-colors cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex items-center gap-1.5"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-[#F5B301]" />
                                <span>Authorise Entry</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setEntryVisit(visit)}
                                className="h-8 px-3 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Manual Check-In
                              </button>
                            )}
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

      {/* TAB 2: CURRENTLY ON SITE (Inside perimeter) */}
      {activeTab === 'onsite' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[780px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Booking ID</th>
                  <th className="px-4 py-2">Site & Destination</th>
                  <th className="px-4 py-2">Supplier & Driver</th>
                  <th className="px-4 py-2">Material / Service</th>
                  <th className="px-4 py-2">Vehicle / Unique ID</th>
                  <th className="px-4 py-2">Entry Authorized At</th>
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
                          Perimeter is clear
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          No delivery vehicles are currently navigating or offloading inside the site.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  onSiteVisits.map((visit) => (
                    <tr key={visit.id} className="h-14 hover:bg-[#F7F7F5] transition-colors">
                      {/* Booking ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs text-[#14171A] block">
                          {visit.orderNumber}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B7280]">
                          {visit.id}
                        </span>
                      </td>

                      {/* Site & Destination */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[200px] truncate">
                          {visit.destinationName}
                        </div>
                        <span className="text-[10px] text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.2 rounded-full font-medium inline-block mt-0.5">
                          Approved haul route
                        </span>
                      </td>

                      {/* Supplier & Driver */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] truncate max-w-[170px]">
                          {visit.driverName || 'Driver'}
                        </div>
                        <div className="text-[11px] text-[#6B7280] truncate max-w-[170px]">
                          {visit.supplierName}
                        </div>
                      </td>

                      {/* Material / Service */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-[#14171A] tabular-nums">
                          {visit.orderedQty} {visit.unit}
                        </span>
                        <span className="text-[11px] text-[#6B7280] block max-w-[170px] truncate">
                          {visit.category}
                        </span>
                      </td>

                      {/* Vehicle / Unique ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs text-[#14171A] bg-[#F7F7F5] border border-[#E7E5E0] px-2 py-0.5 rounded-md inline-block">
                          {visit.vehicleReg || 'REG-PENDING'}
                        </span>
                      </td>

                      {/* Entry Time */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[#6B7280]">
                        {visit.gateEntryAt ? formatDateTime(visit.gateEntryAt) : 'Gate 1'}
                      </td>

                      {/* Gate Action: Scan Out */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => scanOut(visit.id)}
                          className="h-8 px-3 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded-md text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5 text-[#6B7280]" />
                          <span>Log Exit / Scan Out</span>
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

      {/* TAB 3: GATE LOGS & EXITS (Completed attendance records) */}
      {activeTab === 'exits' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[780px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Booking ID</th>
                  <th className="px-4 py-2">Site & Destination</th>
                  <th className="px-4 py-2">Supplier & Driver</th>
                  <th className="px-4 py-2">Material / Service</th>
                  <th className="px-4 py-2">Vehicle / Unique ID</th>
                  <th className="px-4 py-2">Entry & Exit Times</th>
                  <th className="px-4 py-2 text-right">Status & Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {exitLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Clock className="w-8 h-8 text-[#9CA3AF] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          No completed departures today
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          Vehicles completing scan-out and recorded security exceptions appear in this audit log.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  exitLogs.map((visit) => {
                    const isFlagged = visit.marshalFlagged || visit.status === 'flagged';

                    return (
                      <tr key={visit.id} className="h-14 hover:bg-[#F7F7F5] transition-colors">
                        {/* Booking ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-semibold text-xs text-[#14171A] block">
                            {visit.orderNumber}
                          </span>
                          <span className="text-[10px] font-mono text-[#6B7280]">
                            {visit.id}
                          </span>
                        </td>

                        {/* Site & Destination */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A] max-w-[200px] truncate">
                            {visit.destinationName}
                          </div>
                          <div className="text-[11px] text-[#6B7280] truncate max-w-[180px]">
                            {visit.siteName}
                          </div>
                        </td>

                        {/* Supplier & Driver */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A] truncate max-w-[170px]">
                            {visit.driverName || 'Driver'}
                          </div>
                          <div className="text-[11px] text-[#6B7280] truncate max-w-[170px]">
                            {visit.supplierName}
                          </div>
                        </td>

                        {/* Material / Service */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-[#14171A] tabular-nums">
                            {visit.orderedQty} {visit.unit}
                          </span>
                          <span className="text-[11px] text-[#6B7280] block max-w-[170px] truncate">
                            {visit.category}
                          </span>
                        </td>

                        {/* Vehicle / Unique ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono font-semibold text-xs text-[#14171A] bg-[#F7F7F5] border border-[#E7E5E0] px-2 py-0.5 rounded-md inline-block">
                            {visit.vehicleReg || 'REG-PENDING'}
                          </span>
                        </td>

                        {/* Entry & Exit Times */}
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[#6B7280] text-[11px]">
                          <div>In: {visit.gateEntryAt ? formatDateTime(visit.gateEntryAt) : '—'}</div>
                          <div>Out: {visit.gateExitAt ? formatDateTime(visit.gateExitAt) : '—'}</div>
                        </td>

                        {/* Status & Duration */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {isFlagged ? (
                            <div className="text-right">
                              <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Flagged Exception</span>
                              </span>
                              {visit.marshalFlagReason && (
                                <p className="text-[10px] text-[#DC2626] mt-0.5 max-w-[200px] truncate ml-auto">
                                  {visit.marshalFlagReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-right space-y-0.5">
                              <StatusBadge status="completed" size="sm" />
                              <span className="text-[11px] font-mono font-medium text-[#14171A] block">
                                {visit.durationMinutes ? `${visit.durationMinutes} mins duration` : 'Turnaround logged'}
                              </span>
                            </div>
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

      <PresentGateQrModal
        isOpen={isPresentQrOpen}
        onClose={() => setIsPresentQrOpen(false)}
        site={currentSite}
        visits={gateFilteredVisits}
      />
    </div>
  );
}
