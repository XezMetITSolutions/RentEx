import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin') || '';
    console.log(`[Middleware] Request from Origin: ${origin}, Path: ${request.nextUrl.pathname}, Method: ${request.method}`);

    const allowedOrigins = [
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:3000',
        'http://localhost:19000',
        'http://localhost:19006',
        'https://rentex.at',
        'https://rent-ex.vercel.app'
    ];

    const isAllowedOrigin = allowedOrigins.includes(origin) || origin.includes('localhost:');
    const corsOrigin = isAllowedOrigin ? origin : allowedOrigins[0];

    if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 204 });
        
        response.headers.set('Access-Control-Allow-Origin', corsOrigin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Vary', 'Origin');
        
        return response;
    }

    const { pathname } = request.nextUrl;
    let response = NextResponse.next();

    if (pathname.startsWith('/api/')) {
        response.headers.set('Access-Control-Allow-Origin', corsOrigin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
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
