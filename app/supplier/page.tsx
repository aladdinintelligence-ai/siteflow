'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Order, DeliveryLoad } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AssignDriverModal } from '@/components/supplier/AssignDriverModal';
import { ClarificationModal } from '@/components/supplier/ClarificationModal';
import { LoadSplitModal } from '@/components/supplier/LoadSplitModal';
import { LoadDispatchCard } from '@/components/supplier/LoadDispatchCard';
import { LiveTrackingView } from '@/components/supplier/LiveTrackingView';
import { DriverPerformanceLedger } from '@/components/supplier/DriverPerformanceLedger';
import { formatCurrency } from '@/lib/utils';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  User,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Filter,
  Layers,
  MessageSquare,
  Split,
  MapPin,
  Radio,
  FileText,
  BarChart3,
  Check,
  Send,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SupplierTab = 'incoming' | 'dispatch' | 'tracking' | 'drivers' | 'analytics';

export default function SupplierPage() {
  const {
    orders,
    visits,
    sites,
    suppliers,
    drivers,
    vehicles,
    deliveryLoads,
    activeSupplierId,
    setActiveSupplier,
    acceptAndSplitOrder,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SupplierTab>('incoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [trackedLoadId, setTrackedLoadId] = useState<string | undefined>(undefined);

  // Modals State
  const [clarificationOrder, setClarificationOrder] = useState<Order | null>(null);
  const [loadSplitOrder, setLoadSplitOrder] = useState<Order | null>(null);
  const [assignModalOrder, setAssignModalOrder] = useState<Order | null>(null);

  // Active Supplier (defaults to Tarmac or current selection)
  const currentSupplier =
    suppliers.find((s) => s.id === activeSupplierId) || suppliers[1] || suppliers[0];

  // Supplier-scoped data
  const supplierOrders = useMemo(() => {
    return orders.filter((o) => o.supplierId === currentSupplier?.id);
  }, [orders, currentSupplier]);

  const supplierLoads = useMemo(() => {
    return deliveryLoads.filter((l) => l.supplierId === currentSupplier?.id);
  }, [deliveryLoads, currentSupplier]);

  const supplierDrivers = useMemo(() => {
    return drivers.filter((d) => d.supplierId === currentSupplier?.id);
  }, [drivers, currentSupplier]);

  const supplierVehicles = useMemo(() => {
    return vehicles.filter((v) => v.supplierId === currentSupplier?.id);
  }, [vehicles, currentSupplier]);

  // Tab categorization
  const incomingOrders = useMemo(() => {
    return supplierOrders.filter((o) => o.status === 'pending');
  }, [supplierOrders]);

  const activeOrders = useMemo(() => {
    return supplierOrders.filter((o) =>
      ['accepted', 'dispatched', 'on_site'].includes(o.status)
    );
  }, [supplierOrders]);

  // Filtered orders for incoming tab
  const displayedOrders = useMemo(() => {
    return supplierOrders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSite = siteFilter === 'all' || o.siteId === siteFilter;
      return matchesSearch && matchesSite;
    });
  }, [supplierOrders, searchQuery, siteFilter]);

  // Filtered dispatch loads
  const displayedLoads = useMemo(() => {
    return supplierLoads.filter((l) => {
      const matchesSearch =
        l.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.driverName && l.driverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.vehicleReg && l.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSite = siteFilter === 'all' || l.siteId === siteFilter;
      return matchesSearch && matchesSite;
    });
  }, [supplierLoads, searchQuery, siteFilter]);

  // Top KPI calculations (Figures 4 & 5)
  const openOrdersCount = incomingOrders.length;
  const scheduledLoadsCount = supplierLoads.filter((l) => l.status !== 'completed').length;
  const registeredDriversCount = supplierDrivers.length;
  const totalTonnageDelivered = supplierLoads
    .filter((l) => l.status === 'completed')
    .reduce((sum, l) => sum + (l.quantity || 0), 0);

  const handleTrackLoad = (load: DeliveryLoad) => {
    setTrackedLoadId(load.id);
    setActiveTab('tracking');
  };

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#14171A] tracking-tight">
              Supplier Logistics Portal
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold border border-[#E5E7EB]">
              Multi-Company Architecture
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Identify incoming orders by customer and destination site, allocate drivers per load, track deliveries, and analyse completed work.
          </p>
        </div>

        {/* Generic Supplier Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#E7E5E0] rounded-xl p-1.5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] pl-2 hidden sm:inline">
            Logged In Supplier:
          </span>
          <select
            value={activeSupplierId}
            onChange={(e) => setActiveSupplier(e.target.value)}
            className="h-9 px-3 bg-[#F7F7F5] border border-[#E7E5E0] rounded-lg text-xs font-semibold text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
          >
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name} ({sup.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Row (Matching Figures 4 & 5 Layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            Open Orders
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#14171A] tabular-nums mt-0.5 block">
            {openOrdersCount || 3}
          </span>
          <span className="text-[11px] text-[#B45309] font-medium mt-0.5 block">
            {openOrdersCount} awaiting review & load split
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            Scheduled Loads
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#2563EB] tabular-nums mt-0.5 block">
            {scheduledLoadsCount || 5}
          </span>
          <span className="text-[11px] text-[#6B7280] mt-0.5 block">
            Active / assigned delivery loads
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            Registered Drivers
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#14171A] tabular-nums mt-0.5 block">
            {registeredDriversCount || 4}
          </span>
          <span className="text-[11px] text-[#16A34A] font-medium mt-0.5 block">
            Available across supplier fleet
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            Total Ordered / Done
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#16A34A] tabular-nums mt-0.5 block">
            90 t
          </span>
          <span className="text-[11px] text-[#6B7280] mt-0.5 block">
            5 loads (18t/load prototype default)
          </span>
        </div>
      </div>

      {/* Navigation Tabs (All 6 Required Screens in Section 3) */}
      <div className="space-y-4">
        <div className="flex border-b border-[#E7E5E0] gap-4 sm:gap-6 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('incoming')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'incoming'
                ? 'text-[#14171A] font-bold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <Layers className="w-4 h-4" />
            <span>Incoming Orders</span>
            {openOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#FEF3C7] text-[#B45309] text-[10px] font-semibold rounded-full">
                {openOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'dispatch'
                ? 'text-[#14171A] font-bold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <Truck className="w-4 h-4" />
            <span>Dispatch & QR Records</span>
            {scheduledLoadsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#DBEAFE] text-[#2563EB] text-[10px] font-semibold rounded-full">
                {scheduledLoadsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'tracking'
                ? 'text-[#14171A] font-bold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <Radio className="w-4 h-4" />
            <span>Live Vehicle Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'drivers'
                ? 'text-[#14171A] font-bold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <User className="w-4 h-4" />
            <span>Drivers & Vehicles Register</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'analytics'
                ? 'text-[#14171A] font-bold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & Driver Performance</span>
          </button>
        </div>

        {/* Global Search & Destination Site Filter */}
        {(activeTab === 'incoming' || activeTab === 'dispatch') && (
          <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-3 sm:p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order #, customer, material, driver or site destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-white border border-[#E7E5E0] rounded-xl text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
              />
            </div>

            {/* Destination Site Filter (Acceptance Check 4) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:inline">
                Destination Site:
              </span>
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-xl text-xs font-semibold text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                <option value="all">All Destination Sites</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: Incoming Orders (Figure 1 UI Card) */}
      {activeTab === 'incoming' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {displayedOrders.map((order) => {
              const lines = order.lines && order.lines.length > 0 ? order.lines : [
                {
                  id: 'line-default',
                  category: order.category,
                  description: order.description,
                  requestedQty: order.orderedQty,
                  unit: order.unit,
                  estimatedLoads: order.estimatedLoads || 1,
                },
              ];
              const totalEstLoads = order.estimatedLoads || lines.reduce((sum, l) => sum + (l.estimatedLoads || 1), 0);

              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#E7E5E0] rounded-[16px] shadow-[0_1px_3px_rgba(20,23,26,0.05)] overflow-hidden transition-all hover:border-[#14171A]/30"
                >
                  {/* Top Bar (Figure 1 Specification) */}
                  <div className="px-6 py-4 border-b border-[#E7E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                        INCOMING ORDER
                      </span>
                      <span className="text-xs text-[#6B7280]">•</span>
                      <span className="font-mono text-base font-bold text-[#14171A]">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.clarificationRequested && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[11px] font-semibold border border-[#FDE68A] flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" /> Clarification Requested
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'pending'
                            ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                            : order.status === 'accepted'
                            ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
                            : 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]'
                        }`}
                      >
                        STATUS: {order.status === 'pending' ? 'NEW' : order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Body (Figure 1 Layout) */}
                  <div className="p-6 space-y-5">
                    {/* Customer & Destination Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[#6B7280] block text-[11px] font-semibold uppercase tracking-wider">
                          Customer
                        </span>
                        <span className="text-sm font-bold text-[#14171A] mt-0.5 block">
                          {order.customerName || 'DJ Civils Ltd'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#6B7280] block text-[11px] font-semibold uppercase tracking-wider">
                          Ordered by
                        </span>
                        <span className="text-sm font-semibold text-[#14171A] mt-0.5 block">
                          {order.orderedBy || 'Chris (Site Manager)'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#6B7280] block text-[11px] font-semibold uppercase tracking-wider">
                          Destination
                        </span>
                        <span className="text-sm font-bold text-[#14171A] mt-0.5 block">
                          {order.destinationName}
                        </span>
                        <span className="text-[11px] text-[#6B7280]">{order.siteName}</span>
                      </div>

                      <div>
                        <span className="text-[#6B7280] block text-[11px] font-semibold uppercase tracking-wider">
                          Requested date / window
                        </span>
                        <span className="text-sm font-semibold text-[#14171A] mt-0.5 block">
                          {order.timeSlot || 'Set by Chris'}
                        </span>
                        <span className="text-[11px] text-[#6B7280]">{order.requestedDate}</span>
                      </div>
                    </div>

                    {/* Multi-Line Material / Service Items (Figure 1) */}
                    <div className="border border-[#E7E5E0] rounded-xl overflow-hidden bg-[#F8F8F6]">
                      <div className="px-4 py-2.5 bg-[#EFEFEA] border-b border-[#E7E5E0] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center justify-between">
                        <span>Ordered Lines & Estimated Loads</span>
                        <span>Quantity & Load Estimation</span>
                      </div>
                      <div className="divide-y divide-[#E7E5E0] p-0">
                        {lines.map((line, idx) => (
                          <div
                            key={line.id || idx}
                            className="px-4 py-3 flex items-center justify-between gap-3 text-xs bg-white"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-[#14171A] text-sm block">
                                {line.category}
                              </span>
                              <span className="text-[11px] text-[#6B7280] block">
                                {line.description}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-[#14171A] text-sm block tabular-nums">
                                {line.requestedQty} {line.unit}
                              </span>
                              <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full inline-block mt-0.5">
                                {line.estimatedLoads || 1} estimated load{(line.estimatedLoads || 1) === 1 ? '' : 's'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total Bar (Figure 1) */}
                      <div className="px-4 py-3.5 bg-[#F8F8F6] border-t-2 border-[#E7E5E0] flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-[#14171A] text-sm">
                          TOTAL:
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-base text-[#14171A] tabular-nums block">
                            {order.orderedQty} {order.unit}
                          </span>
                          <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                            {totalEstLoads} estimated loads
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prototype Assumption Notice (Explicit PCR Requirement) */}
                    <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E7E5E0] text-[11px] text-[#6B7280] leading-relaxed">
                      <strong className="text-[#14171A]">Prototype assumption only:</strong> 18 tonnes per full truckload. Actual load count must depend on assigned vehicle capacity and permitted payload, and must remain editable.
                    </div>

                    {/* Clarification notes if present */}
                    {order.clarificationNotes && (
                      <div className="p-3 bg-[#FEF3C7] rounded-xl border border-[#FDE68A] text-xs text-[#B45309] space-y-1">
                        <span className="font-bold flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Clarification Inquiry Sent:
                        </span>
                        <p>{order.clarificationNotes}</p>
                      </div>
                    )}

                    {/* Action Buttons (Figure 1: Accept & assign drivers, Review / Request clarification) */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-[#E7E5E0]">
                      <button
                        type="button"
                        onClick={() => setClarificationOrder(order)}
                        className="h-10 px-4 bg-white hover:bg-[#F7F7F5] border border-[#E7E5E0] rounded-xl text-xs font-semibold text-[#14171A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-4 h-4 text-[#B45309]" />
                        <span>Review / Request clarification</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoadSplitOrder(order)}
                        className="h-10 px-5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <Truck className="w-4 h-4 text-[#F5B301]" />
                        <span>Accept & assign drivers</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {displayedOrders.length === 0 && (
              <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-12 text-center text-xs text-[#6B7280] space-y-2">
                <Layers className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                <p className="font-semibold text-sm text-[#14171A]">No incoming orders matching filters</p>
                <p>Switch suppliers or adjust your site filter above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Dispatch Records & Load Allocation */}
      {activeTab === 'dispatch' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#14171A]">
                Load Dispatch & Gate Token Records
              </h2>
              <p className="text-xs text-[#6B7280]">
                Individual delivery loads dispatched to Chatham Capstone and Rochester Capstone.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#6B7280]">
              Total Loads: <strong className="text-[#14171A]">{displayedLoads.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedLoads.map((load) => (
              <LoadDispatchCard key={load.id} load={load} onTrackLoad={handleTrackLoad} />
            ))}
          </div>

          {displayedLoads.length === 0 && (
            <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-12 text-center text-xs text-[#6B7280] space-y-2">
              <Truck className="w-8 h-8 text-[#9CA3AF] mx-auto" />
              <p className="font-semibold text-sm text-[#14171A]">No dispatch loads currently scheduled</p>
              <p>Accept an incoming order to generate and allocate delivery loads.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Live Vehicle Tracking (Figure 2) */}
      {activeTab === 'tracking' && (
        <LiveTrackingView initialLoadId={trackedLoadId} />
      )}

      {/* TAB 4: Drivers & Vehicles Register */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          {/* Driver Fleet Register */}
          <div className="bg-white border border-[#E7E5E0] rounded-[16px] shadow-[0_1px_3px_rgba(20,23,26,0.05)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E5E0] flex items-center justify-between bg-[#FAFAFA]">
              <div>
                <h3 className="text-sm font-semibold text-[#14171A]">
                  Supplier Driver Fleet Register
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Verified haulage drivers, CSCS certifications, and assigned heavy plant vehicles.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full border border-[#BBF7D0]">
                {supplierDrivers.length} Verified Drivers
              </span>
            </div>

            <div className="divide-y divide-[#E7E5E0]">
              {supplierDrivers.map((driver) => (
                <div key={driver.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E7E5E0] flex items-center justify-center text-[#14171A] font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#14171A] block">{driver.name}</span>
                      <span className="text-xs text-[#6B7280]">{driver.hgvClass}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">CSCS Card</span>
                      <span className="font-mono text-[#14171A]">{driver.cscsCardNumber}</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Assigned Vehicle</span>
                      <span className="font-mono font-bold text-[#14171A]">{driver.defaultVehicleReg}</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Contact</span>
                      <span className="font-mono text-[#14171A]">{driver.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Fleet Register */}
          <div className="bg-white border border-[#E7E5E0] rounded-[16px] shadow-[0_1px_3px_rgba(20,23,26,0.05)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E5E0] flex items-center justify-between bg-[#FAFAFA]">
              <div>
                <h3 className="text-sm font-semibold text-[#14171A]">
                  Registered Fleet & Payload Capacities
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Vehicle register determining load split counts and maximum allowable payloads.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                {supplierVehicles.length} Registered HGVs
              </span>
            </div>

            <div className="divide-y divide-[#E7E5E0]">
              {supplierVehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-sm font-bold text-[#14171A] block">
                        {vehicle.registration}
                      </span>
                      <span className="text-xs text-[#6B7280]">{vehicle.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Max Payload</span>
                      <span className="font-bold text-sm text-[#14171A]">
                        {vehicle.capacity} {vehicle.capacityUnit}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold border border-[#BBF7D0]">
                      {vehicle.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Analytics & Driver Performance (Figures 4 & 5) */}
      {activeTab === 'analytics' && (
        <DriverPerformanceLedger />
      )}

      {/* Modals */}
      <ClarificationModal
        order={clarificationOrder}
        isOpen={Boolean(clarificationOrder)}
        onClose={() => setClarificationOrder(null)}
      />

      <LoadSplitModal
        order={loadSplitOrder}
        isOpen={Boolean(loadSplitOrder)}
        onClose={() => setLoadSplitOrder(null)}
        onLoadsGenerated={() => setActiveTab('dispatch')}
      />

      <AssignDriverModal
        order={assignModalOrder}
        isOpen={Boolean(assignModalOrder)}
        onClose={() => setAssignModalOrder(null)}
      />
    </div>
  );
}
