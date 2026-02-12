import prisma from '@/lib/prisma';
import NewCarForm from './NewCarForm';

async function getData() {
    const [options, groups] = await Promise.all([
        prisma.option.findMany({
            where: { status: 'active' },
            orderBy: { name: 'asc' }
        }),
        prisma.optionGroup.findMany({
            orderBy: { name: 'asc' }
        })
    ]);
    return { options, groups };
}

export default async function NewCarPage() {
    const { options, groups } = await getData();

    // Convert Decimal to Number for client component
    const plainOptions = JSON.parse(JSON.stringify(options));
    const plainGroups = JSON.parse(JSON.stringify(groups));

    return <NewCarForm allOptions={plainOptions} groups={plainGroups} />;
}
