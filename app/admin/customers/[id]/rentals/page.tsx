import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, Car, Calendar, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { clsx } from 'clsx';

export default async function CustomerRentalsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) },
        include: {
            rentals: {
                orderBy: { createdAt: 'desc' },
                include: { car: true }
            }
        }
    });

    if (!customer) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link 
                    href="/admin/customers"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Miet-Historie: {customer.firstName} {customer.lastName}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Alle vergangenen und aktuellen Vermietungen dieses Kunden
                    </p>
                </div>
            </div>

            {customer.rentals.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Keine Vermietungen</h3>
                    <p className="text-gray-500 dark:text-gray-400">Dieser Kunde hat bisher noch keine Fahrzeuge gemietet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {customer.rentals.map((rental) => {
                        const startDate = format(new Date(rental.startDate), 'dd.MM.yyyy', { locale: de });
                        const endDate = format(new Date(rental.endDate), 'dd.MM.yyyy', { locale: de });
                        
                        return (
                            <Link 
                                key={rental.id}
                                href={`/admin/reservations/${rental.id}`}
                                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                {rental.car.brand} {rental.car.model}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                {rental.car.plate} • Vertr-Nr: {rental.contractNumber || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 md:gap-8">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <div className="text-sm">
                                                <p className="text-gray-900 dark:text-white font-medium">{startDate} - {endDate}</p>
                                                <p className="text-xs text-gray-500">{rental.totalDays} Tage</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                            <div className="text-sm">
                                                <p className="text-gray-900 dark:text-white font-bold">
                                                    {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                                </p>
                                                <p className="text-xs text-gray-500">{rental.paymentStatus === 'Paid' ? 'Bezahlt' : 'Offen'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                rental.status === 'Active' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                                                rental.status === 'Completed' && "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
                                                rental.status === 'Pending' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                                                rental.status === 'Cancelled' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                            )}>
                                                {rental.status === 'Active' ? 'Aktiv' :
                                                 rental.status === 'Completed' ? 'Abgeschlossen' :
                                                 rental.status === 'Pending' ? 'Ausstehend' : 'Storniert'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
