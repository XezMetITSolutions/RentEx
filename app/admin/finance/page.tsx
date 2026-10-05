import prisma from '@/lib/prisma';
import FinanceView from '@/components/admin/FinanceView';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
    // 1. Fetch rentals with customer and car info
    const [rentals, maintenanceRecords] = await Promise.all([
        prisma.rental.findMany({
            where: {
                status: { not: 'Cancelled' }
            },
            select: {
                id: true,
                contractNumber: true,
                totalAmount: true,
                status: true,
                paymentStatus: true,
                startDate: true,
                endDate: true,
                createdAt: true,
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                car: {
                    select: {
                        brand: true,
                        model: true,
                        plate: true
                    }
                },
                payments: {
                    select: {
                        paymentMethod: true,
                        amount: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.maintenanceRecord.findMany({
            select: {
                cost: true,
                performedDate: true,
                createdAt: true
            }
        })
    ]);

    // 2. Revenue calculations
    const paidRentals = rentals.filter(r => r.paymentStatus === 'Paid');
    const totalRevenue = paidRentals.reduce((sum, r) => sum + Number(r.totalAmount), 0);

    const pendingRevenue = rentals
        .filter(r => r.paymentStatus === 'Pending' || r.paymentStatus === 'Partial')
        .reduce((sum, r) => sum + Number(r.totalAmount), 0);

    const averageRentalValue = paidRentals.length > 0
        ? totalRevenue / paidRentals.length
        : 0;

    // Austrian USt (20% standard rate for car rental)
    const netRevenue = Math.round((totalRevenue / 1.2) * 100) / 100;
    const vatAmount = Math.round((totalRevenue - netRevenue) * 100) / 100;

    // 3. Maintenance Expenses
    const totalExpenses = maintenanceRecords.reduce((sum, m) => sum + Number(m.cost || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

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

    // 6. Recent Transactions serialization
    const transactions = rentals.slice(0, 30).map(r => ({
        id: r.id,
        contractNumber: r.contractNumber || String(r.id),
        customerName: `${r.customer.firstName} ${r.customer.lastName}`,
        customerEmail: r.customer.email,
        carName: `${r.car.brand} ${r.car.model}`,
        plate: r.car.plate,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate.toISOString(),
        createdAt: r.createdAt.toISOString(),
        totalAmount: Number(r.totalAmount),
        paymentStatus: r.paymentStatus,
        status: r.status,
        paymentMethod: r.payments?.[0]?.paymentMethod || 'Stripe / Karte'
    }));

    const stats = {
        totalRevenue,
        netRevenue,
        vatAmount,
        pendingRevenue,
        totalExpenses,
        netProfit,
        monthlyRevenue,
        averageRentalValue,
        growth: Number(growth.toFixed(1)),
        transactions
    };

    return <FinanceView stats={stats} />;
}
