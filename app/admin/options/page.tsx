import prisma from '@/lib/prisma';
import OptionsManager from '@/components/admin/OptionsManager';

export const dynamic = 'force-dynamic';

async function getData() {
    const [options, groups] = await Promise.all([
        prisma.option.findMany({
            where: { carId: null }, // Only global templates
            orderBy: { createdAt: 'desc' },
            include: { group: true }
        }),
        prisma.optionGroup.findMany({
            orderBy: { name: 'asc' }
        })
    ]);
    return { options, groups };
}

export default async function AdminOptionsPage() {
    const { options, groups } = await getData();

    // Convert Decimal to Number for client component
    const plainOptions = JSON.parse(JSON.stringify(options));
    const plainGroups = JSON.parse(JSON.stringify(groups));

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <OptionsManager options={plainOptions} groups={plainGroups} />
        </div>
    );
}
