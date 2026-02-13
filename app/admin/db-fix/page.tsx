'use client';

import { useState } from 'react';
import { Database, ShieldAlert, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { fixDatabaseSchema } from '@/app/actions';

export default function DbFixPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    async function handleFix() {
        if (!confirm('Bu işlem veritabanı şemasını (One-to-Many) senkronize edecek. Devam edilsin mi?')) return;

        setStatus('loading');
        try {
            const result = await fixDatabaseSchema();
            if (result.success) {
                setStatus('success');
                setMessage('Veritabanı şeması başarıyla senkronize edildi. Artık araç düzenleme formunu kullanabilirsiniz.');
            } else {
                setStatus('error');
                setMessage(result.error || 'Bir hata oluştu.');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Beklenmedik bir hata oluştu.');
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-red-600/5 to-orange-600/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <Database className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Veritabanı Onarım Aracı</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Şema uyumsuzluklarını ve 500 hatalarını giderin.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl">
                        <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div className="text-sm text-orange-800 dark:text-orange-300">
                            <p className="font-bold mb-1">Dikkat!</p>
                            <p>Bu işlem `Option` tablosuna `carId` sütununu ekler ve eski çoktan-çoğa ilişki tablosunu siler. Sadece Vercel üzerindeki 500 hatalarını düzeltmek için kullanın.</p>
                        </div>
                    </div>

                    {status === 'success' && (
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="text-sm text-green-800 dark:text-green-300 italic font-medium">
                                {message}
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
                            <p className="text-sm text-red-800 dark:text-red-300 font-bold mb-1">Hata Oluştu</p>
                            <p className="text-xs text-red-700 dark:text-red-400 font-mono">{message}</p>
                        </div>
                    )}

                    <button
                        onClick={handleFix}
                        disabled={status === 'loading'}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                    >
                        {status === 'loading' ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <RefreshCw className="w-6 h-6" />
                        )}
                        {status === 'loading' ? 'İşlem Yapılıyor...' : 'Şemayı Senkronize Et (One-to-ManyFix)'}
                    </button>
                </div>
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    &copy; 2026 Rent-Ex Admin Tools | Database ID: {process.env.NEXT_PUBLIC_VERCEL_ENV || 'Production'}
                </p>
            </div>
        </div>
    );
}
