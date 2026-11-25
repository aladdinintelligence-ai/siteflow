import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route permissions mapping
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/manager': ['manager', 'director', 'ordering'],
  '/director': ['manager', 'director', 'ordering'],
  '/ordering': ['manager', 'director', 'ordering'],
  '/supplier': ['supplier', 'manager', 'director'],
  '/driver': ['driver', 'manager', 'director'],
  '/marshal': ['marshal', 'manager', 'director'],
  '/analyst': ['analyst', 'manager', 'director'],
  '/discovery': ['manager', 'director'],
};

const ROLE_DEFAULT_PATHS: Record<string, string> = {
  manager: '/manager',
  director: '/manager',
  ordering: '/manager',
  supplier: '/supplier',
  driver: '/driver',
  marshal: '/marshal',
  analyst: '/analyst',
};

// Safe base64url decode helper for edge runtime
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('siteflow_jwt_token')?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  // Redirect legacy /director and /ordering to unified /manager dashboard
  if (pathname === '/director' || pathname === '/ordering') {
    return NextResponse.redirect(new URL('/manager', request.url));
  }

  // 1. Root route: automatically redirect to authorized portal or login
  if (pathname === '/') {
    if (payload && payload.role) {
      const defaultPath = ROLE_DEFAULT_PATHS[payload.role] || '/manager';
      return NextResponse.redirect(new URL(defaultPath, request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If user is on /login
  if (pathname === '/login') {
    if (payload && payload.role && !request.nextUrl.searchParams.has('switch')) {
      const defaultPath = ROLE_DEFAULT_PATHS[payload.role] || '/manager';
      return NextResponse.redirect(new URL(defaultPath, request.url));
    }
    return NextResponse.next();
  }

  // 3. Check if route is protected
  const protectedRouteKey = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (protectedRouteKey) {
    // If no valid session token exists, redirect to login
    if (!token || !payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const allowedRoles = ROUTE_PERMISSIONS[protectedRouteKey];
    const userRole = payload.role as string;

    // Check if role is authorized
    if (!allowedRoles.includes(userRole)) {
      const authorizedPath = ROLE_DEFAULT_PATHS[userRole] || '/login';
      const redirectUrl = new URL(authorizedPath, request.url);
      redirectUrl.searchParams.set('denied', 'true');
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/manager/:path*',
    '/director/:path*',
    '/ordering/:path*',
    '/supplier/:path*',
    '/driver/:path*',
    '/marshal/:path*',
    '/analyst/:path*',
    '/discovery/:path*',
  ],
};
