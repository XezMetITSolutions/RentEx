import { MapPin, Phone, Mail, Clock, Car, Calendar, Edit, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { clsx } from 'clsx';
import AustrianPlate from '@/components/ui/AustrianPlate';

export const dynamic = 'force-dynamic';

async function getLocation(id: string) {
    const location = await prisma.location.findUnique({
        where: { id: parseInt(id) },
        include: {
            cars: {
                where: { isActive: true },
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    plate: true,
                    category: true,
                    status: true,
                }
            },
            homeCars: {
                where: { isActive: true },
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    plate: true,
                    category: true,
                    status: true,
                }
            },
            _count: {
                select: {
                    pickups: true,
                    returns: true,
                }
            }
        }
    });

    if (!location) return null;

    return location;
}

export default async function LocationDetailPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const location = await getLocation(params.id);

    if (!location) {
        notFound();
    }

    const allCarsMap = new Map<number, (typeof location.cars)[0] & { isCurrent: boolean, isHome: boolean }>();
    location.cars.forEach(car => allCarsMap.set(car.id, { ...car, isCurrent: true, isHome: false }));
    location.homeCars.forEach(car => {
        if (allCarsMap.has(car.id)) {
            const existing = allCarsMap.get(car.id)!;
            existing.isHome = true;
        } else {
            allCarsMap.set(car.id, { ...car, isCurrent: false, isHome: true });
        }
    });

    const uniqueCars = Array.from(allCarsMap.values());
    const totalVehicles = uniqueCars.length;

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-16 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-hm-rule">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/locations"
                        className="p-2.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-muted hover:text-hm-ink transition-colors"
                        title="Zurück zur Standortübersicht"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                                {location.name}
                            </h1>
                            <span className={clsx(
                                "px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] font-mono text-[11px] font-bold uppercase tracking-wider border",
                                location.status === 'active'
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-hm-paper-2 text-hm-muted border-hm-rule"
                            )}>
                                {location.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                            </span>
                        </div>
                        <p className="text-xs font-mono text-hm-muted mt-1">
                            {location.address ? `${location.address}, ${location.city || ''}` : 'Zentraler Betriebsstandort'}
                            {location.code && ` · Code: ${location.code}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={`/admin/locations/${location.id}/edit`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Edit className="w-3.5 h-3.5 text-hm-muted" />
                        Standort bearbeiten
                    </Link>
                </div>
            </div>

            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">
                            Fahrzeuge vor Ort
                        </span>
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Car className="w-4 h-4 text-hm-accent" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl font-bold text-hm-ink mt-3 hm-tnum">
                        {totalVehicles}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Zugewiesene Flotteneinzelfahrzeuge
                    </p>
                </div>

                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">
                            Abholungen gesamt
                        </span>
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl font-bold text-hm-ink mt-3 hm-tnum">
                        {location._count.pickups}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Erfolgte Fahrzeugübernahmen
                    </p>
                </div>

                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">
                            Rückgaben gesamt
                        </span>
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl font-bold text-hm-ink mt-3 hm-tnum">
                        {location._count.returns}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Erfolgte Fahrzeugrückgaben
                    </p>
                </div>

                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">
                            Betriebsstatus
                        </span>
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <MapPin className="w-4 h-4 text-hm-accent" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl font-bold text-hm-ink mt-3">
                        {location.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Für Kundenbuchungen freigeschaltet
                    </p>
                </div>
            </div>

            {/* Location Details: Contact & Hours */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact & Address */}
                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5 pb-2 border-b border-hm-rule">
                        <Building2 className="w-3.5 h-3.5 text-hm-accent" /> Standort & Kontakt
                    </span>

                    <div className="space-y-3 pt-1 text-xs">
                        {location.address && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-hm-muted mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-hm-ink">{location.address}</p>
                                    {location.city && (
                                        <p className="text-hm-muted">
                                            {location.city}, {location.country || 'Österreich'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {location.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-hm-muted shrink-0" />
                                <a
                                    href={`tel:${location.phone}`}
                                    className="text-hm-ink font-mono hover:underline"
                                >
                                    {location.phone}
                                </a>
                            </div>
                        )}

                        {location.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-hm-muted shrink-0" />
                                <a
                                    href={`mailto:${location.email}`}
                                    className="text-hm-ink font-mono hover:underline"
                                >
                                    {location.email}
                                </a>
                            </div>
                        )}

                        {location.code && (
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-hm-muted">Kürzel:</span>
                                <span className="font-mono font-bold text-hm-ink bg-hm-paper-2 px-2 py-0.5 rounded border border-hm-rule">
                                    {location.code}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5 pb-2 border-b border-hm-rule">
                        <Clock className="w-3.5 h-3.5 text-hm-accent" /> Öffnungszeiten & Check-in
                    </span>

                    <div className="space-y-2.5 pt-1 text-xs font-mono">
                        {location.openingTime && location.closingTime ? (
                            <>
                                <div className="flex justify-between items-center py-1 border-b border-hm-rule">
                                    <span className="text-hm-muted">Montag – Freitag</span>
                                    <span className="font-bold text-hm-ink">
                                        {location.openingTime} – {location.closingTime} Uhr
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-hm-rule">
                                    <span className="text-hm-muted">Samstag</span>
                                    <span className="font-bold text-hm-ink">
                                        {location.openingTime} – {location.closingTime} Uhr
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hm-muted">Sonntag</span>
                                    <span className="font-bold text-hm-ink">
                                        {location.isOpenSundays ? `${location.openingTime} – ${location.closingTime} Uhr` : '24/7 Schlüsseltresor'}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="p-3 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                                24/7 Schlüsseltresor aktiv (Kontaktlose Abholung & Rückgabe jederzeit möglich)
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vehicles Table */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-hm-accent" />
                        Fahrzeuge an diesem Standort ({totalVehicles})
                    </span>
                    <Link
                        href="/admin/locations/assign-cars"
                        className="font-mono text-xs text-hm-accent hover:underline font-semibold"
                    >
                        + Fahrzeuge zuweisen
                    </Link>
                </div>

                {totalVehicles === 0 ? (
                    <div className="px-6 py-12 text-center text-hm-muted space-y-2">
                        <Car className="mx-auto h-8 w-8 text-hm-muted" />
                        <p className="text-xs font-mono font-semibold uppercase tracking-wider text-hm-ink">Keine Fahrzeuge zugewiesen</p>
                        <p className="text-xs text-hm-muted">
                            Diesem Standort sind derzeit keine aktiven Flottenfahrzeuge zugeteilt.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-hm-paper-2 border-b border-hm-rule text-hm-muted uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-5 py-3 font-semibold">Kennzeichen</th>
                                    <th className="px-5 py-3 font-semibold">Kategorie</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Zuweisung</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {uniqueCars.map((car) => (
                                    <tr key={car.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                        <td className="px-5 py-3 font-bold text-hm-ink">
                                            <Link
                                                href={`/admin/fleet/${car.id}`}
                                                className="hover:underline"
                                            >
                                                {car.brand} {car.model}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3">
                                            <AustrianPlate plate={car.plate} />
                                        </td>
                                        <td className="px-5 py-3 text-hm-muted">{car.category || 'Standard'}</td>
                                        <td className="px-5 py-3">
                                            <span className={clsx(
                                                'px-2 py-0.5 rounded-[var(--hm-radius-pill)] font-bold uppercase tracking-wider border text-[10px]',
                                                car.status === 'Active' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
                                                car.status === 'Rented' && 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
                                                car.status === 'Maintenance' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
                                            )}>
                                                {car.status === 'Active' ? 'Verfügbar' : car.status === 'Rented' ? 'Vermietet' : car.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-hm-muted">
                                            {car.isCurrent && car.isHome ? 'Heimat & Aktuell' : car.isCurrent ? 'Aktuell hier' : 'Heimatstandort'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
