import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
    ArrowLeft,
    Calendar,
    Fuel,
    Car,
    CreditCard,
    Wrench,
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    ClipboardList,
    History,
    FileText
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { clsx } from 'clsx';

async function getCarData(id: number) {
    const carPromise = prisma.car.findUnique({
        where: { id },
        include: {
            maintenanceRecords: {
                orderBy: {
                    performedDate: 'desc'
                }
            },
            rentals: {
                take: 10,
                orderBy: {
                    startDate: 'desc'
                },
                include: {
                    customer: true
                }
            }
        }
    });

    const notificationsPromise = prisma.notification.findMany({
        where: {
            relatedType: 'Car',
            relatedId: id
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 20
    });

    const damageRentalsPromise = prisma.rental.findMany({
        where: {
            carId: id,
            damageReport: {
                not: null
            }
        },
        include: {
            customer: true
        },
        orderBy: {
            endDate: 'desc'
        }
    });

    const [car, notifications, damageRentals] = await Promise.all([
        carPromise,
        notificationsPromise,
        damageRentalsPromise
    ]);

    if (!car) return null;

    return {
        ...car,
        notifications,
        damageRentals
    };
}

export default async function AdminCarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const carId = parseInt(resolvedParams.id);

    if (isNaN(carId)) return notFound();

    const car = await getCarData(carId);

    if (!car) {
        notFound();
    }

    const formatCurrency = (amount: number | null | undefined | any) => {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(amount));
    };

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return '-';
        return format(date, 'dd.MM.yyyy', { locale: de });
    };

    // Combine maintenance repairs and rental damages for a unified damage timeline?
    // For now, keep them separate or just listed in the Damage section.

    return (
        <div className="space-y-8 pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/fleet" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{car.brand} {car.model}</h1>
                            <span className={clsx(
                                "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                car.status === 'Active' ? "bg-green-50 text-green-700 border-green-200" :
                                    car.status === 'Maintenance' ? "bg-red-50 text-red-700 border-red-200" :
                                        "bg-blue-50 text-blue-700 border-blue-200"
                            )}>
                                {car.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium text-xs">
                                {car.plate}
                            </span>
                            <span>•</span>
                            <span>{car.category}</span>
                            <span>•</span>
                            <span>VIN: {car.vin || '-'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/admin/fleet/${car.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Bearbeiten
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Main Content Column */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Basic Specs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
                            <Car className="w-5 h-5 text-gray-500" />
                            <h2 className="font-semibold text-gray-900">Fahrzeugdaten</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Marke & Modell</p>
                                <p className="font-medium">{car.brand} {car.model}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Baujahr</p>
                                <p className="font-medium">{car.year}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Farbe</p>
                                <p className="font-medium">{car.color}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Kraftstoff</p>
                                <p className="font-medium">{car.fuelType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Getriebe</p>
                                <p className="font-medium">{car.transmission}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Leistung</p>
                                <p className="font-medium">{car.horsePower ? `${car.horsePower} PS` : '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Kilometerstand</p>
                                <p className="font-medium">{car.currentMileage?.toLocaleString()} km</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Co2 Emissionen</p>
                                <p className="font-medium">{car.co2Emission || '-'} / km</p>
                            </div>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-500" />
                            <h2 className="font-semibold text-gray-900">Finanzen & Kaufoptionen</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-2">Investition</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Kaufpreis</span>
                                        <span className="text-sm font-medium">{formatCurrency(car.purchasePrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Kaufdatum</span>
                                        <span className="text-sm font-medium">{formatDate(car.purchaseDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Aktueller Wert</span>
                                        <span className="text-sm font-medium text-green-600">{formatCurrency(car.currentValue)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-2">Vermietung</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Tagessatz</span>
                                        <span className="text-sm font-medium">{formatCurrency(car.dailyRate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Kaution</span>
                                        <span className="text-sm font-medium">{formatCurrency(car.depositAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Langzeitrate</span>
                                        <span className="text-sm font-medium">{formatCurrency(car.longTermRate)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-2">Leasing / Finanzierung</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Typ</span>
                                        <span className="text-sm font-medium">Kauf (Eigentum)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Restzahlung</span>
                                        <span className="text-sm font-medium">-</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Damage Tracking (Schadenverfolgung) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-gray-500" />
                                <h2 className="font-semibold text-gray-900">Schadenverfolgung</h2>
                            </div>
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {car.damageRentals.length} Gemeldet
                            </span>
                        </div>
                        <div className="p-0">
                            {car.damageRentals.length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {car.damageRentals.map((rental) => (
                                        <li key={rental.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between mb-2">
                                                <Link href={`/admin/rental/${rental.id}`} className="font-medium text-blue-600 text-sm hover:underline">
                                                    Miete #{rental.contractNumber || rental.id}
                                                </Link>
                                                <span className="text-xs text-gray-500">{formatDate(rental.endDate)}</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 p-1.5 bg-red-50 rounded text-red-600">
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{rental.customer.firstName} {rental.customer.lastName}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{rental.damageReport}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-8 text-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-100 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Keine Schäden bekannt. Fahrzeug ist unfallfrei.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Maintenance */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-gray-500" />
                            <h2 className="font-semibold text-gray-900">Wartung & Service</h2>
                        </div>
                        <div className="p-0">
                            {car.maintenanceRecords.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Datum</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Art</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Kosten</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {car.maintenanceRecords.map((record) => (
                                            <tr key={record.id}>
                                                <td className="px-6 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                    {formatDate(record.performedDate)}
                                                </td>
                                                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                    {record.maintenanceType}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-500">
                                                    {record.description}
                                                    <div className="text-xs text-gray-400 mt-0.5">{record.performedBy}</div>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                                                    {formatCurrency(record.cost)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-sm text-gray-500 italic">
                                    Keine Wartungseinträge.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">

                    {/* Car Image */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="aspect-video relative bg-gray-100 flex items-center justify-center">
                            {car.imageUrl ? (
                                <Image
                                    src={car.imageUrl}
                                    alt={car.model}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <Car className="w-16 h-16 text-gray-300" />
                            )}
                        </div>
                    </div>

                    {/* Quick Stats / Critical Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-gray-900">Zustand & Termine</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">TÜV / Pickerl</span>
                                <span className={clsx(
                                    "text-sm font-medium px-2 py-0.5 rounded",
                                    car.nextInspection && new Date(car.nextInspection) < new Date() ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                                )}>
                                    {formatDate(car.nextInspection)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Vignette</span>
                                <span className="text-sm font-medium">{formatDate(car.vignetteValidUntil)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Reifen</span>
                                <span className="text-sm font-medium">{car.tireType || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Versicherung</span>
                                <span className="text-sm font-medium">{car.insuranceCompany || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Messages & Notifications (Nachrichtenverlauf) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-h-[500px] flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <h3 className="text-sm font-semibold text-gray-900">Nachrichtenverlauf</h3>
                        </div>
                        <div className="overflow-y-auto flex-1 p-0">
                            {car.notifications.length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {car.notifications.map((notif) => (
                                        <li key={notif.id} className="p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{notif.subject || 'Benachrichtigung'}</span>
                                                <span className="text-[10px] text-gray-400">{format(notif.createdAt, 'dd.MM.yy HH:mm')}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={clsx(
                                                    "text-[10px] px-1.5 py-0.5 rounded border capitalize",
                                                    notif.status === 'Sent' ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-600 border-gray-100"
                                                )}>
                                                    {notif.type}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6 text-center">
                                    <p className="text-xs text-gray-400">Keine Nachrichten vorhanden.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Rentals List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
                            <History className="w-4 h-4 text-gray-500" />
                            <h3 className="text-sm font-semibold text-gray-900">Letzte Mieten</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {car.rentals.map((rental) => (
                                <div key={rental.id} className="p-4 hover:bg-gray-50 text-sm">
                                    <div className="flex justify-between font-medium text-gray-900 mb-1">
                                        <span>{rental.customer.firstName} {rental.customer.lastName}</span>
                                        <span>{formatCurrency(rental.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-xs">
                                        <span>{formatDate(rental.startDate)} - {formatDate(rental.endDate)}</span>
                                        <span className={clsx(
                                            rental.status === 'Active' ? 'text-green-600' : 'text-gray-500'
                                        )}>{rental.status}</span>
                                    </div>
                                </div>
                            ))}
                            {car.rentals.length === 0 && (
                                <div className="p-6 text-center text-xs text-gray-400">
                                    Keine Vermietungen.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
