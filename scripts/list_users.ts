import prisma from '../lib/prisma';

async function listUsers() {
  console.log('--- CUSTOMERS ---');
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      customerType: true,
      passwordHash: true,
    }
  });
  console.log(customers);

  console.log('\n--- STAFF ---');
  const staff = await prisma.staff.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
    }
  });
  console.log(staff);
}

listUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
