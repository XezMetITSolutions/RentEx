import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import CustomerSelfCheckInForm from './CustomerSelfCheckInForm';
import { getCarTemplateMapping } from '@/lib/carSketches';

export const dynamic = 'force-dynamic';

export default async function CustomerSelfCheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const rentalId = parseInt(resolvedParams.id, 10);
  if (isNaN(rentalId)) notFound();

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: {
      car: {
        include: {
          damageRecords: {
            where: { status: 'open' },
          },
        },
      },
      customer: true,
    },
  });

  if (!rental) notFound();

  // Find sketch template name
  const templateName = rental.car.checkInTemplate || 
    (rental.car.brand.toLowerCase().includes('skoda') && rental.car.model.toLowerCase().includes('octavia') ? 'Skoda Octavia' :
     rental.car.brand.toLowerCase().includes('skoda') && rental.car.model.toLowerCase().includes('superb') ? 'Skodo superb' :
     rental.car.brand.toLowerCase().includes('seat') ? 'Seat Kombi' :
     rental.car.brand.toLowerCase().includes('ford') && rental.car.model.toLowerCase().includes('mustang') ? 'Ford Mustang normal' :
     rental.car.brand.toLowerCase().includes('ducato') ? 'Fiat Ducato' : '');

  const sketchMapping = templateName ? await getCarTemplateMapping(templateName) : {};

  const serializedRental = {
    id: rental.id,
    contractNumber: rental.contractNumber,
    status: rental.status,
    car: {
      id: rental.car.id,
      brand: rental.car.brand,
      model: rental.car.model,
      plate: rental.car.plate,
      currentMileage: rental.car.currentMileage,
      imageUrl: rental.car.imageUrl,
      sketches: sketchMapping,
      existingDamages: (rental.car.damageRecords || []).map((d) => ({
        id: d.id,
        type: d.type,
        description: d.description,
        locationOnCar: d.locationOnCar,
        photoUrl: d.photoUrl,
        x: d.xPosition ?? null,
        y: d.yPosition ?? null,
      })),
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
