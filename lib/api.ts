import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

// Token Management
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem('siteflow_jwt_token');
  if (local) return local;
  const match = document.cookie.match(/siteflow_jwt_token=([^;]+)/);
  return match ? match[1] : null;
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('siteflow_jwt_token', token);
    document.cookie = `siteflow_jwt_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    localStorage.removeItem('siteflow_jwt_token');
    document.cookie = 'siteflow_jwt_token=; path=/; max-age=0; SameSite=Lax';
  }
}

// Request Helper
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `API Error: ${res.status} ${res.statusText}`);
  }

  return data as T;
}

// Socket.io singleton
let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.io Client] Connected to SiteFlow backend:', socketInstance?.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.io Client] Connection warning:', err.message);
    });
  }

  return socketInstance;
}

// API Service Interface
export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password?: string }) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: credentials.email, password: credentials.password || 'SiteFlow2026!' }),
      }),
    demoSwitch: (role: string) =>
      apiRequest('/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    me: () => apiRequest('/auth/me'),
    getPersonas: () => apiRequest('/auth/personas'),
  },

  // Orders
  orders: {
    list: (params?: { status?: string; siteKey?: string; supplierKey?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.siteKey) searchParams.set('siteKey', params.siteKey);
      if (params?.supplierKey) searchParams.set('supplierKey', params.supplierKey);
      if (params?.search) searchParams.set('search', params.search);
      return apiRequest(`/orders?${searchParams.toString()}`);
    },
    get: (id: string) => apiRequest(`/orders/${id}`),
    create: (data: any) =>
      apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    stats: (siteKey?: string) =>
      apiRequest(`/orders/stats${siteKey ? `?siteKey=${siteKey}` : ''}`),
  },

  // Supplier
  supplier: {
    getIncoming: (supplierKey?: string) =>
      apiRequest(`/supplier/incoming${supplierKey ? `?supplierKey=${supplierKey}` : ''}`),
    getActive: (supplierKey?: string) =>
      apiRequest(`/supplier/active${supplierKey ? `?supplierKey=${supplierKey}` : ''}`),
    getHistory: (supplierKey?: string) =>
      apiRequest(`/supplier/history${supplierKey ? `?supplierKey=${supplierKey}` : ''}`),
    getDrivers: (supplierKey?: string) =>
      apiRequest(`/supplier/drivers${supplierKey ? `?supplierKey=${supplierKey}` : ''}`),
    getSuppliers: () => apiRequest('/supplier/list'),
    acceptAndAssign: (orderId: string, data: { driverKey: string; vehicleReg?: string; eta?: string }) =>
      apiRequest(`/supplier/orders/${orderId}/accept`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    decline: (orderId: string, reason: string) =>
      apiRequest(`/supplier/orders/${orderId}/decline`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },

  // Driver
  driver: {
    getJobs: (driverKey?: string) =>
      apiRequest(`/driver/jobs${driverKey ? `?driverKey=${driverKey}` : ''}`),
    toggleConsent: (driverKey: string, consent: boolean) =>
      apiRequest('/driver/consent', {
        method: 'POST',
        body: JSON.stringify({ driverKey, consent }),
      }),
    updateLocation: (data: {
      driverKey: string;
      lat: number;
      lng: number;
      speed?: number;
      heading?: number;
      distanceRemainingMiles?: number;
      eta?: string;
    }) =>
      apiRequest('/driver/location', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Gate & Marshal
  gate: {
    scanIn: (data: { qrPayload?: string; visitId?: string; orderNumber?: string; gateId?: string }) =>
      apiRequest('/gate/scan-in', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getExpected: (siteKey?: string) =>
      apiRequest(`/gate/expected${siteKey ? `?siteKey=${siteKey}` : ''}`),
    getOnSite: (siteKey?: string) =>
      apiRequest(`/gate/on-site${siteKey ? `?siteKey=${siteKey}` : ''}`),
    getExitLogs: (siteKey?: string) =>
      apiRequest(`/gate/exit-logs${siteKey ? `?siteKey=${siteKey}` : ''}`),
    flagException: (visitId: string, reason: string) =>
      apiRequest(`/gate/visits/${visitId}/flag`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    manualEntry: (data: { visitId: string; gateId?: string }) =>
      apiRequest('/gate/manual-entry', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    authoriseEntry: (data: { visitId: string; gateId?: string; orderNumber?: string }) =>
      apiRequest('/gate/authorise-entry', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Verification & Supervisor
  verify: {
    verifyDelivery: (visitId: string, formData: FormData) =>
      apiRequest(`/verify/visits/${visitId}`, {
        method: 'POST',
        body: formData,
      }),
    getDiscrepancies: (siteKey?: string) =>
      apiRequest(`/verify/discrepancies${siteKey ? `?siteKey=${siteKey}` : ''}`),
  },

  // Exit
  exit: {
    scanOut: (data: { visitId?: string; orderNumber?: string }) =>
      apiRequest('/exit/scan-out', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Analytics
  analytics: {
    getDirector: (siteKey?: string) =>
      apiRequest(`/analytics/director${siteKey ? `?siteKey=${siteKey}` : ''}`),
    getAnalyst: () => apiRequest('/analytics/analyst'),
  },
};

