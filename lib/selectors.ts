import { Order, Visit, Site, DriverJobView, RoleId } from '@/lib/types';
import { AppState } from '@/lib/store';

/**
 * STRICT DRIVER SELECTOR:
 * Strips all commercial terms, unit prices, total prices, and supplier margin.
 * Ensures zero leakage of financial data to the driver screen.
 */
export function getDriverJobs(state: AppState, targetDriverId: string = 'drv-dave'): DriverJobView[] {
  const driverVisits = state.visits.filter((v) => !targetDriverId || v.driverId === targetDriverId);

  return driverVisits.map((visit) => {
    const site = state.sites.find((s) => s.id === visit.siteId);
    const order = state.orders.find((o) => o.id === visit.orderId);
    const gate = site?.gates.find((g) => g.id === visit.gateId) || site?.gates[0];
    const destination = site?.destinations.find((d) => d.id === visit.destinationId);
    const approvedRoute = site?.routes.find(
      (r) => r.gateId === (visit.gateId || gate?.id) && r.destinationId === visit.destinationId
    );

    const jobView: DriverJobView = {
      visitId: visit.id,
      orderId: visit.orderId,
      orderNumber: visit.orderNumber,
      siteId: visit.siteId,
      siteName: visit.siteName,
      siteAddress: site?.address || 'Site Delivery Location',
      sitePostcode: site?.postcode || '',
      destinationId: visit.destinationId,
      destinationName: visit.destinationName,
      destinationInstructions: destination?.unloadingInstructions || 'Report to Site Receiving Officer upon arrival.',
      hazardWarnings: destination?.hazardWarnings || ['Safety boots & 5-point PPE mandatory'],
      gateId: gate?.id || 'gate-default',
      gateName: gate?.name || 'Main Construction Gate',
      supplierName: visit.supplierName,
      driverName: visit.driverName || 'Authorized Driver',
      vehicleReg: visit.vehicleReg || 'REG-PENDING',
      type: visit.type,
      category: visit.category,
      description: visit.description,
      orderedQty: visit.orderedQty,
      dispatchedQty: visit.dispatchedQty,
      unit: visit.unit,
      timeSlot: order?.timeSlot || '08:00 - 12:00',
      status: visit.status,
      entryAuthorised: visit.entryAuthorised,
      tracking: visit.tracking,
      gateEntryAt: visit.gateEntryAt,
      verifiedAt: visit.verifiedAt,
      gateExitAt: visit.gateExitAt,
      durationMinutes: visit.durationMinutes,
      approvedRoute,
    };

    return jobView;
  });
}

/**
 * Select active job for current driver:
 * Returns the currently en-route, at-gate, or on-site job.
 */
export function getDriverActiveJob(state: AppState, targetDriverId: string = 'drv-dave'): DriverJobView | undefined {
  const jobs = getDriverJobs(state, targetDriverId);
  // Prioritize jobs in action: at_gate, en_route, on_site, verified
  const active = jobs.find((j) => ['en_route', 'at_gate', 'on_site', 'verified'].includes(j.status));
  return active || jobs[0];
}

/**
 * Supplier Selector:
 * Shows incoming orders, driver dispatch queue, revenue, and delivery performance.
 */
export function getSupplierOrders(state: AppState, supplierId: string = 'sup-cemex') {
  const orders = state.orders.filter((o) => !supplierId || o.supplierId === supplierId);
  const visits = state.visits.filter((v) => !supplierId || v.supplierId === supplierId);
  const drivers = state.drivers.filter((d) => !supplierId || d.supplierId === supplierId);

  const pending = orders.filter((o) => o.status === 'pending');
  const active = orders.filter((o) => ['accepted', 'dispatched', 'on_site'].includes(o.status));
  const completed = orders.filter((o) => ['verified', 'completed'].includes(o.status));
  const totalRevenue = orders
    .filter((o) => o.status !== 'declined')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return {
    orders,
    visits,
    drivers,
    pending,
    active,
    completed,
    totalRevenue,
  };
}

/**
 * Marshal Selector:
 * Traffic marshal views expected gate bookings, active gate events, and historical check-outs.
 */
export function getMarshalVisits(state: AppState, siteId?: string) {
  const effectiveSiteId = siteId || state.currentSiteId;
  const visits = state.visits.filter((v) => !effectiveSiteId || v.siteId === effectiveSiteId);

  const expectedToday = visits.filter((v) => ['scheduled', 'en_route'].includes(v.status));
  const onSiteNow = visits.filter((v) => ['on_site', 'verified'].includes(v.status));
  const exitedToday = visits.filter((v) => v.status === 'completed');
  const flagged = visits.filter((v) => v.marshalFlagged || v.status === 'flagged');

  return {
    visits,
    expectedToday,
    onSiteNow,
    exitedToday,
    flagged,
  };
}

/**
 * Supervisor Selector:
 * Receiving supervisor views pending on-site deliveries requiring verification,
 * records shortages/discrepancies, and confirms service completions/disputes.
 */
export function getSupervisorQueue(state: AppState, siteId?: string) {
  const effectiveSiteId = siteId || state.currentSiteId;
  const visits = state.visits.filter((v) => !effectiveSiteId || v.siteId === effectiveSiteId);

  const pendingVerification = visits.filter((v) => v.status === 'on_site');
  const verified = visits.filter((v) => ['verified', 'completed'].includes(v.status));
  const discrepancies = visits.filter((v) => Boolean(v.discrepancy));
  const disputedServices = visits.filter((v) => v.serviceCompletedStatus === 'disputed' || v.status === 'flagged');

  return {
    pendingVerification,
    verified,
    discrepancies,
    disputedServices,
    totalProcessed: verified.length,
  };
}

/**
 * Director / Executive Selector:
 * High-level KPIs, spend, compliance, and site summaries.
 */
export function getDirectorKpis(state: AppState, siteId?: string) {
  const effectiveSiteId = siteId || state.currentSiteId;
  const orders = state.orders.filter((o) => !effectiveSiteId || o.siteId === effectiveSiteId);
  const visits = state.visits.filter((v) => !effectiveSiteId || v.siteId === effectiveSiteId);

  const totalCommittedSpend = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const verifiedSpend = orders
    .filter((o) => ['verified', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const visitsWithDiscrepancy = visits.filter((v) => Boolean(v.discrepancy));
  const discrepancyRate = visits.length > 0 ? (visitsWithDiscrepancy.length / visits.length) * 100 : 0;

  const onSiteCount = visits.filter((v) => ['on_site', 'verified'].includes(v.status)).length;
  const completedCount = visits.filter((v) => v.status === 'completed').length;

  return {
    totalCommittedSpend,
    verifiedSpend,
    totalOrders: orders.length,
    activeOnSite: onSiteCount,
    totalCompletedVisits: completedCount,
    discrepancyCount: visitsWithDiscrepancy.length,
    discrepancyRate: Number(discrepancyRate.toFixed(1)),
    orders,
    visits,
  };
}

