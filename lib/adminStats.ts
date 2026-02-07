import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function getSidebarStats() {
    const today = new Date();
    const startDay = startOfDay(today);
    const endDay = endOfDay(today);

    const [activeRentals, todayRevenueResult, pendingNotifications] = await Promise.all([
        prisma.rental.count({ where: { status: 'Active' } }),
        prisma.rental.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { not: 'Cancelled' },
                startDate: { lte: endDay },
                endDate: { gte: startDay },
            },
        }),
        prisma.notification.count({ where: { status: 'Pending' } }),
    ]);

    const todayRevenue = Number(todayRevenueResult._sum.totalAmount ?? 0);

    return {
        activeRentals,
        todayRevenue,
        pendingNotifications,
    };
}
