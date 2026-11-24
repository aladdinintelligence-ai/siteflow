'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Site, Gate, Visit } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { X, QrCode, ShieldCheck, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

interface PresentGateQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site;
  visits: Visit[];
}

export const PresentGateQrModal: React.FC<PresentGateQrModalProps> = ({
  isOpen,
  onClose,
  site,
  visits,
}) => {
  const { scanIn } = useAppStore();
  const [selectedGateId, setSelectedGateId] = useState<string>(site.gates[0]?.id || 'gate-chatham-1');
  const [simulatedSuccess, setSimulatedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeGate = site.gates.find((g) => g.id === selectedGateId) || site.gates[0];
  const qrPayload = `DJ-SITEFLOW-GATE://${site.code}/${activeGate?.code || 'G1'}?siteId=${site.id}&gateId=${activeGate?.id}`;

  // Find an en-route arrival that can simulate a gate scan
  const candidateVisit = visits.find((v) => ['en_route', 'scheduled'].includes(v.status));

  const handleSimulateScan = () => {
    if (!candidateVisit) return;
    scanIn(candidateVisit.id, activeGate?.id);
    setSimulatedSuccess(`Driver ${candidateVisit.driverName || candidateVisit.vehicleReg} scanned Gate QR`);
    setTimeout(() => {
      setSimulatedSuccess(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#14171A]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[16px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E7E5E0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#14171A] text-white flex items-center justify-center">
              <QrCode className="w-4 h-4 text-[#F5B301]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#14171A]">Gate Check-In QR Code</h2>
              <p className="text-[11px] text-[#6B7280]">
                {site.name} ({site.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#9CA3AF] hover:text-[#14171A] hover:bg-[#F7F7F5] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 flex flex-col items-center text-center">
          {/* Gate Selector */}
          <div className="w-full flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Gate Totem:
            </span>
            <select
              value={selectedGateId}
              onChange={(e) => setSelectedGateId(e.target.value)}
              className="h-8 px-2.5 bg-[#F7F7F5] border border-[#E7E5E0] rounded-md text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
            >
              {site.gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.code})
                </option>
              ))}
            </select>
          </div>

          {/* QR Code Presentation Box */}
          <div className="p-4 bg-[#FFFFFF] border-2 border-[#14171A] rounded-[16px] shadow-[0_4px_12px_rgba(20,23,26,0.06)] flex flex-col items-center">
            <QRCodeSVG
              value={qrPayload}
              size={220}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#14171A"
            />
            <div className="mt-2 text-center">
              <span className="font-mono text-xs font-bold text-[#14171A] tracking-wider block">
                {activeGate?.code} · {activeGate?.name}
              </span>
              <span className="text-[10px] font-mono text-[#9CA3AF] block truncate max-w-[220px]">
                {qrPayload}
              </span>
            </div>
          </div>

          {/* Operational Instructions */}
          <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E7E5E0] text-xs text-[#6B7280] text-left space-y-1 w-full">
            <div className="flex items-center gap-1.5 font-medium text-[#14171A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Gate Attendant Instructions</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Present this gate QR code to arriving drivers on your terminal or gate totem. When the driver scans it, their booking will appear instantly in your table for review and entry clearance.
            </p>
          </div>

          {/* Demo Simulation Button */}
          {candidateVisit && (
            <div className="w-full pt-1">
              {simulatedSuccess ? (
                <div className="p-2.5 bg-[#DCFCE7] text-[#16A34A] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{simulatedSuccess}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="w-full h-9 bg-white border border-[#E7E5E0] hover:bg-[#F7F7F5] text-[#14171A] rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F5B301]" />
                  <span>Simulate Arrival Scan ({candidateVisit.vehicleReg || candidateVisit.orderNumber})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#E7E5E0] bg-[#F7F7F5] flex items-center justify-between text-xs">
          <span className="text-[#6B7280] text-[11px]">
            Live Gate Totem Active
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

