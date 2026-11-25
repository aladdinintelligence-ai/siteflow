'use client';

import React from 'react';
import { Site, SiteDestination, Gate, SiteRoute } from '@/lib/types';
import { Navigation, AlertTriangle, ShieldCheck, MapPin, Truck, Wrench, ParkingCircle, Info } from 'lucide-react';
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
  const isRochester = site.id === 'site-rochester' || site.hasCommissionedMap === false;

  // ROCHESTER PROTOCOL: No fabricated map or navigation routes
  if (isRochester) {
    return (
      <div className={cn('bg-[#FFFFFF] border border-[#E7E5E0] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(20,23,26,0.04)]', className)}>
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E7E5E0] flex items-center justify-between text-xs bg-[#FFFFFF]">
          <div>
            <span className="font-semibold text-[#14171A]">{site.name}</span>
            <span className="text-[#6B7280] ml-2">({site.code})</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3F4F6] text-[#4B5563]">
            Site Plan Pending
          </span>
        </div>

        {/* Fallback Notice Body */}
        <div className="p-8 text-center space-y-4 bg-[#F8F8F6]">
          <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] border border-[#E7E5E0] text-[#6B7280] mx-auto flex items-center justify-center shadow-xs">
            <MapPin className="w-7 h-7 text-[#9CA3AF] stroke-1" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-sm font-semibold text-[#14171A]">
              Rochester Capstone Site Map Pending
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Engineering layout and approved vehicle delivery routes for Rochester Capstone have not yet been commissioned.
              In accordance with site safety rules, <strong>no fabricated navigation routes are displayed</strong>.
            </p>
          </div>

          {/* Operational Safety Protocol */}
          <div className="max-w-md mx-auto p-4 bg-[#FFFFFF] border border-[#E7E5E0] rounded-xl text-left space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#14171A]">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Gate Marshal Escort Protocol</span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              All delivery drivers and specialist contractors must report to <strong>Gate 1 (Esplanade Checkpoint)</strong>. The traffic marshal will provide verbal route instructions and assign a banksman escort before permitting entry.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] border-t border-[#E7E5E0]">
              <span>Gate 1 VHF Ch 2</span>
              <span>10 mph Site Limit</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHATHAM CAPSTONE: Grounded in "Phase 2A Link Road, East Hill, Chatham"
  const activeGate = site.gates.find((g) => g.id === activeGateId) || site.gates[0];
  const activeDest = site.destinations.find((d) => d.id === activeDestinationId) || site.destinations[0];

  const activeRoute = site.routes.find(
    (r) => r.gateId === activeGate?.id && r.destinationId === activeDest?.id
  );

  // An approved traversable route must exist and destination must be marked approved
  const isRouteApproved = Boolean(activeDest?.isApproved && activeRoute);
  const drawingTitle = site.drawingTitle || 'Phase 2A Link Road, East Hill, Chatham';

  return (
    <div className={cn('bg-[#FFFFFF] border border-[#E7E5E0] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(20,23,26,0.04)]', className)}>
      {/* Top Header info */}
      <div className="px-4 sm:px-5 py-3 border-b border-[#E7E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-[#FFFFFF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#14171A]">{site.name}</span>
            <span className="text-[10px] font-mono text-[#6B7280] bg-[#F7F7F5] px-1.5 py-0.2 rounded border border-[#E7E5E0]">
              {site.code}
            </span>
          </div>
          <span className="text-[11px] text-[#6B7280] block truncate">
            Drawing: <strong className="text-[#14171A] font-medium">{drawingTitle}</strong>
          </span>
        </div>

        <div>
          {isRouteApproved && activeRoute ? (
            <div className="flex items-center gap-2 text-[#14171A] font-medium text-xs">
              <span className="inline-flex items-center gap-1 text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full text-[11px] font-semibold">
                <Navigation className="w-3 h-3 text-[#16A34A]" />
                Approved Route ({activeRoute.estimatedDriveMinutes}m drive)
              </span>
              <span className="text-[#6B7280] hidden xs:inline">· {activeRoute.speedLimitKmh} km/h limit</span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#B45309] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-[#FDE68A]">
              <AlertTriangle className="w-3 h-3 text-[#D97706]" />
              Route Awaiting Marshal Escort
            </span>
          )}
        </div>
      </div>

      {/* Engineering Drawing Reference Layer + Overlaid Navigation */}
      <div className="w-full aspect-[4/3] sm:aspect-[16/10] relative flex items-center justify-center p-2 bg-[#F8F9FA] overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Custom Uploaded Drawing Background (if supplied by Product Owner) */}
          {site.drawingUrl ? (
            <image
              href={site.drawingUrl}
              x="0"
              y="0"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              opacity="0.9"
            />
          ) : (
            <>
              {/* Default CAD Engineering Alignment Layer for Phase 2A Link Road, East Hill, Chatham */}
              <rect width="100" height="100" fill="#F8F9FA" />

              {/* Civil Coordinate Grid */}
              <defs>
                <pattern id="cad-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E5E7EB" strokeWidth="0.3" strokeDasharray="1 1" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#cad-grid)" opacity="0.8" />

              {/* Site Boundary / Red Line Fence Boundary */}
              <rect
                x="6"
                y="10"
                width="88"
                height="80"
                rx="2"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="0.8"
                strokeDasharray="3 2"
              />

              {/* Phase 2A Link Road Corridor Boundaries (Kerb Lines) */}
              {/* Main Link Road Alignment Corridor */}
              <path
                d="M 10 86 L 10 54 L 84 54 L 90 24"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 10 86 L 10 54 L 84 54 L 90 24"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.2"
                strokeDasharray="2 1"
              />

              {/* Internal Spurred Haul Roads */}
              {/* Spur to Welfare Station */}
              <path
                d="M 14 58 L 26 58 L 26 28"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 14 58 L 26 58 L 26 28"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="0.8"
                strokeDasharray="2 1"
              />

              {/* Spur to Contractor Parking & Holding Bay */}
              <path
                d="M 50 54 L 68 54 L 68 74"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 50 54 L 68 54 L 68 74"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="0.8"
                strokeDasharray="2 1"
              />

              {/* Stormwater Drainage Attenuation Basin & Culverts */}
              <ellipse
                cx="78"
                cy="26"
                rx="10"
                ry="7"
                fill="#F1F5F9"
                stroke="#94A3B8"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
              <text x="78" y="27" fill="#64748B" fontSize="2.2" fontWeight="500" textAnchor="middle">
                ATTENUATION POND 1
              </text>

              {/* Earthworks Slopes & Batters */}
              <path
                d="M 32 40 L 44 40 L 46 48 L 30 48 Z"
                fill="#F8FAFC"
                stroke="#CBD5E1"
                strokeWidth="0.6"
              />
              <text x="38" y="45" fill="#94A3B8" fontSize="2.2" fontWeight="600" textAnchor="middle">
                BAY 1 EARTHWORKS
              </text>

              {/* Chainage Engineering Markers */}
              <g fontSize="2" fill="#64748B" fontFamily="monospace">
                <text x="14" y="90">Ch 0+000 (East Hill Jct)</text>
                <text x="14" y="50">Ch 0+200</text>
                <text x="48" y="50">Ch 0+450</text>
                <text x="74" y="50">Ch 0+700</text>
                <text x="82" y="20">Ch 0+850 (Tie-in)</text>
              </g>

              {/* Official Engineering Drawing Title Box (Bottom-Right) */}
              <g transform="translate(48, 80)">
                <rect width="44" height="9" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.5" />
                <text x="2" y="3.2" fill="#14171A" fontSize="1.8" fontWeight="700">
                  PHASE 2A LINK ROAD, EAST HILL, CHATHAM
                </text>
                <text x="2" y="5.8" fill="#64748B" fontSize="1.5">
                  DWG: P2A-CH-RD-001 (Rev P03) · Road & Drainage Layout
                </text>
                <text x="2" y="8" fill="#DC2626" fontSize="1.4" fontWeight="600">
                  NOTE: Operational delivery routes subject to site confirmation
                </text>
              </g>
            </>
          )}

          {/* Active Road Restrictions / Closed Roads Overlay */}
          {site.closedRoads && site.closedRoads.length > 0 && (
            <g transform="translate(54, 48)">
              <rect x="-1" y="-3" width="22" height="6" fill="#FEE2E2" stroke="#DC2626" strokeWidth="0.8" rx="1" />
              <text x="10" y="0.8" fill="#DC2626" fontSize="2" fontWeight="bold" textAnchor="middle">
                ROAD CLOSED · TRENCHING
              </text>
            </g>
          )}

          {/* SINGLE ACCENT: Amber Approved Traversable Route */}
          {/* ONLY DRAWN IF A VALID APPROVED ROUTE IS CERTIFIED */}
          {isRouteApproved && activeRoute && (
            <path
              d={activeRoute.pathD}
              fill="none"
              stroke="#F5B301"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="route-dash-animate"
            />
          )}

          {/* Gate 1 Checkpoint (Black Ink with Gate Badge) */}
          {site.gates.map((gate) => {
            const isSelected = gate.id === activeGate?.id;
            return (
              <g key={gate.id} transform={`translate(${gate.coordinates.x}, ${gate.coordinates.y})`}>
                <circle
                  r={isSelected ? '4' : '3.2'}
                  fill="#14171A"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                <circle r="1.5" fill="#F5B301" />
                <text
                  x="0"
                  y="-5.5"
                  fill="#14171A"
                  fontSize="2.6"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {gate.code} (Gate 1)
                </text>
              </g>
            );
          })}

          {/* Registered Map Locations (Delivery, Parking, Service) */}
          {site.destinations.map((dest) => {
            const isSelected = dest.id === activeDest?.id;
            const isApproved = Boolean(dest.isApproved);
            const type = dest.locationType || 'delivery';

            // Differentiate by location type
            const fillColor = !isApproved ? '#DC2626' : isSelected ? '#14171A' : '#374151';

            return (
              <g key={dest.id} transform={`translate(${dest.coordinates.x}, ${dest.coordinates.y})`}>
                {/* Active selection pulse */}
                {isSelected && (
                  <circle
                    r="6.5"
                    fill="none"
                    stroke={isApproved ? '#F5B301' : '#DC2626'}
                    strokeWidth="0.8"
                    className="animate-ping"
                    opacity="0.6"
                  />
                )}

                <circle
                  r={isSelected ? '4.2' : '3.2'}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />

                {/* Center marker indicating approval or status */}
                <circle r="1.6" fill={!isApproved ? '#FEE2E2' : isSelected ? '#F5B301' : '#FFFFFF'} />

                <text
                  x="0"
                  y="-5.5"
                  fill="#14171A"
                  fontSize="2.5"
                  fontWeight={isSelected ? '700' : '500'}
                  textAnchor="middle"
                >
                  {dest.code}
                </text>

                {/* Unapproved warning tag */}
                {!isApproved && (
                  <text
                    x="0"
                    y="6.5"
                    fill="#DC2626"
                    fontSize="1.8"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    UNVERIFIED
                  </text>
                )}
              </g>
            );
          })}

          {/* Vehicle position dot if driver is navigating */}
          {isRouteApproved && isDriverNavigating && (
            <circle cx="28" cy="58" r="2.2" fill="#14171A" stroke="#F5B301" strokeWidth="1.2" />
          )}
        </svg>
      </div>

      {/* Guidance & Safety Directives */}
      <div className="p-4 bg-white border-t border-[#E7E5E0] space-y-3">
        {isRouteApproved && activeRoute ? (
          /* Approved Traversable Route Guidance */
          <div className="space-y-1.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#14171A]">
              <span className="font-semibold text-sm">
                Permitted Route: {activeGate?.name} → {activeDest?.name}
              </span>
              <span className="text-[11px] font-mono text-[#6B7280]">
                {activeDest?.zone} · Code: {activeDest?.code}
              </span>
            </div>

            <p className="text-[12px] text-[#4B5563] leading-relaxed">
              {activeDest?.unloadingInstructions}
            </p>

            {/* Hazard Warnings */}
            {activeDest?.hazardWarnings && activeDest.hazardWarnings.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {activeDest.hazardWarnings.map((warning, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                  >
                    <AlertTriangle className="w-2.5 h-2.5 text-[#D97706]" />
                    {warning}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* CRITICAL SAFETY FALLBACK: Route Unavailable - Ask Marshal */
          <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[#92400E]">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
              <span>Halt at Gate 1 — Direct Escort Required</span>
            </div>
            <p className="text-[11px] text-[#78350F] leading-relaxed">
              An approved traversable route has not yet been verified for <strong>{activeDest?.name} ({activeDest?.code})</strong>. To prevent vehicle hazards and avoid active utility trenches, <strong>do not attempt unverified navigation</strong>.
            </p>
            <div className="p-2 bg-white/70 rounded-lg text-[11px] text-[#92400E] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Ask Traffic Marshal Gary O&apos;Connor at Gate 1 for physical escort or verbal route instructions.</span>
            </div>
          </div>
        )}

        {/* Universal Site Safety Directive */}
        <div className="pt-2 border-t border-[#E7E5E0] flex items-center justify-between text-[11px] text-[#6B7280]">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
            Map assists drivers; it does not override marshal instructions or signs.
          </span>
          <span className="font-mono text-[#14171A] font-medium hidden sm:inline">Speed limit: 10 mph</span>
        </div>
      </div>
    </div>
  );
};
