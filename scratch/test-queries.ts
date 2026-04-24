import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        console.log("Fetching invoices...");
        const invoices = await prisma.invoice.findMany({
            include: { rental: { include: { car: true, customer: true } } },
            orderBy: { issuedAt: 'desc' },
        });
        console.log(`Found ${invoices.length} invoices`);

        console.log("Fetching rentals without invoice...");
        const withInvoice = await prisma.invoice.findMany({ select: { rentalId: true } });
        const rentalIdsWithInvoice = withInvoice.map((i) => i.rentalId);
        const rentalsWithoutInvoice = await prisma.rental.findMany({
            where: {
                status: { not: 'Cancelled' },
                id: { notIn: rentalIdsWithInvoice },
            },
            include: { car: true, customer: true },
            orderBy: { startDate: 'desc' },
        });
        console.log(`Found ${rentalsWithoutInvoice.length} rentals without invoice`);
        
        process.exit(0);
    } catch (e) {
        console.error("Query failed:", e);
        process.exit(1);
    }
}

test();
