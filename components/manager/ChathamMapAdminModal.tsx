'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { SiteDestination, LocationType } from '@/lib/types';
import {
  X,
  MapPin,
  Plus,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Navigation,
  FileImage,
  Eye,
  AlertOctagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChathamMapAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChathamMapAdminModal: React.FC<ChathamMapAdminModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    sites,
    registerMapLocation,
    updateMapLocation,
    deleteMapLocation,
    setSiteDrawing,
    toggleLocationRouteApproval,
    toggleRoadClosure,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chatham Capstone site
  const chathamSite = sites.find((s) => s.id === 'site-chatham') || sites[0];

  // New location form state
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('delivery');
  const [zone, setZone] = useState('Zone 1 Link Road Earthworks');
  const [posX, setPosX] = useState<number>(50);
  const [posY, setPosY] = useState<number>(50);
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [unloadingInstructions, setUnloadingInstructions] = useState('');
  const [hazardWarningInput, setHazardWarningInput] = useState('10mph speed limit, banksman required');

  // Road closure form state
  const [closureName, setClosureName] = useState('');
  const [closureReason, setClosureReason] = useState('Deep stormwater culvert trenching');

  if (!isOpen) return null;

  // Handle clicking on the map canvas to set coordinates
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPosX(Math.max(5, Math.min(95, x)));
    setPosY(Math.max(5, Math.min(95, y)));
    if (!isAdding) {
      setIsAdding(true);
    }
  };

  // Handle manual drawing file upload (PNG, JPG, SVG)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSiteDrawing('site-chatham', dataUrl, 'Phase 2A Link Road, East Hill, Chatham');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitNewLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const hazards = hazardWarningInput
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    registerMapLocation('site-chatham', {
      name: name.trim(),
      code: code.trim().toUpperCase() || `CH-D${Math.floor(Math.random() * 90 + 10)}`,
      zone,
      locationType,
      coordinates: { x: posX, y: posY },
      unloadingInstructions:
        unloadingInstructions.trim() || 'Follow site safety guidance. Banksman required for reversing.',
      hazardWarnings: hazards.length > 0 ? hazards : ['10mph speed limit'],
      isActive: true,
      isApproved,
    });

    // Reset form
    setName('');
    setCode('');
    setUnloadingInstructions('');
    setIsAdding(false);
  };

  const handleAddRoadClosure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureName.trim()) return;
    toggleRoadClosure('site-chatham', closureName.trim(), closureReason);
    setClosureName('');
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#14171A]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[16px] shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E7E5E0] flex items-center justify-between shrink-0 bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#14171A] text-white flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#F5B301]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#14171A]">
                Chatham Capstone — Site Map & Route Registry
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                Engineering Reference Drawing: <strong className="text-[#14171A]">Phase 2A Link Road, East Hill, Chatham</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Manual Drawing Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.svg"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-2.5 sm:px-3 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Attach official Phase 2A Link Road engineering drawing"
            >
              <Upload className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="hidden sm:inline">Attach / Replace Drawing</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-[#9CA3AF] hover:text-[#14171A] hover:bg-[#F7F7F5] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Engineering Drawing Canvas & Pin Placement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#14171A] uppercase tracking-wider">
                1. Reference Drawing & Operational Locations
              </span>
              <span className="text-[11px] text-[#6B7280]">
                Click anywhere on the map to place a pin at coordinates: <code className="font-mono text-[#14171A]">X: {posX}%, Y: {posY}%</code>
              </span>
            </div>

            <div className="relative aspect-[16/10] bg-[#F8F9FA] border border-[#E7E5E0] rounded-xl overflow-hidden cursor-crosshair">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full select-none"
                onClick={handleMapClick}
              >
                {/* Uploaded Drawing or Default CAD Alignment */}
                {chathamSite.drawingUrl ? (
                  <image
                    href={chathamSite.drawingUrl}
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    preserveAspectRatio="xMidYMid slice"
                    opacity="0.85"
                  />
                ) : (
                  <>
                    <rect width="100" height="100" fill="#F8F9FA" />
                    {/* CAD Grid */}
                    <defs>
                      <pattern id="modal-cad-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E5E7EB" strokeWidth="0.4" strokeDasharray="1 1" />
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#modal-cad-grid)" />

                    {/* Site Boundary */}
                    <rect x="6" y="10" width="88" height="80" rx="2" fill="none" stroke="#D1D5DB" strokeWidth="0.8" strokeDasharray="3 2" />

                    {/* Phase 2A Link Road corridor */}
                    <path d="M 10 86 L 10 54 L 84 54 L 90 24" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 10 86 L 10 54 L 84 54 L 90 24" fill="none" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2 1" />

                    {/* Spurs */}
                    <path d="M 14 58 L 26 58 L 26 28" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 50 54 L 68 54 L 68 74" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />

                    {/* Attenuation Pond */}
                    <ellipse cx="78" cy="26" rx="10" ry="7" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2 2" />
                    <text x="78" y="27" fill="#64748B" fontSize="2.2" fontWeight="500" textAnchor="middle">ATTENUATION POND</text>

                    {/* Chainages */}
                    <text x="14" y="90" fill="#64748B" fontSize="1.8" fontFamily="monospace">Ch 0+000</text>
                    <text x="14" y="50" fill="#64748B" fontSize="1.8" fontFamily="monospace">Ch 0+200</text>
                    <text x="48" y="50" fill="#64748B" fontSize="1.8" fontFamily="monospace">Ch 0+450</text>
                    <text x="74" y="50" fill="#64748B" fontSize="1.8" fontFamily="monospace">Ch 0+700</text>
                  </>
                )}

                {/* Approved Routes Lines */}
                {chathamSite.routes.map((r, i) => (
                  <path
                    key={i}
                    d={r.pathD}
                    fill="none"
                    stroke="#F5B301"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="route-dash-animate"
                  />
                ))}

                {/* Gate 1 Checkpoint */}
                {chathamSite.gates.map((g) => (
                  <g key={g.id} transform={`translate(${g.coordinates.x}, ${g.coordinates.y})`}>
                    <circle r="4" fill="#14171A" stroke="#FFFFFF" strokeWidth="1" />
                    <circle r="1.5" fill="#F5B301" />
                    <text x="0" y="-5.5" fill="#14171A" fontSize="2.8" fontWeight="700" textAnchor="middle">
                      {g.code} (Gate 1)
                    </text>
                  </g>
                ))}

                {/* Registered Destinations */}
                {chathamSite.destinations.map((d) => {
                  const isApproved = Boolean(d.isApproved);
                  return (
                    <g key={d.id} transform={`translate(${d.coordinates.x}, ${d.coordinates.y})`}>
                      <circle
                        r="3.8"
                        fill={!isApproved ? '#DC2626' : '#14171A'}
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                      <circle r="1.6" fill={isApproved ? '#F5B301' : '#FEE2E2'} />
                      <text x="0" y="-5.5" fill="#14171A" fontSize="2.6" fontWeight="600" textAnchor="middle">
                        {d.code}
                      </text>
                    </g>
                  );
                })}

                {/* Crosshair indicator for selected coords */}
                <g transform={`translate(${posX}, ${posY})`}>
                  <circle r="5" fill="none" stroke="#2563EB" strokeWidth="1" strokeDasharray="1 1" className="animate-spin" />
                  <circle r="1.5" fill="#2563EB" />
                </g>
              </svg>
            </div>
          </div>

          {/* Location Registration & Maintenance Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Register / Edit Location Form */}
            <div className="bg-[#F8F8F6] border border-[#E7E5E0] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#14171A]">Register Map Location</span>
                <span className="text-[10px] text-[#6B7280]">
                  Target Pin: ({posX}%, {posY}%)
                </span>
              </div>

              <form onSubmit={handleSubmitNewLocation} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                      Location Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CH-D03"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-[#E7E5E0] rounded text-xs font-mono font-medium text-[#14171A]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                      Location Type
                    </label>
                    <select
                      value={locationType}
                      onChange={(e) => setLocationType(e.target.value as LocationType)}
                      className="w-full h-8 px-2 bg-white border border-[#E7E5E0] rounded text-xs text-[#14171A]"
                    >
                      <option value="delivery">Delivery / Unloading Bay</option>
                      <option value="parking">Contractor Parking</option>
                      <option value="service">Welfare & Service Area</option>
                      <option value="gate">Gate Checkpoint</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                    Human-Readable Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Phase 2A Culvert Laydown Bay"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-8 px-2 bg-white border border-[#E7E5E0] rounded text-xs text-[#14171A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                      Working Zone
                    </label>
                    <input
                      type="text"
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-[#E7E5E0] rounded text-xs text-[#14171A]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                      Route Status
                    </label>
                    <select
                      value={isApproved ? 'approved' : 'pending'}
                      onChange={(e) => setIsApproved(e.target.value === 'approved')}
                      className="w-full h-8 px-2 bg-white border border-[#E7E5E0] rounded text-xs font-medium text-[#14171A]"
                    >
                      <option value="approved">Approved Route (Traversable)</option>
                      <option value="pending">Awaiting Marshal Escort (Unverified)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                    Unloading & Approach Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={unloadingInstructions}
                    onChange={(e) => setUnloadingInstructions(e.target.value)}
                    placeholder="e.g. Reverse discharge into bay. Banksman required."
                    className="w-full p-2 bg-white border border-[#E7E5E0] rounded text-xs text-[#14171A]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-9 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F5B301]" />
                  <span>Register Location on Map</span>
                </button>
              </form>
            </div>

            {/* Right: Road Closures & Safety Directives */}
            <div className="space-y-4">
              <div className="bg-[#F8F8F6] border border-[#E7E5E0] rounded-xl p-4 space-y-3">
                <span className="font-semibold text-xs text-[#14171A] block">
                  Temporary Road Closures & Restrictions
                </span>
                <p className="text-[11px] text-[#6B7280]">
                  Mark internal haul road sections closed to prevent driver routing into active trenches or crane lift zones.
                </p>

                <form onSubmit={handleAddRoadClosure} className="space-y-2">
                  <input
                    type="text"
                    placeholder="e.g. Link Road Ch 250-320 Closed"
                    value={closureName}
                    onChange={(e) => setClosureName(e.target.value)}
                    className="w-full h-8 px-2 bg-white border border-[#E7E5E0] rounded text-xs text-[#14171A]"
                  />
                  <button
                    type="submit"
                    className="w-full h-8 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Apply / Toggle Road Closure</span>
                  </button>
                </form>

                {/* Active Restrictions List */}
                {chathamSite.closedRoads && chathamSite.closedRoads.length > 0 && (
                  <div className="pt-2 border-t border-[#E7E5E0] space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#DC2626] block">
                      Active Restrictions
                    </span>
                    {chathamSite.closedRoads.map((closure) => (
                      <div
                        key={closure.id}
                        className="p-2 bg-[#FEE2E2] border border-[#FECACA] rounded text-[11px] flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-[#DC2626]">{closure.name}</strong>
                          <span className="text-[#991B1B] block text-[10px]">{closure.reason}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleRoadClosure('site-chatham', closure.name, closure.reason)}
                          className="text-[#DC2626] hover:text-[#991B1B] text-xs font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Safety Regulations Summary */}
              <div className="p-3 bg-[#FFFFFF] border border-[#E7E5E0] rounded-xl text-xs space-y-1 text-[#6B7280]">
                <div className="flex items-center gap-1.5 text-[#14171A] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>Site Safety Directive</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Route publication must be strictly based on site-approved vehicle movements. Unverified destinations will instruct drivers to halt at Gate 1 rather than rendering an unverified shortcut.
                </p>
              </div>
            </div>
          </div>

          {/* Registered Locations Management Table */}
          <div className="space-y-2">
            <span className="font-semibold text-xs text-[#14171A] uppercase tracking-wider block">
              2. Registered Chatham Capstone Destinations ({chathamSite.destinations.length})
            </span>

            <div className="border border-[#E7E5E0] rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F8F6] border-b border-[#E7E5E0] h-9 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                    <th className="px-3 py-1.5">Code</th>
                    <th className="px-3 py-1.5">Name</th>
                    <th className="px-3 py-1.5">Type</th>
                    <th className="px-3 py-1.5">Coordinates</th>
                    <th className="px-3 py-1.5">Route Approval</th>
                    <th className="px-3 py-1.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {chathamSite.destinations.map((dest) => {
                    const isApproved = Boolean(dest.isApproved);
                    return (
                      <tr key={dest.id} className="h-11 hover:bg-[#F8F8F6] transition-colors">
                        <td className="px-3 py-2 font-mono font-semibold text-xs text-[#14171A]">
                          {dest.code}
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-medium text-[#14171A] block">{dest.name}</span>
                          <span className="text-[10px] text-[#6B7280]">{dest.zone}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="capitalize px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F3F4F6] text-[#4B5563]">
                            {dest.locationType || 'delivery'}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-[#6B7280]">
                          ({dest.coordinates.x}%, {dest.coordinates.y}%)
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => toggleLocationRouteApproval('site-chatham', dest.id)}
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer',
                              isApproved
                                ? 'bg-[#DCFCE7] text-[#16A34A] hover:bg-[#BBF7D0]'
                                : 'bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]'
                            )}
                          >
                            {isApproved ? 'Approved Traversable' : 'Awaiting Marshal'}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => deleteMapLocation('site-chatham', dest.id)}
                            className="p-1 text-[#9CA3AF] hover:text-[#DC2626] transition-colors cursor-pointer"
                            title="Remove location"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#E7E5E0] bg-[#F8F8F6] flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-[#6B7280]">
            SiteFlow Map Engine · Chatham Capstone Active
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
