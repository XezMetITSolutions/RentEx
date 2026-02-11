import prisma from '@/lib/prisma';
import OptionsManager from '@/components/admin/OptionsManager';

export const dynamic = 'force-dynamic';

async function getOptions() {
    return prisma.option.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export default async function AdminOptionsPage() {
    const options = await getOptions();

    // Convert Decimal to Number for client component
    const plainOptions = JSON.parse(JSON.stringify(options));

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <OptionsManager options={plainOptions} />
        </div>
    );
}
