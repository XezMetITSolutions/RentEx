'use client';

import { useState } from 'react';
import { Terminal, Play, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { runDebugQuery } from '@/app/actions';

export default function DebugActionPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [customSql, setCustomSql] = useState('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'Option\';');

    async function runQuery(sql?: string) {
        setLoading(true);
        try {
            const res = await runDebugQuery(sql || customSql);
            setResult(res);
        } catch (err: any) {
            setResult({ success: false, error: err.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Terminal className="w-6 h-6 text-blue-500" />
                    SQL & Schema Debugger
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => runQuery()}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Running...' : 'Execute SQL'}
                    </button>
                    <button
                        onClick={() => runQuery('SELECT * FROM "Option" LIMIT 1;')}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                        Test Option Table
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
                <div className="p-3 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400">SQL EDITOR</span>
                </div>
                <textarea
                    value={customSql}
                    onChange={(e) => setCustomSql(e.target.value)}
                    className="w-full h-32 bg-transparent p-4 font-mono text-sm text-blue-400 outline-none resize-none"
                    placeholder="Enter raw SQL here..."
                />
            </div>

            {result && (
                <div className={`rounded-xl border p-4 ${result.success ? 'bg-zinc-900 border-zinc-800' : 'bg-red-900/10 border-red-900/30'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`font-bold ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                            {result.success ? 'Execution Successful' : 'Execution Failed'}
                        </span>
                    </div>

                    {result.error && (
                        <div className="bg-black/40 p-3 rounded-lg border border-red-900/20 mb-4">
                            <p className="text-red-400 font-mono text-xs whitespace-pre-wrap">{result.error}</p>
                        </div>
                    )}

                    {result.data && (
                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left font-mono text-[10px]">
                                <thead>
                                    <tr className="border-b border-zinc-800 py-2">
                                        {Object.keys(result.data[0] || {}).map(key => (
                                            <th key={key} className="p-2 text-zinc-500 uppercase">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.data.map((row: any, i: number) => (
                                        <tr key={i} className="border-b border-zinc-800/50 hover:bg-white/5">
                                            {Object.values(row).map((val: any, j: number) => (
                                                <td key={j} className="p-2 text-zinc-300 max-w-[200px] truncate">
                                                    {val === null ? <span className="text-zinc-600 italic">null</span> : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-blue-900/10 border border-blue-900/20 p-4 rounded-xl">
                <div className="flex gap-3">
                    <Database className="w-5 h-5 text-blue-400" />
                    <div className="text-sm text-blue-300">
                        <p className="font-bold mb-1">Common Fix Queries:</p>
                        <ul className="list-disc list-inside space-y-1 opacity-80">
                            <li>Check columns: <code className="text-blue-400">SELECT column_name FROM information_schema.columns WHERE table_name = 'Option';</code></li>
                            <li>Check data: <code className="text-blue-400">SELECT id, name, "carId" FROM "Option" LIMIT 10;</code></li>
                            <li>Add Column: <code className="text-blue-400">ALTER TABLE "Option" ADD COLUMN "carId" INTEGER;</code></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
