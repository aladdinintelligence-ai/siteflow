'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Order, Visit } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { NewOrderModal } from '@/components/ordering/NewOrderModal';
import { OrderDetailDrawer } from '@/components/ordering/OrderDetailDrawer';
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils';
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
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Package,
  Wrench,
  Download,
  DollarSign,
  TrendingUp,
  Truck,
  HardHat,
  FileSpreadsheet,
  AlertTriangle,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SiteManagerPage() {
  const { orders, visits, sites, suppliers, currentSiteId, setCurrentSite } = useAppStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'expenditure' | 'reports'>('orders');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSite = siteFilter === 'all' || o.siteId === siteFilter;
      const matchesType = typeFilter === 'all' || o.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesSupplier = supplierFilter === 'all' || o.supplierId === supplierFilter;
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.vehicleReg && o.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSite && matchesType && matchesStatus && matchesSupplier && matchesSearch;
    });
  }, [orders, siteFilter, typeFilter, statusFilter, supplierFilter, searchQuery]);

  // Executive KPI Calculations
  const totalSpend = useMemo(() => {
    const list = siteFilter === 'all' ? orders : orders.filter((o) => o.siteId === siteFilter);
    return list.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  }, [orders, siteFilter]);

  const openBookingsCount = useMemo(() => {
    const list = siteFilter === 'all' ? orders : orders.filter((o) => o.siteId === siteFilter);
    return list.filter((o) => !['completed', 'declined'].includes(o.status)).length;
  }, [orders, siteFilter]);

  const onSiteTodayCount = useMemo(() => {
    const list = siteFilter === 'all' ? visits : visits.filter((v) => v.siteId === siteFilter);
    return list.filter((v) => ['on_site', 'at_gate'].includes(v.status) && !v.gateExitAt).length;
  }, [visits, siteFilter]);

  const completedVisitsCount = useMemo(() => {
    const list = siteFilter === 'all' ? visits : visits.filter((v) => v.siteId === siteFilter);
    return list.filter((v) => v.status === 'completed' || Boolean(v.gateExitAt)).length;
  }, [visits, siteFilter]);

  // Expenditure Analytics Calculations
  const spendBySupplier = useMemo(() => {
    return suppliers.map((sup) => {
      const supOrders = orders.filter((o) => o.supplierId === sup.id && (siteFilter === 'all' || o.siteId === siteFilter));
      const spend = supOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      return {
        name: sup.name.split(' ')[0],
        fullName: sup.name,
        spend,
        orderCount: supOrders.length,
      };
    }).filter((s) => s.spend > 0).sort((a, b) => b.spend - a.spend);
  }, [orders, suppliers, siteFilter]);

  const spendByType = useMemo(() => {
    const relevantOrders = siteFilter === 'all' ? orders : orders.filter((o) => o.siteId === siteFilter);
    const materialsSpend = relevantOrders.filter((o) => o.type === 'material').reduce((sum, o) => sum + o.totalPrice, 0);
    const servicesSpend = relevantOrders.filter((o) => o.type === 'service').reduce((sum, o) => sum + o.totalPrice, 0);
    return [
      { name: 'Materials', value: materialsSpend, color: '#14171A' },
      { name: 'Services & Repairs', value: servicesSpend, color: '#F5B301' },
    ];
  }, [orders, siteFilter]);

  const spendBySite = useMemo(() => {
    return sites.map((site) => {
      const siteOrders = orders.filter((o) => o.siteId === site.id);
      const spend = siteOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      return {
        name: site.name,
        code: site.code,
        spend,
        orderCount: siteOrders.length,
      };
    });
  }, [orders, sites]);

  const selectedVisit = useMemo(() => {
    if (!selectedOrder) return undefined;
    return visits.find((v) => v.orderId === selectedOrder.id);
  }, [selectedOrder, visits]);

  // Export operational report as CSV
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Type', 'Category', 'Description', 'Site', 'Destination', 'Supplier', 'Quantity', 'Unit', 'Unit Price', 'Total Price', 'Status', 'Date'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.type,
      `"${o.category.replace(/"/g, '""')}"`,
      `"${o.description.replace(/"/g, '""')}"`,
      `"${o.siteName}"`,
      `"${o.destinationName}"`,
      `"${o.supplierName}"`,
      o.orderedQty,
      o.unit,
      o.unitPrice,
      o.totalPrice,
      o.status,
      o.requestedDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DJ_Civil_SiteFlow_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Top Banner: Site Manager Portal Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-[16px] p-5 sm:p-6 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#14171A] text-white uppercase tracking-wider">
              Site Manager Dashboard
            </span>
            <span className="text-xs text-[#6B7280]">Chris Jones · DJ Civil Engineering Ltd</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#14171A] tracking-tight">
            Site Operations, Materials & Service Bookings
          </h1>
          <p className="text-xs text-[#6B7280]">
            Complete commercial spend ledger, specialist site services, and operational reports for Chatham & Rochester.
          </p>
        </div>

        {/* Primary Action: Visible New Order / Book Service button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="h-11 px-5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#F5B301]" />
            <span>New Order / Book Service</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-11 px-3.5 bg-white border border-[#E7E5E0] hover:bg-[#F8F8F6] text-[#14171A] rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Download CSV operational report"
          >
            <Download className="w-4 h-4 text-[#6B7280]" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Spend */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">
              Committed Spend
            </span>
            <DollarSign className="w-4 h-4 text-[#F5B301] shrink-0" />
          </div>
          <span className="text-xl sm:text-[26px] font-semibold text-[#14171A] tabular-nums block truncate">
            {formatCurrency(totalSpend)}
          </span>
          <span className="text-[11px] text-[#6B7280] block mt-0.5">
            Materials & booked services
          </span>
        </div>

        {/* Open Bookings */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">
              Open Bookings
            </span>
            <FileSpreadsheet className="w-4 h-4 text-[#2563EB] shrink-0" />
          </div>
          <span className="text-xl sm:text-[26px] font-semibold text-[#14171A] tabular-nums block truncate">
            {openBookingsCount}
          </span>
          <span className="text-[11px] text-[#6B7280] block mt-0.5">
            Pending supplier or transit
          </span>
        </div>

        {/* On Site Today */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">
              On Site Today
            </span>
            <Truck className="w-4 h-4 text-[#16A34A] shrink-0" />
          </div>
          <span className="text-xl sm:text-[26px] font-semibold text-[#14171A] tabular-nums block truncate">
            {onSiteTodayCount}
          </span>
          <span className="text-[11px] text-[#6B7280] block mt-0.5">
            Active at gate / destination
          </span>
        </div>

        {/* Completed Turnarounds */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">
              Completed Visits
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#14171A] shrink-0" />
          </div>
          <span className="text-xl sm:text-[26px] font-semibold text-[#14171A] tabular-nums block truncate">
            {completedVisitsCount}
          </span>
          <span className="text-[11px] text-[#6B7280] block mt-0.5">
            Full scan-in & scan-out records
          </span>
        </div>
      </div>

      {/* Navigation Tabs: Orders Ledger | Expenditure & Analytics | Operational Reports */}
      <div className="flex items-center border-b border-[#E7E5E0] gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={cn(
            'pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2',
            activeTab === 'orders'
              ? 'border-[#14171A] text-[#14171A]'
              : 'border-transparent text-[#6B7280] hover:text-[#14171A]'
          )}
        >
          <Package className="w-4 h-4" />
          <span>Orders & Service Bookings</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#F7F7F5] text-[#14171A] font-mono">
            {filteredOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('expenditure')}
          className={cn(
            'pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2',
            activeTab === 'expenditure'
              ? 'border-[#14171A] text-[#14171A]'
              : 'border-transparent text-[#6B7280] hover:text-[#14171A]'
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Expenditure & Cost Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            'pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2',
            activeTab === 'reports'
              ? 'border-[#14171A] text-[#14171A]'
              : 'border-transparent text-[#6B7280] hover:text-[#14171A]'
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Chatham & Rochester Operational Reports</span>
        </button>
      </div>

      {/* TAB 1: ORDERS & SERVICE BOOKINGS LEDGER */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3 sm:p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ref, material, service, supplier, vehicle reg, destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Site Filter */}
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                <option value="all">All Sites (Chatham & Rochester)</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                <option value="all">All Types (Materials & Services)</option>
                <option value="material">Materials Only</option>
                <option value="service">Services Only</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Supplier</option>
                <option value="accepted">Accepted</option>
                <option value="dispatched">Dispatched / En Route</option>
                <option value="on_site">On Site</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
              </select>

              {/* Supplier Filter */}
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                <option value="all">All Suppliers / Contractors</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unified Orders & Bookings Table */}
          <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
            <div className="overflow-x-auto min-w-0">
              <table className="w-full min-w-[960px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E5E0] bg-[#FFFFFF] h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                    <th className="px-4 py-2">Booking Ref</th>
                    <th className="px-4 py-2">Type & Category</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Site & Destination</th>
                    <th className="px-4 py-2">Supplier / Contractor</th>
                    <th className="px-4 py-2">Vehicle / ID</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">Agreed Value</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-[#6B7280]">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Package className="w-8 h-8 text-[#9CA3AF] stroke-1" />
                          <span className="font-medium text-[#14171A]">No bookings match your filter criteria</span>
                          <p className="text-xs text-[#9CA3AF] max-w-sm">
                            Click &quot;New Order / Book Service&quot; above to dispatch a new material load or site maintenance contractor.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isService = order.type === 'service';
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="h-14 hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                        >
                          {/* Booking Ref & Date */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono font-semibold text-xs text-[#14171A] block">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] text-[#6B7280]">
                              {formatDate(order.requestedDate)} · {order.timeSlot}
                            </span>
                          </td>

                          {/* Type & Category */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {isService ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#FEF3C7] text-[#B45309]">
                                  <Wrench className="w-2.5 h-2.5" />
                                  Service
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#F3F4F6] text-[#4B5563]">
                                  <Package className="w-2.5 h-2.5" />
                                  Material
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-[#14171A] text-xs block max-w-[170px] truncate">
                              {order.category}
                            </span>
                          </td>

                          {/* Item / Service Description */}
                          <td className="px-4 py-3 max-w-[200px]">
                            <span className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">
                              {order.description}
                            </span>
                          </td>

                          {/* Site & Destination */}
                          <td className="px-4 py-3">
                            <span className="font-medium text-[#14171A] text-xs block max-w-[170px] truncate">
                              {order.destinationName}
                            </span>
                            <span className="text-[10px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-[#9CA3AF]" />
                              {order.siteName.split(' ')[0]}
                            </span>
                          </td>

                          {/* Supplier / Contractor */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-[#14171A] text-xs block max-w-[150px] truncate">
                              {order.supplierName}
                            </span>
                          </td>

                          {/* Vehicle / ID */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono font-medium text-xs text-[#14171A] bg-[#F7F7F5] border border-[#E7E5E0] px-1.5 py-0.5 rounded">
                              {order.vehicleReg || 'Unassigned'}
                            </span>
                          </td>

                          {/* Quantity */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <span className="font-semibold text-xs text-[#14171A] tabular-nums">
                              {order.orderedQty}
                            </span>
                            <span className="text-[11px] text-[#6B7280] ml-1">
                              {order.unit}
                            </span>
                          </td>

                          {/* Agreed Value */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <span className="font-semibold text-xs text-[#14171A] tabular-nums block">
                              {formatCurrency(order.totalPrice)}
                            </span>
                            <span className="text-[10px] font-mono text-[#9CA3AF]">
                              £{order.unitPrice}/{order.unit}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <StatusBadge status={order.status} size="sm" />
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className="text-xs text-[#14171A] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: EXPENDITURE & COST ANALYTICS */}
      {activeTab === 'expenditure' && (
        <div className="space-y-6">
          {/* Top Row: Spend by Supplier (Bar Chart) & Spend by Type (Pie Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Supplier Spend Commitment */}
            <div className="lg:col-span-7 bg-white border border-[#E7E5E0] rounded-[16px] p-5 sm:p-6 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#14171A]">Expenditure by Supplier & Contractor</h3>
                  <p className="text-xs text-[#6B7280]">Total committed capital across framework partners</p>
                </div>
                <span className="text-xs font-semibold text-[#14171A] font-mono bg-[#F7F7F5] px-2.5 py-1 rounded-md border border-[#E7E5E0]">
                  {formatCurrency(totalSpend)}
                </span>
              </div>

              <div className="h-64 w-full">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendBySupplier} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickFormatter={(val) => `£${val / 1000}k`}
                      />
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(Number(val)), 'Spend']}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E7E5E0',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="spend" fill="#14171A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[#9CA3AF]">
                    Loading expenditure chart...
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Materials vs Specialist Services Split */}
            <div className="lg:col-span-5 bg-white border border-[#E7E5E0] rounded-[16px] p-5 sm:p-6 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#14171A]">Materials vs Services Spend</h3>
                <p className="text-xs text-[#6B7280]">Proportion of physical materials vs specialist contractor services</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {spendByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), 'Total']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : null}
              </div>

              <div className="space-y-2 border-t border-[#E7E5E0] pt-3 text-xs">
                {spendByType.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[#6B7280]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-[#14171A] tabular-nums font-mono">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Site Comparison Grid: Chatham vs Rochester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spendBySite.map((s) => (
              <div key={s.code} className="bg-white border border-[#E7E5E0] rounded-[16px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#F5B301]" />
                    <span className="font-semibold text-[#14171A] text-sm">{s.name}</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#6B7280] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E7E5E0]">
                    {s.code}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-[#E7E5E0] pt-3">
                  <span className="text-xs text-[#6B7280]">Total Project Spend</span>
                  <span className="text-xl font-semibold text-[#14171A] tabular-nums font-mono">
                    {formatCurrency(s.spend)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span>Total Recorded Bookings</span>
                  <span className="font-semibold text-[#14171A]">{s.orderCount} bookings</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL REPORTS & TURNAROUND LOGS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 shadow-[0_1px_2px_rgba(20,23,26,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-semibold text-sm text-[#14171A]">Site Gate Attendance & Turnaround Audit</h3>
              <p className="text-xs text-[#6B7280]">Traceable gate logs, entry times, duration records, and scan-out completion</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="h-9 px-3 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full CSV Audit</span>
            </button>
          </div>

          <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
            <div className="overflow-x-auto min-w-0">
              <table className="w-full min-w-[800px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E5E0] bg-[#FFFFFF] h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                    <th className="px-4 py-2">Visit Ref</th>
                    <th className="px-4 py-2">Site & Destination</th>
                    <th className="px-4 py-2">Driver / Worker</th>
                    <th className="px-4 py-2">Vehicle Reg</th>
                    <th className="px-4 py-2">Gate Entry</th>
                    <th className="px-4 py-2">Gate Exit</th>
                    <th className="px-4 py-2 text-right">Turnaround</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {visits.map((v) => (
                    <tr key={v.id} className="h-13 hover:bg-[#F7F7F5] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs text-[#14171A] block">
                          {v.orderNumber}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B7280]">{v.id}</span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium text-[#14171A] text-xs block max-w-[170px] truncate">
                          {v.destinationName}
                        </span>
                        <span className="text-[10px] text-[#6B7280]">{v.siteName}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-[#14171A]">{v.driverName || 'Driver'}</span>
                        <span className="text-[10px] text-[#6B7280] block">{v.supplierName}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-medium text-xs text-[#14171A] bg-[#F7F7F5] border border-[#E7E5E0] px-1.5 py-0.5 rounded">
                          {v.vehicleReg}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[#6B7280]">
                        {v.gateEntryAt ? formatDateTime(v.gateEntryAt) : 'Pending'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[#6B7280]">
                        {v.gateExitAt ? formatDateTime(v.gateExitAt) : (v.status === 'on_site' ? 'Currently on site' : '—')}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="font-mono font-semibold text-[#14171A]">
                          {v.durationMinutes ? `${v.durationMinutes} min` : (v.status === 'on_site' ? 'Active' : '—')}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <StatusBadge status={v.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Order / Book Service Modal */}
      <NewOrderModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {/* Order & Visit Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        visit={selectedVisit}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

