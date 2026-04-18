import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 204 });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
