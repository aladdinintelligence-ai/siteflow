'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Order, Visit } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AssignDriverModal } from '@/components/supplier/AssignDriverModal';
import { DeclineOrderModal } from '@/components/supplier/DeclineOrderModal';
import { SupplierOrderDetailsDrawer } from '@/components/supplier/SupplierOrderDetailsDrawer';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SupplierTab = 'incoming' | 'active' | 'history';

export default function SupplierPage() {
  const {
    orders,
    visits,
    sites,
    suppliers,
    activeSupplierId,
    setActiveSupplier,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SupplierTab>('incoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');

  // Modals & Drawer State
  const [assignModalOrder, setAssignModalOrder] = useState<Order | null>(null);
  const [declineModalOrder, setDeclineModalOrder] = useState<Order | null>(null);
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);

  // Active Supplier
  const currentSupplier =
    suppliers.find((s) => s.id === activeSupplierId) || suppliers[0];

  // Supplier-scoped data
  const supplierOrders = useMemo(() => {
    return orders.filter((o) => o.supplierId === currentSupplier?.id);
  }, [orders, currentSupplier]);

  const supplierVisits = useMemo(() => {
    return visits.filter((v) => v.supplierId === currentSupplier?.id);
  }, [visits, currentSupplier]);

  // Tab categorization
  const incomingOrders = useMemo(() => {
    return supplierOrders.filter((o) => o.status === 'pending');
  }, [supplierOrders]);

  const activeOrders = useMemo(() => {
    return supplierOrders.filter((o) =>
      ['accepted', 'dispatched', 'on_site'].includes(o.status)
    );
  }, [supplierOrders]);

  const historyOrders = useMemo(() => {
    return supplierOrders.filter((o) =>
      ['verified', 'completed', 'disputed'].includes(o.status)
    );
  }, [supplierOrders]);

  // Filtered orders for active tab
  const displayedOrders = useMemo(() => {
    let baseList: Order[] = [];
    if (activeTab === 'incoming') baseList = incomingOrders;
    else if (activeTab === 'active') baseList = activeOrders;
    else baseList = historyOrders;

    return baseList.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.siteName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSite = siteFilter === 'all' || o.siteId === siteFilter;
      return matchesSearch && matchesSite;
    });
  }, [activeTab, incomingOrders, activeOrders, historyOrders, searchQuery, siteFilter]);

  // KPI Calculations
  const ordersThisMonth = supplierOrders.filter((o) => o.status !== 'declined').length;

  const totalSalesValue = supplierOrders
    .filter((o) => o.status !== 'declined')
    .reduce((sum, o) => {
      const v = supplierVisits.find((vis) => vis.orderId === o.id);
      if (v?.discrepancy) {
        const shortAmt = Math.abs(v.discrepancy.varianceQty * (o.unitPrice || 0));
        return sum + Math.max(0, o.totalPrice - shortAmt);
      }
      return sum + o.totalPrice;
    }, 0);

  const completedCount = historyOrders.length;
  const shortCount = historyOrders.filter((o) => {
    const v = supplierVisits.find((vis) => vis.orderId === o.id);
    return Boolean(v?.discrepancy);
  }).length;

  const onTimeRate = '97.2%';
  const shortDeliveryRate =
    completedCount > 0
      ? `${Math.round((shortCount / completedCount) * 100)}%`
      : '0%';

  const drawerVisit = useMemo(() => {
    if (!drawerOrder) return undefined;
    return supplierVisits.find((v) => v.orderId === drawerOrder.id);
  }, [drawerOrder, supplierVisits]);

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#14171A] tracking-tight">
              Supplier Logistics Portal
            </h1>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Accept DJ Civil orders, assign drivers and vehicles, and track verified delivery settlements.
          </p>
        </div>

        {/* Supplier Selector in Header */}
        <div className="flex items-center gap-2 bg-white border border-[#E7E5E0] rounded-lg p-1.5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] pl-2 hidden sm:inline">
            Supplier:
          </span>
          <select
            value={activeSupplierId}
            onChange={(e) => setActiveSupplier(e.target.value)}
            className="h-8 px-2.5 bg-[#F7F7F5] border border-[#E7E5E0] rounded-md text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
          >
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Row (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Orders (Month)
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#14171A] tabular-nums mt-0.5 block truncate">
            {ordersThisMonth}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            {incomingOrders.length} pending acceptance
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Net Sales Value
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#14171A] tabular-nums mt-0.5 block truncate">
            {formatCurrency(totalSalesValue)}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Active & verified orders
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            On-Time Rate
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#16A34A] tabular-nums mt-0.5 block truncate">
            {onTimeRate}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Within scheduled site slot
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Shortage Rate
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#B45309] tabular-nums mt-0.5 block truncate">
            {shortDeliveryRate}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            {shortCount} recorded shortage{shortCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Tabs & Search Filter Container */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E7E5E0] gap-4 sm:gap-6 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('incoming')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'incoming'
                ? 'text-[#14171A] font-semibold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <span>Incoming Orders</span>
            {incomingOrders.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#FEF3C7] text-[#B45309] text-[10px] font-semibold rounded-full">
                {incomingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'active'
                ? 'text-[#14171A] font-semibold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <span>Active Dispatches</span>
            {activeOrders.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#DBEAFE] text-[#2563EB] text-[10px] font-semibold rounded-full">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'pb-3 font-medium transition-colors relative flex items-center gap-2 cursor-pointer whitespace-nowrap',
              activeTab === 'history'
                ? 'text-[#14171A] font-semibold border-b-2 border-[#14171A]'
                : 'text-[#6B7280] hover:text-[#14171A]'
            )}
          >
            <span>Fulfilment History</span>
            <span className="px-1.5 py-0.2 bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold rounded-full">
              {historyOrders.length}
            </span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3 sm:p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ref, material, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
            >
              <option value="all">All Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab 1: Incoming Orders */}
      {activeTab === 'incoming' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Order ref</th>
                  <th className="px-4 py-2">Material / Service</th>
                  <th className="px-4 py-2">Site & Destination</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Delivery Slot</th>
                  <th className="px-4 py-2 text-right">Sales Value</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {displayedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#16A34A] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          All incoming purchase orders processed
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          New orders submitted by the DJ Civil team will appear here immediately for driver allocation.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="h-14 hover:bg-[#F7F7F5] transition-colors group cursor-pointer"
                      onClick={() => setDrawerOrder(order)}
                    >
                      <td className="px-4 py-3 font-mono font-medium text-[#14171A] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={order.status} size="sm" />
                          <span>{order.orderNumber}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[220px] truncate">
                          {order.category}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] truncate max-w-[220px]">
                          {order.description}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-[#14171A] font-medium max-w-[180px] truncate">
                          {order.destinationName}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] truncate max-w-[180px]">
                          {order.siteName}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-[#14171A] tabular-nums">
                          {order.orderedQty}
                        </span>{' '}
                        <span className="text-[#6B7280]">{order.unit}</span>
                      </td>

                      <td className="px-4 py-3 font-mono text-[#6B7280] whitespace-nowrap">
                        {order.timeSlot}
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-[#14171A] tabular-nums whitespace-nowrap">
                        {formatCurrency(order.totalPrice)}
                      </td>

                      <td
                        className="px-4 py-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDeclineModalOrder(order)}
                            className="h-8 px-2.5 bg-white border border-[#E7E5E0] hover:bg-[#FEE2E2] hover:text-[#DC2626] text-[#6B7280] rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => setAssignModalOrder(order)}
                            className="h-8 px-3 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
                          >
                            Accept & Assign Driver
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Active Dispatches */}
      {activeTab === 'active' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Order ref</th>
                  <th className="px-4 py-2">Material / Service</th>
                  <th className="px-4 py-2">Site & Offload Destination</th>
                  <th className="px-4 py-2">Assigned Driver & VRN</th>
                  <th className="px-4 py-2">Status & ETA</th>
                  <th className="px-4 py-2 text-right">Value</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {displayedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Truck className="w-8 h-8 text-[#9CA3AF] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          No active dispatches
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          Accept incoming purchase orders to assign drivers and initiate site haulage.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map((order) => {
                    const visit = supplierVisits.find((v) => v.orderId === order.id);

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setDrawerOrder(order)}
                        className="h-14 hover:bg-[#F7F7F5] transition-colors group cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono font-medium text-[#14171A] whitespace-nowrap">
                          {order.orderNumber}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A] max-w-[200px] truncate">
                            {order.category}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF]">
                            {order.orderedQty} {order.unit}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-[#14171A] font-medium max-w-[180px] truncate">
                            {order.destinationName}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF] truncate max-w-[180px]">
                            {order.siteName}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {visit?.driverName ? (
                            <div>
                              <div className="font-medium text-[#14171A]">
                                {visit.driverName}
                              </div>
                              <div className="font-mono text-[11px] text-[#6B7280]">
                                {visit.vehicleReg}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#B45309] font-medium bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                              Driver not assigned
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={order.status} size="sm" />
                            {visit?.tracking && order.status === 'dispatched' && (
                              <span className="text-[11px] text-[#2563EB] font-mono">
                                ETA {visit.tracking.estimatedArrivalMinutes}m
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right font-medium text-[#14171A] tabular-nums whitespace-nowrap">
                          {formatCurrency(order.totalPrice)}
                        </td>

                        <td
                          className="px-4 py-3 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setAssignModalOrder(order)}
                            className="h-8 px-3 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            {visit?.driverName ? 'Reassign' : 'Assign driver'}
                          </button>
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

      {/* Tab 3: Fulfilment History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                  <th className="px-4 py-2">Order ref</th>
                  <th className="px-4 py-2">Material / Destination</th>
                  <th className="px-4 py-2">Ordered vs Delivered</th>
                  <th className="px-4 py-2">Fulfilment Variance</th>
                  <th className="px-4 py-2 text-right">Order Value</th>
                  <th className="px-4 py-2 text-right">Credit / Adj.</th>
                  <th className="px-4 py-2 text-right">Net Invoiced</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {displayedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Clock className="w-8 h-8 text-[#9CA3AF] stroke-1" />
                        <span className="font-medium text-[#14171A]">
                          No completed orders recorded
                        </span>
                        <p className="text-xs text-[#9CA3AF] max-w-sm">
                          Completed and verified delivery receipts will display reconciled quantities and credit notes here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map((order) => {
                    const visit = supplierVisits.find((v) => v.orderId === order.id);
                    const hasDiscrepancy = Boolean(visit?.discrepancy);
                    const variance = visit?.discrepancy?.varianceQty ?? 0;
                    const unitPrice = order.unitPrice || 0;
                    const creditNote = hasDiscrepancy ? Math.abs(variance * unitPrice) : 0;
                    const netInvoiced = Math.max(0, order.totalPrice - creditNote);

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setDrawerOrder(order)}
                        className="h-14 hover:bg-[#F7F7F5] transition-colors group cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono font-medium text-[#14171A] whitespace-nowrap">
                          {order.orderNumber}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-[#14171A] max-w-[200px] truncate">
                            {order.category}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF] truncate max-w-[200px]">
                            {order.destinationName} • {order.siteName}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[#6B7280]">
                            {order.orderedQty} {order.unit}
                          </span>
                          <span className="mx-1.5 text-[#9CA3AF]">→</span>
                          <span className="font-medium text-[#14171A]">
                            {visit?.receivedQty !== undefined
                              ? `${visit.receivedQty} ${order.unit}`
                              : `${order.orderedQty} ${order.unit}`}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {hasDiscrepancy ? (
                            <span className="text-[11px] font-medium text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>
                                {variance} {order.unit} shortage
                              </span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>100% Fulfilled</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-medium text-[#6B7280] tabular-nums whitespace-nowrap">
                          {formatCurrency(order.totalPrice)}
                        </td>

                        <td className="px-4 py-3 text-right font-mono text-xs tabular-nums whitespace-nowrap">
                          {hasDiscrepancy ? (
                            <span className="text-[#DC2626] font-medium">
                              -{formatCurrency(creditNote)}
                            </span>
                          ) : (
                            <span className="text-[#9CA3AF]">£0.00</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-[#14171A] tabular-nums whitespace-nowrap">
                          {formatCurrency(netInvoiced)}
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <StatusBadge status={order.status} size="sm" />
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
      <AssignDriverModal
        order={assignModalOrder}
        isOpen={Boolean(assignModalOrder)}
        onClose={() => setAssignModalOrder(null)}
      />

      <DeclineOrderModal
        order={declineModalOrder}
        isOpen={Boolean(declineModalOrder)}
        onClose={() => setDeclineModalOrder(null)}
      />

      <SupplierOrderDetailsDrawer
        order={drawerOrder}
        visit={drawerVisit}
        isOpen={Boolean(drawerOrder)}
        onClose={() => setDrawerOrder(null)}
        onAssignDriver={(order) => {
          setDrawerOrder(null);
          setAssignModalOrder(order);
        }}
        onDeclineOrder={(order) => {
          setDrawerOrder(null);
          setDeclineModalOrder(order);
        }}
      />
    </div>
  );
}
