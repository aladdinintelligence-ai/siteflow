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
} from './types';
import {
  SEED_SITES,
  SEED_SUPPLIERS,
  SEED_DRIVERS,
  SEED_ORDERS,
  SEED_VISITS,
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
  marshalFlagException: (visitId: string, reason: string) => void;
  verifyDelivery: (
    visitId: string,
    receivedQty: number,
    isDisputed: boolean,
    notes: string,
    reasonCode?: DiscrepancyRecord['reasonCode']
  ) => void;
  scanOut: (visitId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      orders: SEED_ORDERS,
      visits: SEED_VISITS,
      sites: SEED_SITES,
      suppliers: SEED_SUPPLIERS,
      drivers: SEED_DRIVERS,

      currentRole: 'driver',
      currentSiteId: 'site-btr',
      activeDriverId: 'drv-dave',
      activeSupplierId: 'sup-cemex',
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
            gateId: site?.gates[0]?.id || 'gate-btr-1',
            destinationId: order.destinationId,
            destinationName: order.destinationName,
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
        const reg = vehicleReg || driver?.defaultVehicleReg || 'REG-UNASSIGNED';

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
            gateId: site?.gates[0]?.id || 'gate-btr-1',
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
                  status: 'on_site',
                  entryAuthorised: true,
                  entryAuthorisedBy: 'Auto QR Validation',
                  entryMethod: 'qr_auto',
                  gateEntryAt: now,
                  tracking: v.tracking
                    ? {
                        ...v.tracking,
                        distanceRemainingKm: 0,
                        estimatedArrivalMinutes: 0,
                        currentLocationName: 'On Site - Authorized at Gate',
                        lastPingAt: now,
                      }
                    : undefined,
                }
              : v
          ),
          orders: state.orders.map((o) =>
            o.id === targetVisit?.orderId ? { ...o, status: 'on_site' } : o
          ),
        }));

        // Persist to real backend
        api.gate.scanIn({
          visitId,
          gateId,
          orderNumber: targetVisit?.orderNumber,
        }).catch((err) => console.warn('[Backend Sync]', err.message));

        get().showToast(`Booking retrieved: Gate entry authorised for ${targetVisit?.orderNumber || 'visit'}`);
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
                  status: isDisputed ? 'disputed' : 'completed',
                }
              : o
          ),
        }));

        // Persist scan out to real backend
        api.exit.scanOut({
          visitId,
          orderNumber: targetVisit.orderNumber,
        }).catch((err) => console.warn('[Backend Sync]', err.message));

        get().showToast(`Visit completed: ${duration}m turnaround duration logged`);
      },
    }),
    {
      name: 'dj_siteflow_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
