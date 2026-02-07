import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const cookie = request.cookies.get('rentex_customer')?.value;

    if (pathname.startsWith('/dashboard')) {
        if (!cookie) {
            const login = new URL('/login', request.url);
            login.searchParams.set('from', pathname);
            return NextResponse.redirect(login);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
