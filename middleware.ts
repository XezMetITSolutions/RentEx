import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin') || '';
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://rentex.at';
    
    // Check if the origin is allowed
    const isAllowedOrigin = origin === allowedOrigin || 
                           origin === 'http://localhost:8081' || 
                           origin === 'http://localhost:19006' || // Older Expo Web
                           origin === 'http://localhost:19000'; // Expo Go Web

    if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 204 });
        if (isAllowedOrigin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
        } else if (process.env.NODE_ENV === 'development') {
            response.headers.set('Access-Control-Allow-Origin', '*');
        }
        
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Vary', 'Origin');
        return response;
    }

    const { pathname } = request.nextUrl;
    let response = NextResponse.next();

    // Add CORS headers to API routes
    if (pathname.startsWith('/api/')) {
        if (isAllowedOrigin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
        } else if (process.env.NODE_ENV === 'development') {
            response.headers.set('Access-Control-Allow-Origin', '*');
        }
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Vary', 'Origin');
    }

    const cookie = request.cookies.get('rentex_customer')?.value;

    if (pathname.startsWith('/dashboard')) {
        if (!request.cookies.get('rentex_customer')?.value) {
            const login = new URL('/login', request.url);
            login.searchParams.set('from', pathname);
            return NextResponse.redirect(login);
        }
    }

    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!request.cookies.get('rentex_admin_session')?.value) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
};
