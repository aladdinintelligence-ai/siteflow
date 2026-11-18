'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Order, OrderStatus } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { NewOrderModal } from '@/components/ordering/NewOrderModal';
import { OrderDetailDrawer } from '@/components/ordering/OrderDetailDrawer';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrderingPage() {
  const { orders, visits, sites, suppliers, currentSiteId } = useAppStore();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // KPI Calculations
  const openOrdersCount = orders.filter((o) => !['completed', 'declined'].includes(o.status)).length;
  const awaitingSupplierCount = orders.filter((o) => o.status === 'pending').length;
  const onSiteCount = orders.filter((o) => o.status === 'on_site').length;
  const discrepancyCount = visits.filter((v) => Boolean(v.discrepancy)).length;

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.destinationName.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      // Site
      const matchesSite = siteFilter === 'all' || o.siteId === siteFilter;

      // Supplier
      const matchesSupplier = supplierFilter === 'all' || o.supplierId === supplierFilter;

      return matchesSearch && matchesStatus && matchesSite && matchesSupplier;
    });
  }, [orders, searchQuery, statusFilter, siteFilter, supplierFilter]);

  const selectedVisit = useMemo(() => {
    if (!selectedOrder) return undefined;
    return visits.find((v) => v.orderId === selectedOrder.id);
  }, [selectedOrder, visits]);

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#14171A] tracking-tight">
            Purchase Orders & Booking Ledger
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            DJ Civil commercial orders, designated zones, and supplier fulfilment status.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="h-10 px-4 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
        >
          <Plus className="w-4 h-4" />
          <span>New order</span>
        </button>
      </div>

      {/* Summary KPI Row: 4 clean cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Open Orders
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#14171A] tabular-nums mt-0.5 block truncate">
            {openOrdersCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">Live in flight</span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Pending Supplier
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#B45309] tabular-nums mt-0.5 block truncate">
            {awaitingSupplierCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">Pending acceptance</span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            On Site Today
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#2563EB] tabular-nums mt-0.5 block truncate">
            {onSiteCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">Discharging in zones</span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Discrepancies
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#DC2626] tabular-nums mt-0.5 block truncate">
            {discrepancyCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">Short / damaged items</span>
        </div>
      </div>

      {/* Filter and Search Bar: 40px inputs on 8px grid */}
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, item, supplier, destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="dispatched">Dispatched / En Route</option>
            <option value="on_site">On site</option>
            <option value="verified">Verified</option>
            <option value="completed">Completed</option>
            <option value="disputed">Disputed</option>
          </select>

          {/* Site Filter */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer max-w-[160px] truncate"
          >
            <option value="all">All sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Supplier Filter */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer max-w-[160px] truncate"
          >
            <option value="all">All suppliers</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table: 48px rows, no zebra stripes, light hover, right-aligned values */}
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full min-w-[800px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                <th className="px-4 py-2">Order ref</th>
                <th className="px-4 py-2">Item / Service</th>
                <th className="px-4 py-2">Site & Destination</th>
                <th className="px-4 py-2">Supplier</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Slot</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E0]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6B7280]">
                    No purchase orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const visit = visits.find((v) => v.orderId === order.id);
                  const hasDiscrepancy = Boolean(visit?.discrepancy);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="h-12 hover:bg-[#F7F7F5] transition-colors cursor-pointer group"
                    >
                      {/* Order Ref */}
                      <td className="px-4 py-3 font-mono font-medium text-[#14171A] whitespace-nowrap">
                        {order.orderNumber}
                      </td>

                      {/* Item & Category */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[220px] truncate">
                          {order.category}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] capitalize">
                          {order.type}
                        </div>
                      </td>

                      {/* Site & Destination */}
                      <td className="px-4 py-3">
                        <div className="text-[#14171A] max-w-[180px] truncate">
                          {order.destinationName}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] max-w-[180px] truncate">
                          {order.siteName}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-3 text-[#14171A] max-w-[160px] truncate">
                        {order.supplierName}
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-[#14171A] tabular-nums">
                          {order.orderedQty}
                        </span>{' '}
                        <span className="text-[#6B7280]">{order.unit}</span>
                      </td>

                      {/* Time Slot */}
                      <td className="px-4 py-3 font-mono text-[#6B7280] whitespace-nowrap">
                        {order.timeSlot}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={order.status} size="sm" />
                          {hasDiscrepancy && (
                            <span className="text-[10px] font-medium text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.5 rounded-full">
                              Shortage
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Value (Right-aligned) */}
                      <td className="px-4 py-3 text-right font-medium text-[#14171A] tabular-nums whitespace-nowrap">
                        {formatCurrency(order.totalPrice)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialogs */}
      <NewOrderModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />

      <OrderDetailDrawer
        order={selectedOrder}
        visit={selectedVisit}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
