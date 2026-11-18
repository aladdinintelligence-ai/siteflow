export type RoleId =
  | 'director'
  | 'ordering'
  | 'supplier'
  | 'driver'
  | 'marshal'
  | 'supervisor'
  | 'analyst';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'dispatched'
  | 'on_site'
  | 'verified'
  | 'completed'
  | 'disputed'
  | 'declined';

export type VisitStatus =
  | 'scheduled'
  | 'en_route'
  | 'at_gate'
  | 'on_site'
  | 'verified'
  | 'completed'
  | 'flagged';

export type OrderType = 'material' | 'service';

export interface Gate {
  id: string;
  name: string;
  code: string;
  locationDescription: string;
  coordinates: { x: number; y: number }; // Relative percentage on SVG site plan (0-100)
}

export interface SiteDestination {
  id: string;
  name: string;
  code: string;
  zone: string;
  coordinates: { x: number; y: number };
  unloadingInstructions: string;
  hazardWarnings: string[];
}

export interface SiteRoute {
  gateId: string;
  destinationId: string;
  pathD: string; // SVG path data (d attribute in 0-100 coordinate space)
  estimatedDriveMinutes: number;
  oneWay: boolean;
  speedLimitKmh: number;
}

export interface Site {
  id: string;
  name: string;
  code: string;
  address: string;
  postcode: string;
  projectManager: string;
  gates: Gate[];
  destinations: SiteDestination[];
  routes: SiteRoute[];
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  rating: number;
}

export interface Driver {
  id: string;
  supplierId: string;
  name: string;
  phone: string;
  defaultVehicleReg: string;
  hgvClass: string;
  cscsCardNumber: string;
  avatarUrl?: string;
}

export interface DiscrepancyRecord {
  orderedQty: number;
  dispatchedQty: number;
  receivedQty: number;
  varianceQty: number;
  unit: string;
  reasonCode: 'shortage' | 'damaged' | 'rejected_spec' | 'moisture_loss' | 'over_delivery' | 'late_arrival';
  notes: string;
  flaggedBy: string;
  flaggedAt: string;
  resolved: boolean;
}

export interface LiveTrackingData {
  consentGranted: boolean;
  driverCanToggle: boolean;
  currentLat?: number;
  currentLng?: number;
  distanceRemainingKm: number;
  estimatedArrivalMinutes: number;
  currentLocationName: string;
  lastPingAt: string;
  disclaimer: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. DJ-2026-0842
  siteId: string;
  siteName: string;
  supplierId: string;
  supplierName: string;
  type: OrderType;
  category: string; // Concrete, Aggregates, Rebar, Waste, Plant Hire, Service
  description: string;
  orderedQty: number;
  unit: string; // tonnes, m3, loads, units, hours
  destinationId: string;
  destinationName: string;
  requestedDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. 08:30 - 09:30
  // Commercial details strictly omitted in driver selector
  unitPrice: number;
  totalPrice: number;
  commercialTerms: string;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface Visit {
  id: string;
  orderId: string;
  orderNumber: string;
  siteId: string;
  siteName: string;
  supplierId: string;
  supplierName: string;
  driverId?: string;
  driverName?: string;
  vehicleReg?: string;
  gateId?: string;
  destinationId: string;
  destinationName: string;
  type: OrderType;
  category: string;
  description: string;
  orderedQty: number;
  dispatchedQty: number;
  receivedQty?: number;
  unit: string;
  status: VisitStatus;
  // Tracking
  tracking?: LiveTrackingData;
  // Timestamps
  scheduledAt: string;
  dispatchedAt?: string;
  gateEntryAt?: string;
  verifiedAt?: string;
  gateExitAt?: string;
  durationMinutes?: number;
  // Entry Authorization
  entryAuthorised: boolean;
  entryAuthorisedBy?: string;
  entryMethod?: 'qr_auto' | 'marshal_manual';
  marshalFlagged?: boolean;
  marshalFlagReason?: string;
  // Verification details
  verifiedBy?: string;
  serviceCompletedStatus?: 'completed' | 'disputed' | 'pending';
  discrepancy?: DiscrepancyRecord;
  proofNote?: string;
}

// STRICT DRIVER VIEW MODEL: Zero price/commercial fields
export interface DriverJobView {
  visitId: string;
  orderId: string;
  orderNumber: string;
  siteId: string;
  siteName: string;
  siteAddress: string;
  sitePostcode: string;
  destinationId: string;
  destinationName: string;
  destinationInstructions: string;
  hazardWarnings: string[];
  gateId: string;
  gateName: string;
  supplierName: string;
  driverName: string;
  vehicleReg: string;
  type: OrderType;
  category: string;
  description: string;
  orderedQty: number;
  dispatchedQty: number;
  unit: string;
  timeSlot: string;
  status: VisitStatus;
  entryAuthorised: boolean;
  tracking?: LiveTrackingData;
  gateEntryAt?: string;
  verifiedAt?: string;
  gateExitAt?: string;
  durationMinutes?: number;
  approvedRoute?: SiteRoute;
}

export interface DemoStep {
  step: number;
  title: string;
  role: RoleId;
  targetUrl: string;
  summary: string;
  instruction: string;
  buttonLabel: string;
  targetId?: string;
}

