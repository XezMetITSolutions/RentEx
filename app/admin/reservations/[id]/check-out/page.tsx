import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CheckOutReturnForm from '@/components/admin/CheckOutReturnForm';

export const dynamic = 'force-dynamic';

async function getRental(id: number) {
    return await prisma.rental.findUnique({
        where: { id },
        include: {
            car: true,
            customer: true,
            pickupLocation: true,
            returnLocation: true,
        }
    });
}

export default async function AdminCheckOutPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const rentalId = parseInt(resolvedParams.id, 10);
    if (isNaN(rentalId)) notFound();

    const rental = await getRental(rentalId);
    if (!rental) notFound();

    return (
        <div className="min-h-screen bg-gray-50/50 pt-6 px-4">
            <CheckOutReturnForm rental={rental} />
        </div>
    );
}
