import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing Invoice table...');
    const invoices = await prisma.invoice.findMany({ take: 1 });
    console.log('Success fetching invoices:', invoices.length);
    
    console.log('Testing Rental table...');
    const rentals = await prisma.rental.findMany({ take: 1 });
    console.log('Success fetching rentals:', rentals.length);
  } catch (error: any) {
    console.error('DATABASE ERROR DETECTED:');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
