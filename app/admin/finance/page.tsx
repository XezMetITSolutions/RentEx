import prisma from '@/lib/prisma';
import FinanceView from '@/components/admin/FinanceView';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
    // Fetch rental data
    const rentals = await prisma.rental.findMany({
        where: {
            status: { not: 'Cancelled' }
        },
        select: {
            totalAmount: true,
            status: true,
            paymentStatus: true,
            startDate: true
        }
    });

    // 1. Total Revenue (Paid)
    const totalRevenue = rentals
        .filter(r => r.paymentStatus === 'Paid')
        .reduce((sum, r) => sum + Number(r.totalAmount), 0);

    // 2. Pending Revenue (Active or Pending payment)
    const pendingRevenue = rentals
        .filter(r => r.paymentStatus === 'Pending' || r.paymentStatus === 'Partial')
        .reduce((sum, r) => sum + Number(r.totalAmount), 0);

    // 3. Average Rental Value
    const paidRentalsCount = rentals.filter(r => r.paymentStatus === 'Paid').length;
    const averageRentalValue = paidRentalsCount > 0
        ? totalRevenue / paidRentalsCount
        : 0;

    // 4. Monthly Revenue (Last 6 months)
    const monthlyRevenue = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = subMonths(today, i);
        const monthName = format(date, 'MMM', { locale: de });
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        const monthTotal = rentals
            .filter(r => {
                const rDate = new Date(r.startDate);
                return rDate >= start && rDate <= end && r.paymentStatus === 'Paid';
            })
            .reduce((sum, r) => sum + Number(r.totalAmount), 0);

        monthlyRevenue.push({
            month: monthName,
            amount: monthTotal
        });
    }

    // 5. Growth Calculation (Current Month vs Last Month)
    const currentMonthAmount = monthlyRevenue[5].amount;
    const lastMonthAmount = monthlyRevenue[4].amount;

    let growth = 0;
    if (lastMonthAmount > 0) {
        growth = ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100;
    } else if (currentMonthAmount > 0) {
        growth = 100;
    }

    const stats = {
        totalRevenue,
        pendingRevenue,
        monthlyRevenue,
        averageRentalValue,
        growth: Number(growth.toFixed(1))
    };

    return <FinanceView stats={stats} />;
}
