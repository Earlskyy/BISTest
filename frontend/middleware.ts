import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/', '/login', '/certificate-request', '/file-complaint', '/certificate-status'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api');

  // Protected routes
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/staff/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
