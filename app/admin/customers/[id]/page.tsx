import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

import CustomerForm from '@/components/admin/CustomerForm';
import { notFound } from 'next/navigation';
import { 
    ChevronLeft, Mail, Phone, MapPin, Globe, 
    Calendar, TrendingUp, History, Shield, 
    Clock, CreditCard, Ban, CheckCircle2,
    FileText, User, Star, ExternalLink,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

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
    let tierColor = 'text-gray-500 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700';
    if (totalRentals >= 10) {
        tier = 'VIP';
        tierColor = 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800';
    } else if (totalRentals >= 3) {
        tier = 'Stammkunde';
        tierColor = 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800';
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-24 px-4 sm:px-6">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <Link 
                        href="/admin/customers"
                        className="group flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                {customer.firstName} {customer.lastName}
                            </h1>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${tierColor} shadow-sm`}>
                                {totalRentals >= 10 ? <Star className="w-3 h-3 fill-current" /> : null}
                                {tier}
                            </div>
                            {!customer.isActive && (
                                <div className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 shadow-sm animate-pulse">
                                    Deaktiviert
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Kunde seit {format(new Date(customer.createdAt), 'dd. MMMM yyyy', { locale: de })}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 hidden sm:block"></span>
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {customer.email}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                        <Mail className="w-4 h-4" />
                        Nachricht
                    </button>
                    {!customer.isBlacklisted ? (
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white border border-red-700 rounded-2xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95">
                            <Ban className="w-4 h-4" />
                            Sperren
                        </button>
                    ) : (
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white border border-green-700 rounded-2xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 active:scale-95">
                            <CheckCircle2 className="w-4 h-4" />
                            Entsperren
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (Main Stats & Forms) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="group bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gesamtumsatz</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                                        €{totalRevenue.toLocaleString('de-AT')}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>

                        <div className="group bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mietvorgänge</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                                        {totalRentals} <span className="text-sm font-medium text-gray-400">({completedRentals} OK)</span>
                                    </p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>

                        <div className="group bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Wohnsitz</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-lg">
                                            {customer.country === 'Deutschland' ? '🇩🇪' : 
                                             customer.country === 'Schweiz' ? '🇨🇭' : 
                                             customer.country === 'Italien' ? '🇮🇹' : 
                                             customer.country === 'Türkei' ? '🇹🇷' : '🇦🇹'}
                                        </span>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">
                                            {customer.country || 'Österreich'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Edit Form Section */}
                    <div className="bg-white dark:bg-gray-900/60 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Stammdaten</h2>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Profil bearbeiten</span>
                        </div>
                        <div className="p-8">
                            <CustomerForm customer={serializedCustomer} countries={serializedCountries} />
                        </div>
                    </div>

                    {/* Rental History Section */}
                    <div className="bg-white dark:bg-gray-900/60 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500 rounded-2xl shadow-lg shadow-purple-500/20">
                                    <History className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Mietverlauf</h2>
                            </div>
                            <Link href={`/admin/customers/${id}/rentals`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] text-blue-600 hover:text-blue-700 transition-colors">
                                Alle anzeigen
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>

                        <div className="p-8 overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="text-left text-[10px] font-black uppercase tracking-[3px] text-gray-400">
                                        <th className="pb-6">Fahrzeug</th>
                                        <th className="pb-6">Datum</th>
                                        <th className="pb-6">Status</th>
                                        <th className="pb-6 text-right">Betrag</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {customer.rentals.slice(0, 8).map((rental) => (
                                        <tr key={rental.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                            <td className="py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center font-bold text-xs text-gray-500">
                                                        {rental.car.brand[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                            {rental.car.brand} {rental.car.model}
                                                        </p>
                                                        <p className="text-[10px] font-medium text-gray-400 font-mono tracking-tight">{rental.car.plate}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                                    {format(new Date(rental.startDate), 'dd. MMM yyyy', { locale: de })}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium">Beginn</p>
                                            </td>
                                            <td className="py-5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    rental.status === 'Completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                    rental.status === 'Active' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    'bg-gray-50 text-gray-400 border border-gray-100'
                                                }`}>
                                                    <span className={`w-1 h-1 rounded-full ${
                                                        rental.status === 'Completed' ? 'bg-green-500' :
                                                        rental.status === 'Active' ? 'bg-blue-500 animate-pulse' :
                                                        'bg-gray-400'
                                                    }`}></span>
                                                    {rental.status}
                                                </div>
                                            </td>
                                            <td className="py-5 text-right font-black text-sm text-gray-900 dark:text-white">
                                                €{Number(rental.totalAmount).toLocaleString('de-AT')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {customer.rentals.length === 0 && (
                                <div className="py-16 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                                        <History className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 italic text-sm">Noch keine Vermietungen verzeichnet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* CRM Side Notes */}
                    <div className="bg-white dark:bg-gray-900/60 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-zinc-900 dark:bg-white rounded-2xl shadow-lg">
                                <FileText className="w-5 h-5 text-white dark:text-zinc-900" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Interne Notizen</h3>
                        </div>
                        <div className="space-y-4">
                            <textarea 
                                className="w-full h-40 bg-gray-50 dark:bg-white/5 border-none rounded-3xl p-6 text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-inner"
                                placeholder="Notizen zum Kunden hinterlassen..."
                                defaultValue={customer.notes || ''}
                            />
                            <button className="w-full group relative overflow-hidden bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black py-4 rounded-2xl text-xs uppercase tracking-[2px] transition-all active:scale-[0.98]">
                                <span className="relative z-10">Notiz speichern</span>
                                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            </button>
                        </div>
                    </div>

                    {/* Verifications Checklist */}
                    <div className="bg-white dark:bg-gray-900/60 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Dokumenten-Check</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">E-Mail verifiziert</span>
                                </div>
                            </div>
                            
                            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                customer.licensePhotoUrl 
                                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-900/20' 
                                : 'bg-gray-50/50 dark:bg-white/5 border-transparent'
                            }`}>
                                <div className="flex items-center gap-3">
                                    {customer.licensePhotoUrl ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <Clock className="w-5 h-5 text-gray-400" />}
                                    <span className={`text-xs font-bold uppercase tracking-wider ${customer.licensePhotoUrl ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400'}`}>
                                        Führerschein
                                    </span>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                customer.idAustriaVerified 
                                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-900/20' 
                                : 'bg-gray-50/50 dark:bg-white/5 border-transparent'
                            }`}>
                                <div className="flex items-center gap-3">
                                    {customer.idAustriaVerified ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <Clock className="w-5 h-5 text-gray-400" />}
                                    <span className={`text-xs font-bold uppercase tracking-wider ${customer.idAustriaVerified ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400'}`}>
                                        ID Verifiziert (AT)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Alert Box */}
                    {customer.isBlacklisted && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-[2.5rem] p-8 border border-red-100 dark:border-red-900/40">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-red-900 dark:text-red-400 font-black uppercase tracking-wider text-xs">Blacklist Alert</h4>
                                    <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
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
