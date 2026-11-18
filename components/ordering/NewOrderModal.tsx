'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { OrderType } from '@/lib/types';
import { X, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { sites, suppliers, currentSiteId, createOrder } = useAppStore();

  const [type, setType] = useState<OrderType>('material');
  const [siteId, setSiteId] = useState(currentSiteId || sites[0]?.id || 'site-btr');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || 'sup-cemex');
  const [destinationId, setDestinationId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [orderedQty, setOrderedQty] = useState<number>(20);
  const [unit, setUnit] = useState('tonnes');
  const [timeSlot, setTimeSlot] = useState('09:00 - 10:00');
  const [unitPrice, setUnitPrice] = useState<number>(32);
  const [commercialTerms, setCommercialTerms] = useState('Standard Net 30 days.');
  const [error, setError] = useState<string | null>(null);

  const selectedSite = sites.find((s) => s.id === siteId) || sites[0];

  // Auto-set destination when site changes
  useEffect(() => {
    if (selectedSite && selectedSite.destinations.length > 0) {
      setDestinationId(selectedSite.destinations[0].id);
    }
  }, [selectedSite, siteId]);

  // Adjust default units based on type
  useEffect(() => {
    if (type === 'service') {
      setUnit('hours');
      setCategory('Specialist Mobile Crane Lift (60t)');
      setDescription('Appointed Person and rigging crew for rooftop plant positioning.');
      setUnitPrice(185);
      setOrderedQty(8);
    } else {
      setUnit('tonnes');
      setCategory('MOT Type 1 Sub-Base Granite');
      setDescription('Crushed granite aggregate 0-40mm for crane hardstanding pad compaction.');
      setUnitPrice(28.5);
      setOrderedQty(25);
    }
  }, [type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category.trim()) {
      setError('Please provide a category or item name.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide order specifications / description.');
      return;
    }
    if (orderedQty <= 0) {
      setError('Ordered quantity must be greater than zero.');
      return;
    }
    if (unitPrice <= 0) {
      setError('Unit price must be greater than zero.');
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
    const destination = selectedSite?.destinations.find((d) => d.id === destinationId) || selectedSite?.destinations[0];

    const totalPrice = Number((orderedQty * unitPrice).toFixed(2));

    createOrder({
      siteId,
      siteName: selectedSite?.name || 'Site Location',
      supplierId: supplier.id,
      supplierName: supplier.name,
      type,
      category: category.trim(),
      description: description.trim(),
      orderedQty,
      unit,
      destinationId: destination?.id || 'dest-default',
      destinationName: destination?.name || 'Laydown Area',
      requestedDate: new Date().toISOString().split('T')[0],
      timeSlot,
      unitPrice,
      totalPrice,
      commercialTerms,
      notes: 'Procured via DJ Civil Ordering Platform.',
    });

    onClose();
  };

  const calculatedTotal = orderedQty * unitPrice;

  return (
    <div className="fixed inset-0 z-50 bg-[#14171A]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] shadow-2xl w-full max-w-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#14171A]">Create purchase order</h2>
            <p className="text-xs text-[#6B7280]">
              Dispatch a direct order to a Tier 1 supplier or specialist contractor.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#9CA3AF] hover:text-[#14171A] hover:bg-[#F7F7F5] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEE2E2] rounded-lg text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: Material vs Service */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1.5">
              Order type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F7F7F5] p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setType('material')}
                className={`py-2 rounded-md font-medium transition-colors cursor-pointer text-center ${
                  type === 'material' ? 'bg-white text-[#14171A] shadow-xs' : 'text-[#6B7280] hover:text-[#14171A]'
                }`}
              >
                Materials (Concrete, Aggregate, Steel)
              </button>
              <button
                type="button"
                onClick={() => setType('service')}
                className={`py-2 rounded-md font-medium transition-colors cursor-pointer text-center ${
                  type === 'service' ? 'bg-white text-[#14171A] shadow-xs' : 'text-[#6B7280] hover:text-[#14171A]'
                }`}
              >
                Specialist Service (Crane, Vac Ex, Piling)
              </button>
            </div>
          </div>

          {/* Site & Destination (Dynamic options based on site) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                Site
              </label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                Destination zone
              </label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                {selectedSite?.destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Supplier & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                Supplier
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                Requested gate slot
              </label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g. 09:00 - 10:00"
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
              />
            </div>
          </div>

          {/* Category & Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
              Item / service category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. C35/45 Structural Concrete"
              className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
              Specification & notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact pour slump, aggregate sizing, or certs required..."
              className="w-full p-2.5 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
            />
          </div>

          {/* Quantity, Unit & Pricing */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                value={orderedQty}
                onChange={(e) => setOrderedQty(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] tabular-nums focus:outline-none focus:ring-1 focus:ring-[#14171A]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                <option value="tonnes">tonnes</option>
                <option value="m³">m³</option>
                <option value="loads">loads</option>
                <option value="units">units</option>
                <option value="hours">hours</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                Rate (£ / unit)
              </label>
              <input
                type="number"
                step="any"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] tabular-nums focus:outline-none focus:ring-1 focus:ring-[#14171A]"
              />
            </div>
          </div>

          {/* Commercial Terms & Total Calculation */}
          <div className="flex items-center justify-between p-3 bg-[#F7F7F5] rounded-lg text-xs border border-[#E7E5E0]">
            <div>
              <span className="text-[#6B7280] block">Commercial Commitment</span>
              <span className="text-[11px] text-[#9CA3AF]">{commercialTerms}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#6B7280] block uppercase tracking-wider">Total Value</span>
              <span className="text-base font-semibold text-[#14171A] tabular-nums">
                {formatCurrency(calculatedTotal)}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E7E5E0]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 bg-white hover:bg-[#F7F7F5] text-[#14171A] border border-[#E7E5E0] rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Submit order to supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

