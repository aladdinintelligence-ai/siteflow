import { RoleId } from '@/lib/types';

export interface RoleConfig {
  id: RoleId;
  name: string;
  badge: string;
  deviceFocus: 'desktop' | 'mobile' | 'tablet';
  path: string;
  description: string;
  allowedDataDescription: string;
  iconName: string;
}

export const ROLES: Record<RoleId, RoleConfig> = {
  director: {
    id: 'director',
    name: 'Director / PM',
    badge: 'Executive',
    deviceFocus: 'desktop',
    path: '/director',
    description: 'Project-wide spend, order volume, supplier SLAs, and site discrepancy rates.',
    allowedDataDescription: 'Full access: spend, costs, supplier SLAs, all sites, cross-role audit trail.',
    iconName: 'Briefcase',
  },
  ordering: {
    id: 'ordering',
    name: 'Ordering Team',
    badge: 'Commercial',
    deviceFocus: 'desktop',
    path: '/ordering',
    description: 'Create material & service purchase orders, specify zones, and coordinate delivery slots.',
    allowedDataDescription: 'Order creation, booking slots, commercial terms, pricing, order progress.',
    iconName: 'ClipboardList',
  },
  supplier: {
    id: 'supplier',
    name: 'Supplier / Contractor',
    badge: 'Logistics',
    deviceFocus: 'desktop',
    path: '/supplier',
    description: 'Accept purchase orders, assign drivers and vehicles, monitor dispatch schedule.',
    allowedDataDescription: 'Orders for own company, sales values, driver dispatch, fulfilment performance.',
    iconName: 'Truck',
  },
  driver: {
    id: 'driver',
    name: 'Driver / Worker',
    badge: 'Field',
    deviceFocus: 'mobile',
    path: '/driver',
    description: 'View run details, scan site QR for gate access, follow approved haul route, scan out.',
    allowedDataDescription: 'Operational job details, site navigation, delivery receipt. Zero pricing.',
    iconName: 'HardHat',
  },
  marshal: {
    id: 'marshal',
    name: 'Traffic Marshal',
    badge: 'Gatehouse',
    deviceFocus: 'tablet',
    path: '/marshal',
    description: 'Live gate activity, automated QR entry logs, queue management, exception handling.',
    allowedDataDescription: 'Gate bookings for today, vehicle registrations, driver names, entry/exit timestamps.',
    iconName: 'ShieldCheck',
  },
  supervisor: {
    id: 'supervisor',
    name: 'Receiving Supervisor',
    badge: 'Quality Sign-Off',
    deviceFocus: 'tablet',
    path: '/supervisor',
    description: 'Verify received quantity against dispatched, log shortages or damaged items, certify services.',
    allowedDataDescription: 'Dispatched volume vs received volume, quality sign-off, discrepancy logging.',
    iconName: 'CheckCircle2',
  },
  analyst: {
    id: 'analyst',
    name: 'Data Analyst',
    badge: 'Analytics',
    deviceFocus: 'desktop',
    path: '/analyst',
    description: 'Turnaround times, supplier SLA reliability, waste trends, and site carbon metrics.',
    allowedDataDescription: 'Full aggregated metrics, duration histograms, supplier scorecards.',
    iconName: 'BarChart3',
  },
};
