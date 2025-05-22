// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Allow access to auth routes
      if (req.nextUrl.pathname.startsWith('/api/auth')) {
        return true;
      }

      if (req.nextUrl.pathname.startsWith('/super-admin')) {
        return token?.role === 'SUPER_ADMIN';
      }
      
      return !!token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
});

export const config = { 
  matcher: [
    '/super-admin/:path*',
    // Add other protected paths here
  ] 
};