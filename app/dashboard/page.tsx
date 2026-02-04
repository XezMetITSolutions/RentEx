import { ArrowRight, Car, Calendar, CreditCard, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Genel Bakış
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Buradan kiralamalarınızı takip edebilir ve hesabınızı yönetebilirsiniz.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Aktif Kiralamalar", value: "1", icon: Car, color: "text-blue-600 dark:text-blue-500" },
                    { label: "Toplam Sürüş", value: "3", icon: Clock, color: "text-emerald-600 dark:text-emerald-500" },
                    { label: "Puanlarım", value: "1.250", icon: ShieldCheck, color: "text-amber-600 dark:text-amber-500" },
                    { label: "Gelecek Rezervasyon", value: "1", icon: Calendar, color: "text-purple-600 dark:text-purple-500" },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                            </div>
                            <div className={`rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">

                {/* Active Rental Card (Main) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Aktif Kiralama</h2>
                        <Link href="/dashboard/rentals" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500">
                            Detayları Gör
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex flex-col md:flex-row">
                            <div className="relative h-64 md:h-auto md:w-2/5 p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
                                {/* Placeholder for car image */}
                                <div className="relative w-full h-40">
                                    {/* Using a generic reliable placeholder since we don't have exact car images yet */}
                                    <img
                                        src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop"
                                        alt="Tesla Model 3"
                                        className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                                <div className="mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">BMW 320i M Sport</h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">34 TB 1923 • Siyah</p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                            Aktif Sürüş
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-1">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Alış</p>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">2 Şubat 2026, 10:00</p>
                                        <p className="text-xs text-zinc-500">İstanbul Havalimanı</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Teslim</p>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">5 Şubat 2026, 10:00</p>
                                        <p className="text-xs text-zinc-500">Sabiha Gökçen</p>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="w-full bg-zinc-100 rounded-full h-2.5 dark:bg-zinc-800 mb-2">
                                        <div className="bg-blue-600 h-2.5 rounded-full w-[65%]"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                        <span>Kalan Süre: 1 Gün 2 Saat</span>
                                        <span>Dönüşe Hazır Olun</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 flex justify-between items-center dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="flex gap-4">
                                <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">Süreyi Uzat</button>
                                <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">Yol Yardımı</button>
                            </div>
                            <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500">
                                Teslim Noktasına Git <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions & Actions */}
                <div className="space-y-6">

                    {/* Recent List */}
                    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Son İşlemler</h3>
                        </div>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {[
                                { title: "Kiralama Ödemesi", date: "2 Şubat 2026", amount: "-₺4.500", type: "expense" },
                                { title: "Depozito İadesi", date: "28 Ocak 2026", amount: "+₺2.000", type: "income" },
                                { title: "Kiralama Ödemesi", date: "25 Ocak 2026", amount: "-₺3.200", type: "expense" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{item.title}</p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.date}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold ${item.type === 'income' ? 'text-emerald-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                        {item.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                            <Link href="/dashboard/payments" className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                                Tümünü Gör <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Support */}
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-900 p-6 text-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                        <h3 className="text-lg font-bold">Yardıma mı ihtiyacınız var?</h3>
                        <p className="mt-2 text-sm text-zinc-400">7/24 Destek ekibimize ulaşabilir veya SSS sayfamızı ziyaret edebilirsiniz.</p>
                        <button className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-100 dark:bg-zinc-100 dark:hover:bg-zinc-200">
                            Canlı Destek Başlat
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
