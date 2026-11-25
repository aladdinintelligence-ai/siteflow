'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RoleId } from '@/lib/types';
import { api, getAuthToken, setAuthToken } from '@/lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  organization: string;
  supplierId?: string;
  driverId?: string;
  siteId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string, redirectPath?: string | null) => Promise<{ success: boolean; message?: string; role?: RoleId }>;
  logout: () => void;
  hasAccessToRoute: (pathname: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role to path mapping
export const ROLE_HOME_PATHS: Record<RoleId, string> = {
  manager: '/manager',
  director: '/manager',
  ordering: '/manager',
  supplier: '/supplier',
  driver: '/driver',
  marshal: '/marshal',
  analyst: '/analyst',
};

// Route access rules
export const ROUTE_PERMISSIONS: Record<string, RoleId[]> = {
  '/manager': ['manager', 'director', 'ordering'],
  '/director': ['manager', 'director', 'ordering'],
  '/ordering': ['manager', 'director', 'ordering'],
  '/supplier': ['supplier', 'manager', 'director'],
  '/driver': ['driver', 'manager', 'director'],
  '/marshal': ['marshal', 'manager', 'director'],
  '/analyst': ['analyst', 'manager', 'director'],
  '/discovery': ['manager', 'director'],
  '/profile': ['manager', 'director', 'ordering', 'supplier', 'driver', 'marshal', 'analyst'],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check current session from backend
  const checkSession = useCallback(async () => {
    const existingToken = getAuthToken();
    if (!existingToken) {
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.me();
      if (res?.success && res.user) {
        setUser(res.user);
        setTokenState(existingToken);
      } else {
        setAuthToken(null);
        setUser(null);
        setTokenState(null);
      }
    } catch {
      // If token expired or network error
      setAuthToken(null);
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const hasAccessToRoute = useCallback(
    (targetPath: string): boolean => {
      if (!user) return false;
      const allowedRoles = ROUTE_PERMISSIONS[targetPath];
      if (!allowedRoles) return true; // public or unlisted
      return allowedRoles.includes(user.role);
    },
    [user]
  );

  const login = async (email: string, password: string = 'SiteFlow2026!', redirectPath?: string | null) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token && res.user) {
        setAuthToken(res.token);
        setTokenState(res.token);
        setUser(res.user);

        const userRole = res.user.role as RoleId;
        const defaultHome = ROLE_HOME_PATHS[userRole] || '/director';

        // Check if redirectPath is valid and authorized for this user's role
        let targetDestination = defaultHome;
        if (redirectPath && redirectPath.startsWith('/')) {
          const allowedRoles = ROUTE_PERMISSIONS[redirectPath];
          if (!allowedRoles || allowedRoles.includes(userRole)) {
            targetDestination = redirectPath;
          }
        }

        router.push(targetDestination);
        return { success: true, role: userRole };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Invalid credentials' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasAccessToRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
