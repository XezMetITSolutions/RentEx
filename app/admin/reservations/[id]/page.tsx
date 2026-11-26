import ExtensionsPanel from '@/components/dashboard/ExtensionsPanel';
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
    CheckCircle,
    XCircle,
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
    AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { updatePaymentStatus } from '@/app/actions/rental-updates';
import RentalActionsClient from '@/components/admin/RentalActionsClient';
import AustrianPlate from '@/components/ui/AustrianPlate';

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

    const statusBadgeStyles = {
        'Pending': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        'Confirmed': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        'Active': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        'Completed': 'bg-hm-paper-2 text-hm-muted border-hm-rule',
        'Cancelled': 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
        'NoShow': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
    };

    const statusLabels: Record<string, string> = {
        'Pending': 'Ausstehend',
        'Confirmed': 'Bestätigt',
        'Active': 'Laufend (Aktiv)',
        'Completed': 'Abgeschlossen',
        'Cancelled': 'Storniert',
        'NoShow': 'Nicht erschienen'
    };

    const paymentBadgeStyles: Record<string, string> = {
        'Pending': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        'Partial': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        'Paid': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
        'Refunded': 'bg-purple-500/10 text-purple-700 border-purple-500/20'
    };

    const paymentLabels: Record<string, string> = {
        'Pending': 'Zahlung offen',
        'Partial': 'Teilweise bezahlt',
        'Paid': 'Vollständig bezahlt',
        'Refunded': 'Erstattet'
    };

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-16 px-4 sm:px-6 lg:px-8 text-hm-ink">
            <ExtensionsPanel rentalId={rentalId} admin />

            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-hm-rule">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/reservations"
                        className="p-2.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-muted hover:text-hm-ink transition-colors"
                        title="Zurück zur Übersicht"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                                Reservierung {rental.contractNumber || `#${rental.id.toString().padStart(4, '0')}`}
                            </h1>
                            <span className={clsx(
                                "px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] font-mono text-[11px] font-bold uppercase tracking-wider border",
                                statusBadgeStyles[rental.status as keyof typeof statusBadgeStyles] || "bg-hm-paper-2 text-hm-muted border-hm-rule"
                            )}>
                                {statusLabels[rental.status] || rental.status}
                            </span>
                        </div>
                        <p className="text-xs font-mono text-hm-muted mt-1">
                            Erstellt am {formatInTimeZone(new Date(rental.createdAt), BUSINESS.TIME_ZONE, 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr
                        </p>
                    </div>
                </div>

                {/* Quick Actions (Stornieren, Erstatten, Aktivieren etc.) */}
                <RentalActionsClient rental={rental} />
            </div>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left & Middle Columns (Details) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Customer & Vehicle Snapshot */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Customer */}
                        <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-hm-rule">
                                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-hm-accent" /> Mieter & Fahrer
                                </span>
                                <Link
                                    href={`/admin/customers/${rental.customer.id}`}
                                    className="font-mono text-[11px] text-hm-accent hover:underline flex items-center gap-1"
                                >
                                    Profil öffnen <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="space-y-2">
                                <p className="text-base font-bold text-hm-ink">
                                    {rental.customer.firstName} {rental.customer.lastName}
                                </p>
                                <div className="space-y-1.5 text-xs text-hm-muted">
                                    <p className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-hm-muted" />
                                        <a href={`mailto:${rental.customer.email}`} className="text-hm-ink hover:underline">
                                            {rental.customer.email}
                                        </a>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-hm-muted" />
                                        <a href={`tel:${rental.customer.phone}`} className="text-hm-ink hover:underline">
                                            {rental.customer.phone || '–'}
                                        </a>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-hm-muted" />
                                        <span>{rental.customer.address}, {rental.customer.postalCode} {rental.customer.city}</span>
                                    </p>
                                    {rental.customer.company && (
                                        <p className="flex items-center gap-2 pt-1 font-medium text-hm-ink">
                                            <Building2 className="w-3.5 h-3.5 text-hm-accent" />
                                            <span>{rental.customer.company} {rental.customer.taxId && `(${rental.customer.taxId})`}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vehicle */}
                        <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-hm-rule">
                                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5">
                                    <Car className="w-3.5 h-3.5 text-hm-accent" /> Flottenfahrzeug
                                </span>
                                <Link
                                    href={`/admin/fleet/${rental.car.id}`}
                                    className="font-mono text-[11px] text-hm-accent hover:underline flex items-center gap-1"
                                >
                                    Fahrzeugdaten <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-base font-bold text-hm-ink">
                                        {rental.car.brand} {rental.car.model}
                                    </p>
                                    <p className="text-xs text-hm-muted mt-0.5">{rental.car.category || 'Standard'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AustrianPlate plate={rental.car.plate} />
                                    <div className="text-xs font-mono text-hm-muted">
                                        Tagespreis: <span className="font-bold text-hm-ink">€{Number(rental.dailyRate).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rental Period & Locations */}
                    <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-hm-accent" /> Mietzeitraum & Standorte
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="p-4 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule space-y-2">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" /> Übernahme / Abholung
                                </span>
                                <p className="text-base font-bold text-hm-ink font-mono">
                                    {formatInTimeZone(start, BUSINESS.TIME_ZONE, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                                </p>
                                <p className="text-xs text-hm-muted flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-hm-accent" />
                                    {rental.pickupLocation?.name || rental.car.currentLocation?.name || rental.car.homeLocation?.name || 'Feldkirch (Illstraße 75a)'}
                                </p>
                            </div>
                            <div className="p-4 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule space-y-2">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" /> Geplante Rückgabe
                                </span>
                                <p className="text-base font-bold text-hm-ink font-mono">
                                    {formatInTimeZone(end, BUSINESS.TIME_ZONE, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                                </p>
                                <p className="text-xs text-hm-muted flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-hm-accent" />
                                    {rental.returnLocation?.name || rental.car.currentLocation?.name || rental.car.homeLocation?.name || 'Feldkirch (Illstraße 75a)'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-hm-rule font-mono text-xs text-hm-muted">
                            <span>Gesamte Mietdauer: <strong className="text-hm-ink font-bold">{rental.totalDays} Tag{rental.totalDays > 1 ? 'e' : ''}</strong></span>
                            <span>Freikilometer: <strong className="text-hm-ink font-bold">{rental.includedKm || (rental.totalDays * 250)} km</strong></span>
                        </div>
                    </div>

                    {/* Digitales Übergabeprotokoll (Self Check-in & Fotos) */}
                    <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-hm-rule">
                            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Digitales Übergabeprotokoll (Check-in)
                            </span>
                            {rental.checkInAt ? (
                                <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Durchgeführt am {formatInTimeZone(new Date(rental.checkInAt), BUSINESS.TIME_ZONE, 'dd.MM.yyyy HH:mm', { locale: de })}
                                </span>
                            ) : (
                                <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Noch nicht durch Mieter durchgeführt
                                </span>
                            )}
                        </div>

                        {rental.checkInAt ? (
                            <div className="space-y-5">
                                {/* Tacho & Tank */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs text-hm-muted flex items-center gap-1.5">
                                                <Gauge className="w-3.5 h-3.5 text-hm-accent" /> KM bei Übergabe
                                            </span>
                                            <span className="font-mono text-base font-bold text-hm-ink hm-tnum">
                                                {rental.pickupMileage ? `${rental.pickupMileage.toLocaleString('de-AT')} km` : '–'}
                                            </span>
                                        </div>
                                        {rental.mileagePhoto && (
                                            <div className="pt-2">
                                                <a href={rental.mileagePhoto} target="_blank" rel="noreferrer" className="block relative aspect-[16/9] rounded-[var(--hm-radius-input)] overflow-hidden border border-hm-rule hover:opacity-90 transition-opacity">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={rental.mileagePhoto} alt="Tacho Beleg" className="w-full h-full object-cover" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs text-hm-muted flex items-center gap-1.5">
                                                <Droplets className="w-3.5 h-3.5 text-blue-500" /> Tankstand bei Übergabe
                                            </span>
                                            <span className="font-mono text-base font-bold text-hm-ink">
                                                {rental.fuelLevelPickup || 'Voll'}
                                            </span>
                                        </div>
                                        {rental.fuelPhoto && (
                                            <div className="pt-2">
                                                <a href={rental.fuelPhoto} target="_blank" rel="noreferrer" className="block relative aspect-[16/9] rounded-[var(--hm-radius-input)] overflow-hidden border border-hm-rule hover:opacity-90 transition-opacity">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={rental.fuelPhoto} alt="Tank Beleg" className="w-full h-full object-cover" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Damages Reported by Customer */}
                                <div>
                                    <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted mb-3 flex items-center gap-2">
                                        <Camera className="w-3.5 h-3.5 text-amber-500" />
                                        Beim Check-in vom Mieter gemeldete Schäden ({rental.damageRecords?.length || 0})
                                    </h4>
                                    {rental.damageRecords && rental.damageRecords.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {rental.damageRecords.map((dam) => (
                                                <div key={dam.id} className="p-4 rounded-[var(--hm-radius-input)] border border-amber-500/20 bg-amber-500/5 space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <strong className="text-xs font-bold text-hm-ink">{dam.type}</strong>
                                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-amber-500/10 text-amber-700 font-semibold uppercase">
                                                            {dam.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-hm-muted leading-relaxed">{dam.description || 'Keine Schadensbeschreibung angegeben'}</p>
                                                    {dam.photoUrl && (
                                                        <div className="pt-2">
                                                            <a href={dam.photoUrl} target="_blank" rel="noreferrer" className="block relative aspect-[16/9] rounded-[var(--hm-radius-input)] overflow-hidden border border-hm-rule">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={dam.photoUrl} alt="Schadensfoto" className="w-full h-full object-cover" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-xs font-mono text-hm-muted">
                                            Kunde hat keine neuen Vorschäden gemeldet. Fahrzeug wurde schadenfrei übernommen.
                                        </div>
                                    )}
                                </div>

                                {/* Digital Signature */}
                                {rental.signature && (
                                    <div className="pt-3 border-t border-hm-rule">
                                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5 mb-2">
                                            <PenTool className="w-3.5 h-3.5 text-hm-muted" /> Digitale Unterschrift des Mieters
                                        </span>
                                        <div className="bg-white p-3 rounded-[var(--hm-radius-input)] border border-hm-rule inline-block">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={rental.signature} alt="Unterschrift" className="h-16 w-auto object-contain" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-dashed border-hm-rule text-center space-y-2">
                                <Clock className="w-6 h-6 text-hm-muted mx-auto" />
                                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                    Check-in ausstehend
                                </p>
                                <p className="text-xs text-hm-muted max-w-md mx-auto">
                                    Der Mieter hat die Fahrzeugübernahme noch nicht abgeschlossen. Sobald der Kunde den Self Check-in Link öffnet und KM, Tank sowie Fotos übermittelt, werden diese hier revisionssicher protokolliert.
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href={`/self-checkin/${rental.id}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule font-mono text-xs font-semibold text-hm-ink transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-hm-accent" />
                                        Self Check-in Vorschau öffnen
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Financials & Kaution & Stripe */}
                <div className="space-y-6">
                    {/* Price Breakdown */}
                    <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-hm-accent" /> Abrechnung & Preis
                        </span>
                        <div className="space-y-2.5 font-mono text-xs pt-1">
                            <div className="flex justify-between items-center text-hm-muted">
                                <span>Mietpreis ({rental.totalDays} Tag{rental.totalDays > 1 ? 'e' : ''})</span>
                                <span className="font-semibold text-hm-ink hm-tnum">€{(Number(rental.dailyRate) * rental.totalDays).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-hm-muted">
                                <span>Schutzpaket ({rental.insuranceType || 'Basis'})</span>
                                <span className="font-semibold text-hm-ink hm-tnum">€{Number(rental.insuranceCost || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-hm-muted">
                                <span>Extras</span>
                                <span className="font-semibold text-hm-ink hm-tnum">€{Number(rental.extrasCost || 0).toFixed(2)}</span>
                            </div>
                            {rental.discountAmount && Number(rental.discountAmount) > 0 && (
                                <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                                    <span>Rabatt ({rental.discountReason || 'Gutschein'})</span>
                                    <span className="font-semibold hm-tnum">-€{Number(rental.discountAmount).toFixed(2)}</span>
                                </div>
                            )}
                            {rental.extraCharges && Number(rental.extraCharges) > 0 && (
                                <div className="flex justify-between items-center text-amber-700">
                                    <span>Zusatzkosten (Mehr-KM etc.)</span>
                                    <span className="font-semibold hm-tnum">+€{Number(rental.extraCharges).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="pt-3 border-t border-hm-rule flex justify-between items-baseline">
                                <span className="font-bold text-hm-ink text-sm">Gesamtbetrag</span>
                                <span className="hm-display text-2xl font-bold text-hm-ink hm-tnum">
                                    €{Number(rental.totalAmount).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status & Stripe */}
                    <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-hm-rule">
                            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-hm-accent" /> Zahlungsstatus
                            </span>
                            <span className={clsx(
                                "font-mono text-[11px] font-bold px-2 py-0.5 rounded-[var(--hm-radius-pill)] uppercase border",
                                paymentBadgeStyles[rental.paymentStatus] || "bg-hm-paper-2 text-hm-muted border-hm-rule"
                            )}>
                                {paymentLabels[rental.paymentStatus] || rental.paymentStatus}
                            </span>
                        </div>

                        <div className="space-y-3 text-xs font-mono">
                            <div className="flex justify-between items-center text-hm-muted">
                                <span>Zahlungsmethode:</span>
                                <span className="font-semibold text-hm-ink">{rental.paymentMethod || 'Online'}</span>
                            </div>

                            {rental.stripeSessionId && (
                                <div className="p-3 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule space-y-1">
                                    <span className="text-[10px] text-hm-muted uppercase tracking-wider block font-bold">Stripe Session:</span>
                                    <p className="text-[11px] text-hm-ink break-all font-mono">
                                        {rental.stripeSessionId}
                                    </p>
                                </div>
                            )}

                            {rental.payments && rental.payments.length > 0 && (
                                <div className="pt-2 border-t border-hm-rule space-y-1.5">
                                    <span className="text-[10px] text-hm-muted uppercase tracking-wider block font-bold">Zahlungseingänge:</span>
                                    {rental.payments.map((p) => (
                                        <div key={p.id} className="flex justify-between items-center text-[11px] text-hm-muted">
                                            <span>{p.notes || p.paymentMethod}</span>
                                            <span className="font-bold text-hm-ink hm-tnum">€{Number(p.amount).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {rental.paymentStatus !== 'Paid' && (
                                <div className="flex gap-2 pt-2">
                                    <form action={updatePaymentStatus.bind(null, rental.id, 'Paid')} className="flex-1">
                                        <button className="w-full py-1.5 rounded-[var(--hm-radius-input)] bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors">
                                            Als bezahlt markieren
                                        </button>
                                    </form>
                                    <form action={updatePaymentStatus.bind(null, rental.id, 'Pending')} className="flex-1">
                                        <button className="w-full py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-muted hover:text-hm-ink font-mono text-xs font-semibold uppercase tracking-wider transition-colors">
                                            Ausstehend
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kaution / Sicherheitsleistung Information */}
                    <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-3">
                        <div className="flex items-center gap-1.5 pb-2 border-b border-hm-rule">
                            <Shield className="w-3.5 h-3.5 text-hm-accent" />
                            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted">
                                Kaution & Vorautorisierung
                            </span>
                        </div>
                        <div className="text-xs space-y-2 text-hm-muted">
                            <div className="flex justify-between items-center font-mono">
                                <span>Kautionsbetrag:</span>
                                <span className="font-bold text-hm-ink">€{rental.car.depositAmount ? Number(rental.car.depositAmount).toFixed(2) : '300.00'}</span>
                            </div>
                            <div className="p-3 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-[11px] space-y-1.5">
                                <p className="font-bold text-hm-ink">💡 Stripe Vorautorisierung (Blockieren):</p>
                                <p className="leading-relaxed">
                                    Über Stripe kann die Kaution mittels <strong className="text-hm-ink font-mono">capture_method: &apos;manual&apos;</strong> auf der Kreditkarte des Mieters reserviert (blockiert) werden, ohne das Geld direkt einzuziehen. Bei schadenfreier Rückgabe verfällt der Block automatisch.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Note */}
                    <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-2">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-hm-accent" /> Interne Notiz
                        </span>
                        <textarea
                            className="w-full bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] p-3 text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent resize-y"
                            rows={3}
                            placeholder="Interne Bemerkung zur Buchung..."
                            defaultValue={rental.notes || ''}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
