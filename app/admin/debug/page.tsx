import prisma from '@/lib/prisma';
import { Table, Database, Columns, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDbInfo() {
    try {
        // Get all tables
        const tables: any[] = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;

        // Get columns for key tables
        const tableDetails: Record<string, any[]> = {};
        for (const table of tables as { table_name: string }[]) {
            const tableName = table.table_name;
            const columns: any[] = await prisma.$queryRawUnsafe(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = '${tableName}'
                ORDER BY ordinal_position;
            `);
            tableDetails[tableName] = columns;
        }

        return { tables, tableDetails, error: null as string | null };
    } catch (error: any) {
        return { tables: [] as any[], tableDetails: {} as Record<string, any[]>, error: error.message as string };
    }
}

export default async function DebugPage() {
    const { tables, tableDetails, error } = await getDbInfo();
    const typedTables = tables as { table_name: string }[];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Database className="w-8 h-8 text-blue-600" />
                        System Debugger
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Inspect database schema and system health.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Database Connected</span>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <h3 className="text-red-800 font-bold">Database Error</h3>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {typedTables.map((table) => (
                    <div key={table.table_name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white text-lg">
                                <Table className="w-5 h-5 text-blue-500" />
                                {table.table_name}
                            </div>
                            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg uppercase tracking-wider">
                                {tableDetails[table.table_name]?.length || 0} Columns
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Column</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nullable</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {(tableDetails[table.table_name] || []).map((col: any) => (
                                        <tr key={col.column_name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-3 font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">{col.column_name}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{col.data_type}</td>
                                            <td className="px-6 py-3 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${col.is_nullable === 'YES' ? 'bg-gray-100 text-gray-500 dark:bg-gray-700' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                    {col.is_nullable}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-400 dark:text-gray-500 font-mono italic">
                                                {col.column_default || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="text-blue-900 dark:text-blue-300 font-bold">Diagnosis Guidance</h3>
                        <p className="text-blue-800 dark:text-blue-400 text-sm mt-1 leading-relaxed">
                            Check if any columns in the tables above are missing or have incorrect types according to the Prisma schema.
                            If you recently updated `schema.prisma`, ensure you've run `npx prisma db push`.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
