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
  manager: {
    id: 'manager',
    name: 'Site Manager',
    badge: 'Operations & Commercial',
    deviceFocus: 'desktop',
    path: '/manager',
    description: 'Material orders & service bookings, full commercial spend ledger, operational reports for Chatham & Rochester.',
    allowedDataDescription: 'Full access: material & service booking, £ spend tracking, supplier SLAs, gate activity, all sites.',
    iconName: 'Building2',
  },
  director: {
    id: 'director',
    name: 'Site Manager',
    badge: 'Operations & Commercial',
    deviceFocus: 'desktop',
    path: '/manager',
    description: 'Material orders & service bookings, full commercial spend ledger, operational reports for Chatham & Rochester.',
    allowedDataDescription: 'Full access: material & service booking, £ spend tracking, supplier SLAs, gate activity, all sites.',
    iconName: 'Building2',
  },
  ordering: {
    id: 'ordering',
    name: 'Site Manager',
    badge: 'Operations & Commercial',
    deviceFocus: 'desktop',
    path: '/manager',
    description: 'Material orders & service bookings, full commercial spend ledger, operational reports for Chatham & Rochester.',
    allowedDataDescription: 'Full access: material & service booking, £ spend tracking, supplier SLAs, gate activity, all sites.',
    iconName: 'Building2',
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
