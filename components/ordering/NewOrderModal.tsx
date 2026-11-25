'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { OrderType } from '@/lib/types';
import { X, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MATERIAL_CATEGORIES = [
  {
    category: 'Aggregates Package (6F5, Type 1, Reject Sand)',
    description: 'Phase 2A Link Road aggregate package: 6F5 (18t), Type 1 (54t), Reject Sand (18t).',
    unit: 'tonnes',
    defaultQty: 90,
    defaultPrice: 28.0,
    isMultiLine: true,
  },
  {
    category: 'Red Diesel Fuel (Ultra-Low Sulphur EN 590)',
    description: 'Bulk red diesel delivery for site generators, 30t excavators, and dumpers.',
    unit: 'litres',
    defaultQty: 5000,
    defaultPrice: 1.12,
  },
  {
    category: 'Portable Welfare Toilets (Chemical Units)',
    description: 'Mains-free chemical portable site toilets with hand sanitiser stations.',
    unit: 'units',
    defaultQty: 4,
    defaultPrice: 85.0,
  },
  {
    category: 'Sharp Washed Concreting Sand (0-4mm)',
    description: 'Bulk washed concreting sand for structural slab bedding and screed.',
    unit: 'tonnes',
    defaultQty: 20,
    defaultPrice: 26.5,
  },
  {
    category: 'C24 Structural Timber 47x150mm',
    description: 'Kiln-dried treated structural timber carcassing 4.8m lengths.',
    unit: 'units',
    defaultQty: 120,
    defaultPrice: 14.5,
  },
  {
    category: '300mm Twinwall Drainage Pipes (6m)',
    description: 'High-density polyethylene surface water carrier pipe with couplers.',
    unit: 'lengths',
    defaultQty: 35,
    defaultPrice: 78.0,
  },
  {
    category: 'C35/45 Ready-Mix Structural Concrete',
    description: 'Marine concrete pump mix, slump 120mm, high sulphate resistance.',
    unit: 'm³',
    defaultQty: 24,
    defaultPrice: 115.0,
  },
  {
    category: 'MOT Type 1 Sub-Base Granite Aggregate',
    description: '0-40mm crushed granite aggregate for heavy haul road base.',
    unit: 'tonnes',
    defaultQty: 28,
    defaultPrice: 24.5,
  },
  {
    category: 'High-Tensile B500B Steel Reinforcement Rebar',
    description: 'Fabricated high-yield steel reinforcement rebar cage bundles.',
    unit: 'tonnes',
    defaultQty: 15,
    defaultPrice: 850.0,
  },
  {
    category: 'Other Construction Material',
    description: 'General construction and civils building supplies.',
    unit: 'units',
    defaultQty: 10,
    defaultPrice: 50.0,
  },
];

const SERVICE_CATEGORIES = [
  {
    category: 'Welfare Cabins & Toilet Sanitation',
    description: 'Weekly complete waste tank pump-out, chemical recharge and deep sanitisation.',
    unit: 'visits',
    defaultQty: 1,
    defaultPrice: 160.0,
  },
  {
    category: 'Emergency Tyre Repairs & Replacement',
    description: 'Emergency on-site vulcanising puncture repair and heavy plant tyre bead refitting.',
    unit: 'repairs',
    defaultQty: 2,
    defaultPrice: 185.0,
  },
  {
    category: 'Mobile Plant & Machinery Field Repairs',
    description: 'Mobile field engineer for 30t excavator hydraulic line leak and mechanical ram repair.',
    unit: 'hours',
    defaultQty: 4,
    defaultPrice: 95.0,
  },
  {
    category: 'Site Dust Suppression & Bowser Spray',
    description: '10,000L tractor-towed road pressure spray for haul roads and dust abatement.',
    unit: 'days',
    defaultQty: 1,
    defaultPrice: 420.0,
  },
  {
    category: 'Scaffolding & Edge Protection Safety Audit',
    description: 'Weekly working-at-height statutory safety inspection and green tag handover.',
    unit: 'audits',
    defaultQty: 1,
    defaultPrice: 210.0,
  },
  {
    category: 'Mobile Crane Lift & Rigging Inspection',
    description: 'Appointed Person and rigging crew for plant positioning and lift plan certification.',
    unit: 'hours',
    defaultQty: 8,
    defaultPrice: 185.0,
  },
  {
    category: 'Site Security & Out-of-Hours Patrol',
    description: 'SIA licensed perimeter static guard and hourly checkpoint security patrols.',
    unit: 'shifts',
    defaultQty: 7,
    defaultPrice: 240.0,
  },
  {
    category: 'Waste Management & Skip Exchange',
    description: '16-yard enclosed roll-on-roll-off construction waste container exchange.',
    unit: 'loads',
    defaultQty: 2,
    defaultPrice: 380.0,
  },
  {
    category: 'Other Specialist Site Service',
    description: 'Specialist engineering inspection or sub-contractor site attendance.',
    unit: 'hours',
    defaultQty: 1,
    defaultPrice: 150.0,
  },
];

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { sites, suppliers, currentSiteId, createOrder } = useAppStore();

  const [type, setType] = useState<OrderType>('material');
  const [siteId, setSiteId] = useState(currentSiteId || sites[0]?.id || 'site-chatham');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || 'sup-cemex');
  const [destinationId, setDestinationId] = useState('');
  const [category, setCategory] = useState(MATERIAL_CATEGORIES[0].category);
  const [description, setDescription] = useState(MATERIAL_CATEGORIES[0].description);
  const [orderedQty, setOrderedQty] = useState<number>(MATERIAL_CATEGORIES[0].defaultQty);
  const [unit, setUnit] = useState(MATERIAL_CATEGORIES[0].unit);
  const [unitPrice, setUnitPrice] = useState<number>(MATERIAL_CATEGORIES[0].defaultPrice);
  const [commercialTerms, setCommercialTerms] = useState('Standard Net 30 days.');
  const [error, setError] = useState<string | null>(null);

  const selectedSite = sites.find((s) => s.id === siteId) || sites[0];

  // Auto-set destination when site changes
  useEffect(() => {
    if (selectedSite && selectedSite.destinations.length > 0) {
      setDestinationId(selectedSite.destinations[0].id);
    }
  }, [selectedSite, siteId]);

  // Adjust defaults when type changes
  const handleTypeChange = (newType: OrderType) => {
    setType(newType);
    if (newType === 'service') {
      const preset = SERVICE_CATEGORIES[0];
      setCategory(preset.category);
      setDescription(preset.description);
      setUnit(preset.unit);
      setOrderedQty(preset.defaultQty);
      setUnitPrice(preset.defaultPrice);
    } else {
      const preset = MATERIAL_CATEGORIES[0];
      setCategory(preset.category);
      setDescription(preset.description);
      setUnit(preset.unit);
      setOrderedQty(preset.defaultQty);
      setUnitPrice(preset.defaultPrice);
    }
  };

  // Handle category dropdown change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const list = type === 'service' ? SERVICE_CATEGORIES : MATERIAL_CATEGORIES;
    const match = list.find((item) => item.category === newCategory);
    if (match) {
      setDescription(match.description);
      setUnit(match.unit);
      setOrderedQty(match.defaultQty);
      setUnitPrice(match.defaultPrice);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category.trim()) {
      setError('Please select a category or service item.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide order specifications / scope of work.');
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

    const isAggregatePackage = category.includes('Aggregates Package') || category.includes('6F5');
    const lines = isAggregatePackage
      ? [
          {
            id: `line-${Date.now()}-1`,
            category: '6F5',
            description: '6F5 Selected Granular Fill capping material',
            requestedQty: 18,
            unit: 'tonnes',
            estimatedLoads: 1,
          },
          {
            id: `line-${Date.now()}-2`,
            category: 'Type 1',
            description: 'MOT Type 1 Crushed Granite 0-40mm sub-base',
            requestedQty: 54,
            unit: 'tonnes',
            estimatedLoads: 3,
          },
          {
            id: `line-${Date.now()}-3`,
            category: 'Reject Sand',
            description: 'Reject Sand for bedding and pipe surround',
            requestedQty: 18,
            unit: 'tonnes',
            estimatedLoads: 1,
          },
        ]
      : [
          {
            id: `line-${Date.now()}-1`,
            category: category.trim(),
            description: description.trim(),
            requestedQty: orderedQty,
            unit,
            estimatedLoads: Math.max(1, Math.ceil(orderedQty / (unit === 'tonnes' ? 18 : unit === 'litres' ? 5000 : unit === 'units' ? 4 : 1))),
          },
        ];

    const estimatedLoads = isAggregatePackage ? 5 : lines[0].estimatedLoads || 1;

    createOrder({
      siteId,
      siteName: selectedSite?.name || 'Site Location',
      customerName: 'DJ Civils Ltd',
      orderedBy: 'Chris (Site Manager)',
      supplierId: supplier.id,
      supplierName: supplier.name,
      type,
      category: category.trim(),
      description: description.trim(),
      orderedQty,
      unit,
      lines,
      estimatedLoads,
      destinationId: destination?.id || selectedSite?.destinations[0]?.id || 'dest-chatham-dock',
      destinationName: destination?.name || selectedSite?.destinations[0]?.name || 'Site Offload Zone',
      // PCR Requirement: SM does NOT select vehicle or driver; supplier selects on dispatch
      vehicleReg: undefined,
      requestedDate: new Date().toISOString().split('T')[0],
      // PCR Requirement: Suppliers can deliver at any time (open delivery window)
      timeSlot: 'Set by Chris (Open delivery window)',
      unitPrice,
      totalPrice,
      commercialTerms,
      notes: 'Procured via DJ Civil Site Manager Portal. Open delivery window.',
    });

    onClose();
  };

  const calculatedTotal = orderedQty * unitPrice;

  return (
    <div className="fixed inset-0 z-[60] bg-[#14171A]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[16px] shadow-2xl w-full max-w-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#14171A]">New Order / Book Service</h2>
            <p className="text-xs text-[#6B7280]">
              Create material orders or book specialist on-site services for Chatham Capstone or Rochester Capstone.
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
                onClick={() => handleTypeChange('material')}
                className={`py-2 px-3 rounded-md font-medium transition-colors cursor-pointer text-center ${
                  type === 'material' ? 'bg-white text-[#14171A] shadow-xs' : 'text-[#6B7280] hover:text-[#14171A]'
                }`}
              >
                Materials (Sand, Wood, Pipes, Cement)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('service')}
                className={`py-2 px-3 rounded-md font-medium transition-colors cursor-pointer text-center ${
                  type === 'service' ? 'bg-white text-[#14171A] shadow-xs' : 'text-[#6B7280] hover:text-[#14171A]'
                }`}
              >
                Services (Toilet Cleaning, Repairs)
              </button>
            </div>
          </div>

          {/* Site & Destination (Connected specifically to site) */}
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
                Booking-Specific Destination
              </label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
              >
                {selectedSite?.destinations
                  .filter((d) => d.isActive !== false)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code}) {d.isApproved ? '· Approved Traversable' : '· Escort Required'}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Supplier Selection & Delivery Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                Supplier / Contractor
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
                Delivery Schedule Window
              </label>
              <div className="h-10 px-3 bg-[#F8F8F6] border border-[#E7E5E0] rounded-lg flex items-center gap-2 text-xs text-[#6B7280]">
                <Clock className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span className="truncate">Open Delivery Window (Any time)</span>
              </div>
            </div>
          </div>

          {/* Category Dropdown (Required for Service, Clean Dropdown for Material) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
              {type === 'service' ? 'Service Category (Select from Dropdown)' : 'Material Category'}
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A] cursor-pointer"
            >
              {(type === 'service' ? SERVICE_CATEGORIES : MATERIAL_CATEGORIES).map((item) => (
                <option key={item.category} value={item.category}>
                  {item.category}
                </option>
              ))}
            </select>
          </div>

          {/* Specification & Scope */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
              Specification & Scope of Works
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact mix, aggregate specification, or scope of works required..."
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
                min="0.1"
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
                <option value="lengths">lengths</option>
                <option value="hours">hours</option>
                <option value="visits">visits</option>
                <option value="repairs">repairs</option>
                <option value="days">days</option>
                <option value="audits">audits</option>
                <option value="shifts">shifts</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                Rate (£ / unit)
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E0] rounded-lg text-xs text-[#14171A] tabular-nums focus:outline-none focus:ring-1 focus:ring-[#14171A]"
              />
            </div>
          </div>

          {/* Operational Policy Callout */}
          <div className="p-3 bg-[#F8F8F6] rounded-xl border border-[#E7E5E0] text-[11px] text-[#6B7280] space-y-1">
            <span className="font-medium text-[#14171A] block">Logistics & Driver Allocation</span>
            <p>
              Driver and vehicle registration details will be assigned directly by the supplier on dispatch. Deliveries are open window without fixed time slot constraints.
            </p>
          </div>

          {/* Commercial Commitment & Total Calculation */}
          <div className="flex items-center justify-between p-3.5 bg-[#F7F7F5] rounded-xl text-xs border border-[#E7E5E0]">
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
