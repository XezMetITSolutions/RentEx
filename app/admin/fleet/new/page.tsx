import prisma from '@/lib/prisma';
import { getCarCategories } from '@/app/actions';
import NewCarForm from './NewCarForm';

async function getData() {
    const [options, groups, categories] = await Promise.all([
        prisma.option.findMany({
            where: { status: 'active' },
            orderBy: { name: 'asc' }
        }),
        prisma.optionGroup.findMany({
            orderBy: { name: 'asc' }
        }),
        getCarCategories()
    ]);
    return { options, groups, categories };
}

export default async function NewCarPage() {
    const { options, groups, categories } = await getData();

    const plainOptions = JSON.parse(JSON.stringify(options));
    const plainGroups = JSON.parse(JSON.stringify(groups));
    const plainCategories = JSON.parse(JSON.stringify(categories));

    return <NewCarForm allOptions={plainOptions} groups={plainGroups} categories={plainCategories} />;
}
