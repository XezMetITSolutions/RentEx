'use client';

import { createCustomer, updateCustomer } from '@/app/actions';
import { User, Mail, Phone, MapPin, Calendar, FileText, Save, AlertCircle, Upload, X, ShieldCheck } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';

interface CustomerFormProps {
    customer?: any;
    countries?: any[];
    onSuccess?: (customer: any) => void;
    onCancel?: () => void;
    isModal?: boolean;
}

export default function CustomerForm({ customer, countries = [], onSuccess, onCancel, isModal }: CustomerFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    
    // Logic for date constraints
    const today = new Date();
    const maxBirthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate()).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [issueDate, setIssueDate] = useState<string>(
        customer?.licenseIssueDate ? new Date(customer.licenseIssueDate).toISOString().split('T')[0] : ''
    );

    const handleSubmit = async (formData: FormData) => {
        setError(null);

        startTransition(async () => {
            try {
                let result;
                if (customer?.id) {
                    result = await updateCustomer(customer.id, formData);
                } else {
                    result = await createCustomer(formData);
                }

                if (result && !result.success) {
                    setError(result.error || 'Ein Fehler ist aufgetreten');
                } else {
                    if (onSuccess) {
                        onSuccess(result.customer);
                    } else if (!isModal) {
                        router.push('/admin/customers');
                        router.refresh();
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            }
        });
    };


    return (
        <form action={handleSubmit} className="space-y-10">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-black text-red-800 dark:text-red-200 uppercase tracking-wider">Fehler</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">{error}</p>
                    </div>
                </div>
            )}
            
            <div className={`grid grid-cols-1 ${isModal ? '' : 'lg:grid-cols-2'} gap-12`}>
                {/* Left Section: Personal Info */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 pb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                            <User className="w-4 h-4" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[2px] text-gray-500">Persönliche Daten</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Vorname *</label>
                            <input 
                                name="firstName" 
                                type="text" 
                                required 
                                defaultValue={customer?.firstName}
                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all dark:text-white font-medium" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Nachname *</label>
                            <input 
                                name="lastName" 
                                type="text" 
                                required 
                                defaultValue={customer?.lastName}
                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all dark:text-white font-medium" 
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Geburtsdatum</label>
                            <div className="relative">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    name="dateOfBirth" 
                                    type="date" 
                                    max={maxBirthDate}
                                    defaultValue={customer?.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : ''}
                                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all dark:text-white font-medium" 
                                />
                            </div>
                        </div>

                        {/* License Info */}
                        <div className="sm:col-span-2 pt-4 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Führerscheinnummer</label>
                                <div className="relative">
                                    <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        name="licenseNumber" 
                                        type="text" 
                                        defaultValue={customer?.licenseNumber}
                                        className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all dark:text-white font-medium" 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Ausstellung</label>
                                    <input 
                                        name="licenseIssueDate" 
                                        type="date" 
                                        max={todayStr}
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all dark:text-white text-sm font-medium" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-red-500 ml-1">Ablaufdatum *</label>
                                    <input 
                                        name="licenseExpiryDate" 
                                        type="date" 
                                        required 
                                        min={issueDate || todayStr}
                                        defaultValue={customer?.licenseExpiryDate ? new Date(customer.licenseExpiryDate).toISOString().split('T')[0] : ''}
                                        className="w-full px-5 py-3.5 bg-red-50/30 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl focus:ring-4 focus:ring-red-500/10 outline-none transition-all dark:text-white text-sm font-medium" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Contact & Documents */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 pb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[2px] text-gray-500">Kontakt & Adresse</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">E-Mail *</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        name="email" 
                                        type="email" 
                                        required 
                                        defaultValue={customer?.email}
                                        className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all dark:text-white font-medium" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        name="phone" 
                                        type="tel" 
                                        defaultValue={customer?.phone}
                                        className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all dark:text-white font-medium" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Straße & Hausnummer</label>
                            <input 
                                name="address" 
                                type="text" 
                                defaultValue={customer?.address}
                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl outline-none transition-all dark:text-white font-medium" 
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">PLZ</label>
                                <input 
                                    name="postalCode" 
                                    type="text" 
                                    defaultValue={customer?.postalCode}
                                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl outline-none font-medium" 
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Stadt</label>
                                <input 
                                    name="city" 
                                    type="text" 
                                    defaultValue={customer?.city}
                                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl outline-none font-medium" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Land</label>
                            <select 
                                name="country" 
                                defaultValue={customer?.country || 'Österreich'}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white font-bold cursor-pointer appearance-none"
                            >
                                {countries.length > 0 ? (
                                    countries.map((c: any) => (
                                        <option key={c.id} value={c.nicename} className="dark:bg-gray-900">
                                            {c.nicename}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="Österreich">Österreich</option>
                                        <option value="Deutschland">Deutschland</option>
                                        <option value="Schweiz">Schweiz</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Uploads */}
                    <div className="pt-8 space-y-8">
                        <div className="flex items-center gap-3 pb-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-[2px] text-gray-500">Dokumente</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <ImageUpload 
                                name="licensePhotoUrl"
                                label="Führerschein"
                                defaultValue={customer?.licensePhotoUrl}
                                uploadUrl="/api/admin/customers/upload"
                                accept="image/*,.pdf"
                                hideUrlInput={true}
                            />

                            <ImageUpload 
                                name="idPhotoUrl"
                                label="Ausweis / Reisepass"
                                defaultValue={customer?.idPhotoUrl}
                                uploadUrl="/api/admin/customers/upload"
                                accept="image/*,.pdf"
                                hideUrlInput={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-6 pt-12 border-t border-gray-50 dark:border-white/5">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-8 py-3 text-sm font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Abbrechen
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="group relative flex items-center gap-3 px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Save className={`w-5 h-5 ${isPending ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                    <span className="uppercase tracking-widest text-xs">Daten Speichern</span>
                </button>
            </div>
        </form>
    );
}
