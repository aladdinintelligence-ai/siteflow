import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  RoleId,
  OrderStatus,
  VisitStatus,
  Order,
  Visit,
  Site,
  Supplier,
  Driver,
  DiscrepancyRecord,
  LiveTrackingData,
  UserProfile,
  SiteDestination,
  SiteRoute,
  Vehicle,
  DeliveryLoad,
  LoadStatus,
} from './types';
import {
  SEED_SITES,
  SEED_SUPPLIERS,
  SEED_DRIVERS,
  SEED_ORDERS,
  SEED_VISITS,
  SEED_PROFILES,
  SEED_VEHICLES,
  SEED_DELIVERY_LOADS,
} from '@/data/seed';
import { api, getSocket, setAuthToken } from './api';

export interface ToastInfo {
  id: number;
  message: string;
}

export interface AppState {
  // Core Entities
  orders: Order[];
  visits: Visit[];
  sites: Site[];
  suppliers: Supplier[];
  drivers: Driver[];
  vehicles: Vehicle[];
  deliveryLoads: DeliveryLoad[];
  userProfiles: Record<string, UserProfile>;

  // App Navigation & Session Context
  currentRole: RoleId;
  currentSiteId: string;
  activeDriverId: string;
  activeSupplierId: string;

  // Real-time Toast Notifications for cross-role feedback
  toast: ToastInfo | null;
  showToast: (message: string) => void;
  clearToast: () => void;

  // Actions - Navigation & Operations
  setCurrentRole: (role: RoleId) => void;
  setCurrentSite: (siteId: string) => void;
  setActiveDriver: (driverId: string) => void;
  setActiveSupplier: (supplierId: string) => void;

  // Actions - 7-Step Workflow Operations
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => string;
  acceptOrder: (orderId: string, notes?: string) => void;
  declineOrder: (orderId: string, reason: string) => void;
  assignDriver: (orderId: string, driverId: string, vehicleReg?: string) => void;
  startJourney: (visitId: string) => void;
  toggleDriverTrackingConsent: (visitId: string, consent: boolean) => void;
  scanIn: (visitId: string, gateId?: string) => void;
  marshalAuthoriseEntry: (visitId: string, notes?: string) => void;
  marshalFlagException: (visitId: string, reason: string) => void;
  verifyDelivery: (
    visitId: string,
    receivedQty: number,
    isDisputed: boolean,
    notes: string,
    reasonCode?: DiscrepancyRecord['reasonCode']
  ) => void;
  scanOut: (visitId: string) => void;

  // Actions - Supplier Portal Multi-Load Logistics
  acceptAndSplitOrder: (orderId: string, loadSplit?: { lineId: string; loads: number; payloadPerLoad: number }[]) => void;
  assignDriverToLoad: (loadId: string, driverId: string, vehicleReg: string) => void;
  dispatchLoad: (loadId: string) => void;
  requestClarification: (orderId: string, notes: string) => void;
  updateLoadStatus: (loadId: string, status: LoadStatus) => void;

  // Actions - Map Locations, Approved Routes & Profiles
  updateUserProfile: (role: RoleId, updates: Partial<UserProfile>) => void;
  registerMapLocation: (siteId: string, location: Omit<SiteDestination, 'id'> & { id?: string }) => void;
  updateMapLocation: (siteId: string, locationId: string, updates: Partial<SiteDestination>) => void;
  deleteMapLocation: (siteId: string, locationId: string) => void;
  setSiteDrawing: (siteId: string, drawingUrl: string, drawingTitle?: string) => void;
  toggleRoadClosure: (siteId: string, closureName: string, reason: string) => void;
  toggleLocationRouteApproval: (siteId: string, destinationId: string, isApproved?: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      orders: SEED_ORDERS,
      visits: SEED_VISITS,
      sites: SEED_SITES,
      suppliers: SEED_SUPPLIERS,
      drivers: SEED_DRIVERS,
      vehicles: SEED_VEHICLES,
      deliveryLoads: SEED_DELIVERY_LOADS,
      userProfiles: SEED_PROFILES,

      currentRole: 'driver',
      currentSiteId: 'site-chatham',
      activeDriverId: 'drv-dave',
      activeSupplierId: 'sup-tarmac',
      toast: null,

      showToast: (message: string) => {
        const id = Date.now();
        set({ toast: { id, message } });
        setTimeout(() => {
          const current = get().toast;
          if (current?.id === id) {
            set({ toast: null });
          }
        }, 3000);
      },

      clearToast: () => set({ toast: null }),

      setCurrentRole: (role) => {
        set({ currentRole: role });
        api.auth.demoSwitch(role).then((res) => {
          if (res?.token) setAuthToken(res.token);
        }).catch(() => {});
      },
      setCurrentSite: (siteId) => set({ currentSiteId: siteId }),
      setActiveDriver: (driverId) => set({ activeDriverId: driverId }),
      setActiveSupplier: (supplierId) => set({ activeSupplierId: supplierId }),

      createOrder: (orderInput) => {
        const id = `ord-${Date.now().toString().slice(-4)}`;
        const orderNumber = `DJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const newOrder: Order = {
          ...orderInput,
          id,
          orderNumber,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const { showToast } = get();
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        // Persist to real Node.js & MongoDB backend
        api.orders.create({
          type: orderInput.type,
          category: orderInput.category,
          description: orderInput.description,
          orderedQty: orderInput.orderedQty,
          unit: orderInput.unit,
          siteKey: orderInput.siteId,
          destinationId: orderInput.destinationId,
          supplierKey: orderInput.supplierId,
          timeSlot: orderInput.timeSlot,
          unitPrice: orderInput.unitPrice,
          commercialTerms: orderInput.commercialTerms,
          vehicleReg: orderInput.vehicleReg,
        }).catch((err) => console.warn('[Backend Sync]', err.message));

        showToast(`Order ${orderNumber} created & sent to ${newOrder.supplierName}`);
        return id;
      },

      acceptOrder: (orderId, notes) => {
        const { orders, visits, sites, suppliers, showToast } = get();
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        const site = sites.find((s) => s.id === order.siteId);
        const supplier = suppliers.find((s) => s.id === order.supplierId);

        let existingVisit = visits.find((v) => v.orderId === orderId);
        let updatedVisits = [...visits];

        if (!existingVisit) {
          const newVisit: Visit = {
            id: `vis-${order.id.replace('ord-', '')}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            siteId: order.siteId,
            siteName: order.siteName,
            supplierId: order.supplierId,
            supplierName: supplier?.name || order.supplierName,
            gateId: site?.gates[0]?.id || 'gate-chatham-1',
            destinationId: order.destinationId,
            destinationName: order.destinationName,
            vehicleReg: order.vehicleReg,
            type: order.type,
            category: order.category,
            description: order.description,
            orderedQty: order.orderedQty,
            dispatchedQty: order.orderedQty,
            unit: order.unit,
            status: 'scheduled',
            scheduledAt: new Date(Date.now() + 3600000).toISOString(),
            entryAuthorised: false,
          };
          updatedVisits = [newVisit, ...visits];
        }

        set({
          orders: orders.map((o) =>
            o.id === orderId ? { ...o, status: 'accepted', notes: notes || o.notes } : o
          ),
          visits: updatedVisits,
        });

        showToast(`Order ${order.orderNumber} accepted. Ready to assign driver.`);
      },

      declineOrder: (orderId, reason) => {
        const order = get().orders.find((o) => o.id === orderId);
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'declined', notes: `Declined: ${reason}` } : o
          ),
        }));
        get().showToast(`Order ${order?.orderNumber || ''} declined: ${reason}`);
      },

      assignDriver: (orderId, driverId, vehicleReg) => {
        const { orders, visits, drivers, sites, showToast } = get();
        const order = orders.find((o) => o.id === orderId);
        const driver = drivers.find((d) => d.id === driverId);
        const reg = vehicleReg || order?.vehicleReg || driver?.defaultVehicleReg || 'REG-UNASSIGNED';

        const updatedOrders = orders.map((o) =>
          o.id === orderId ? { ...o, status: 'dispatched' as OrderStatus } : o
        );

        let existingVisit = visits.find((v) => v.orderId === orderId);
        let updatedVisits = [...visits];

        const tracking: LiveTrackingData = {
          consentGranted: true,
          driverCanToggle: true,
          distanceRemainingKm: 3.2,
          estimatedArrivalMinutes: 9,
          currentLocationName: 'En route via arterial haul road',
          lastPingAt: new Date().toISOString(),
          disclaimer: 'Live telematics subject to site manager and gate verification.',
        };

        if (existingVisit) {
          updatedVisits = visits.map((v) =>
            v.orderId === orderId
              ? {
                  ...v,
                  driverId,
                  driverName: driver?.name || 'Assigned Driver',
                  vehicleReg: reg,
                  status: 'en_route' as VisitStatus,
                  dispatchedAt: new Date().toISOString(),
                  tracking,
                }
              : v
          );
        } else if (order) {
          const site = sites.find((s) => s.id === order.siteId);
          const newVisit: Visit = {
            id: `vis-${order.id.replace('ord-', '')}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            siteId: order.siteId,
            siteName: order.siteName,
            supplierId: order.supplierId,
            supplierName: order.supplierName,
            driverId,
            driverName: driver?.name || 'Assigned Driver',
            vehicleReg: reg,
            gateId: site?.gates[0]?.id || 'gate-chatham-1',
            destinationId: order.destinationId,
            destinationName: order.destinationName,
            type: order.type,
            category: order.category,
            description: order.description,
            orderedQty: order.orderedQty,
            dispatchedQty: order.orderedQty,
            unit: order.unit,
            status: 'en_route',
            scheduledAt: new Date().toISOString(),
            dispatchedAt: new Date().toISOString(),
            entryAuthorised: false,
            tracking,
          };
          updatedVisits = [newVisit, ...visits];
        }

        set({
          orders: updatedOrders,
          visits: updatedVisits,
          activeDriverId: driverId,
        });

        // Persist to real backend
        api.supplier.acceptAndAssign(orderId, {
          driverKey: driverId,
          vehicleReg: reg,
          eta: '25 mins (10:45 AM)',
        }).catch((err) => console.warn('[Backend Sync]', err.message));

        showToast(`Driver ${driver?.name || 'allocated'} (${reg}) assigned to ${order?.orderNumber || 'order'}`);
      },

      startJourney: (visitId) => {
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  status: 'en_route',
                  dispatchedAt: v.dispatchedAt || new Date().toISOString(),
                  tracking: v.tracking || {
                    consentGranted: true,
                    driverCanToggle: true,
                    distanceRemainingKm: 4.5,
                    estimatedArrivalMinutes: 12,
                    currentLocationName: 'In transit to site gate',
                    lastPingAt: new Date().toISOString(),
                    disclaimer: 'Live telematics subject to site manager and gate verification.',
                  },
                }
              : v
          ),
        }));
      },

      toggleDriverTrackingConsent: (visitId, consent) => {
        set((state) => ({
          visits: state.visits.map((v) => {
            if (v.id === visitId && v.tracking) {
              return {
                ...v,
                tracking: {
                  ...v.tracking,
                  consentGranted: consent,
                },
              };
            }
            return v;
          }),
        }));
      },

      scanIn: (visitId, gateId) => {
        const now = new Date().toISOString();
        const targetVisit = get().visits.find((v) => v.id === visitId);

        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  gateId: gateId || v.gateId,
                  status: 'at_gate',
                  entryAuthorised: false,
                  gateEntryAt: now,
                  tracking: v.tracking
                    ? {
                        ...v.tracking,
                        distanceRemainingKm: 0,
                        estimatedArrivalMinutes: 0,
                        currentLocationName: 'At Gate - Awaiting Clearance',
                        lastPingAt: now,
                      }
                    : undefined,
                }
              : v
          ),
          deliveryLoads: state.deliveryLoads.map((l) =>
            l.orderId === targetVisit?.orderId || l.id === visitId || l.vehicleReg === targetVisit?.vehicleReg
              ? {
                  ...l,
                  status: 'at_gate' as LoadStatus,
                  gateEntryAt: now,
                  tracking: l.tracking
                    ? {
                        ...l.tracking,
                        distanceRemainingKm: 0,
                        estimatedArrivalMinutes: 0,
                        currentLocationName: 'At Gate - Awaiting Clearance',
                        lastPingAt: now,
                      }
                    : undefined,
                }
              : l
          ),
        }));

        // Persist to real backend
        api.gate.scanIn({
          visitId,
          gateId,
          orderNumber: targetVisit?.orderNumber,
        }).catch((err) => console.warn('[Backend Sync]', err.message));

        get().showToast(`Gate QR scanned: ${targetVisit?.vehicleReg || targetVisit?.orderNumber || 'Driver'} checked in. Awaiting marshal authorisation.`);
      },

      marshalAuthoriseEntry: (visitId, notes) => {
        const now = new Date().toISOString();
        const targetVisit = get().visits.find((v) => v.id === visitId);
        if (!targetVisit) return;

        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  status: 'on_site',
                  entryAuthorised: true,
                  entryAuthorisedBy: "Gary O'Connor (Traffic Marshal)",
                  entryMethod: 'marshal_manual',
                  gateEntryAt: v.gateEntryAt || now,
                  tracking: v.tracking
                    ? {
                        ...v.tracking,
                        distanceRemainingKm: 0,
                        estimatedArrivalMinutes: 0,
                        currentLocationName: `On Site - Heading to ${v.destinationName}`,
                        lastPingAt: now,
                      }
                    : undefined,
                }
              : v
          ),
          orders: state.orders.map((o) =>
            o.id === targetVisit.orderId ? { ...o, status: 'on_site' } : o
          ),
          deliveryLoads: state.deliveryLoads.map((l) =>
            l.orderId === targetVisit?.orderId || l.id === visitId || l.vehicleReg === targetVisit?.vehicleReg
              ? {
                  ...l,
                  status: 'on_site' as LoadStatus,
                  gateEntryAt: l.gateEntryAt || now,
                }
              : l
          ),
        }));

        api.gate.authoriseEntry({
          visitId,
          gateId: targetVisit.gateId,
          orderNumber: targetVisit.orderNumber,
        }).catch((err) => console.warn('[Backend Sync]', err.message));

        get().showToast(`Gate entry authorised: ${targetVisit.vehicleReg || targetVisit.orderNumber} cleared for ${targetVisit.destinationName}`);
      },

      marshalFlagException: (visitId, reason) => {
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  marshalFlagged: true,
                  marshalFlagReason: reason,
                  status: 'flagged',
                }
              : v
          ),
        }));

        api.gate.flagException(visitId, reason).catch((err) => console.warn('[Backend Sync]', err.message));
        get().showToast(`Gate exception flagged: ${reason}`);
      },

      verifyDelivery: (visitId, receivedQty, isDisputed, notes, reasonCode) => {
        const now = new Date().toISOString();
        const targetVisit = get().visits.find((v) => v.id === visitId);
        if (!targetVisit) return;

        const variance = receivedQty - targetVisit.orderedQty;
        const hasDiscrepancy = Math.abs(variance) > 0.001 || isDisputed;

        const discrepancy: DiscrepancyRecord | undefined = hasDiscrepancy
          ? {
              orderedQty: targetVisit.orderedQty,
              dispatchedQty: targetVisit.dispatchedQty,
              receivedQty,
              varianceQty: variance,
              unit: targetVisit.unit,
              reasonCode: reasonCode || (isDisputed ? 'rejected_spec' : 'shortage'),
              notes,
              flaggedBy: 'Gary Nolan (Receiving Supervisor)',
              flaggedAt: now,
              resolved: false,
            }
          : undefined;

        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  receivedQty,
                  verifiedAt: now,
                  verifiedBy: 'Gary Nolan (Receiving Supervisor)',
                  status: 'verified',
                  serviceCompletedStatus: targetVisit.type === 'service' ? (isDisputed ? 'disputed' : 'completed') : undefined,
                  discrepancy,
                  proofNote: notes,
                }
              : v
          ),
          orders: state.orders.map((o) =>
            o.id === targetVisit.orderId
              ? {
                  ...o,
                  status: isDisputed ? 'disputed' : 'verified',
                  notes: notes ? `${o.notes ? o.notes + ' | ' : ''}${notes}` : o.notes,
                }
              : o
          ),
        }));

        // Persist verification to real backend
        const formData = new FormData();
        formData.append('actualReceivedQty', String(receivedQty));
        formData.append('isDisputed', String(isDisputed));
        formData.append('proofNotes', notes || '');
        if (reasonCode) formData.append('reasonCode', reasonCode);
        api.verify.verifyDelivery(visitId, formData).catch((err) => console.warn('[Backend Sync]', err.message));

        get().showToast(
          hasDiscrepancy
            ? `Delivery verified with discrepancy: ${variance} ${targetVisit.unit} variance recorded`
            : `Delivery 100% verified for ${targetVisit.orderNumber}`
        );
      },

      scanOut: (visitId) => {
        const now = new Date().toISOString();
        const targetVisit = get().visits.find((v) => v.id === visitId);
        if (!targetVisit) return;

        let duration = 32;
        if (targetVisit.gateEntryAt) {
          const entryMs = new Date(targetVisit.gateEntryAt).getTime();
          const exitMs = new Date(now).getTime();
          duration = Math.max(5, Math.round((exitMs - entryMs) / 60000));
        }

        const isDisputed =
          targetVisit.serviceCompletedStatus === 'disputed' || targetVisit.status === 'flagged';

        const allVisitsForOrder = get().visits.filter((v) => v.orderId === targetVisit.orderId);
        const hasOtherIncompleteVisits = allVisitsForOrder.some(
          (v) => v.id !== visitId && v.status !== 'completed'
        );

        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  gateExitAt: now,
                  durationMinutes: duration,
                  status: isDisputed ? 'flagged' : 'completed',
                }
              : v
          ),
          orders: state.orders.map((o) =>
            o.id === targetVisit.orderId
              ? {
                  ...o,
                  status: isDisputed
                    ? 'disputed'
                    : hasOtherIncompleteVisits
                    ? o.status
                    : 'completed',
                }
              : o
          ),
          deliveryLoads: state.deliveryLoads.map((l) =>
            l.orderId === targetVisit?.orderId || l.id === visitId || l.vehicleReg === targetVisit?.vehicleReg
              ? {
                  ...l,
                  status: 'completed' as LoadStatus,
                  gateExitAt: now,
                  durationMinutes: duration,
                }
              : l
          ),
        }));

        // Persist scan out to real backend
        api.exit.scanOut({
          visitId,
          orderNumber: targetVisit.orderNumber,
        }).catch((err) => console.warn('[Backend Sync]', err.message));

        get().showToast(
          `Visit completed: ${duration}m turnaround duration logged for ${targetVisit.vehicleReg || targetVisit.orderNumber}`
        );
      },

      acceptAndSplitOrder: (orderId, loadSplit) => {
        const { orders, deliveryLoads, drivers, vehicles, showToast } = get();
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        // Update order status to accepted
        const updatedOrders = orders.map((o) =>
          o.id === orderId ? { ...o, status: 'accepted' as OrderStatus } : o
        );

        // Check if loads already exist for this order
        const existingLoads = deliveryLoads.filter((l) => l.orderId === orderId);

        let newLoads: DeliveryLoad[] = [];
        if (existingLoads.length > 0) {
          // Loads already exist; activate them to assigned if pending
          newLoads = deliveryLoads.map((l) =>
            l.orderId === orderId
              ? { ...l, status: l.status === 'pending_assignment' ? ('assigned' as LoadStatus) : l.status }
              : l
          );
        } else {
          // Generate new loads
          const supplierDrivers = drivers.filter((d) => d.supplierId === order.supplierId);
          const supplierVehicles = vehicles.filter((v) => v.supplierId === order.supplierId);
          const generated: DeliveryLoad[] = [];
          const lines = order.lines && order.lines.length > 0 ? order.lines : [
            {
              id: 'line-default-1',
              category: order.category,
              description: order.description,
              requestedQty: order.orderedQty,
              unit: order.unit,
              estimatedLoads: order.estimatedLoads || 1,
            },
          ];

          let loadLetterCode = 65; // 'A'
          lines.forEach((line) => {
            const defaultCapacity = line.unit === 'tonnes' ? 18 : line.unit === 'litres' ? 5000 : line.unit === 'units' ? 4 : 1;
            const count = Math.max(1, line.estimatedLoads || Math.ceil(line.requestedQty / defaultCapacity));
            const qtyPerLoad = Number((line.requestedQty / count).toFixed(1));

            for (let i = 0; i < count; i++) {
              const letter = String.fromCharCode(loadLetterCode++);
              const driver = supplierDrivers[i % Math.max(1, supplierDrivers.length)] || supplierDrivers[0];
              const vehicle = supplierVehicles[i % Math.max(1, supplierVehicles.length)] || supplierVehicles[0];
              const loadNum = `LD-${order.orderNumber.replace(/[^0-9]/g, '') || '1024'}-${letter}`;

              generated.push({
                id: `load-${Date.now().toString().slice(-4)}-${i}`,
                loadNumber: loadNum,
                orderId: order.id,
                orderNumber: order.orderNumber,
                orderLineId: line.id,
                customerName: order.customerName || 'DJ Civils Ltd',
                siteId: order.siteId,
                siteName: order.siteName,
                destinationId: order.destinationId,
                destinationName: order.destinationName,
                supplierId: order.supplierId,
                material: line.category,
                quantity: qtyPerLoad,
                unit: line.unit,
                driverId: driver?.id,
                driverName: driver?.name,
                vehicleReg: driver?.defaultVehicleReg || vehicle?.registration || 'REG-PENDING',
                vehicleCapacity: vehicle?.capacity || defaultCapacity,
                vehicleType: vehicle?.type || 'Heavy Goods Vehicle',
                status: 'assigned',
                qrCode: `SF-LOAD:${loadNum}|ORD:${order.orderNumber}|${order.siteName}|${line.category}:${qtyPerLoad}${line.unit}`,
              });
            }
          });
          newLoads = [...deliveryLoads, ...generated];
        }

        set({
          orders: updatedOrders,
          deliveryLoads: newLoads,
        });

        showToast(`Order ${order.orderNumber} accepted. Individual loads generated & ready for dispatch.`);
      },

      assignDriverToLoad: (loadId, driverId, vehicleReg) => {
        const { deliveryLoads, drivers, vehicles, showToast } = get();
        const load = deliveryLoads.find((l) => l.id === loadId);
        const driver = drivers.find((d) => d.id === driverId);
        const reg = vehicleReg ? vehicleReg.trim().toUpperCase() : driver?.defaultVehicleReg || 'REG-ASSIGNED';
        const veh = vehicles.find((v) => v.registration.toUpperCase() === reg);

        set({
          deliveryLoads: deliveryLoads.map((l) =>
            l.id === loadId
              ? {
                  ...l,
                  driverId,
                  driverName: driver?.name || 'Assigned Driver',
                  vehicleReg: reg,
                  vehicleCapacity: veh?.capacity || l.vehicleCapacity || 18,
                  vehicleType: veh?.type || l.vehicleType,
                  status: 'assigned',
                }
              : l
          ),
        });

        showToast(`Driver ${driver?.name || 'allocated'} (${reg}) assigned to load ${load?.loadNumber || loadId}`);
      },

      dispatchLoad: (loadId) => {
        const { deliveryLoads, orders, showToast } = get();
        const load = deliveryLoads.find((l) => l.id === loadId);
        if (!load) return;

        const now = new Date().toISOString();
        const tracking: LiveTrackingData = {
          consentGranted: true,
          driverCanToggle: true,
          distanceRemainingKm: 4.2,
          estimatedArrivalMinutes: 12,
          currentLocationName: 'In transit - En route via arterial haul road',
          lastPingAt: now,
          disclaimer: 'Live telematics subject to site manager and gate verification.',
        };

        set({
          deliveryLoads: deliveryLoads.map((l) =>
            l.id === loadId
              ? {
                  ...l,
                  status: 'dispatched',
                  dispatchedAt: now,
                  estimatedArrivalMinutes: 12,
                  tracking,
                }
              : l
          ),
          orders: orders.map((o) =>
            o.id === load.orderId && (o.status === 'pending' || o.status === 'accepted')
              ? { ...o, status: 'dispatched' }
              : o
          ),
        });

        showToast(`Load ${load.loadNumber} dispatched! Live ETA: 12 mins to ${load.destinationName}`);
      },

      requestClarification: (orderId, notes) => {
        const { orders, showToast } = get();
        const order = orders.find((o) => o.id === orderId);
        set({
          orders: orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  clarificationRequested: true,
                  clarificationNotes: notes,
                  notes: notes ? `Clarification: ${notes}` : o.notes,
                }
              : o
          ),
        });

        showToast(`Clarification request sent to Chris (Site Manager) for ${order?.orderNumber || 'order'}.`);
      },

      updateLoadStatus: (loadId, status) => {
        const now = new Date().toISOString();
        const targetLoad = get().deliveryLoads.find((l) => l.id === loadId);
        set((state) => ({
          deliveryLoads: state.deliveryLoads.map((l) =>
            l.id === loadId
              ? {
                  ...l,
                  status,
                  dispatchedAt: status === 'dispatched' ? (l.dispatchedAt || now) : l.dispatchedAt,
                  gateEntryAt: (status === 'at_gate' || status === 'on_site') ? (l.gateEntryAt || now) : l.gateEntryAt,
                  gateExitAt: status === 'completed' ? (l.gateExitAt || now) : l.gateExitAt,
                  durationMinutes: status === 'completed' ? (l.durationMinutes || 28) : l.durationMinutes,
                  tracking: status === 'dispatched' ? (l.tracking || {
                    consentGranted: true,
                    driverCanToggle: true,
                    distanceRemainingKm: 4.2,
                    estimatedArrivalMinutes: 12,
                    currentLocationName: 'In transit to site gate',
                    lastPingAt: now,
                    disclaimer: 'Live telematics subject to site manager and gate verification.',
                  }) : status === 'at_gate' ? {
                    consentGranted: true,
                    driverCanToggle: true,
                    distanceRemainingKm: 0,
                    estimatedArrivalMinutes: 0,
                    currentLocationName: 'At Gate - Awaiting Clearance',
                    lastPingAt: now,
                    disclaimer: 'Live telematics subject to site manager and gate verification.',
                  } : status === 'on_site' ? {
                    consentGranted: true,
                    driverCanToggle: true,
                    distanceRemainingKm: 0,
                    estimatedArrivalMinutes: 0,
                    currentLocationName: `On Site - Discharge at ${l.destinationName}`,
                    lastPingAt: now,
                    disclaimer: 'Live telematics subject to site manager and gate verification.',
                  } : undefined,
                }
              : l
          ),
        }));

        get().showToast(`Load ${targetLoad?.loadNumber || loadId} status updated: ${status.replace('_', ' ').toUpperCase()}`);
      },

      updateUserProfile: (role, updates) => {
        set((state) => {
          const current = state.userProfiles[role] || state.userProfiles.manager;
          return {
            userProfiles: {
              ...state.userProfiles,
              [role]: { ...current, ...updates },
            },
          };
        });
        get().showToast('Profile credentials and details updated successfully.');
      },

      registerMapLocation: (siteId, locationData) => {
        const id = locationData.id || `dest-${Date.now().toString().slice(-4)}`;
        const code = locationData.code || `CH-D${Math.floor(Math.random() * 90 + 10)}`;
        const newLocation: SiteDestination = {
          ...locationData,
          id,
          code,
          locationType: locationData.locationType || 'delivery',
          isActive: locationData.isActive !== false,
          isApproved: Boolean(locationData.isApproved),
        };

        set((state) => ({
          sites: state.sites.map((s) => {
            if (s.id !== siteId) return s;
            const updatedDests = [...s.destinations, newLocation];
            // If approved, create default route from Gate 1
            const primaryGate = s.gates[0];
            let updatedRoutes = [...s.routes];
            if (newLocation.isApproved && primaryGate) {
              const gx = primaryGate.coordinates.x;
              const gy = primaryGate.coordinates.y;
              const dx = newLocation.coordinates.x;
              const dy = newLocation.coordinates.y;
              const midY = (gy + dy) / 2;
              const pathD = `M ${gx} ${gy} L ${gx} ${midY} L ${dx} ${midY} L ${dx} ${dy}`;
              updatedRoutes.push({
                gateId: primaryGate.id,
                destinationId: id,
                pathD,
                estimatedDriveMinutes: 3,
                oneWay: true,
                speedLimitKmh: 10,
                isApproved: true,
              });
            }
            return {
              ...s,
              destinations: updatedDests,
              routes: updatedRoutes,
            };
          }),
        }));

        get().showToast(`Location ${newLocation.name} (${newLocation.code}) registered on site map.`);
      },

      updateMapLocation: (siteId, locationId, updates) => {
        set((state) => ({
          sites: state.sites.map((s) => {
            if (s.id !== siteId) return s;
            const updatedDests = s.destinations.map((d) =>
              d.id === locationId ? { ...d, ...updates } : d
            );
            return {
              ...s,
              destinations: updatedDests,
            };
          }),
        }));
        get().showToast('Site map location updated.');
      },

      deleteMapLocation: (siteId, locationId) => {
        set((state) => ({
          sites: state.sites.map((s) => {
            if (s.id !== siteId) return s;
            return {
              ...s,
              destinations: s.destinations.filter((d) => d.id !== locationId),
              routes: s.routes.filter((r) => r.destinationId !== locationId),
            };
          }),
        }));
        get().showToast('Location removed from site map.');
      },

      setSiteDrawing: (siteId, drawingUrl, drawingTitle) => {
        set((state) => ({
          sites: state.sites.map((s) =>
            s.id === siteId
              ? {
                  ...s,
                  drawingUrl,
                  drawingTitle: drawingTitle || s.drawingTitle || 'Phase 2A Link Road, East Hill, Chatham',
                }
              : s
          ),
        }));
        get().showToast('Engineering reference drawing attached successfully.');
      },

      toggleRoadClosure: (siteId, closureName, reason) => {
        set((state) => ({
          sites: state.sites.map((s) => {
            if (s.id !== siteId) return s;
            const existing = s.closedRoads || [];
            const found = existing.find((c) => c.name === closureName);
            let updatedClosures;
            if (found) {
              updatedClosures = existing.filter((c) => c.name !== closureName);
            } else {
              updatedClosures = [
                ...existing,
                { id: `cls-${Date.now()}`, name: closureName, reason, active: true },
              ];
            }
            return {
              ...s,
              closedRoads: updatedClosures,
            };
          }),
        }));
        get().showToast(`Road restriction updated for ${closureName}.`);
      },

      toggleLocationRouteApproval: (siteId, destinationId, isApproved) => {
        set((state) => ({
          sites: state.sites.map((s) => {
            if (s.id !== siteId) return s;
            const targetDest = s.destinations.find((d) => d.id === destinationId);
            if (!targetDest) return s;

            const newApproval = isApproved !== undefined ? isApproved : !targetDest.isApproved;
            const updatedDests = s.destinations.map((d) =>
              d.id === destinationId ? { ...d, isApproved: newApproval } : d
            );

            // Update routes
            let updatedRoutes = [...s.routes];
            if (newApproval) {
              const existingRoute = s.routes.find((r) => r.destinationId === destinationId);
              if (!existingRoute && s.gates[0]) {
                const gx = s.gates[0].coordinates.x;
                const gy = s.gates[0].coordinates.y;
                const dx = targetDest.coordinates.x;
                const dy = targetDest.coordinates.y;
                const midY = (gy + dy) / 2;
                updatedRoutes.push({
                  gateId: s.gates[0].id,
                  destinationId,
                  pathD: `M ${gx} ${gy} L ${gx} ${midY} L ${dx} ${midY} L ${dx} ${dy}`,
                  estimatedDriveMinutes: 3,
                  oneWay: true,
                  speedLimitKmh: 10,
                  isApproved: true,
                });
              } else if (existingRoute) {
                updatedRoutes = updatedRoutes.map((r) =>
                  r.destinationId === destinationId ? { ...r, isApproved: true } : r
                );
              }
            } else {
              updatedRoutes = updatedRoutes.filter((r) => r.destinationId !== destinationId);
            }

            return {
              ...s,
              destinations: updatedDests,
              routes: updatedRoutes,
            };
          }),
        }));
        get().showToast('Route approval status updated.');
      },
    }),
    {
      name: 'dj_siteflow_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
