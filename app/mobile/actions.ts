'use server';

import { isCarAvailable } from '@/lib/availability';

export async function checkMobileCarAvailability(carId: number, startDateStr: string, endDateStr: string) {
  try {
    return await isCarAvailable(carId, new Date(startDateStr), new Date(endDateStr));
  } catch (err) {
    console.error('Error checking availability:', err);
    return false; // Fail safe
  }
}
