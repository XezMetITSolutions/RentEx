'use client';

import { createCustomer } from '@/app/actions';
import { User, Mail, Phone, MapPin, Calendar, FileText, Save, AlertCircle, Upload, X } from 'lucide-react';
import { useState, useTransition } from 'react';

interface CustomerFormProps {
    onSuccess?: (customer: any) => void;
    onCancel?: () => void;
    isModal?: boolean;
}

export default function CustomerForm({ onSuccess, onCancel, isModal }: CustomerFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [licenseFiles, setLicenseFiles] = useState<File[]>([]);
    
    // Logic for date constraints
    const today = new Date();
    const maxBirthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate()).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [issueDate, setIssueDate] = useState<string>('');

    const handleSubmit = async (formData: FormData) => {
        setError(null);

        // Add license files to formData
        licenseFiles.forEach((file, index) => {
            formData.append(`licenseFile${index}`, file);
        });

        startTransition(async () => {
            try {
                const result = await createCustomer(formData);
                if (result && !result.success) {
                    setError(result.error || 'Ein Fehler ist aufgetreten');
                } else if (onSuccess) {
                    // We might need to fetch the newly created customer or have the action return it
                    // For now, we assume success and trigger callback
                    onSuccess(result);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setLicenseFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setLicenseFiles(prev => prev.filter((_, i) => i !== index));
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
                            <input name="firstName" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nachname *</label>
                            <input name="lastName" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Geburtsdatum</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    name="dateOfBirth" 
                                    type="date" 
                                    max={maxBirthDate}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" 
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Führerscheinnummer</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input name="licenseNumber" type="text" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
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
                                    <input name="email" type="email" required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input name="phone" type="tel" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Straße & Hausnummer</label>
                                <input name="address" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PLZ</label>
                                    <input name="postalCode" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stadt</label>
                                    <input name="city" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-gray-400" />
                            Dokumente
                        </h2>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                            <input type="file" id="licenseUpload" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                            <label htmlFor="licenseUpload" className="cursor-pointer block">
                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-xs text-gray-500">Klicken zum Hochladen</p>
                            </label>
                        </div>
                        {licenseFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {licenseFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs">
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button type="button" onClick={() => removeFile(index)}><X className="w-3 h-3 text-red-500" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
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
