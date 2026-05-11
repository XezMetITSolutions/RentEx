'use client';

import { createCustomer, updateCustomer } from '@/app/actions';
import { User, Mail, Phone, MapPin, Calendar, FileText, Save, AlertCircle, Upload, X, ShieldCheck } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';

interface CustomerFormProps {
    customer?: any;
    onSuccess?: (customer: any) => void;
    onCancel?: () => void;
    isModal?: boolean;
}

export default function CustomerForm({ customer, onSuccess, onCancel, isModal }: CustomerFormProps) {
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
        <form action={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Fehler</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                    </div>
                </div>
            )}
            
            <div className={`grid grid-cols-1 ${isModal ? '' : 'md:grid-cols-2'} gap-6`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        Persönliche Daten
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vorname *</label>
                            <input 
                                name="firstName" 
                                type="text" 
                                required 
                                defaultValue={customer?.firstName}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nachname *</label>
                            <input 
                                name="lastName" 
                                type="text" 
                                required 
                                defaultValue={customer?.lastName}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" 
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Geburtsdatum</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    name="dateOfBirth" 
                                    type="date" 
                                    max={maxBirthDate}
                                    defaultValue={customer?.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : ''}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" 
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Führerscheinnummer</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        name="licenseNumber" 
                                        type="text" 
                                        defaultValue={customer?.licenseNumber}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-xs">Ausstellungsdatum</label>
                                    <input 
                                        name="licenseIssueDate" 
                                        type="date" 
                                        max={todayStr}
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-red-500 mb-2 text-xs font-bold">Ablaufdatum *</label>
                                    <input 
                                        name="licenseExpiryDate" 
                                        type="date" 
                                        required 
                                        min={issueDate || todayStr}
                                        defaultValue={customer?.licenseExpiryDate ? new Date(customer.licenseExpiryDate).toISOString().split('T')[0] : ''}
                                        className="w-full px-3 py-2 border border-red-300 dark:border-red-800 bg-white dark:bg-gray-900 rounded-lg text-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            Kontakt & Adresse
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        name="email" 
                                        type="email" 
                                        required 
                                        defaultValue={customer?.email}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        name="phone" 
                                        type="tel" 
                                        defaultValue={customer?.phone}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Straße & Hausnummer</label>
                                <input 
                                    name="address" 
                                    type="text" 
                                    defaultValue={customer?.address}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg" 
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PLZ</label>
                                     <input 
                                         name="postalCode" 
                                         type="text" 
                                         defaultValue={customer?.postalCode}
                                         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg" 
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stadt</label>
                                     <input 
                                         name="city" 
                                         type="text" 
                                         defaultValue={customer?.city}
                                         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg" 
                                     />
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Land</label>
                                 <select 
                                     name="country" 
                                     defaultValue={customer?.country || 'Österreich'}
                                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                                 >
                                     <option value="Österreich">Österreich</option>
                                     <option value="Deutschland">Deutschland</option>
                                     <option value="Schweiz">Schweiz</option>
                                     <option value="Italien">Italien</option>
                                     <option value="Slowenien">Slowenien</option>
                                     <option value="Ungarn">Ungarn</option>
                                     <option value="Tschechien">Tschechien</option>
                                     <option value="Slowakei">Slowakei</option>
                                     <option value="Andere">Andere</option>
                                 </select>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-gray-400" />
                            Dokumente
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <ImageUpload 
                                name="licensePhotoUrl"
                                label="Führerschein"
                                defaultValue={customer?.licensePhotoUrl}
                                uploadUrl="/api/admin/customers/upload"
                                accept="image/*,.pdf"
                            />

                            <ImageUpload 
                                name="idPhotoUrl"
                                label="Personalausweis / Reisepass"
                                defaultValue={customer?.idPhotoUrl}
                                uploadUrl="/api/admin/customers/upload"
                                accept="image/*,.pdf"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium"
                    >
                        Abbrechen
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 transition-all"
                >
                    <Save className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                    {isPending ? 'Speichern...' : 'Kunde speichern'}
                </button>
            </div>
        </form>
    );
}
