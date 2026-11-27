import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import CustomerSelfCheckInForm from './CustomerSelfCheckInForm';
import { getCarTemplateMapping } from '@/lib/carSketches';
import { verifyCheckInToken } from '@/lib/checkInSecurity';
import { getAdminSession } from '@/lib/adminAuth';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function CustomerSelfCheckInPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
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

  // Security Check: Verify Cryptographic Token OR Staff Session
  const staffSession = await getAdminSession();
  const token = resolvedSearchParams.token;
  const isTokenValid = verifyCheckInToken(token, rental.id, rental.customerId, rental.createdAt);

  if (!staffSession && !isTokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
        <Navbar />
        <main className="pt-32 pb-20 px-4 max-w-lg mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Zugriff verweigert</h1>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Dieser Übergabelink ist ungültig, unvollständig oder abgelaufen. Bitte nutzen Sie den offiziellen Link aus Ihrer Bestätigungs-E-Mail oder wenden Sie sich an unser Büro.
          </p>
          <div className="p-4 bg-white rounded-xl border border-gray-200 text-xs text-gray-500 mb-6 text-left space-y-1">
            <p><strong>Rent-Ex Kundenservice:</strong></p>
            <p>E-Mail: info@rent-ex.at</p>
            <p>Standort: Hauptstraße 1, 6800 Feldkirch</p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Zur Startseite
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if rental is already completed or inactive
  if (rental.status === 'Active' || rental.status === 'Completed') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
        <Navbar />
        <main className="pt-32 pb-20 px-4 max-w-lg mx-auto text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Übergabe bereits abgeschlossen</h1>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Das Übergabeprotokoll für diese Reservierung (<strong>{rental.contractNumber || `#${rental.id}`}</strong>) wurde bereits erfolgreich erfasst und das Fahrzeug aktiviert.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Zur Startseite
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Find sketch template name with smart fallback
  const brand = (rental.car.brand || '').toLowerCase();
  const model = (rental.car.model || '').toLowerCase();

  const templateName = rental.car.checkInTemplate || 
    (brand.includes('skoda') && model.includes('octavia') ? 'Skoda Octavia' :
     brand.includes('skoda') && model.includes('superb') ? 'Skodo superb' :
     brand.includes('seat') && model.includes('ibiza') ? 'Seat Ibiza' :
     brand.includes('seat') ? 'Seat Kombi' :
     brand.includes('ford') && model.includes('mustang') ? 'Ford Mustang normal' :
     brand.includes('ford') ? 'Ford 616' :
     brand.includes('ducato') || model.includes('ducato') ? 'Fiat Ducato' :
     brand.includes('vw') || brand.includes('volkswagen') || model.includes('polo') || model.includes('golf') ? 'Seat Ibiza' :
     'Seat Ibiza');

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
