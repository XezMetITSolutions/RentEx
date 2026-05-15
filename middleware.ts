import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiting (per edge instance)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const { pathname } = request.nextUrl;

    // --- RATE LIMITING ---
    if (pathname.startsWith('/api/') || pathname === '/admin/login') {
        const now = Date.now();
        const limitInfo = rateLimitMap.get(ip) || { count: 0, lastReset: now };
        
        // Reset every 60 seconds
        if (now - limitInfo.lastReset > 60000) {
            limitInfo.count = 0;
            limitInfo.lastReset = now;
        }

        limitInfo.count++;
        rateLimitMap.set(ip, limitInfo);

        const limit = (pathname === '/admin/login' || pathname.startsWith('/api/mobile/auth/')) ? 10 : 100;
        
        if (limitInfo.count > limit) {
            console.warn(`[Security] Rate limit exceeded for IP ${ip} on ${pathname}`);
            return new NextResponse(JSON.stringify({ error: 'Zu viele Anfragen. Bitte warten Sie eine Minute.' }), { 
                status: 429, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }
    }

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

    // 1. Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // 2. CSRF / Origin Protection for state-changing requests
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (stateChangingMethods.includes(request.method)) {
        const referer = request.headers.get('referer');
        const host = request.headers.get('host');
        
        // Simple referer check: if referer exists, it must match our host
        if (referer && host) {
            const refererHost = new URL(referer).host;
            if (refererHost !== host && !allowedOrigins.some(ao => ao.includes(refererHost))) {
                console.warn(`[Security] CSRF Blocked: Referer ${refererHost} does not match Host ${host}`);
                return new NextResponse(JSON.stringify({ error: 'Invalid origin' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
            }
        }
    }

    if (pathname.startsWith('/api/')) {
        response.headers.set('Access-Control-Allow-Origin', corsOrigin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Vary', 'Origin');
    }

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
