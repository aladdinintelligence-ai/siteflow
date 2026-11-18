'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Check, X } from 'lucide-react';

export const ToastNotice: React.FC = () => {
  const { toast, clearToast } = useAppStore();

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="bg-[#14171A] text-white px-3.5 py-2.5 rounded-lg shadow-lg border border-[#2A2F35] flex items-center gap-2.5 text-xs font-medium max-w-md select-none">
        <span className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
        <span className="truncate">{toast.message}</span>
        <button
          onClick={clearToast}
          className="text-[#9CA3AF] hover:text-white transition-colors ml-1 p-0.5 cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

