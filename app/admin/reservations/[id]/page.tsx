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
    CheckCircle,
    XCircle,
    AlertCircle,
    Receipt,
    PenTool
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { updateRentalStatus, updatePaymentStatus } from '@/app/actions/rental-updates';

export const dynamic = 'force-dynamic';

async function getRental(id: number) {
    if (!id || isNaN(id)) return null;
    const rental = await prisma.rental.findUnique({
        where: { id },
        include: {
            car: true,
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
        'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Active': 'bg-blue-100 text-blue-800 border-blue-200',
        'Completed': 'bg-green-100 text-green-800 border-green-200',
        'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };

    const paymentStatusColors = {
        'Pending': 'bg-gray-100 text-gray-800',
        'Partial': 'bg-amber-100 text-amber-800',
        'Paid': 'bg-green-100 text-green-800',
        'Refunded': 'bg-purple-100 text-purple-800'
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <Link href="/admin/reservations" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservierung #{rental.id.toString().padStart(4, '0')}</h1>
                            <span className={clsx(
                                "px-3 py-1 rounded-full text-xs font-bold border",
                                statusColors[rental.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"
                            )}>
                                {rental.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Erstellt am {format(new Date(rental.createdAt), 'dd. MMMM yyyy HH:mm', { locale: de })}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {rental.status === 'Pending' && (
                        <div className="flex gap-2">
                            <Link
                                href={`/admin/reservations/${rental.id}/check-in`}
                                className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-zinc-900/10"
                            >
                                <PenTool className="w-4 h-4" />
                                Digitaler Check-In
                            </Link>
                            <form action={updateRentalStatus.bind(null, rental.id, 'Active')}>
                                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                                    <CheckCircle className="w-4 h-4" />
                                    Direkt Aktivieren
                                </button>
                            </form>
                        </div>
                    )}
                    {rental.status === 'Active' && (
                        <form action={updateRentalStatus.bind(null, rental.id, 'Completed')}>
                            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                                <CheckCircle className="w-4 h-4" />
                                Abschließen
                            </button>
                        </form>
                    )}
                    {rental.status !== 'Cancelled' && rental.status !== 'Completed' && (
                        <form action={updateRentalStatus.bind(null, rental.id, 'Cancelled')}>
                            <button className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                                <XCircle className="w-4 h-4" />
                                Stornieren
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer & Car Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-bold">
                                <User className="w-5 h-5 text-blue-500" />
                                Kunde
                            </div>
                            <div className="space-y-3">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{rental.customer.firstName} {rental.customer.lastName}</p>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">{rental.customer.email}</p>
                                    <p className="text-sm text-gray-500">{rental.customer.phone}</p>
                                    <p className="text-sm text-gray-500">
                                        {rental.customer.address}, {rental.customer.postalCode} {rental.customer.city}
                                    </p>
                                    {rental.customer.company && (
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">
                                            🏢 {rental.customer.company} {rental.customer.taxId && `(${rental.customer.taxId})`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Car */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-bold">
                                <Car className="w-5 h-5 text-blue-500" />
                                Fahrzeug
                            </div>
                            <div className="space-y-3">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{rental.car.brand} {rental.car.model}</p>
                                <div className="space-y-1">
                                    <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded inline-block">
                                        {rental.car.plate}
                                    </p>
                                    <p className="text-sm text-gray-500">{rental.car.category}</p>
                                    <p className="text-sm text-gray-500">Mietpreis: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.dailyRate))}/Tag</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rental Period & Locations */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white font-bold">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Mietzeitraum & Standorte
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <Calendar className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Abholung</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{format(start, 'dd.MM.yyyy HH:mm', { locale: de })}</p>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {rental.pickupLocation?.name || 'Hauptstandort'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <Calendar className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Rückgabe</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{format(end, 'dd.MM.yyyy HH:mm', { locale: de })}</p>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {rental.returnLocation?.name || 'Hauptstandort'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                            <p className="text-sm text-gray-500">Gesamtdauer: <span className="font-bold text-gray-900 dark:text-white">{rental.totalDays} Tage</span></p>
                            {rental.contractNumber && (
                                <p className="text-sm text-gray-500">Vertrag: <span className="font-mono">{rental.contractNumber}</span></p>
                            )}
                        </div>
                    </div>

                    {/* Extras & Insurance */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white font-bold">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Versicherung & Extras
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Versicherung</p>
                                <p className="font-bold text-gray-900 dark:text-white">{rental.insuranceType || 'Basis-Schutz'}</p>
                                <p className="text-sm text-gray-500 mt-1">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.insuranceCost || 0))} Kosten</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Zusatzleistungen</p>
                                <div className="flex flex-wrap gap-2">
                                    {rental.hasGPS && <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs border border-gray-100">GPS</span>}
                                    {rental.hasChildSeat && <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs border border-gray-100">Kindersitz</span>}
                                    {rental.hasSkiRack && <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs border border-gray-100">Skiträger</span>}
                                    {!rental.hasGPS && !rental.hasChildSeat && !rental.hasSkiRack && <p className="text-sm text-gray-500">Keine Extras gewählt</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Financials */}
                <div className="space-y-6">
                    {/* Price Summary */}
                    <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl shadow-blue-500/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Receipt className="w-24 h-24" />
                        </div>
                        <h3 className="text-lg font-bold mb-6 relative z-10 text-blue-400">Preisaufschlüsselung</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Miete ({rental.totalDays} Tage)</span>
                                <span>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.dailyRate) * rental.totalDays)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Versicherung</span>
                                <span>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.insuranceCost || 0))}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Extras</span>
                                <span>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.extrasCost || 0))}</span>
                            </div>
                            {rental.discountAmount && Number(rental.discountAmount) > 0 && (
                                <div className="flex justify-between items-center text-sm text-green-400">
                                    <span>Rabatt ({rental.discountReason})</span>
                                    <span>-{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.discountAmount))}</span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <span className="font-bold">Gesamtbetrag</span>
                                <span className="text-2xl font-black text-blue-400">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                <CreditCard className="w-5 h-5 text-blue-500" />
                                Zahlung
                            </div>
                            <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold", paymentStatusColors[rental.paymentStatus as keyof typeof paymentStatusColors] || "bg-gray-100 text-gray-800")}>
                                {rental.paymentStatus}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm py-2 border-b border-gray-50 dark:border-gray-700">
                                <span className="text-gray-500">Methode</span>
                                <span className="font-medium text-gray-900 dark:text-white">{rental.paymentMethod || 'Nicht festgelegt'}</span>
                            </div>

                            {rental.stripeSessionId && (
                                <div className="text-xs text-blue-600 dark:text-blue-400 break-all p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="font-bold mb-1">Stripe Session ID:</p>
                                    {rental.stripeSessionId}
                                </div>
                            )}

                            {rental.paymentStatus !== 'Paid' && (
                                <div className="flex gap-2 mt-4">
                                    <form action={updatePaymentStatus.bind(null, rental.id, 'Paid')} className="flex-1">
                                        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-bold transition-all">
                                            Als bezahlt markieren
                                        </button>
                                    </form>
                                    <form action={updatePaymentStatus.bind(null, rental.id, 'Pending')} className="flex-1">
                                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold transition-all">
                                            Ausstehend
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Admin Note */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-400 font-bold">
                            <AlertCircle className="w-5 h-5" />
                            Admin Notiz
                        </div>
                        <textarea
                            className="w-full bg-white/50 dark:bg-black/20 border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="Interne Notiz hinzufügen..."
                            defaultValue={rental.notes || ''}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
