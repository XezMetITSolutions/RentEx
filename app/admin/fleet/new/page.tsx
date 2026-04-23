import prisma from '@/lib/prisma';
import { getCarCategories } from '@/app/actions';
import NewCarForm from './NewCarForm';

async function getData() {
    const [options, groups, categories, locations] = await Promise.all([
        prisma.option.findMany({
            where: { status: 'active' },
            orderBy: { name: 'asc' }
        }),
        prisma.optionGroup.findMany({
            orderBy: { name: 'asc' }
        }),
        getCarCategories(),
        prisma.location.findMany({
            orderBy: { name: 'asc' }
        })
    ]);
    return { options, groups, categories, locations };
}

export default async function NewCarPage() {
    const { options, groups, categories, locations } = await getData();

    const plainOptions = JSON.parse(JSON.stringify(options));
    const plainGroups = JSON.parse(JSON.stringify(groups));
    const plainCategories = JSON.parse(JSON.stringify(categories));
    const plainLocations = JSON.parse(JSON.stringify(locations));

    return <NewCarForm 
        allOptions={plainOptions} 
        groups={plainGroups} 
        categories={plainCategories} 
        locations={plainLocations} 
    />;
}
