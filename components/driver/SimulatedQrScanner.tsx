'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Check, X, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface SimulatedQrScannerProps {
  orderNumber: string;
  gateName: string;
  onScanSuccess: () => void;
  onClose: () => void;
}

export const SimulatedQrScanner: React.FC<SimulatedQrScannerProps> = ({
  orderNumber,
  gateName,
  onScanSuccess,
  onClose,
}) => {
  const [scanningState, setScanningState] = useState<'viewfinder' | 'reading' | 'matched'>('viewfinder');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setScanningState('reading');
    }, 1200);

    const timer2 = setTimeout(() => {
      setScanningState('matched');
    }, 2200);

    const timer3 = setTimeout(() => {
      onScanSuccess();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-[#14171A]/85 backdrop-blur-xs flex flex-col items-center justify-between p-4 select-none animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="w-full max-w-sm flex items-center justify-between text-white pt-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#F5B301]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Gate QR Scanner</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Viewfinder Target */}
      <div className="w-full max-w-[280px] aspect-square relative flex items-center justify-center my-auto">
        {/* Subtle corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-sm" />

        {/* Laser line */}
        {scanningState === 'viewfinder' && (
          <div className="absolute inset-x-2 h-[2px] bg-[#F5B301] laser-scan-animate" />
        )}

        {/* Clean white QR code card */}
        <div className="p-4 bg-white rounded-xl flex flex-col items-center justify-center text-center shadow-lg">
          <QRCodeSVG
            value={`DJ-SITEFLOW://${orderNumber}/${gateName}`}
            size={160}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#14171A"
          />
          <span className="text-[11px] font-mono text-[#6B7280] mt-2 font-medium">
            {gateName}
          </span>
        </div>

        {/* Reading overlay */}
        {scanningState === 'reading' && (
          <div className="absolute inset-0 bg-[#14171A]/90 rounded-xl flex flex-col items-center justify-center text-white">
            <Loader2 className="w-6 h-6 text-[#F5B301] animate-spin mb-2" />
            <p className="text-xs font-semibold">Validating Booking...</p>
            <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">{orderNumber}</p>
          </div>
        )}

        {/* Matched overlay */}
        {scanningState === 'matched' && (
          <div className="absolute inset-0 bg-white rounded-xl flex flex-col items-center justify-center text-[#14171A] p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-2">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <p className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider">
              Booking Retrieved
            </p>
            <p className="text-sm font-semibold text-[#14171A] mt-0.5">Entry Authorised</p>
            <p className="text-[11px] font-mono text-[#6B7280] mt-1">{orderNumber}</p>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="w-full max-w-sm bg-white/10 rounded-lg p-3 text-center text-xs text-white/80 mb-2">
        <span>Point camera at site entrance QR board to check in</span>
      </div>
    </div>
  );
};
