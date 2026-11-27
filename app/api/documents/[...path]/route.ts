import { NextRequest, NextResponse } from 'next/server';
import { r2, R2_BUCKET_NAME } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getAdminSession } from '@/lib/adminAuth';
import { getCurrentCustomer } from '@/lib/dashboardAuth';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params;
        const key = pathSegments.join('/');

        // 1. Authorization Check
        const adminSession = await getAdminSession();
        const customer = await getCurrentCustomer();

        let isAuthorized = false;

        if (adminSession) {
            // Admin has access to view customer documents
            isAuthorized = true;
        } else if (customer) {
            // A customer can only access their own document
            // Either by folder convention (customer-docs/{customerId}/...) or if the URL matches customer.licensePhotoUrl
            const fullUrlPath = `/api/documents/${key}`;
            const isOwner = key.startsWith(`customer-docs/${customer.id}/`) || 
                            (customer.licensePhotoUrl && customer.licensePhotoUrl.includes(key));
            
            if (isOwner) {
                isAuthorized = true;
            } else {
                // Also verify against customer database record in case URL formatting differs
                const dbCustomer = await prisma.customer.findUnique({
                    where: { id: customer.id },
                    select: { licensePhotoUrl: true }
                });
                if (dbCustomer?.licensePhotoUrl && dbCustomer.licensePhotoUrl.includes(key)) {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return new NextResponse(JSON.stringify({ error: 'Nicht autorisiert' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. Fetch object from private R2 bucket
        const command = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
        });

        const r2Object = await r2.send(command);

        if (!r2Object.Body) {
            return new NextResponse(JSON.stringify({ error: 'Dokument nicht gefunden' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Convert AWS SDK Stream to web Response
        const stream = r2Object.Body.transformToWebStream();
        const headers = new Headers();
        
        headers.set('Content-Type', r2Object.ContentType || 'application/octet-stream');
        headers.set('Cache-Control', 'private, max-age=3600');
        headers.set('X-Content-Type-Options', 'nosniff');
        
        if (r2Object.ContentLength) {
            headers.set('Content-Length', r2Object.ContentLength.toString());
        }

        return new NextResponse(stream, {
            status: 200,
            headers,
        });
    } catch (error: any) {
        if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
            return new NextResponse(JSON.stringify({ error: 'Dokument nicht gefunden' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        console.error('[Document Proxy Error]', error);
        return new NextResponse(JSON.stringify({ error: 'Interner Serverfehler' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
