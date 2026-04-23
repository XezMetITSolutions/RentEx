import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    if (request.method === 'OPTIONS') {
        const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://rent-ex.at';
        const origin = request.headers.get('origin') || '';
        const response = new NextResponse(null, { status: 204 });
        if (origin === allowedOrigin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
        }
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Vary', 'Origin');
        return response;
    }

    const { pathname } = request.nextUrl;
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

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
};
