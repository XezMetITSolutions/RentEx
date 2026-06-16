'use server';

import prisma from '@/lib/prisma';

export async function checkMobileCarAvailability(carId: number, startDateStr: string, endDateStr: string) {
  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const conflictingRentals = await prisma.rental.findMany({
      where: {
        carId,
        status: { in: ['Active', 'Pending', 'Confirmed'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate }
          }
        ]
      }
    });

    return conflictingRentals.length === 0;
  } catch (err) {
    console.error('Error checking availability:', err);
    return false; // Fail safe
  }
}
