import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

import CustomerForm from '@/components/admin/CustomerForm';
import CustomerActions from './CustomerActions';
import CustomerNotes from '@/components/admin/CustomerNotes';
import { notFound } from 'next/navigation';
import { 
    ChevronLeft, Mail, Phone, MapPin, Globe, 
    Calendar, TrendingUp, History, Shield, 
    Clock, CreditCard, Ban, CheckCircle2,
    FileText, User, Star, ExternalLink,
    AlertCircle, ChevronRight, Plus
} from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { rentalStatusLabel } from '@/lib/statusLabels';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customerId = parseInt(id);
    
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
            rentals: {
                include: { car: true },
                orderBy: { createdAt: 'desc' }
            },
            _count: {
                select: { rentals: true }
            }
        }
    });

    const countries = await prisma.country.findMany({
        orderBy: { nicename: 'asc' }
    });

    if (!customer) {
        notFound();
    }

    // Serialize Decimal values and dates for client components
    const serializedCustomer = JSON.parse(JSON.stringify(customer));
    const serializedCountries = JSON.parse(JSON.stringify(countries));

    // Calculate stats
    const totalRentals = customer._count.rentals;
    const totalRevenue = customer.rentals.reduce((sum, r) => sum + Number(r.totalAmount), 0);
    const completedRentals = customer.rentals.filter(r => r.status === 'Completed').length;
    
    // Determine tier
    let tier = 'Neukunde';
    let tierColor = 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    if (totalRentals >= 10) {
        tier = 'VIP';
        tierColor = 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50';
    } else if (totalRentals >= 3) {
        tier = 'Stammkunde';
        tierColor = 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50';
    }
    
    const isLicenseExpired = customer.licenseExpiryDate ? new Date(customer.licenseExpiryDate) < new Date() : false;
    const isLicenseMissing = !customer.licenseNumber;

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-24 px-4 sm:px-6">
            
            {/* Header Area (Clean SaaS Style) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Link 
                        href="/admin/customers"
                        className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                {customer.firstName} {customer.lastName}
                            </h1>
                            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${tierColor}`}>
                                {totalRentals >= 10 ? <Star className="w-3.5 h-3.5 fill-current" /> : null}
                                {tier}
                            </div>
                            {!customer.isActive && (
                                <div className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50">
                                    Deaktiviert
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Kunde seit {format(new Date(customer.createdAt), 'dd.MM.yyyy', { locale: de })}
                            </span>
                            <span className="hidden sm:inline-block text-gray-300 dark:text-gray-600">•</span>
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {customer.email}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href={`/admin/reservations/new?customerId=${customer.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/10"
                    >
                        <Plus className="w-4 h-4" />
                        Neue Reservierung
                    </Link>
                    <CustomerActions customer={{
                        id: customer.id,
                        email: customer.email,
                        isBlacklisted: customer.isBlacklisted,
                        blacklistReason: customer.blacklistReason
                    }} />
                </div>
            </div>

            {/* Warning Banners */}
            {(isLicenseExpired || isLicenseMissing) && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/20 rounded-xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                    <div>
                        <h4 className="font-bold text-sm">Führerscheinprüfung erforderlich</h4>
                        <p className="text-xs mt-1 font-medium">
                            {isLicenseExpired && "Achtung: Der Führerschein dieses Kunden ist abgelaufen! Reservierungen können blockiert sein."}
                            {isLicenseMissing && !isLicenseExpired && "Achtung: Die Führerscheindaten dieses Kunden sind unvollständig!"}
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left & Center Columns (Main Content) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gesamtumsatz</p>
                                <CreditCard className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2 tracking-tight">
                                €{totalRevenue.toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mietvorgänge</p>
                                <TrendingUp className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2 tracking-tight">
                                {totalRentals}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{completedRentals} Erfolgreich abgeschlossen</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wohnsitz</p>
                                <Globe className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-2xl">
                                    {customer.country === 'Deutschland' ? '🇩🇪' : 
                                     customer.country === 'Schweiz' ? '🇨🇭' : 
                                     customer.country === 'Italien' ? '🇮🇹' : 
                                     customer.country === 'Türkei' ? '🇹🇷' : '🇦🇹'}
                                </span>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                    {customer.country || 'Österreich'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Edit Form Section */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Stammdaten</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <CustomerForm customer={serializedCustomer} countries={serializedCountries} />
                        </div>
                    </div>

                    {/* Rental History Section */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-gray-400" />
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Letzte Vermietungen</h2>
                            </div>
                            <Link href={`/admin/customers/${id}/rentals`} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                Alle anzeigen <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            {!customer.rentals || customer.rentals.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <History className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Keine Vermietungen</p>
                                    <p className="text-sm text-gray-500 mt-1">Dieser Kunde hat noch keine Fahrzeuge gemietet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Fahrzeug</th>
                                            <th className="px-6 py-3 font-medium">Datum</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                            <th className="px-6 py-3 font-medium text-right">Betrag</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {customer.rentals.slice(0, 5).map((rental) => (
                                            <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {rental.car.brand} {rental.car.model}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5 font-mono">
                                                        {rental.car.plate}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                    {format(new Date(rental.startDate), 'dd.MM.yyyy', { locale: de })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {rental.status === 'Completed' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Abgeschlossen
                                                        </span>
                                                    ) : rental.status === 'Active' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                                            Aktiv
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                                            {rentalStatusLabel(rental.status)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                                    €{Number(rental.totalAmount).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    
                    {/* CRM Side Notes */}
                    <CustomerNotes customerId={customer.id} initialNotes={customer.notes || ''} />

                    {/* Verifications Checklist */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Verifizierung</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100/50 dark:border-green-800/20">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-400">E-Mail Adresse</span>
                                </div>
                            </div>
                            
                            <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                customer.licensePhotoUrl 
                                ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100/50 dark:border-green-800/20' 
                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {customer.licensePhotoUrl ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" /> : <Clock className="w-4 h-4 text-gray-400" />}
                                    <span className={`text-sm font-medium ${customer.licensePhotoUrl ? 'text-green-800 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        Führerschein
                                    </span>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                customer.idAustriaVerified 
                                ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100/50 dark:border-green-800/20' 
                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {customer.idAustriaVerified ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" /> : <Clock className="w-4 h-4 text-gray-400" />}
                                    <span className={`text-sm font-medium ${customer.idAustriaVerified ? 'text-green-800 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        ID Austria
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Alert Box */}
                    {customer.isBlacklisted && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-900/40">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">Gesperrt</h4>
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                        {customer.blacklistReason || 'Kein Grund angegeben.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
