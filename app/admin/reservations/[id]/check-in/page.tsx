import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CheckInForm from '@/components/admin/CheckInForm';

export const dynamic = 'force-dynamic';

async function getRental(id: number) {
    return await prisma.rental.findUnique({
        where: { id },
        include: {
            car: true,
            customer: true
        }
    });
}

export default async function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const rentalId = parseInt(resolvedParams.id);
    const rental = await getRental(rentalId);

    if (!rental) {
        notFound();
    }

    // Only allow check-in if status is Pending
    if (rental.status !== 'Pending') {
        // Optionale Logik: Redirect oder Hinweis
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pt-8 px-4">
            <CheckInForm rental={rental} />
        </div>
    );
}
