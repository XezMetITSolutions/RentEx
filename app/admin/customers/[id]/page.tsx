import prisma from '@/lib/prisma';
import CustomerForm from '@/components/admin/CustomerForm';
import { notFound } from 'next/navigation';
import { 
    ChevronLeft, Mail, Phone, MapPin, Globe, 
    Calendar, TrendingUp, History, Shield, 
    Clock, CreditCard, Ban, CheckCircle2,
    FileText, User, Star
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

    if (!customer) {
        notFound();
    }

    // Calculate stats
    const totalRentals = customer._count.rentals;
    const totalRevenue = customer.rentals.reduce((sum, r) => sum + Number(r.totalAmount), 0);
    const completedRentals = customer.rentals.filter(r => r.status === 'Completed').length;
    
    // Determine tier
    let tier = 'Neukunde';
    let tierColor = 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    if (totalRentals >= 10) {
        tier = 'VIP';
        tierColor = 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    } else if (totalRentals >= 3) {
        tier = 'Stammkunde';
        tierColor = 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header & Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/admin/customers"
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                {customer.firstName} {customer.lastName}
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${tierColor}`}>
                                {tier}
                            </span>
                            {!customer.isActive && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 border border-red-200">
                                    Deaktiviert
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Kunde seit {format(new Date(customer.createdAt), 'dd. MMMM yyyy', { locale: de })}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
                        <Mail className="w-4 h-4" />
                        E-Mail senden
                    </button>
                    {!customer.isBlacklisted ? (
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors shadow-sm">
                            <Ban className="w-4 h-4" />
                            Blacklisten
                        </button>
                    ) : (
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Whitelist
                        </button>
                    )}
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Gesamtumsatz</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                        €{totalRevenue.toLocaleString('de-AT')}
                    </p>
                </div>
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Mieten</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {totalRentals} <span className="text-sm font-medium text-gray-400">({completedRentals} OK)</span>
                    </p>
                </div>
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <Globe className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Wohnsitz</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🇦🇹</span>
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                            {customer.country || 'Österreich'}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Status</span>
                    </div>
                    <p className="text-lg font-black flex items-center gap-2">
                        {customer.isActive ? (
                            <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Aktiv</>
                        ) : (
                            <><span className="w-2 h-2 rounded-full bg-gray-400"></span> Inaktiv</>
                        )}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight dark:text-white">Stammdaten bearbeiten</h2>
                        </div>
                        <CustomerForm customer={customer} />
                    </div>

                    {/* Rental History */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                    <History className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight dark:text-white">Kiralama Geçmişi</h2>
                            </div>
                            <Link href={`/admin/customers/${id}/rentals`} className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:underline">
                                Alle ansehen
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-[10px] font-black uppercase tracking-[2px] text-gray-400 border-b border-gray-100 dark:border-white/5">
                                        <th className="pb-4">Vertrag</th>
                                        <th className="pb-4">Fahrzeug</th>
                                        <th className="pb-4">Datum</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4 text-right">Betrag</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {customer.rentals.slice(0, 5).map((rental) => (
                                        <tr key={rental.id} className="group">
                                            <td className="py-4 font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
                                                {rental.contractNumber || `#${rental.id}`}
                                            </td>
                                            <td className="py-4">
                                                <p className="text-sm font-bold dark:text-white">{rental.car.brand} {rental.car.model}</p>
                                                <p className="text-[10px] font-medium text-gray-400">{rental.car.plate}</p>
                                            </td>
                                            <td className="py-4">
                                                <p className="text-xs font-bold dark:text-gray-300">
                                                    {format(new Date(rental.startDate), 'dd.MM.yy')}
                                                </p>
                                            </td>
                                            <td className="py-4">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    rental.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                    rental.status === 'Active' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {rental.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right font-black text-sm dark:text-white">
                                                €{Number(rental.totalAmount).toLocaleString('de-AT')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {customer.rentals.length === 0 && (
                                <div className="py-12 text-center text-gray-400 italic text-sm">
                                    Noch keine Vermietungen verzeichnet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar info */}
                <div className="space-y-8">
                    {/* CRM Notes */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl">
                        <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-500">
                            <FileText className="w-4 h-4" />
                            Dahili Notlar
                        </h3>
                        <textarea 
                            className="w-full h-32 bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                            placeholder="Müşteri hakkında notlar bırakın..."
                            defaultValue={customer.notes || ''}
                        />
                        <button className="w-full mt-4 bg-gray-900 dark:bg-white dark:text-black text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                            Notu Kaydet
                        </button>
                    </div>

                    {/* Verifications */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl">
                        <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-500">
                            <Shield className="w-4 h-4" />
                            Dokumenten-Check
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                                <span className="text-xs font-bold text-green-700 dark:text-green-400">E-Mail verifiziert</span>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Ehliyet yüklendi</span>
                                {customer.licensePhotoUrl ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <Ban className="w-4 h-4 text-gray-300" />}
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">ID verified (Austria)</span>
                                {customer.idAustriaVerified ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <Ban className="w-4 h-4 text-gray-300" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

