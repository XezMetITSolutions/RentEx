import prisma from '@/lib/prisma';
import { Activity, User, Car, Calendar, CreditCard, Settings as SettingsIcon, Filter, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

async function getActivityLogs() {
    const logs = await prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
    });

    return logs.map(log => ({
        id: String(log.id),
        userName: log.userName ?? undefined,
        action: log.action,
        entityType: log.entityType,
        description: log.description,
        createdAt: log.createdAt,
        ipAddress: log.ipAddress ?? undefined
    }));
}

export default async function ActivityLogPanel() {
    const logs = await getActivityLogs();

    const getIcon = (entityType: string) => {
        switch (entityType) {
            case 'Car': return Car;
            case 'Customer': return User;
            case 'Rental': return Calendar;
            case 'Payment': return CreditCard;
            case 'Email': return Activity;
            default: return SettingsIcon;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'Created': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
            case 'Updated': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
            case 'Deleted': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
            case 'Payment': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
            case 'Completed': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aktivitätsprotokoll</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Letzte Systemaktivitäten</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Suchen..."
                                className="h-9 w-48 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 pl-9 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <select className="h-9 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                            <option value="all">Alle Aktivitäten</option>
                            <option value="car">Fahrzeuge</option>
                            <option value="rental">Reservierungen</option>
                            <option value="customer">Kunden</option>
                            <option value="payment">Zahlungen</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {logs.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        Keine Aktivitäten vorhanden.
                    </div>
                ) : logs.map((log) => {
                    const Icon = getIcon(log.entityType);
                    return (
                        <div key={log.id} className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${getActionColor(log.action)}`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{log.userName ?? 'System'}</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{log.entityType}</span>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{log.description}</p>

                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span>{formatDistanceToNow(log.createdAt, { addSuffix: true, locale: de })}</span>
                                        {log.ipAddress && (
                                            <>
                                                <span>•</span>
                                                <span>IP: {log.ipAddress}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4">
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    Alle Aktivitäten anzeigen →
                </button>
            </div>
        </div>
    );
}
