import prisma from '../lib/prisma';
import { hashPassword } from '../lib/auth';

async function fixPasswords() {
  const password = 'password123';
  const hashed = hashPassword(password);
  
  console.log(`Setting password to "${password}" for all customers...`);
  
  const customers = await prisma.customer.findMany();
  for (const c of customers) {
    await prisma.customer.update({
      where: { id: c.id },
      data: { passwordHash: hashed }
    });
    console.log(`Updated ${c.email}`);
  }
}

fixPasswords()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
