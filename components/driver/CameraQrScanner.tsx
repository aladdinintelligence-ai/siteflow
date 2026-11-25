'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Loader2, Check, RefreshCw } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface CameraQrScannerProps {
  orderNumber: string;
  gateName: string;
  mode?: 'entry' | 'exit';
  title?: string;
  onScanSuccess: (decodedText?: string) => void;
  onClose: () => void;
}

export const CameraQrScanner: React.FC<CameraQrScannerProps> = ({
  orderNumber,
  gateName,
  mode = 'entry',
  title,
  onScanSuccess,
  onClose,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanMatched, setScanMatched] = useState<boolean>(false);
  const [manualToken, setManualToken] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'qr-camera-viewport';

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      try {
        const scanner = new Html5Qrcode(readerElementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras().catch(() => []);
        const hasCamera = cameras && cameras.length > 0;

        if (hasCamera && isMounted) {
          // Prefer back/environment camera for site gates
          const backCam = cameras.find((c) =>
            c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment')
          ) || cameras[0];

          await scanner.start(
            backCam.id,
            {
              fps: 10,
              qrbox: { width: 220, height: 220 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              if (isMounted) {
                setScanMatched(true);
                try {
                  if (scanner.isScanning) {
                    scanner.stop().catch(() => {});
                  }
                } catch {
                  // Ignore scanner stop state errors
                }
                setTimeout(() => {
                  onScanSuccess(decodedText);
                }, 800);
              }
            },
            () => {
              // Frame scan error (normal while searching for QR)
            }
          );
          if (isMounted) {
            setCameraActive(true);
          } else {
            // Unmounted while starting
            try {
              if (scanner.isScanning) {
                scanner.stop().catch(() => {}).finally(() => {
                  try { scanner.clear(); } catch {}
                });
              }
            } catch {}
          }
        } else {
          if (isMounted) setErrorMsg('No physical camera detected. You can use manual entry or simulation below.');
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err?.message || 'Camera permission not granted. Use manual token check-in below.');
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      const scanner = scannerRef.current;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner.stop().catch(() => {}).finally(() => {
              try { scanner.clear(); } catch {}
            });
          } else {
            try { scanner.clear(); } catch {}
          }
        } catch {
          // Suppress synchronous "Cannot stop, scanner is not running or paused"
        }
      }
    };
  }, [onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScanMatched(true);
    setTimeout(() => {
      onScanSuccess(manualToken || `DJ-SITEFLOW://${orderNumber}/gate-1`);
    }, 600);
  };

  const handleSimulateScan = () => {
    setScanMatched(true);
    setTimeout(() => {
      onScanSuccess(`DJ-SITEFLOW://${orderNumber}/gate-1`);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white border border-[#E7E5E0] rounded-[16px] shadow-2xl p-5 flex flex-col items-center space-y-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between text-[#14171A]">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#F5B301]" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {title || (mode === 'exit' ? 'Gate Exit QR Scanner (Scan-Out)' : 'Gate Check-In QR Scanner')}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#F7F7F5] hover:bg-[#E7E5E0] text-[#6B7280] hover:text-[#14171A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Box */}
        <div className="w-full aspect-square max-w-[260px] relative flex items-center justify-center bg-[#14171A] border border-[#E7E5E0] rounded-xl overflow-hidden">
          {/* HTML5 QR Code Mount */}
          <div id={readerElementId} className="w-full h-full object-cover" />

          {/* Targeting corners */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#F5B301] rounded-tl-sm pointer-events-none z-10" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#F5B301] rounded-tr-sm pointer-events-none z-10" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#F5B301] rounded-bl-sm pointer-events-none z-10" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#F5B301] rounded-tr-sm pointer-events-none z-10" />

          {/* Laser scanning line */}
          {!scanMatched && (
            <div className="absolute inset-x-3 h-[2px] bg-[#F5B301] shadow-[0_0_8px_#F5B301] laser-scan-animate z-20 pointer-events-none" />
          )}

          {/* Success overlay */}
          {scanMatched && (
            <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center text-[#14171A] p-4 text-center z-30 animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-2">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <p className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider">
                {mode === 'exit' ? 'Exit Scan Verified · Visit Complete' : 'QR Verified · Gate Cleared'}
              </p>
              <p className="text-sm font-semibold text-[#14171A] mt-0.5">
                {mode === 'exit' ? `Exit recorded at ${gateName}` : `Authorised for ${gateName}`}
              </p>
              <p className="text-[11px] font-mono text-[#6B7280] mt-1">{orderNumber}</p>
            </div>
          )}

          {/* Camera loading / fallback note */}
          {!cameraActive && !errorMsg && !scanMatched && (
            <div className="absolute inset-0 bg-[#14171A]/80 flex flex-col items-center justify-center text-white text-xs p-4 text-center">
              <Loader2 className="w-6 h-6 text-[#F5B301] animate-spin mb-2" />
              <span>Initialising device camera...</span>
            </div>
          )}
        </div>

        {/* Fallback & Simulation controls */}
        {errorMsg && (
          <div className="w-full bg-[#FEF3C7] text-[#B45309] text-xs p-2.5 rounded-lg text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        <div className="w-full space-y-2">
          <form onSubmit={handleManualSubmit} className="flex gap-1.5">
            <input
              type="text"
              placeholder={`e.g. ${orderNumber}`}
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-[#F8F8F6] border border-[#E7E5E0] rounded-lg text-xs outline-none focus:border-[#14171A]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#14171A] text-white rounded-lg text-xs font-medium hover:bg-[#2A2F35] cursor-pointer"
            >
              Verify
            </button>
          </form>

          <button
            type="button"
            onClick={handleSimulateScan}
            className="w-full py-2 bg-[#F8F8F6] hover:bg-[#E7E5E0] text-[#14171A] rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>{mode === 'exit' ? 'Simulate gate exit scan' : 'Simulate gate check-in scan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

