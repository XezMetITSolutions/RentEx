import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatInTimeZone } from 'date-fns-tz';
import { de } from 'date-fns/locale';
import { BUSINESS } from '@/lib/config';
import {
    Calendar,
    User,
    Car,
    MapPin,
    CreditCard,
    Clock,
    FileText,
    ArrowLeft,
    CheckCircle2,
    Receipt,
    PenTool,
    Gauge,
    Droplets,
    ShieldCheck,
    Camera,
    Phone,
    Mail,
    Building2,
    Shield,
    ExternalLink,
    AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { updatePaymentStatus } from '@/app/actions/rental-updates';
import RentalActionsClient from '@/components/admin/RentalActionsClient';
import CheckInLinkShare from '@/components/admin/CheckInLinkShare';
import AustrianPlate from '@/components/ui/AustrianPlate';

export const dynamic = 'force-dynamic';

async function getRental(id: number) {
    if (!id || isNaN(id)) return null;
    return await prisma.rental.findUnique({
        where: { id },
        include: {
            car: {
                include: {
                    currentLocation: true,
                    homeLocation: true,
                },
            },
            customer: true,
            pickupLocation: true,
            returnLocation: true,
            payments: true,
            damageRecords: true,
        },
    });
}

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const rentalId = parseInt(resolvedParams.id, 10);
    const rental = await getRental(rentalId);

    if (!rental) {
        notFound();
    }

    const start = new Date(rental.startDate);
    const end = new Date(rental.endDate);

    const statusBadgeStyles: Record<string, string> = {
        Pending: 'bg-amber-50 text-amber-800 border-amber-200',
        Confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
        Active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        Completed: 'bg-gray-100 text-gray-700 border-gray-200',
        Cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
        NoShow: 'bg-orange-50 text-orange-800 border-orange-200',
    };

    const statusLabels: Record<string, string> = {
        Pending: 'Ausstehend',
        Confirmed: 'Bestätigt',
        Active: 'Laufend (Aktiv)',
        Completed: 'Abgeschlossen',
        Cancelled: 'Storniert',
        NoShow: 'Nicht erschienen',
    };

    const paymentBadgeStyles: Record<string, string> = {
        Pending: 'bg-amber-50 text-amber-800 border-amber-200',
        Partial: 'bg-amber-50 text-amber-800 border-amber-200',
        Paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        Refunded: 'bg-purple-50 text-purple-800 border-purple-200',
    };

    const paymentLabels: Record<string, string> = {
        Pending: 'Zahlung offen',
        Partial: 'Teilweise bezahlt',
        Paid: 'Vollständig bezahlt',
        Refunded: 'Erstattet',
    };

    const paymentMethodGerman: Record<string, string> = {
        arrival: 'Zahlung vor Ort (Bar / Karte)',
        cash: 'Barzahlung vor Ort',
        card: 'Kartenzahlung vor Ort',
        stripe: 'Online (Stripe Kreditkarte)',
        online: 'Online-Zahlung',
        transfer: 'Banküberweisung',
    };

    const paymentMethodDisplay = paymentMethodGerman[rental.paymentMethod?.toLowerCase() || ''] || rental.paymentMethod || 'Vor Ort bei Abholung';

    return (
        <div className="max-w-[1360px] mx-auto space-y-6 pb-20 px-4 sm:px-6">
            
            {/* Header & Status Bar */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex items-start sm:items-center gap-4">
                        <Link
                            href="/admin/reservations"
                            className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors shrink-0"
                            title="Zurück zu allen Reservierungen"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                    Reservierung {rental.contractNumber || `#${rental.id.toString().padStart(4, '0')}`}
                                </h1>
                                <span className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                                    statusBadgeStyles[rental.status] || "bg-gray-100 text-gray-700 border-gray-200"
                                )}>
                                    {statusLabels[rental.status] || rental.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
                                <span>Erstellt am: <strong>{formatInTimeZone(new Date(rental.createdAt), BUSINESS.TIME_ZONE, 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr</strong></span>
                                <span>·</span>
                                <span>Buchungs-ID: <strong>#{rental.id}</strong></span>
                            </p>
                        </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <RentalActionsClient rental={rental} />
                    </div>
                </div>
            </div>

            {/* Main Content Layout: 2 Cols Left + 1 Col Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left (Operational Information) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Customer & Vehicle Snapshot Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Mieter & Fahrer */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <User className="w-4 h-4 text-red-600" /> Mieter & Fahrer
                                    </h3>
                                    <Link
                                        href={`/admin/customers/${rental.customer.id}`}
                                        className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                                    >
                                        Kundenprofil <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-3">
                                    {rental.customer.firstName} {rental.customer.lastName}
                                </h4>
                                <div className="space-y-2.5 text-xs text-gray-600">
                                    <div className="flex items-center gap-2.5">
                                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                        <a href={`mailto:${rental.customer.email}`} className="text-gray-900 hover:underline font-medium">
                                            {rental.customer.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                        <a href={`tel:${rental.customer.phone}`} className="text-gray-900 hover:underline font-medium">
                                            {rental.customer.phone || 'Keine Telefonnummer hinterlegt'}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                        <span>
                                            {[
                                                rental.customer.address,
                                                rental.customer.postalCode,
                                                rental.customer.city !== rental.customer.postalCode ? rental.customer.city : null
                                            ].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                    {rental.customer.company && (
                                        <div className="flex items-center gap-2.5 pt-1 text-gray-900 font-semibold">
                                            <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                                            <span>{rental.customer.company} {rental.customer.taxId && `(${rental.customer.taxId})`}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Flottenfahrzeug */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <Car className="w-4 h-4 text-red-600" /> Zugewiesenes Fahrzeug
                                    </h3>
                                    <Link
                                        href={`/admin/fleet/${rental.car.id}`}
                                        className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                                    >
                                        Flotte öffnen <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">
                                            {rental.car.brand} {rental.car.model}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{rental.car.category || 'Standard'}</p>
                                    </div>
                                    <AustrianPlate plate={rental.car.plate} />
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Tagesmietpreis:</span>
                                    <strong className="text-gray-900 font-bold">€{Number(rental.dailyRate).toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rental Period & Route */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-red-600" /> Mietzeitraum & Übergabestation
                            </h3>
                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                Gesamtdauer: {rental.totalDays} Tag{rental.totalDays > 1 ? 'e' : ''}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Abholung / Übernahme
                                </span>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatInTimeZone(start, BUSINESS.TIME_ZONE, 'dd.MM.yyyy · HH:mm', { locale: de })} Uhr
                                </p>
                                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                                    {rental.pickupLocation?.name || 'Hauptfiliale Feldkirch (Illstraße 75a)'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5 mb-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Rückgabe
                                </span>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatInTimeZone(end, BUSINESS.TIME_ZONE, 'dd.MM.yyyy · HH:mm', { locale: de })} Uhr
                                </p>
                                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                                    {rental.returnLocation?.name || 'Hauptfiliale Feldkirch (Illstraße 75a)'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
                            <span>Inkludierte Freikilometer: <strong className="text-gray-900">{rental.includedKm || (rental.totalDays * 250)} km</strong></span>
                            <span>Kraftstoff-Regelung: <strong className="text-gray-900">Voll übernehmen / Voll zurückgeben</strong></span>
                        </div>
                    </div>

                    {/* Digital Handover Protocol */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Digitales Übergabeprotokoll (Check-in)
                            </h3>
                            {rental.checkInAt ? (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Abgeschlossen am {formatInTimeZone(new Date(rental.checkInAt), BUSINESS.TIME_ZONE, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Noch nicht durch Mieter durchgeführt
                                </span>
                            )}
                        </div>

                        {rental.checkInAt ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                                                <Gauge className="w-4 h-4 text-gray-700" /> Kilometerstand bei Übergabe
                                            </span>
                                            <span className="text-base font-bold text-gray-900">
                                                {rental.pickupMileage ? `${rental.pickupMileage.toLocaleString('de-AT')} km` : '–'}
                                            </span>
                                        </div>
                                        {rental.mileagePhoto && (
                                            <div className="pt-2">
                                                <a href={rental.mileagePhoto} target="_blank" rel="noreferrer" className="block relative aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 hover:opacity-90">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={rental.mileagePhoto} alt="Tachometer Beleg" className="w-full h-full object-cover" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                                                <Droplets className="w-4 h-4 text-blue-600" /> Tankstand bei Übergabe
                                            </span>
                                            <span className="text-base font-bold text-gray-900">
                                                {rental.fuelLevelPickup || 'Voll'}
                                            </span>
                                        </div>
                                        {rental.fuelPhoto && (
                                            <div className="pt-2">
                                                <a href={rental.fuelPhoto} target="_blank" rel="noreferrer" className="block relative aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 hover:opacity-90">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={rental.fuelPhoto} alt="Tankanzeige Beleg" className="w-full h-full object-cover" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {rental.signature && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <PenTool className="w-3.5 h-3.5 text-gray-600" /> Digitale Unterschrift des Mieters vor Fahrtantritt:
                                        </h4>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 inline-block">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={rental.signature} alt="Unterschrift" className="h-16 w-auto object-contain" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Fahrzeugübernahme (Check-in) noch ausstehend</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            Wenn der Mieter vor Ort in der Filiale erscheint, starten Sie die gemeinsame Fahrzeugübergabe mit digitaler Unterschrift.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0">
                                    <Link
                                        href={`/admin/reservations/${rental.id}/check-in`}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-red-600/20"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Vor-Ort Check-in starten</span>
                                    </Link>
                                    <CheckInLinkShare rentalId={rental.id} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right (Commercials & Payments) */}
                <div className="space-y-6">

                    {/* Commercial Breakdown */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                            <Receipt className="w-4 h-4 text-red-600" /> Preisübersicht & Abrechnung
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Mietpreis ({rental.totalDays} Tag{rental.totalDays > 1 ? 'e' : ''})</span>
                                <span className="font-semibold text-gray-900">€{(Number(rental.dailyRate) * rental.totalDays).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Schutzpaket ({rental.insuranceType || 'Basis-Schutz'})</span>
                                <span className="font-semibold text-gray-900">€{Number(rental.insuranceCost || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Gewählte Extras</span>
                                <span className="font-semibold text-gray-900">€{Number(rental.extrasCost || 0).toFixed(2)}</span>
                            </div>
                            {rental.discountAmount && Number(rental.discountAmount) > 0 && (
                                <div className="flex justify-between items-center text-emerald-700 font-semibold">
                                    <span>Rabatt ({rental.discountReason || 'Gutschein'})</span>
                                    <span>-€{Number(rental.discountAmount).toFixed(2)}</span>
                                </div>
                            )}
                            {rental.extraCharges && Number(rental.extraCharges) > 0 && (
                                <div className="flex justify-between items-center text-amber-700 font-semibold">
                                    <span>Zusatzkosten</span>
                                    <span>+€{Number(rental.extraCharges).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
                                <span className="font-bold text-gray-900 text-sm">Gesamtbetrag (inkl. MwSt.)</span>
                                <span className="text-2xl font-black text-gray-900">
                                    €{Number(rental.totalAmount).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-red-600" /> Zahlungsstatus
                            </h3>
                            <span className={clsx(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                                paymentBadgeStyles[rental.paymentStatus] || "bg-gray-100 text-gray-700 border-gray-200"
                            )}>
                                {paymentLabels[rental.paymentStatus] || rental.paymentStatus}
                            </span>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                <span className="text-gray-500">Zahlungsart:</span>
                                <strong className="text-gray-900 font-bold">{paymentMethodDisplay}</strong>
                            </div>

                            {rental.paymentStatus !== 'Paid' && (
                                <div className="flex gap-2 pt-1">
                                    <form action={updatePaymentStatus.bind(null, rental.id, 'Paid')} className="flex-1">
                                        <button className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                                            Als bezahlt verbuchen
                                        </button>
                                    </form>
                                    <form action={updatePaymentStatus.bind(null, rental.id, 'Pending')} className="flex-1">
                                        <button className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider transition-colors border border-gray-200">
                                            Ausstehend
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kaution */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-600" /> Sicherheitsleistung (Kaution)
                            </h3>
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase">
                                Vor Ort autorisieren
                            </span>
                        </div>
                        <div className="space-y-3 text-xs text-gray-600">
                            <div className="flex justify-between items-center">
                                <span>Kautionsbetrag:</span>
                                <strong className="text-gray-900 text-base font-extrabold">€{rental.car.depositAmount ? Number(rental.car.depositAmount).toFixed(2) : '300,00'}</strong>
                            </div>
                            <p className="text-gray-500 leading-relaxed text-[11px] bg-gray-50 p-3 rounded-xl border border-gray-100">
                                Die Kaution wird bei Fahrzeugübergabe vor Ort per Kredit- oder Debitkarte als Sicherheitsleistung hinterlegt und nach ordnungsgemäßer Rückgabe freigegeben.
                            </p>
                        </div>
                    </div>

                    {/* Internal Memo */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
                            <FileText className="w-4 h-4 text-gray-600" /> Interne Notiz
                        </h3>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 outline-none focus:border-red-600 focus:bg-white transition-all resize-y"
                            rows={3}
                            placeholder="Interne Bemerkung zu dieser Buchung erfassen..."
                            defaultValue={rental.notes || ''}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
