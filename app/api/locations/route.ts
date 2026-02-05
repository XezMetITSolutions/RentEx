import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const locations = await prisma.location.findMany({
            include: {
                _count: {
                    select: {
                        cars: true,
                        homeCars: true,
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch locations' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const location = await prisma.location.create({
            data: {
                name: body.name,
                code: body.code || null,
                address: body.address || null,
                city: body.city || null,
                country: body.country || 'Österreich',
                phone: body.phone || null,
                email: body.email || null,
                latitude: body.latitude,
                longitude: body.longitude,
                openingTime: body.openingTime || null,
                closingTime: body.closingTime || null,
                isOpenSundays: body.isOpenSundays || false,
                status: body.status || 'active',
            }
        });

        return NextResponse.json(location, { status: 201 });
    } catch (error) {
        console.error('Error creating location:', error);
        return NextResponse.json(
            { error: 'Failed to create location' },
            { status: 500 }
        );
    }
}
