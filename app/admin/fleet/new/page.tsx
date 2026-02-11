import prisma from '@/lib/prisma';
import NewCarForm from './NewCarForm';

async function getAllOptions() {
    return prisma.option.findMany({
        where: { status: 'active' },
        orderBy: { name: 'asc' }
    });
}

export default async function NewCarPage() {
    const allOptions = await getAllOptions();
    // Convert Decimal to Number for client component
    const plainOptions = JSON.parse(JSON.stringify(allOptions));

    return <NewCarForm allOptions={plainOptions} />;
}
