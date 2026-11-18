'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getDriverJobs, getDriverActiveJob } from '@/lib/selectors';
import { PhoneFrame } from '@/components/shared/PhoneFrame';
import { DriverActiveJob } from '@/components/driver/DriverActiveJob';
import { DriverJobCard } from '@/components/driver/DriverJobCard';
import { cn } from '@/lib/utils';

export default function DriverPage() {
  const store = useAppStore();
  const { activeDriverId, setActiveDriver, sites, currentSiteId } = store;

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  // Strictly role-scoped jobs: NO PRICING FIELDS
  const allDriverJobs = getDriverJobs(store, activeDriverId);
  const activeJob =
    allDriverJobs.find((j) => j.visitId === selectedVisitId) ||
    getDriverActiveJob(store, activeDriverId) ||
    allDriverJobs[0];

  const currentSite = sites.find((s) => s.id === (activeJob?.siteId || currentSiteId)) || sites[0];
  const completedJobs = allDriverJobs.filter((j) => ['completed', 'flagged'].includes(j.status));
  const driverProfile = store.drivers.find((d) => d.id === activeDriverId) || store.drivers[0];

  return (
    <div className="flex-1 w-full bg-[#F7F7F5] py-2 sm:py-8 px-2 sm:px-4 flex items-center justify-center">
      <PhoneFrame>
        {/* Driver App Header */}
        <div className="bg-[#FFFFFF] border-b border-[#E7E5E0] p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-sm font-semibold text-[#14171A] leading-tight">
                {driverProfile.name}
              </h1>
              <p className="text-xs font-mono text-[#6B7280] mt-0.5">
                {driverProfile.defaultVehicleReg}
              </p>
            </div>

            {/* Quiet driver profile switch */}
            <select
              value={activeDriverId}
              onChange={(e) => {
                setActiveDriver(e.target.value);
                setSelectedVisitId(null);
              }}
              className="text-xs text-[#6B7280] bg-[#F7F7F5] border border-[#E7E5E0] rounded-lg px-2 py-1 outline-none cursor-pointer max-w-[110px] sm:max-w-[150px] truncate"
            >
              {store.drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name.split(' ')[0]} ({d.defaultVehicleReg})
                </option>
              ))}
            </select>
          </div>

          {/* Clean Segmented Tab Control */}
          <div className="grid grid-cols-2 gap-1 bg-[#F7F7F5] p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('current')}
              className={cn(
                'py-1.5 rounded-md font-medium transition-colors cursor-pointer text-center',
                activeTab === 'current'
                  ? 'bg-white text-[#14171A] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#14171A]'
              )}
            >
              Current run
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                'py-1.5 rounded-md font-medium transition-colors cursor-pointer text-center',
                activeTab === 'history'
                  ? 'bg-white text-[#14171A] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#14171A]'
              )}
            >
              Completed ({completedJobs.length})
            </button>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="p-3 sm:p-4 bg-[#F7F7F5] flex-1 overflow-y-auto space-y-4 min-h-[460px]">
          {activeTab === 'current' ? (
            activeJob ? (
              <DriverActiveJob
                job={activeJob}
                site={currentSite}
                onJobCompleted={() => setActiveTab('history')}
              />
            ) : (
              <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-8 text-center text-xs text-[#6B7280]">
                No active delivery runs allocated right now.
              </div>
            )
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {completedJobs.length === 0 ? (
                <div className="bg-white border border-[#E7E5E0] rounded-[12px] p-8 text-center text-xs text-[#6B7280]">
                  No completed delivery records logged today yet.
                </div>
              ) : (
                completedJobs.map((job) => (
                  <DriverJobCard
                    key={job.visitId}
                    job={job}
                    isActive={job.visitId === activeJob?.visitId}
                    onSelect={() => {
                      setSelectedVisitId(job.visitId);
                      setActiveTab('current');
                    }}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
