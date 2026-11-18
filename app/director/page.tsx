'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Order, Visit } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { OrderDetailDrawer } from '@/components/ordering/OrderDetailDrawer';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DirectorPage() {
  const { orders, visits, sites, suppliers, currentSiteId, setCurrentSite } = useAppStore();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSite = selectedSiteFilter === 'all' || o.siteId === selectedSiteFilter;
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.siteName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSite && matchesStatus && matchesSearch;
    });
  }, [orders, selectedSiteFilter, statusFilter, searchQuery]);

  // Executive KPI Calculations
  const totalCommittedSpend = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  const verifiedSpend = orders
    .filter((o) => ['verified', 'completed'].includes(o.status))
    .reduce((sum, o) => {
      const v = visits.find((vis) => vis.orderId === o.id);
      if (v?.discrepancy) {
        const shortAmt = Math.abs(v.discrepancy.varianceQty * (o.unitPrice || 0));
        return sum + Math.max(0, o.totalPrice - shortAmt);
      }
      return sum + o.totalPrice;
    }, 0);

  const totalVisitsCount = visits.length;
  const discrepancyVisits = visits.filter(
    (v) => Boolean(v.discrepancy) || v.serviceCompletedStatus === 'disputed'
  );
  const discrepancyRate =
    totalVisitsCount > 0
      ? ((discrepancyVisits.length / totalVisitsCount) * 100).toFixed(1)
      : '0.0';

  const onSiteVehiclesCount = visits.filter(
    (v) => ['on_site', 'verified'].includes(v.status) && !v.gateExitAt
  ).length;

  // Chart 1: Spend by Supplier
  const supplierSpendData = useMemo(() => {
    return suppliers.map((sup) => {
      const supOrders = orders.filter((o) => o.supplierId === sup.id);
      const spend = supOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      return {
        name: sup.name.split(' ')[0], // short name
        fullName: sup.name,
        spend,
      };
    });
  }, [suppliers, orders]);

  // Chart 2: Order Status Distribution
  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      Pending: 0,
      Active: 0,
      Verified: 0,
      Discrepancies: 0,
    };

    orders.forEach((o) => {
      const v = visits.find((vis) => vis.orderId === o.id);
      if (v?.discrepancy || o.status === 'disputed') {
        counts.Discrepancies += 1;
      } else if (['verified', 'completed'].includes(o.status)) {
        counts.Verified += 1;
      } else if (['accepted', 'dispatched', 'on_site'].includes(o.status)) {
        counts.Active += 1;
      } else {
        counts.Pending += 1;
      }
    });

    return [
      { name: 'Verified Clean', value: counts.Verified, color: '#16A34A' },
      { name: 'Active In Flight', value: counts.Active, color: '#2563EB' },
      { name: 'Pending Supplier', value: counts.Pending, color: '#F5B301' },
      { name: 'Discrepancies Flagged', value: counts.Discrepancies, color: '#DC2626' },
    ];
  }, [orders, visits]);

  const selectedVisit = useMemo(() => {
    if (!selectedOrder) return undefined;
    return visits.find((v) => v.orderId === selectedOrder.id);
  }, [selectedOrder, visits]);

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#14171A] tracking-tight">
              Executive Director Dashboard
            </h1>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Cross-project spend commitment, supplier delivery compliance, and real-time site operational governance.
          </p>
        </div>

        {/* Site Selector in Header */}
        <div className="flex items-center gap-2 bg-white border border-[#E7E5E0] rounded-lg p-1.5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] pl-2 hidden sm:inline">
            Project Scope:
          </span>
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="h-8 px-2.5 bg-[#F7F7F5] border border-[#E7E5E0] rounded-md text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
          >
            <option value="all">All Construction Projects</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Row (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Committed PO Spend
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#14171A] tabular-nums mt-0.5 block truncate">
            {formatCurrency(totalCommittedSpend)}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            {orders.length} total purchase orders
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Verified Invoiced Spend
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#16A34A] tabular-nums mt-0.5 block truncate">
            {formatCurrency(verifiedSpend)}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Net of shortage adjustments
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Site Discrepancy Rate
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#DC2626] tabular-nums mt-0.5 block truncate">
            {discrepancyRate}%
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            {discrepancyVisits.length} recorded shortage{discrepancyVisits.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Active Vehicles On Site
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#2563EB] tabular-nums mt-0.5 block truncate">
            {onSiteVehiclesCount}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Live gateheadcount
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid: 2 clean cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Spend by Tier-1 Supplier (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
                Spend by Key Trade Contractor & Supplier
              </span>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                Committed material & specialist plant hire volume
              </p>
            </div>
            <span className="text-[11px] font-medium text-[#14171A] bg-[#F7F7F5] border border-[#E7E5E0] px-2 py-0.5 rounded">
              PO Volume (£)
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierSpendData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E7E5E0' }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E7E5E0' }}
                    tickFormatter={(val) => `£${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Committed Spend']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E7E5E0',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="spend" fill="#14171A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Order & Reconciliation Status (1 col) */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
              Delivery Reconciliation Status
            </span>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              Live status across {orders.length} orders
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} orders`, name]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E7E5E0',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E7E5E0] text-[11px]">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#6B7280] truncate">{item.name}</span>
                <span className="font-semibold text-[#14171A] ml-auto tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3 sm:p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ref, item, destination, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="dispatched">Dispatched</option>
            <option value="on_site">On Site</option>
            <option value="verified">Verified</option>
            <option value="completed">Completed</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>
      </div>

      {/* Project-Wide Orders Audit Table */}
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
        <div className="p-4 border-b border-[#E7E5E0] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#14171A]">
              Project Commercial Orders & Lifecycle Audit
            </h3>
            <p className="text-xs text-[#6B7280]">
              Click any record to inspect chain-of-custody timestamps, driver allocations, and weighbridge discrepancy receipts.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full min-w-[800px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                <th className="px-4 py-2">Order ref</th>
                <th className="px-4 py-2">Material / Service</th>
                <th className="px-4 py-2">Site & Destination</th>
                <th className="px-4 py-2">Supplier</th>
                <th className="px-4 py-2">Delivered vs Ordered</th>
                <th className="px-4 py-2">Turnaround</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Invoiced Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E0]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[#6B7280]">
                    No purchase orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const visit = visits.find((v) => v.orderId === order.id);
                  const hasDiscrepancy = Boolean(visit?.discrepancy);
                  const variance = visit?.discrepancy?.varianceQty ?? 0;
                  const creditNote = hasDiscrepancy ? Math.abs(variance * (order.unitPrice || 0)) : 0;
                  const netInvoiced = Math.max(0, order.totalPrice - creditNote);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="h-14 hover:bg-[#F7F7F5] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-[#14171A] whitespace-nowrap">
                        {order.orderNumber}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[200px] truncate">
                          {order.category}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] capitalize">
                          {order.type} • {order.orderedQty} {order.unit}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#14171A] max-w-[180px] truncate">
                          {order.destinationName}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] truncate max-w-[180px]">
                          {order.siteName}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[#14171A] whitespace-nowrap">
                        {order.supplierName}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {visit?.receivedQty !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#14171A]">
                              {visit.receivedQty} {order.unit}
                            </span>
                            {hasDiscrepancy ? (
                              <span className="text-[10px] font-semibold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.2 rounded-full">
                                {variance} {order.unit}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.2 rounded-full">
                                100%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#6B7280]">
                            {order.orderedQty} {order.unit} (pending)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[#6B7280] font-mono text-[11px]">
                        {visit?.durationMinutes ? `${visit.durationMinutes}m` : '—'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={order.status} size="sm" />
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-[#14171A] tabular-nums whitespace-nowrap">
                        {['verified', 'completed'].includes(order.status)
                          ? formatCurrency(netInvoiced)
                          : formatCurrency(order.totalPrice)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        visit={selectedVisit}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

