'use client';

import { useState } from 'react';
import { 
    User, Mail, Phone, MapPin, Calendar, 
    Shield, Globe, Award, Edit, FileText, 
    CheckCircle2, AlertCircle, ExternalLink, 
    Activity, ShieldCheck, X, Clipboard, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import CustomerForm from './CustomerForm';
import Link from 'next/link';

interface CustomerProfileViewProps {
    customer: any;
    countries: any[];
}

export default function CustomerProfileView({ customer, countries }: CustomerProfileViewProps) {
    const [isEditing, setIsEditing] = useState(false);

    const isLicenseExpired = customer.licenseExpiryDate ? new Date(customer.licenseExpiryDate) < new Date() : false;
    const isLicenseMissing = !customer.licenseNumber;

    const formattedBirthDate = customer.dateOfBirth 
        ? format(new Date(customer.dateOfBirth), 'dd.MM.yyyy', { locale: de }) 
        : 'Nicht angegeben';

    const formattedLicenseIssue = customer.licenseIssueDate 
        ? format(new Date(customer.licenseIssueDate), 'dd.MM.yyyy', { locale: de }) 
        : 'Nicht angegeben';

    const formattedLicenseExpiry = customer.licenseExpiryDate 
        ? format(new Date(customer.licenseExpiryDate), 'dd.MM.yyyy', { locale: de }) 
        : 'Nicht angegeben';

    const activeRental = customer.rentals?.find((r: any) => r.status === 'Active');

    return (
        <div className="space-y-6">
            {/* Active Rental Banner */}
            {activeRental && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Activity className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300">Aktive Vermietung</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                                Derzeit fährt der Kunde den <span className="font-semibold">{activeRental.car.brand} {activeRental.car.model}</span> ({activeRental.car.plate}).
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/admin/reservations/${activeRental.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                        Buchung ansehen <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            {/* Main Details Area */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            {isEditing ? 'Stammdaten bearbeiten' : 'Kunden-Stammdaten'}
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs border ${
                            isEditing 
                            ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:text-gray-200'
                            : 'bg-blue-55 hover:bg-blue-60 hover:text-white border-blue-100 text-blue-600 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-400'
                        }`}
                    >
                        {isEditing ? (
                            <>
                                <X className="w-3.5 h-3.5" />
                                <span>Abbrechen</span>
                            </>
                        ) : (
                            <>
                                <Edit className="w-3.5 h-3.5" />
                                <span>Bearbeiten</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="p-6">
                    {isEditing ? (
                        <CustomerForm 
                            customer={customer} 
                            countries={countries} 
                            onCancel={() => setIsEditing(false)}
                            onSuccess={() => {
                                setIsEditing(false);
                                window.location.reload();
                            }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
                            {/* Left Column: Personal info & address */}
                            <div className="space-y-6 md:pr-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Persönliche & Kontakt Daten</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Kunden-Typ</span>
                                        <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{customer.customerType || 'Privatkunde'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Geburtsdatum</span>
                                        <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{formattedBirthDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Telefonnummer</span>
                                        <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">
                                            {customer.phone ? (
                                                <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                                    {customer.phone}
                                                </a>
                                            ) : 'Nicht angegeben'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Nationalität</span>
                                        <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{customer.nationality || 'Nicht angegeben'}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Adresse</span>
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-950 dark:text-white">{customer.address || 'Nicht angegeben'}</p>
                                            <p>{customer.postalCode} {customer.city}</p>
                                            <p className="font-medium text-xs text-gray-400 mt-1 uppercase tracking-wide">{customer.country}</p>
                                        </div>
                                    </div>
                                </div>

                                {customer.company && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Firma</span>
                                            <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{customer.company}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400">UID Nummer</span>
                                            <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{customer.taxId || 'Nicht angegeben'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: License, ID & Loyalty details */}
                            <div className="space-y-6 pt-6 md:pt-0 md:pl-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Führerschein & Identität</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Führerscheinnummer</span>
                                        <p className="text-sm font-mono font-bold mt-0.5 text-gray-900 dark:text-white">{customer.licenseNumber || 'Nicht hinterlegt'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Ausstellungsdatum</span>
                                        <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{formattedLicenseIssue}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Gültig bis</span>
                                        <p className={`text-sm font-bold mt-0.5 ${isLicenseExpired ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{formattedLicenseExpiry}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Ausweistyp / Nummer</span>
                                        <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">
                                            {customer.idType ? `${customer.idType}: ` : ''}
                                            <span className="font-mono">{customer.idNumber || 'Nicht hinterlegt'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Sadakat & Partner (Loyalty)</h3>
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <span className="text-[9px] uppercase font-bold text-gray-400">KM-Guthaben</span>
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                                {(customer.kmBalance?.balance || 0).toLocaleString('de-AT')} km
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[9px] uppercase font-bold text-gray-400">Referenzcode</span>
                                            <p className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-1">
                                                {customer.referralCode || 'Keiner'}
                                                {customer.referralCode && (
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(customer.referralCode);
                                                            alert('Kopiert!');
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Clipboard className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Previews Card */}
            {!isEditing && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Hinterlegte Dokumente</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* License Photo Preview */}
                        <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50/20 dark:bg-gray-950/20 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Führerschein Kopie</span>
                            {customer.licensePhotoUrl ? (
                                <div className="w-full flex flex-col items-center">
                                    {customer.licensePhotoUrl.toLowerCase().endsWith('.pdf') ? (
                                        <div className="h-32 flex flex-col items-center justify-center gap-2">
                                            <FileText className="w-12 h-12 text-blue-500" />
                                            <span className="text-[10px] text-gray-500 truncate max-w-[200px]">{customer.licensePhotoUrl.split('/').pop()}</span>
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-black">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={customer.licensePhotoUrl} alt="Führerschein" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <a 
                                        href={customer.licensePhotoUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-bold"
                                    >
                                        Dokument ansehen <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            ) : (
                                <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
                                    <AlertCircle className="w-8 h-8" />
                                    <span className="text-xs font-medium italic">Kein Führerschein hochgeladen</span>
                                </div>
                            )}
                        </div>

                        {/* ID / Passport Photo Preview */}
                        <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50/20 dark:bg-gray-950/20 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ausweis / Reisepass Kopie</span>
                            {customer.idPhotoUrl ? (
                                <div className="w-full flex flex-col items-center">
                                    {customer.idPhotoUrl.toLowerCase().endsWith('.pdf') ? (
                                        <div className="h-32 flex flex-col items-center justify-center gap-2">
                                            <FileText className="w-12 h-12 text-blue-500" />
                                            <span className="text-[10px] text-gray-500 truncate max-w-[200px]">{customer.idPhotoUrl.split('/').pop()}</span>
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-black">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={customer.idPhotoUrl} alt="Ausweis/Pass" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <a 
                                        href={customer.idPhotoUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-bold"
                                    >
                                        Dokument ansehen <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            ) : (
                                <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
                                    <AlertCircle className="w-8 h-8" />
                                    <span className="text-xs font-medium italic">Kein Ausweis hochgeladen</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
