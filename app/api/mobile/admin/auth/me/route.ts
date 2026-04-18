import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthStaff } from '@/lib/mobileAuth';

export async function GET(req: NextRequest) {
  const auth = getAuthStaff(req);
  if (!auth) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }
  const staff = await prisma.staff.findUnique({
    where: { id: auth.id },
    include: { location: true },
  });
  if (!staff || !staff.isActive) {
    return NextResponse.json({ error: 'Konto deaktiviert.' }, { status: 401 });
  }
  return NextResponse.json({
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    locationId: staff.locationId,
    locationName: staff.location?.name ?? null,
  });
}
