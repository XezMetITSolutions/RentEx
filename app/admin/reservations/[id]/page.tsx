import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
    Calendar,
    User,
    Car,
    MapPin,
    CreditCard,
    Clock,
    FileText,
    ArrowLeft,
    AlertCircle,
    Receipt
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { updatePaymentStatus } from '@/app/actions/rental-updates';
import RentalActionsClient from '@/components/admin/RentalActionsClient';

export const dynamic = 'force-dynamic';

async function getRental(id: number) {
    if (!id || isNaN(id)) return null;
    const rental = await prisma.rental.findUnique({
        where: { id },
        include: {
            car: {
                include: {
                    currentLocation: true,
                    homeLocation: true
                }
            },
            customer: true,
            pickupLocation: true,
            returnLocation: true,
            payments: true,
            damageRecords: true
        }
    });
    return rental;
}

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const rentalId = parseInt(resolvedParams.id);
    const rental = await getRental(rentalId);

    if (!rental) {
        notFound();
    }

    const start = new Date(rental.startDate);
    const end = new Date(rental.endDate);

    const statusColors = {
        'Pending': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        'Active': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        'Completed': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        'Cancelled': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
    };

    const paymentStatusColors = {
        'Pending': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        'Partial': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'Paid': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'Refunded': 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 pb-20">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <Link href="/admin/reservations" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                Buchung #{rental.id.toString().padStart(4, '0')}
                            </h1>
                            <span className={clsx(
                                "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                statusColors[rental.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"
                            )}>
                                {rental.status === 'Pending' && 'Ausstehend'}
                                {rental.status === 'Active' && 'Aktiv'}
                                {rental.status === 'Completed' && 'Abgeschlossen'}
                                {rental.status === 'Cancelled' && 'Storniert'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Erstellt am {format(new Date(rental.createdAt), 'dd. MMMM yyyy HH:mm', { locale: de })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <RentalActionsClient rental={rental} />
                </div>
            </div>

            {/* Split Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details (Whitespace optimized) */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Customer & Car Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                Kunde
                            </h2>
                            <div className="space-y-1">
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {rental.customer.firstName} {rental.customer.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{rental.customer.email}</p>
                                <p className="text-sm text-gray-500">{rental.customer.phone}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {rental.customer.address}, {rental.customer.postalCode} {rental.customer.city}
                                </p>
                                {rental.customer.company && (
                                    <p className="text-xs font-semibold text-red-650 bg-red-500/10 border border-red-500/10 px-2 py-0.5 rounded inline-block mt-2">
                                        🏢 {rental.customer.company} {rental.customer.taxId && `(${rental.customer.taxId})`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Car Info */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
                                <Car className="w-4 h-4 text-gray-400" />
                                Fahrzeug
                            </h2>
                            <div className="space-y-1.5">
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {rental.car.brand} {rental.car.model}
                                </p>
                                <span className="inline-block font-mono text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-650 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
                                    {rental.car.plate}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">{rental.car.category}</p>
                                <p className="text-xs text-gray-400 font-medium">
                                    Tagespreis: {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.dailyRate))}
                                </p>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* Rental Period & Locations */}
                    <div className="space-y-6">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Zeitraum & Standorte
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Abholung</span>
                                <p className="text-md font-medium text-gray-900 dark:text-white">
                                    {format(start, 'dd.MM.yyyy HH:mm', { locale: de })}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    {rental.pickupLocation?.name || 'Hauptstandort'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rückgabe</span>
                                <p className="text-md font-medium text-gray-900 dark:text-white">
                                    {format(end, 'dd.MM.yyyy HH:mm', { locale: de })}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    {rental.returnLocation?.name || 'Hauptstandort'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between items-center text-xs text-gray-400">
                            <p>Gesamtdauer: <span className="font-semibold text-gray-900 dark:text-white">{rental.totalDays} Tage</span></p>
                            {rental.contractNumber && (
                                <p>Vertragsnummer: <span className="font-mono text-gray-900 dark:text-white">{rental.contractNumber}</span></p>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* Extras & Insurance */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            Optionen & Versicherung
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-850">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Haftungsbeschränkung</span>
                                <p className="font-medium text-gray-950 dark:text-white mt-1">{rental.insuranceType || 'Basis-Schutz'}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Kosten: {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.insuranceCost || 0))}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-850">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Zusatzleistungen</span>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {rental.hasGPS && <span className="px-2 py-0.5 bg-white dark:bg-gray-900 rounded text-[10px] font-medium border border-gray-250 dark:border-gray-800 text-gray-650">GPS</span>}
                                    {rental.hasChildSeat && <span className="px-2 py-0.5 bg-white dark:bg-gray-900 rounded text-[10px] font-medium border border-gray-250 dark:border-gray-800 text-gray-650">Kindersitz</span>}
                                    {rental.hasSkiRack && <span className="px-2 py-0.5 bg-white dark:bg-gray-900 rounded text-[10px] font-medium border border-gray-250 dark:border-gray-800 text-gray-650">Skiträger</span>}
                                    {!rental.hasGPS && !rental.hasChildSeat && !rental.hasSkiRack && <p className="text-xs text-gray-500 italic">Keine Extras gewählt</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing Table & Actions (Subtle & clean) */}
                <div className="space-y-8">
                    {/* Minimalist Price Summary */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                            <Receipt className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-semibold text-gray-950 dark:text-white">Abrechnung</h3>
                        </div>
                        <div className="space-y-3.5 text-xs">
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                <span>Miete ({rental.totalDays} Tage)</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.dailyRate) * rental.totalDays)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                <span>Versicherung</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.insuranceCost || 0))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                <span>Extras</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.extrasCost || 0))}
                                </span>
                            </div>
                            {rental.discountAmount && Number(rental.discountAmount) > 0 && (
                                <div className="flex justify-between items-center text-emerald-600 font-medium">
                                    <span>Rabatt ({rental.discountReason})</span>
                                    <span>-{new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.discountAmount))}</span>
                                </div>
                            )}
                            <div className="pt-3.5 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end">
                                <span className="font-bold text-gray-950 dark:text-white">Gesamtbetrag</span>
                                <span className="text-xl font-bold text-red-600 dark:text-red-500">
                                    {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status (Spacious layout) */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-white">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                Zahlung status
                            </div>
                            <span className={clsx(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                paymentStatusColors[rental.paymentStatus as keyof typeof paymentStatusColors] || "bg-gray-100 text-gray-800 border-gray-200"
                            )}>
                                {rental.paymentStatus === 'Pending' && 'Ausstehend'}
                                {rental.paymentStatus === 'Partial' && 'Teilweise'}
                                {rental.paymentStatus === 'Paid' && 'Bezahlt'}
                                {rental.paymentStatus === 'Refunded' && 'Rückerstattet'}
                            </span>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="flex justify-between text-gray-550 py-1">
                                <span>Methode</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{rental.paymentMethod || 'Nicht festgelegt'}</span>
                            </div>

                            {rental.stripeSessionId && (
                                <div className="text-[10px] text-blue-600 dark:text-blue-400 break-all p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/20 rounded-lg font-mono">
                                    <p className="font-bold mb-1 uppercase tracking-wide text-[9px] text-gray-400">Stripe ID</p>
                                    {rental.stripeSessionId}
                                </div>
                            )}

                            {rental.paymentStatus !== 'Paid' && (
                                <div className="flex gap-2 pt-2">
                                    <form action={updatePaymentStatus.bind(null, rental.id, 'Paid')} className="flex-1">
                                        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-semibold transition-all">
                                            Bezahlt
                                        </button>
                                    </form>
                                    <form action={updatePaymentStatus.bind(null, rental.id, 'Pending')} className="flex-1">
                                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 py-2 rounded-lg text-xs font-semibold transition-all border border-transparent dark:border-gray-700">
                                            Ausstehend
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Admin Note */}
                    <div className="bg-amber-500/5 dark:bg-amber-500/5 p-6 rounded-xl border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4" />
                            Admin Notiz
                        </div>
                        <textarea
                            className="w-full bg-white/50 dark:bg-zinc-950 border border-amber-500/20 rounded-lg p-2.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500 h-20 resize-none"
                            placeholder="Interne Notiz hinzufügen..."
                            defaultValue={rental.notes || ''}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
