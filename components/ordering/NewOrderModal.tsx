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

const MATERIAL_PRESETS = [
  { label: 'Sand', category: 'Sharp Washed Concreting Sand (0-4mm)', description: 'Bulk washed sand for structural slab bedding and quayside screed.', unit: 'tonnes', qty: 20, price: 26.5 },
  { label: 'Wood', category: 'C24 Structural Timber 47x150mm', description: 'Kiln-dried treated structural timber carcassing 4.8m lengths.', unit: 'units', qty: 120, price: 14.5 },
  { label: 'Pipes', category: '300mm Twinwall Drainage Pipes (6m)', description: 'High-density polyethylene surface water carrier pipe with couplers.', unit: 'lengths', qty: 35, price: 78.0 },
  { label: 'Cement', category: 'C35/45 Ready-Mix Structural Concrete', description: 'Marine concrete pump mix, slump 120mm, high sulphate resistance.', unit: 'm³', qty: 24, price: 115.0 },
  { label: 'Aggregates', category: 'MOT Type 1 Sub-Base Granite', description: '0-40mm crushed granite aggregate for heavy haul road base.', unit: 'tonnes', qty: 28, price: 24.5 },
];

const SERVICE_PRESETS = [
  { label: 'Toilet Cleaning', category: 'Welfare Cabins & Toilet Sanitation', description: 'Weekly complete waste tank pump-out, chemical recharge and deep sanitisation.', unit: 'visits', qty: 1, price: 160.0 },
  { label: 'Tyre Repairs', category: 'Mobile Plant / 8-Wheeler Tyre Repair', description: 'Emergency on-site vulcanising puncture repair and tyre bead refitting.', unit: 'repairs', qty: 2, price: 185.0 },
  { label: 'Machinery Repairs', category: 'Excavator Hydraulic & Mechanical Repair', description: 'Mobile field engineer for 30t excavator hydraulic line leak and ram repair.', unit: 'hours', qty: 4, price: 95.0 },
  { label: 'Dust Suppression', category: 'Site Road Dust Suppression Bowser', description: '10,000L tractor-towed road pressure spray for quayside haul roads.', unit: 'days', qty: 1, price: 420.0 },
  { label: 'Scaffolding Audit', category: 'Scaffolding & Edge Protection Inspection', description: 'Weekly working-at-height statutory safety inspection and green tag handover.', unit: 'audits', qty: 1, price: 210.0 },
];

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { sites, suppliers, currentSiteId, createOrder } = useAppStore();

  const [type, setType] = useState<OrderType>('material');
  const [siteId, setSiteId] = useState(currentSiteId || sites[0]?.id || 'site-chatham');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || 'sup-cemex');
  const [destinationId, setDestinationId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [orderedQty, setOrderedQty] = useState<number>(20);
  const [unit, setUnit] = useState('tonnes');
  const [vehicleReg, setVehicleReg] = useState('KX68 VKF');
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
      destinationId: destination?.id || selectedSite?.destinations[0]?.id || 'dest-chatham-dock',
      destinationName: destination?.name || selectedSite?.destinations[0]?.name || 'Site Offload Zone',
      vehicleReg: vehicleReg.trim() ? vehicleReg.trim().toUpperCase() : undefined,
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
    <div className="fixed inset-0 z-[60] bg-[#14171A]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[12px] shadow-2xl w-full max-w-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#14171A]">New Order / Book Service</h2>
            <p className="text-xs text-[#6B7280]">
              Dispatch construction material deliveries or book specialist on-site maintenance services.
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
              Booking Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F7F7F5] p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setType('material')}
                className={`py-2 px-3 rounded-md font-medium transition-colors cursor-pointer text-center ${
                  type === 'material' ? 'bg-white text-[#14171A] shadow-xs' : 'text-[#6B7280] hover:text-[#14171A]'
                }`}
              >
                Materials (Sand, Wood, Pipes, Cement)
              </button>
              <button
                type="button"
                onClick={() => setType('service')}
                className={`py-2 px-3 rounded-md font-medium transition-colors cursor-pointer text-center ${
                  type === 'service' ? 'bg-white text-[#14171A] shadow-xs' : 'text-[#6B7280] hover:text-[#14171A]'
                }`}
              >
                Services (Toilet Cleaning, Repairs)
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

          {/* Supplier & Logistics Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                Vehicle Reg / Unique ID
              </label>
              <input
                type="text"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                placeholder="e.g. KX68 VKF"
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-mono font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
              />
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                {type === 'material' ? 'Material Category' : 'Service Category'}
              </label>
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                <span className="text-[10px] text-[#9CA3AF] mr-1 hidden xs:inline">Quick fill:</span>
                {(type === 'material' ? MATERIAL_PRESETS : SERVICE_PRESETS).map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setCategory(p.category);
                      setDescription(p.description);
                      setUnit(p.unit);
                      setOrderedQty(p.qty);
                      setUnitPrice(p.price);
                    }}
                    className="px-2 py-0.5 bg-[#F7F7F5] hover:bg-[#E7E5E0] text-[#14171A] rounded text-[11px] font-medium border border-[#E7E5E0] transition-colors cursor-pointer shrink-0"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={type === 'material' ? 'e.g. C35/45 Marine Concrete or Sharp Sand' : 'e.g. Welfare Cabin Sanitation or Tyre Repair'}
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
              className="h-10 px-5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Confirm & Dispatch Booking</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

