import React from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  ShieldCheck,
  FileCheck2,
  Map,
  Radio,
  ArrowRight,
} from 'lucide-react';

export default function DiscoveryPage() {
  const discoveryItems = [
    {
      category: '1. Existing Order & Booking Workflow',
      icon: ClipboardList,
      question: 'How are purchase orders and gate slots currently agreed between DJ Civil and Tier 1 suppliers?',
      details: [
        'Do subcontractors and hauliers operate via fixed delivery time slots, or flexible morning/afternoon arrival windows?',
        'What software or ERP (e.g. COINS, Procore, Viewpoint, Excel) is currently DJ Civil’s commercial system of record?',
        'Is order approval hierarchical (e.g. Site Agent → Commercial Manager → Director sign-off thresholds)?',
      ],
      consultantTip:
        'Integrating SiteFlow as an operational layer without disrupting existing ERPs ensures rapid field adoption without dual data-entry friction.',
    },
    {
      category: '2. Site Gate Access & Entry Authorisation',
      icon: ShieldCheck,
      question: 'Who holds ultimate authority to grant or revoke vehicle entry through the gates?',
      details: [
        'Should an authorized booking QR code automatically lift ANPR barriers, or does the traffic marshal always inspect paper tickets?',
        'When an unbooked vehicle arrives (e.g. emergency hotbox asphalt), what is the fast-track ad-hoc booking protocol?',
        'How should gate marshal exceptions (e.g. missing PPE, failed wheel wash, late curfew violation) escalate to site management?',
      ],
      consultantTip:
        'Auto-authorisation frees marshals from manual typing while giving them instant one-tap exception flagging on live arrivals.',
    },
    {
      category: '3. Delivery & Service Verification Ownership',
      icon: FileCheck2,
      question: 'Who on site verifies physical material quantities, and how are disputed tickets currently resolved?',
      details: [
        'Are bulk deliveries (aggregates, concrete, muck away) reconciled by weighbridge tickets, batch tickets, or physical tape measurements?',
        'What is the acceptable variance threshold before a formal non-conformance / discrepancy notice is raised to the supplier?',
        'For specialist services (mobile crane hire, piling rigs, vacuum excavators), who certifies the actual hours worked vs standby demurrage?',
      ],
      consultantTip:
        'Side-by-side Ordered vs Dispatched vs Received comparison (shown in SiteFlow) eliminates month-end invoice disputes before payment approval.',
    },
    {
      category: '4. Digital Site Plans & CAD/GIS Availability',
      icon: Map,
      question: 'What format do DJ Civil site logistics plans currently exist in, and how often do haul routes change?',
      details: [
        'Are site logistics plans maintained in 2D PDF, DWG / CAD, BIM models, or Google Earth overlays?',
        'How frequently do pit locations, batching bays, and approved traffic management routes shift during construction phases?',
        'Does the site management team have internal resource to update coordinate pins, or should SiteFlow support simple map editing?',
      ],
      consultantTip:
        'Lightweight SVG site navigation works on any driver smartphone without requiring heavy 3D game engines or native app installs.',
    },
    {
      category: '5. Driver Telematics & Live Approach Tracking',
      icon: Radio,
      question: 'Is live GPS vehicle approach tracking desirable, and what are supplier union/GDPR constraints?',
      details: [
        'Do hauliers and independent owner-operators accept optional consent-based geofence tracking for pre-gate arrival notifications?',
        'Would DJ Civil benefit from 15-minute predictive gate queue warnings to smooth peak morning concrete wagon arrivals?',
        'Is telemetry required from supplier telematics APIs (e.g. Webfleet, Samsara) or directly through the driver’s web app session?',
      ],
      consultantTip:
        'Consent-based tracking with explicit manager validation caveats satisfies GDPR and union concerns while giving the gatehouse early visibility.',
    },
  ];

  return (
    <div className="flex-1 w-full bg-[#F7F7F5] py-10 px-4 sm:px-6">
      <div className="max-w-[840px] mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            Kickoff Readiness
          </span>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-[#14171A] tracking-tight">
            Discovery questions for DJ Civil
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            These questions validate operational assumptions from the concept PRD. They ensure that
            the full-scale deployment of <strong>DJ Civil SiteFlow</strong> aligns with commercial
            contracts, gate reality, and site safety rules.
          </p>
        </div>

        {/* Discovery Question Cards */}
        <div className="space-y-4">
          {discoveryItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E7E5E0] rounded-[12px] p-5 shadow-[0_1px_2px_rgba(20,23,26,0.04)] space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-[#14171A]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h2 className="text-base font-semibold text-[#14171A] mt-0.5">
                      {item.question}
                    </h2>
                  </div>
                </div>

                <div className="space-y-2 pl-0 sm:pl-11 text-xs text-[#6B7280]">
                  <ul className="space-y-1.5 list-disc pl-4 text-[#4B5563]">
                    {item.details.map((detail, dIdx) => (
                      <li key={dIdx} className="leading-relaxed">
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 p-3 bg-[#F7F7F5] border border-[#E7E5E0] rounded-lg text-xs text-[#14171A]">
                    <span className="font-semibold">Consultant recommendation: </span>
                    <span className="text-[#6B7280]">{item.consultantTip}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Link */}
        <div className="pt-2 flex justify-start">
          <Link
            href="/driver"
            className="inline-flex items-center gap-2 h-10 px-4 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-medium transition-colors"
          >
            <span>Review Driver Screen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
