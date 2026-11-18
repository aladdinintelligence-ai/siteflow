'use client';

import React from 'react';
import { Site, SiteDestination, Gate, SiteRoute } from '@/lib/types';
import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SitePlanProps {
  site: Site;
  activeGateId?: string;
  activeDestinationId?: string;
  isDriverNavigating?: boolean;
  className?: string;
}

export const SitePlan: React.FC<SitePlanProps> = ({
  site,
  activeGateId,
  activeDestinationId,
  isDriverNavigating = false,
  className,
}) => {
  const activeGate = site.gates.find((g) => g.id === activeGateId) || site.gates[0];
  const activeDest = site.destinations.find((d) => d.id === activeDestinationId) || site.destinations[0];

  const activeRoute =
    site.routes.find((r) => r.gateId === activeGate?.id && r.destinationId === activeDest?.id) ||
    site.routes[0];

  return (
    <div className={cn('bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] overflow-hidden shadow-[0_1px_2px_rgba(20,23,26,0.04)]', className)}>
      {/* Top Header info */}
      <div className="px-4 py-3 border-b border-[#E7E5E0] flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-[#14171A]">{site.name}</span>
          <span className="text-[#6B7280] ml-2">Site Plan ({site.code})</span>
        </div>
        {activeRoute && (
          <div className="flex items-center gap-1.5 text-[#14171A] font-medium">
            <Navigation className="w-3.5 h-3.5 text-[#F5B301]" />
            <span>{activeRoute.estimatedDriveMinutes} min drive</span>
            <span className="text-[#6B7280]">· {activeRoute.speedLimitKmh} km/h limit</span>
          </div>
        )}
      </div>

      {/* Light, uncluttered SVG Site Map */}
      <div className="w-full aspect-[4/3] relative flex items-center justify-center p-2 bg-[#F7F7F5]">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Base Background */}
          <rect width="100" height="100" fill="#F7F7F5" />

          {/* Thin site boundary fence */}
          <rect
            x="8"
            y="12"
            width="84"
            height="76"
            rx="3"
            fill="#FFFFFF"
            stroke="#E7E5E0"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {/* Simple, quiet building blocks */}
          <rect
            x="30"
            y="22"
            width="40"
            height="24"
            rx="2"
            fill="#F3F4F6"
            stroke="#E5E7EB"
            strokeWidth="0.6"
          />
          <text x="50" y="35" fill="#9CA3AF" fontSize="2.8" fontWeight="500" textAnchor="middle">
            MAIN STRUCTURE
          </text>

          <rect
            x="16"
            y="46"
            width="18"
            height="18"
            rx="1.5"
            fill="#F3F4F6"
            stroke="#E5E7EB"
            strokeWidth="0.6"
          />
          <text x="25" y="56" fill="#9CA3AF" fontSize="2.2" fontWeight="500" textAnchor="middle">
            LAYDOWN
          </text>

          <rect
            x="58"
            y="54"
            width="24"
            height="18"
            rx="1.5"
            fill="#F3F4F6"
            stroke="#E5E7EB"
            strokeWidth="0.6"
          />
          <text x="70" y="64" fill="#9CA3AF" fontSize="2.2" fontWeight="500" textAnchor="middle">
            SUBSTATION
          </text>

          {/* General Haul Roads (quiet light gray lines) */}
          <path
            d="M 12 82 L 12 56 L 88 56 L 88 84"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 50 56 L 50 30"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 26 56 L 26 36 L 34 32"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* ONE SINGLE ACCENT: Amber Route Line */}
          {activeRoute && (
            <path
              d={activeRoute.pathD}
              fill="none"
              stroke="#F5B301"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="route-dash-animate"
            />
          )}

          {/* Gate markers (Ink) */}
          {site.gates.map((gate) => {
            const isSelected = gate.id === activeGate?.id;
            return (
              <g key={gate.id} transform={`translate(${gate.coordinates.x}, ${gate.coordinates.y})`}>
                <circle
                  r={isSelected ? '3.5' : '2.8'}
                  fill="#14171A"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="-4.5"
                  fill="#14171A"
                  fontSize="2.4"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {gate.code}
                </text>
              </g>
            );
          })}

          {/* Destination pins (Ink with small amber center) */}
          {site.destinations.map((dest) => {
            const isSelected = dest.id === activeDest?.id;
            return (
              <g key={dest.id} transform={`translate(${dest.coordinates.x}, ${dest.coordinates.y})`}>
                <circle
                  r={isSelected ? '4' : '3'}
                  fill="#14171A"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                />
                {isSelected && <circle r="1.6" fill="#F5B301" />}
                <text
                  x="0"
                  y="-5.5"
                  fill="#14171A"
                  fontSize="2.6"
                  fontWeight={isSelected ? '600' : '500'}
                  textAnchor="middle"
                >
                  {dest.code}
                </text>
              </g>
            );
          })}

          {/* Vehicle position dot */}
          {activeRoute && isDriverNavigating && (
            <circle cx="26" cy="48" r="2.2" fill="#14171A" stroke="#F5B301" strokeWidth="1" />
          )}
        </svg>
      </div>

      {/* Uncluttered guidance text */}
      <div className="p-4 bg-white border-t border-[#E7E5E0] text-xs text-[#6B7280] space-y-1">
        <div className="flex items-center justify-between text-[#14171A]">
          <span className="font-semibold">Route: {activeGate?.name} → {activeDest?.name}</span>
          <span className="text-[11px] text-[#6B7280] font-mono">{activeDest?.zone}</span>
        </div>
        <p className="text-[12px] leading-relaxed pt-1">
          {activeDest?.unloadingInstructions}
        </p>
      </div>
    </div>
  );
};
