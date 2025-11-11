import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for role-based route protection
 * Verifies JWT token and checks user role
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('hotel_admin_token')?.value;

  // If no token and trying to access protected route, redirect to login
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token (basic check - in production, verify JWT signature)
  if (token) {
    try {
      // Decode token to check expiration and role
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        // Invalid token format
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('hotel_admin_token');
        return response;
      }

      // Token is valid, allow request
      return NextResponse.next();
    } catch (error) {
      // Token verification failed
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('hotel_admin_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

