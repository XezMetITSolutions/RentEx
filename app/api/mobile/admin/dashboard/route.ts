import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthStaff } from '@/lib/mobileAuth';

export async function GET(req: NextRequest) {
  const staff = getAuthStaff(req);
  if (!staff) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  const [
    totalCars,
    activeCars,
    maintenanceCars,
    activeRentals,
    pendingRentals,
    overdueRentals,
    todayPickups,
    todayReturns,
    monthRentals,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { status: 'Active' } }),
    prisma.car.count({ where: { status: 'Maintenance' } }),
    prisma.rental.count({ where: { status: 'Active' } }),
    prisma.rental.count({ where: { status: 'Pending' } }),
    prisma.rental.count({ where: { isOverdue: true, status: 'Active' } }),
    prisma.rental.count({
      where: {
        startDate: { gte: startOfToday, lt: new Date(startOfToday.getTime() + 86400000) },
        status: { in: ['Pending', 'Confirmed'] },
      },
    }),
    prisma.rental.count({
      where: {
        endDate: { gte: startOfToday, lt: new Date(startOfToday.getTime() + 86400000) },
        status: 'Active',
      },
    }),
    prisma.rental.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { totalAmount: true, status: true },
    }),
  ]);

  const monthRevenue = monthRentals
    .filter((r) => r.status !== 'Cancelled')
    .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

  return NextResponse.json({
    cars: { total: totalCars, active: activeCars, maintenance: maintenanceCars },
    rentals: {
      active: activeRentals,
      pending: pendingRentals,
      overdue: overdueRentals,
      todayPickups,
      todayReturns,
      monthCount: monthRentals.length,
    },
    revenue: {
      month: Math.round(monthRevenue * 100) / 100,
    },
  });
}
