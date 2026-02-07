
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // VW Golf Kombi
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Golf Kombi' },
        },
        data: {
            imageUrl: '/assets/cars/vw_golf_kombi.jpg',
        },
    });

    // VW Polo
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Polo' },
        },
        data: {
            imageUrl: 'https://images.unsplash.com/photo-1591112611240-540af4ee74db?auto=format&fit=crop&q=80&w=800',
        },
    });

    // Fiat Ducato (All variants)
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Ducato' },
        },
        data: {
            imageUrl: '/assets/cars/fiat_ducato.png',
        },
    });

    // Skoda Superb Kombi
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Superb Kombi' },
        },
        data: {
            imageUrl: '/assets/cars/skoda_superb.png',
        },
    });

    // Ford Transit Custom
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Transit Custom' },
        },
        data: {
            imageUrl: '/assets/cars/ford_transit.png',
        },
    });

    // Hyundai Ioniq
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Ioniq' },
        },
        data: {
            imageUrl: 'https://images.unsplash.com/photo-1609529669235-c07e4e1bd6e9?auto=format&fit=crop&q=80&w=800',
        },
    });

    // Ford Mustang Mach-E
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Mustang' },
        },
        data: {
            imageUrl: 'https://images.unsplash.com/photo-1570733577530-363675629c41?auto=format&fit=crop&q=80&w=800',
        },
    });

    // Seat Leon
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Leon' },
        },
        data: {
            imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=800',
        },
    });

    // Skoda Octavia
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Oktavia' },
        },
        data: {
            imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ebcc3?auto=format&fit=crop&q=80&w=800',
        },
    });

    // Seat Ibiza
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Ibiza' },
        },
        data: {
            imageUrl: 'https://images.unsplash.com/photo-1591112611240-540af4ee74db?auto=format&fit=crop&q=80&w=800',
        },
    });

    // Peugeot Traveller
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Traveller' },
        },
        data: {
            imageUrl: '/assets/cars/peugeot_traveller.jpg',
        },
    });

    console.log('Car images updated successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
