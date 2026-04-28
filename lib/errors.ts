import { NextResponse } from 'next/server';

export interface ApiError {
    error: string;
    code?: string;
    details?: Record<string, any>;
}

export class ApiErrorHandler {
    static badRequest(message: string, code?: string): NextResponse<ApiError> {
        return NextResponse.json(
            { error: message, code },
            { status: 400 }
        );
    }

    static unauthorized(message: string = 'Nicht autorisiert'): NextResponse<ApiError> {
        return NextResponse.json(
            { error: message, code: 'UNAUTHORIZED' },
            { status: 401 }
        );
    }

    static forbidden(message: string = 'Zugriff verweigert'): NextResponse<ApiError> {
        return NextResponse.json(
            { error: message, code: 'FORBIDDEN' },
            { status: 403 }
        );
    }

    static notFound(message: string = 'Nicht gefunden'): NextResponse<ApiError> {
        return NextResponse.json(
            { error: message, code: 'NOT_FOUND' },
            { status: 404 }
        );
    }

    static conflict(message: string, code?: string): NextResponse<ApiError> {
        return NextResponse.json(
            { error: message, code },
            { status: 409 }
        );
    }

    static serverError(message: string = 'Serverfehler'): NextResponse<ApiError> {
        return NextResponse.json(
            { error: message, code: 'SERVER_ERROR' },
            { status: 500 }
        );
    }

    static json<T>(data: T, status: number = 200): NextResponse<T> {
        return NextResponse.json(data, { status });
    }
}
