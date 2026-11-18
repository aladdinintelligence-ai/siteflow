'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Visit, Order } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VerifyDeliveryModal } from '@/components/supervisor/VerifyDeliveryModal';
import { SupervisorDetailDrawer } from '@/components/supervisor/SupervisorDetailDrawer';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  MapPin,
  Truck,
  Scale,
  FileText,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SupervisorTab = 'pending' | 'verified' | 'discrepancies';

export default function SupervisorPage() {
  const { visits, orders, sites, currentSiteId } = useAppStore();

  const [activeTab, setActiveTab] = useState<SupervisorTab>('pending');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawer State
  const [verifyVisit, setVerifyVisit] = useState<Visit | null>(null);
  const [drawerVisit, setDrawerVisit] = useState<Visit | null>(null);

  const currentSite = sites.find((s) => s.id === currentSiteId) || sites[0];

  // Filter visits for current site
  const siteVisits = useMemo(() => {
    return visits.filter((v) => !currentSiteId || v.siteId === currentSiteId);
  }, [visits, currentSiteId]);

  // Zone & Search Filtered Visits
  const filteredVisits = useMemo(() => {
    return siteVisits.filter((v) => {
      const matchesZone = selectedZoneId === 'all' || v.destinationId === selectedZoneId;
      const matchesSearch =
        v.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.vehicleReg && v.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesZone && matchesSearch;
    });
  }, [siteVisits, selectedZoneId, searchQuery]);

  // Tab categorization
  const pendingVisits = useMemo(() => {
    return filteredVisits.filter((v) => v.status === 'on_site');
  }, [filteredVisits]);

  const verifiedVisits = useMemo(() => {
    return filteredVisits.filter(
      (v) => ['verified', 'completed'].includes(v.status) && !v.discrepancy && v.serviceCompletedStatus !== 'disputed'
    );
  }, [filteredVisits]);

  const discrepancyVisits = useMemo(() => {
    return filteredVisits.filter(
      (v) => Boolean(v.discrepancy) || v.serviceCompletedStatus === 'disputed' || v.status === 'flagged'
    );
  }, [filteredVisits]);

  // KPI Calculations
  const pendingCount = siteVisits.filter((v) => v.status === 'on_site').length;
  const verifiedCount = siteVisits.filter(
    (v) => ['verified', 'completed'].includes(v.status)
  ).length;
  const discrepancyCount = siteVisits.filter(
    (v) => Boolean(v.discrepancy) || v.serviceCompletedStatus === 'disputed'
  ).length;

  const passRate =
    verifiedCount > 0
      ? `${Math.round(((verifiedCount - discrepancyCount) / verifiedCount) * 100)}%`
      : '100%';

  const selectedOrder = useMemo(() => {
    if (!drawerVisit) return undefined;
    return orders.find((o) => o.id === drawerVisit.orderId);
  }, [drawerVisit, orders]);

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#14171A] tracking-tight">
              Receiving & Quality Sign-Off
            </h1>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Physical quantity verification, weighbridge tickets, shortage records, and service sign-off for {currentSite.name}.
          </p>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#E7E5E0] rounded-lg p-1.5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] pl-2 hidden sm:inline">
            Zone:
          </span>
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="h-8 px-2.5 bg-[#F7F7F5] border border-[#E7E5E0] rounded-md text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
          >
            <option value="all">All Site Zones</option>
            {currentSite.destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Row (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Awaiting Verification
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#B45309] tabular-nums mt-0.5 block truncate">
            {pendingCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Vehicles in discharge bays
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Verified Today
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#16A34A] tabular-nums mt-0.5 block truncate">
            {verifiedCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Chain of custody certified
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Discrepancies Flagged
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#DC2626] tabular-nums mt-0.5 block truncate">
            {discrepancyCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Shortages & rejected loads
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Quality Pass Rate
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#14171A] tabular-nums mt-0.5 block truncate">
            {passRate}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Zero-variance deliveries
          </span>
        </div>
      </div>

      {/* Tabs & Search Container */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E7E5E0] gap-4 sm:gap-6 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'pending'
                ? 'text-[#14171A] font-semibold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <span>Awaiting Inspection</span>
            {pendingVisits.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#FEF3C7] text-[#B45309] text-[10px] font-semibold rounded-full">
                {pendingVisits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('verified')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'verified'
                ? 'text-[#14171A] font-semibold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <span>Verified Deliveries</span>
            <span className="px-1.5 py-0.2 bg-[#DCFCE7] text-[#16A34A] text-[10px] font-semibold rounded-full">
              {verifiedVisits.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('discrepancies')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'discrepancies'
                ? 'text-[#14171A] font-semibold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <span>Discrepancy & Dispute Log</span>
            {discrepancyVisits.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#FEE2E2] text-[#DC2626] text-[10px] font-semibold rounded-full">
                {discrepancyVisits.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3 sm:p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ref, material, supplier, or VRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
          </div>

          <div className="flex items-center gap-2 text-[#6B7280] text-xs">
            <Scale className="w-4 h-4 text-[#14171A]" />
            <span>Site Weighbridge Connected</span>
          </div>
        </div>
      </div>

      {/* Tab 1: Awaiting Inspection */}
      {activeTab === 'pending' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Order ref</th>
                  <th className="px-4 py-2">Material / Specification</th>
                  <th className="px-4 py-2">Zone & Bay</th>
                  <th className="px-4 py-2">Supplier & VRN</th>
                  <th className="px-4 py-2">Expected Quantity</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {pendingVisits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#16A34A] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          All on-site deliveries verified
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          Vehicles currently inside the site gate will appear here awaiting physical sign-off and quantity confirmation.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingVisits.map((visit) => (
                    <tr
                      key={visit.id}
                      onClick={() => setDrawerVisit(visit)}
                      className="h-14 hover:bg-[#F7F7F5] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-[#14171A] whitespace-nowrap">
                        {visit.orderNumber}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[200px] truncate">
                          {visit.category}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] truncate max-w-[200px]">
                          {visit.description}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[180px] truncate">
                          {visit.destinationName}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] truncate max-w-[180px]">
                          {visit.siteName}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-[#14171A]">
                          {visit.supplierName}
                        </div>
                        <div className="font-mono text-[11px] text-[#6B7280]">
                          {visit.vehicleReg} • {visit.driverName || 'Driver'}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-[#14171A] tabular-nums">
                          {visit.orderedQty}
                        </span>{' '}
                        <span className="text-[#6B7280]">{visit.unit}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={visit.status} size="sm" />
                      </td>

                      <td
                        className="px-4 py-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setVerifyVisit(visit)}
                          className="h-8 px-3 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex items-center gap-1.5 ml-auto"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Verify Delivery</span>
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

      {/* Tab 2: Verified Deliveries */}
      {activeTab === 'verified' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Order ref</th>
                  <th className="px-4 py-2">Specification</th>
                  <th className="px-4 py-2">Offload Zone</th>
                  <th className="px-4 py-2">Ordered vs Received</th>
                  <th className="px-4 py-2">Verification Outcome</th>
                  <th className="px-4 py-2">Verified By</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {verifiedVisits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Clock className="w-8 h-8 text-[#9CA3AF] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          No verified deliveries recorded yet
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          Completed quality sign-offs without shortages will appear in this ledger.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  verifiedVisits.map((visit) => (
                    <tr
                      key={visit.id}
                      onClick={() => setDrawerVisit(visit)}
                      className="h-14 hover:bg-[#F7F7F5] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-[#14171A] whitespace-nowrap">
                        {visit.orderNumber}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[200px] truncate">
                          {visit.category}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] truncate max-w-[200px]">
                          {visit.supplierName} • {visit.vehicleReg}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[180px] truncate">
                          {visit.destinationName}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] truncate max-w-[180px]">
                          {visit.siteName}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[#6B7280]">
                          {visit.orderedQty} {visit.unit}
                        </span>
                        <span className="mx-1.5 text-[#9CA3AF]">→</span>
                        <span className="font-semibold text-[#14171A]">
                          {visit.receivedQty ?? visit.orderedQty} {visit.unit}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>100% Full Match</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[#6B7280] text-[11px]">
                        {visit.verifiedBy || 'Gary Nolan (Supervisor)'}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <StatusBadge status={visit.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Discrepancy & Dispute Log */}
      {activeTab === 'discrepancies' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Order ref</th>
                  <th className="px-4 py-2">Cargo / Service</th>
                  <th className="px-4 py-2">Supplier & VRN</th>
                  <th className="px-4 py-2">Variance</th>
                  <th className="px-4 py-2">Reason Code</th>
                  <th className="px-4 py-2">Supervisor Proof Notes</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {discrepancyVisits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#16A34A] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          Zero active discrepancies recorded
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          Deliveries with shortfalls, moisture losses, damaged goods, or disputed services will appear here for commercial resolution.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  discrepancyVisits.map((visit) => {
                    const variance = visit.discrepancy?.varianceQty ?? 0;
                    const isDisputedService =
                      visit.serviceCompletedStatus === 'disputed' || visit.status === 'flagged';

                    return (
                      <tr
                        key={visit.id}
                        onClick={() => setDrawerVisit(visit)}
                        className="h-14 hover:bg-[#F7F7F5] transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3 font-mono font-medium text-[#14171A] whitespace-nowrap">
                          {visit.orderNumber}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A] max-w-[200px] truncate">
                            {visit.category}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF] truncate max-w-[200px]">
                            {visit.destinationName}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-[#14171A]">
                            {visit.supplierName}
                          </div>
                          <div className="font-mono text-[11px] text-[#6B7280]">
                            {visit.vehicleReg}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {isDisputedService ? (
                            <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Service Contested</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>
                                {variance} {visit.unit} shortage
                              </span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap capitalize text-[#14171A] font-medium">
                          {visit.discrepancy?.reasonCode.replace('_', ' ') || 'Disputed spec'}
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-[#6B7280] text-[11px] max-w-[260px] truncate">
                            {visit.discrepancy?.notes || visit.proofNote || 'POD voucher countersigned.'}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <StatusBadge status={visit.status} size="sm" />
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

      {/* Modals & Drawer */}
      <VerifyDeliveryModal
        visit={verifyVisit}
        isOpen={Boolean(verifyVisit)}
        onClose={() => setVerifyVisit(null)}
      />

      <SupervisorDetailDrawer
        visit={drawerVisit}
        order={selectedOrder}
        isOpen={Boolean(drawerVisit)}
        onClose={() => setDrawerVisit(null)}
        onVerify={(visit) => setVerifyVisit(visit)}
      />
    </div>
  );
}
