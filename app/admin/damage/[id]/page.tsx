
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DamageDetail from '@/components/admin/damage/DamageDetail';

async function getDamageRecord(id: number) {
    const record = await prisma.damageRecord.findUnique({
        where: { id },
        include: {
            car: {
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    plate: true,
                    imageUrl: true,
                    checkInTemplate: true,
                }
            },
            rental: {
                select: {
                    id: true,
                    customer: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            }
        }
    });

    if (!record) return null;

    return {
        ...record,
        repairCost: record.repairCost ? Number(record.repairCost) : null,
        reportedDate: record.reportedDate.toISOString(),
    };
}

export default async function DamageDetailPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    if (isNaN(id)) return notFound();

    const record = await getDamageRecord(id);
    if (!record) return notFound();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10">
            <DamageDetail initialRecord={record as any} />
        </div>
    );
}
