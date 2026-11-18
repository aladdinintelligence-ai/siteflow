'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Truck,
  TrendingDown,
  Building2,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalystPage() {
  const { visits, orders, suppliers, sites, currentSiteId } = useAppStore();
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtered visits
  const siteVisits = useMemo(() => {
    return visits.filter((v) => selectedSiteFilter === 'all' || v.siteId === selectedSiteFilter);
  }, [visits, selectedSiteFilter]);

  // Turnaround Histogram Data
  const turnaroundData = useMemo(() => {
    const buckets = [
      { range: '<20 mins', count: 0, fill: '#16A34A' },
      { range: '20-35 mins', count: 0, fill: '#14171A' },
      { range: '35-50 mins', count: 0, fill: '#F5B301' },
      { range: '>50 mins', count: 0, fill: '#DC2626' },
    ];

    siteVisits.forEach((v) => {
      const dur = v.durationMinutes || 32;
      if (dur < 20) buckets[0].count += 1;
      else if (dur <= 35) buckets[1].count += 1;
      else if (dur <= 50) buckets[2].count += 1;
      else buckets[3].count += 1;
    });

    return buckets;
  }, [siteVisits]);

  // Waste / Discrepancy by Category
  const categoryVarianceData = useMemo(() => {
    const categories: Record<string, { total: number; discrepancies: number }> = {};

    siteVisits.forEach((v) => {
      const key = v.type === 'service' ? 'Plant & Rigging' : v.category.split(' ')[0];
      if (!categories[key]) {
        categories[key] = { total: 0, discrepancies: 0 };
      }
      categories[key].total += 1;
      if (v.discrepancy || v.serviceCompletedStatus === 'disputed') {
        categories[key].discrepancies += 1;
      }
    });

    return Object.entries(categories).map(([name, data]) => ({
      category: name,
      rate: Number(((data.discrepancies / data.total) * 100).toFixed(1)),
      count: data.discrepancies,
      total: data.total,
    }));
  }, [siteVisits]);

  // Supplier Scorecard
  const supplierScorecards = useMemo(() => {
    return suppliers.map((sup) => {
      const supVisits = siteVisits.filter((v) => v.supplierId === sup.id);
      const totalVisits = supVisits.length;
      const verifiedVisits = supVisits.filter((v) => ['verified', 'completed'].includes(v.status));
      const withDiscrepancy = supVisits.filter((v) => Boolean(v.discrepancy));

      const matchRate =
        verifiedVisits.length > 0
          ? Math.round(((verifiedVisits.length - withDiscrepancy.length) / verifiedVisits.length) * 100)
          : 100;

      const avgTurnaround =
        totalVisits > 0
          ? Math.round(
              supVisits.reduce((sum, v) => sum + (v.durationMinutes || 30), 0) / totalVisits
            )
          : 28;

      const onTimeRate = totalVisits > 0 ? (sup.rating >= 4.7 ? 98 : 94) : 95;

      let grade = 'A';
      if (matchRate >= 95 && onTimeRate >= 95) grade = 'A+';
      else if (matchRate < 85 || onTimeRate < 90) grade = 'B';

      return {
        id: sup.id,
        name: sup.name,
        category: sup.category,
        totalVisits,
        onTimeRate: `${onTimeRate}%`,
        matchRate: `${matchRate}%`,
        avgTurnaround: `${avgTurnaround}m`,
        grade,
      };
    });
  }, [suppliers, siteVisits]);

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#14171A] tracking-tight">
              Operational Analytics & SLA Scorecard
            </h1>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Turnaround duration histograms, trade contractor SLA metrics, and haulage environmental footprint.
          </p>
        </div>

        {/* Site Filter */}
        <div className="flex items-center gap-2 bg-white border border-[#E7E5E0] rounded-lg p-1.5 shadow-[0_1px_2px_rgba(20,23,26,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] pl-2 hidden sm:inline">
            Project:
          </span>
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="h-8 px-2.5 bg-[#F7F7F5] border border-[#E7E5E0] rounded-md text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
          >
            <option value="all">All Sites Portfolio</option>
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
            Avg Turnaround Duration
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#14171A] tabular-nums mt-0.5 block truncate">
            31.4 mins
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#16A34A] mt-0.5 block truncate font-medium">
            -6.2 mins vs paper gate ledger
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            On-Time Arrival SLA
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#16A34A] tabular-nums mt-0.5 block truncate">
            96.8%
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Within ±15m delivery window
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Delivery Discrepancy Rate
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#B45309] tabular-nums mt-0.5 block truncate">
            12.0%
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Captured at offload point
          </span>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-3.5 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block truncate">
            Gate Idling Carbon Saved
          </span>
          <span className="text-xl sm:text-[28px] font-semibold text-[#2563EB] tabular-nums mt-0.5 block truncate">
            2.41 tCO₂e
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] mt-0.5 block truncate">
            Contactless auto QR check-in
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Turnaround Duration Distribution */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3">
          <div>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
              Site Turnaround Duration Distribution
            </span>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              Gate entry scan to exit scan (target: &lt;35 mins)
            </p>
          </div>

          <div className="h-60 w-full pt-2">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnaroundData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis
                    dataKey="range"
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
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} visits`, 'Frequency']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E7E5E0',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill="#14171A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Shortage Rate by Category */}
        <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3">
          <div>
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
              Discrepancy Frequency by Trade Category
            </span>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              Percentage of shipments flagged with shortages or spec issues
            </p>
          </div>

          <div className="h-60 w-full pt-2">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryVarianceData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis
                    dataKey="category"
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
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Discrepancy Rate']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E7E5E0',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="rate" fill="#F5B301" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Scorecard Table */}
      <div className="bg-white border border-[#E7E5E0] rounded-[12px] shadow-[0_1px_2px_rgba(20,23,26,0.04)] overflow-hidden">
        <div className="p-4 border-b border-[#E7E5E0]">
          <h3 className="text-sm font-semibold text-[#14171A]">
            Contractor & Supplier SLA Performance Matrix
          </h3>
          <p className="text-xs text-[#6B7280]">
            Punctuality, quantity reconciliation accuracy, and turnaround benchmark rankings.
          </p>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full min-w-[700px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E7E5E0] bg-white h-11 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                <th className="px-4 py-2">Supplier</th>
                <th className="px-4 py-2">Trade Category</th>
                <th className="px-4 py-2">Deliveries</th>
                <th className="px-4 py-2">Slot Punctuality</th>
                <th className="px-4 py-2">Quantity Accuracy</th>
                <th className="px-4 py-2">Avg Turnaround</th>
                <th className="px-4 py-2 text-right">SLA Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E0]">
              {supplierScorecards.map((sup) => (
                <tr key={sup.id} className="h-13 hover:bg-[#F7F7F5] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#14171A] whitespace-nowrap">
                    {sup.name}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] max-w-[200px] truncate">
                    {sup.category}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums text-[#14171A] font-medium">
                    {sup.totalVisits}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums text-[#16A34A] font-medium">
                    {sup.onTimeRate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums font-medium text-[#14171A]">
                    {sup.matchRate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums text-[#6B7280]">
                    {sup.avgTurnaround}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-semibold inline-block',
                        sup.grade === 'A+'
                          ? 'bg-[#DCFCE7] text-[#16A34A]'
                          : sup.grade === 'A'
                          ? 'bg-[#DBEAFE] text-[#2563EB]'
                          : 'bg-[#FEF3C7] text-[#B45309]'
                      )}
                    >
                      {sup.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

