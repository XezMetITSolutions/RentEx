'use client';

import {
    FileText,
    Download,
    Printer,
    Share2,
    ExternalLink,
    ChevronLeft,
    Mail,
    Receipt,
    Building2,
    User,
    Calendar,
    Zap,
    Car
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';

interface InvoiceViewProps {
    invoice: {
        id: number;
        invoiceNumber: string;
        issuedAt: Date | string;
        subtotal: number | string;
        taxRate: number | string;
        taxAmount: number | string;
        total: number | string;
        status: string;
        rental: {
            contractNumber: string | null;
            startDate: Date | string;
            endDate: Date | string;
            totalDays: number;
            dailyRate: number | string;
            extrasCost: number | string;
            insuranceCost: number | string;
            insuranceType: string | null;
            car: {
                brand: string;
                model: string;
                plate: string;
            };
            customer: {
                firstName: string;
                lastName: string;
                email: string;
                phone: string | null;
                address: string | null;
                city: string | null;
                postalCode: string | null;
                country: string | null;
                company: string | null;
            };
        };
    };
}

export default function InvoiceView({ invoice }: InvoiceViewProps) {
    const handlePrint = () => {
        window.print();
    };

    const customer = invoice.rental.customer;
    const car = invoice.rental.car;
    const rental = invoice.rental;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 print:py-0 print:px-0">
            {/* Dynamic Navigation & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <Link
                    href="/admin/rechnungen"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Zurück zu Rechnungen
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Drucken
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-red-600/20">
                        <Download className="w-4 h-4 mr-2" />
                        PDF Export
                    </button>
                </div>
            </div>

            {/* Main Invoice Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden print:shadow-none print:border-none">
                {/* Invoice Header */}
                <div className="p-8 sm:p-12 border-b border-gray-100 dark:border-gray-800 relative">
                    <div className="absolute top-0 right-0 p-8 sm:p-12 flex flex-col items-end">
                        <div className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="text-red-600">RENT</span>
                            <span>-EX</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Autovermietung GmbH</p>
                    </div>

                    <div className="mt-8 sm:mt-0">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">RECHNUNG</h1>
                        <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-12">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rechnungs-Nr.</p>
                                <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Datum</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {format(new Date(invoice.issuedAt), 'dd. MMMM yyyy', { locale: de })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Addresses Section */}
                <div className="grid sm:grid-cols-2">
                    <div className="p-8 sm:p-12 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Empfänger</p>
                        <div className="space-y-1">
                            {customer.company && <p className="font-bold text-gray-900 dark:text-white">{customer.company}</p>}
                            <p className="text-gray-900 dark:text-white font-medium">{customer.firstName} {customer.lastName}</p>
                            <p className="text-gray-600 dark:text-gray-400">{customer.address}</p>
                            <p className="text-gray-600 dark:text-gray-400">{customer.postalCode} {customer.city}</p>
                            <p className="text-gray-600 dark:text-gray-400">{customer.country}</p>
                            <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                            </div>
                        </div>
                    </div>
                    <div className="p-8 sm:p-12 bg-gray-50/50 dark:bg-gray-800/30">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Absender</p>
                        <div className="space-y-1 text-sm">
                            <p className="font-bold text-gray-900 dark:text-white">Rent-Ex Autovermietung GmbH</p>
                            <p className="text-gray-600 dark:text-gray-400">Arlbergstraße 101</p>
                            <p className="text-gray-600 dark:text-gray-400">6850 Dornbirn</p>
                            <p className="text-gray-600 dark:text-gray-400">Österreich</p>
                            <div className="pt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">UID-Nr.</p>
                                    <p className="text-xs text-gray-900 dark:text-white">ATU78123456</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Firmenbuch</p>
                                    <p className="text-xs text-gray-900 dark:text-white">FN 567891 a</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rental Info Table */}
                <div className="p-8 sm:p-12">
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Mietobjekt</p>
                            <p className="text-gray-900 dark:text-white font-bold">{car.brand} {car.model} <span className="text-gray-400 dark:text-gray-500 font-normal ml-2">({car.plate})</span></p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-400 uppercase">Vertrag</p>
                            <p className="text-gray-900 dark:text-white font-mono font-bold text-sm">{rental.contractNumber}</p>
                        </div>
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Beschreibung</th>
                                <th className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Menge</th>
                                <th className="py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Einzelpreis</th>
                                <th className="py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Gesamt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            <tr>
                                <td className="py-6">
                                    <p className="font-bold text-gray-900 dark:text-white">Fahrzeugmiete</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Zeitraum: {format(new Date(rental.startDate), 'dd.MM.yyyy')} – {format(new Date(rental.endDate), 'dd.MM.yyyy')}
                                    </p>
                                </td>
                                <td className="py-6 text-center text-gray-600 dark:text-gray-400">{rental.totalDays} Tag(e)</td>
                                <td className="py-6 text-right text-gray-600 dark:text-gray-400">€{Number(rental.dailyRate).toFixed(2)}</td>
                                <td className="py-6 text-right font-medium text-gray-900 dark:text-white">€{(Number(rental.dailyRate) * rental.totalDays).toFixed(2)}</td>
                            </tr>
                            {Number(rental.extrasCost) > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-bold text-gray-900 dark:text-white">Zusatzoptionen / Extras</p>
                                        <p className="text-xs text-gray-500 mt-1">Ausgewähltes Zubehör</p>
                                    </td>
                                    <td className="py-6 text-center text-gray-600 dark:text-gray-400">1 Pausch.</td>
                                    <td className="py-6 text-right text-gray-600 dark:text-gray-400">€{Number(rental.extrasCost).toFixed(2)}</td>
                                    <td className="py-6 text-right font-medium text-gray-900 dark:text-white">€{Number(rental.extrasCost).toFixed(2)}</td>
                                </tr>
                            )}
                            {Number(rental.insuranceCost) > 0 && (
                                <tr>
                                    <td className="py-6">
                                        <p className="font-bold text-gray-900 dark:text-white">Versicherung ({rental.insuranceType})</p>
                                        <p className="text-xs text-gray-500 mt-1">Zusätzlicher Schutz & Haftung</p>
                                    </td>
                                    <td className="py-6 text-center text-gray-600 dark:text-gray-400">1 Pausch.</td>
                                    <td className="py-6 text-right text-gray-600 dark:text-gray-400">€{Number(rental.insuranceCost).toFixed(2)}</td>
                                    <td className="py-6 text-right font-medium text-gray-900 dark:text-white">€{Number(rental.insuranceCost).toFixed(2)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Invoice Footer / Totals */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 sm:p-12">
                    <div className="flex flex-col sm:flex-row justify-between gap-8">
                        <div className="max-w-xs">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Zahlungsinhalt</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Der Betrag wurde gemäß dem Vertrag bereits beglichen. Vielen Dank für Ihr Vertrauen!
                            </p>
                        </div>

                        <div className="w-full sm:w-80 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Netto</span>
                                <span>€{Number(invoice.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>MwSt. ({invoice.taxRate}%)</span>
                                <span>€{Number(invoice.taxAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Gesamtbetrag</span>
                                <span className="text-2xl font-black text-red-600">€{Number(invoice.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700 text-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold grid grid-cols-1 sm:grid-cols-3 gap-8 print:grid-cols-3">
                        <div>Bank: Sparkasse Vorarlberg</div>
                        <div>IBAN: AT12 3456 7890 1234 5678</div>
                        <div>BIC: SPKVAT21XXX</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
