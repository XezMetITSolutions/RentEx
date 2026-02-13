'use client';

import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, XCircle, ChevronDown, List, Database, Code, RefreshCw, Send } from 'lucide-react';
import { runDiagnostics, testUpdateCarAction } from '@/app/actions';

export default function DiagnosisPage() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    async function fetchReport() {
        setLoading(true);
        setError(null);
        try {
            const result = await runDiagnostics();
            if (result.success) {
                setReport(result.results);
            } else {
                setError(result.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function runUpdateTest() {
        setTestLoading(true);
        setTestResult(null);
        try {
            const result = await testUpdateCarAction(48);
            setTestResult(result);
        } catch (err: any) {
            setTestResult({ success: false, error: err.message });
        } finally {
            setTestLoading(false);
        }
    }

    useEffect(() => {
        fetchReport();
    }, []);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Activity className="w-8 h-8 text-red-500" />
                        Sistem Teşhis & Sağlık Raporu
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Veritabanı uyuşmazlıklarını ve runtime hatalarını analiz edin.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={runUpdateTest}
                        disabled={testLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {testLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Update Testi Yap (ID 48)
                    </button>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        <Activity className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Yeniden Analiz Et
                    </button>
                </div>
            </div>

            {testResult && (
                <div className={`p-6 rounded-2xl border flex items-start gap-4 ${testResult.success ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'}`}>
                    {testResult.success ? <CheckCircle className="w-6 h-6 text-green-500 mt-1" /> : <ShieldAlert className="w-6 h-6 text-red-500 mt-1" />}
                    <div className="flex-1 overflow-hidden">
                        <h3 className={`font-bold text-lg ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
                            {testResult.success ? 'Yazma Testi Başarılı' : 'Yazma Testi Başarısız (TÜM HATA DETAYI)'}
                        </h3>
                        {testResult.error && (
                            <div className="mt-4 space-y-2">
                                <p className="text-red-400 font-mono text-xs p-3 bg-black/40 border border-red-900/20 rounded-lg whitespace-pre-wrap">
                                    {testResult.error}
                                </p>
                                {testResult.stack && (
                                    <p className="text-gray-500 font-mono text-[10px] p-3 bg-black/20 rounded-lg overflow-x-auto whitespace-pre">
                                        {testResult.stack}
                                    </p>
                                )}
                            </div>
                        )}
                        {testResult.message && <p className="text-green-400 font-medium mt-1">{testResult.message}</p>}
                    </div>
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-2xl flex items-start gap-4">
                    <ShieldAlert className="w-6 h-6 text-red-500 mt-1" />
                    <div>
                        <h3 className="text-red-500 font-bold text-lg">Kritik Sistem Hatası</h3>
                        <p className="text-red-400 font-mono text-sm mt-2 whitespace-pre-wrap">{error}</p>
                    </div>
                </div>
            )}

            {report && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Database Connection */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Database className="w-4 h-4" /> Veritabanı Bağlantısı
                        </h3>
                        {report.database.status === 'connected' ? (
                            <div className="flex items-center gap-2 text-green-500 font-bold">
                                <CheckCircle className="w-5 h-5" /> Bağlantı Başarılı
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-500 font-bold">
                                <XCircle className="w-5 h-5" /> {report.database.status}
                            </div>
                        )}
                    </div>

                    {/* Model Status */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 md:col-span-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Code className="w-4 h-4" /> Prisma Modelleri & Kayıt Sayıları
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(report.models).map(([name, status]: [string, any]) => (
                                <div key={name} className={`p-4 rounded-xl border ${status.status === 'ok' ? 'bg-zinc-50 dark:bg-black/20 border-zinc-100 dark:border-zinc-800' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-gray-900 dark:text-gray-100 capitalize">{name}</span>
                                        {status.status === 'ok' ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>
                                    {status.status === 'ok' ? (
                                        <span className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">{status.count}</span>
                                    ) : (
                                        <div className="text-[10px] text-red-400 font-mono mt-2 overflow-hidden text-ellipsis h-12">
                                            {status.error}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Option Schema Details */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 md:col-span-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <List className="w-4 h-4" /> 'Option' Tablosu Mevcut Şeması (Database)
                        </h3>
                        <div className="bg-zinc-50 dark:bg-black/40 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                            <table className="w-full text-left text-sm font-mono">
                                <thead className="bg-zinc-100 dark:bg-zinc-800/50">
                                    <tr>
                                        <th className="px-4 py-2 text-zinc-500">Sütun Adı</th>
                                        <th className="px-4 py-2 text-zinc-500">Veri Tipi</th>
                                        <th className="px-4 py-2 text-zinc-500">Boş Geçilebilir</th>
                                        <th className="px-4 py-2 text-zinc-500 text-right">Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.schema.map((col: any) => (
                                        <tr key={col.column_name} className="border-t border-zinc-100 dark:border-zinc-800">
                                            <td className="px-4 py-2 font-bold text-zinc-700 dark:text-zinc-300">{col.column_name}</td>
                                            <td className="px-4 py-2 text-zinc-500">{col.data_type}</td>
                                            <td className="px-4 py-2 text-zinc-500">{col.is_nullable}</td>
                                            <td className="px-4 py-2 text-right">
                                                {['carId', 'carCategory', 'groupId'].includes(col.column_name) ? (
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-[10px] font-bold">GEREKLİ</span>
                                                ) : <span className="text-zinc-400">Standart</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
