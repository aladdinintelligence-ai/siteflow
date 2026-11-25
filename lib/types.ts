export type RoleId =
  | 'manager'
  | 'supplier'
  | 'driver'
  | 'marshal'
  | 'analyst'
  | 'director'
  | 'ordering';

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

export type LocationType = 'gate' | 'delivery' | 'parking' | 'service';

export interface SiteDestination {
  id: string;
  name: string;
  code: string;
  zone: string;
  coordinates: { x: number; y: number };
  unloadingInstructions: string;
  hazardWarnings: string[];
  locationType?: LocationType;
  isActive?: boolean;
  isApproved?: boolean; // Approved traversable route verified from Gate 1
  approvedRouteSvg?: string;
}

export interface SiteRoadClosure {
  id: string;
  name: string;
  reason: string;
  active: boolean;
}

export interface SiteRoute {
  gateId: string;
  destinationId: string;
  pathD: string; // SVG path data (d attribute in 0-100 coordinate space)
  estimatedDriveMinutes: number;
  oneWay: boolean;
  speedLimitKmh: number;
  isApproved?: boolean;
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
  drawingTitle?: string; // e.g. "Phase 2A Link Road, East Hill, Chatham"
  drawingType?: string; // e.g. "Engineering Road & Drainage Reference Layer"
  drawingUrl?: string; // Custom uploaded drawing URL / base64
  hasCommissionedMap?: boolean; // True for Chatham Capstone, false for Rochester Capstone
  closedRoads?: SiteRoadClosure[];
}

export interface UserProfile {
  id: string;
  role: RoleId;
  name: string;
  email: string;
  phone: string;
  organization: string;
  avatarUrl?: string;
  jobTitle?: string;
  siteId?: string;
  siteName?: string;
  radioChannel?: string;
  cscsNumber?: string;
  inductionStatus?: 'Verified' | 'Pending' | 'Exempt';
  vehicleReg?: string; // Assigned vehicle registration for drivers
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

export interface OrderLine {
  id: string;
  category: string;
  description: string;
  requestedQty: number;
  unit: string;
  estimatedLoads?: number;
}

export interface Vehicle {
  id: string;
  supplierId: string;
  registration: string;
  type: string;
  capacity: number;
  capacityUnit: string;
  status: 'available' | 'in_transit' | 'maintenance';
}

export type LoadStatus =
  | 'pending_assignment'
  | 'assigned'
  | 'dispatched'
  | 'at_gate'
  | 'on_site'
  | 'completed'
  | 'cancelled';

export interface DeliveryLoad {
  id: string;
  loadNumber: string; // e.g. LD-1024-A
  orderId: string;
  orderNumber: string;
  orderLineId?: string;
  customerName: string;
  siteId: string;
  siteName: string;
  destinationId: string;
  destinationName: string;
  supplierId: string;
  material: string;
  quantity: number;
  unit: string;
  driverId?: string;
  driverName?: string;
  vehicleReg?: string;
  vehicleCapacity?: number;
  vehicleType?: string;
  status: LoadStatus;
  dispatchedAt?: string;
  estimatedArrivalMinutes?: number;
  gateEntryAt?: string;
  gateExitAt?: string;
  durationMinutes?: number;
  tracking?: LiveTrackingData;
  qrCode?: string;
  clarificationNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. DJ-2026-0842 or #SF-1024
  customerName?: string; // e.g. DJ Civils Ltd
  orderedBy?: string; // e.g. Chris (Site Manager)
  siteId: string;
  siteName: string;
  supplierId: string;
  supplierName: string;
  type: OrderType;
  category: string; // Concrete, Aggregates, Rebar, Waste, Plant Hire, Service
  description: string;
  orderedQty: number;
  unit: string; // tonnes, m3, loads, units, hours, litres, visits
  lines?: OrderLine[];
  estimatedLoads?: number;
  clarificationRequested?: boolean;
  clarificationNotes?: string;
  destinationId: string;
  destinationName: string;
  vehicleReg?: string; // Vehicle registration or unique identification
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

