import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import CustomerSelfCheckInForm from './CustomerSelfCheckInForm';

export const dynamic = 'force-dynamic';

export default async function CustomerSelfCheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const rentalId = parseInt(resolvedParams.id, 10);
  if (isNaN(rentalId)) notFound();

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: {
      car: true,
      customer: true,
    },
  });

  if (!rental) notFound();

  const serializedRental = {
    id: rental.id,
    contractNumber: rental.contractNumber,
    status: rental.status,
    car: {
      brand: rental.car.brand,
      model: rental.car.model,
      plate: rental.car.plate,
      currentMileage: rental.car.currentMileage,
      imageUrl: rental.car.imageUrl,
    },
    customer: {
      firstName: rental.customer.firstName,
      lastName: rental.customer.lastName,
      email: rental.customer.email,
    },
  };

  return (
    <div className="min-h-screen bg-hm-paper text-hm-ink selection:bg-hm-accent/25">
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <CustomerSelfCheckInForm rental={serializedRental} />
      </main>
      <Footer />
    </div>
  );
}
