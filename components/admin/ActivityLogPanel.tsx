'use client';

import { useState, useMemo } from 'react';
import { Activity, User, Car, Calendar, CreditCard, Settings as SettingsIcon, Filter, Search, ChevronDown, ChevronUp, Cpu, Monitor } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface ActivityLog {
    id: string;
    userName?: string;
    action: string;
    entityType: string;
    description: string;
    createdAt: Date | string;
    ipAddress?: string;
    metadata?: string;
    userAgent?: string;
}

// Translations map for Actions
const actionTranslations: Record<string, string> = {
    'Created': 'Erstellt',
    'Updated': 'Aktualisiert',
    'Deleted': 'Gelöscht',
    'Completed': 'Abgeschlossen',
    'Cancelled': 'Storniert',
    'Payment': 'Zahlung',
    'Logged In': 'Eingeloggt',
    'Logged Out': 'Ausgeloggt',
    'Failed Login': 'Fehlgeschlagener Login',
    'Sent': 'Gesendet'
};

// Translations map for Entity Types
const entityTranslations: Record<string, string> = {
    'Car': 'Fahrzeug',
    'Customer': 'Kunde',
    'Rental': 'Reservierung',
    'Payment': 'Zahlung',
    'Email': 'E-Mail',
    'SystemSettings': 'Einstellungen',
    'Staff': 'Mitarbeiter',
    'Location': 'Standort',
    'Option': 'Zusatzoption',
    'DamageRecord': 'Schadensprotokoll',
    'Task': 'Aufgabe'
};

export default function ActivityLogPanel({ initialLogs }: { initialLogs: ActivityLog[] }) {
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

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
            default: return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
        }
    };

    // Filter logic
    const filteredLogs = useMemo(() => {
        return initialLogs.filter(log => {
            // Search filter
            const query = search.toLowerCase();
            const matchesSearch = 
                log.description.toLowerCase().includes(query) ||
                (log.userName && log.userName.toLowerCase().includes(query)) ||
                (log.ipAddress && log.ipAddress.toLowerCase().includes(query)) ||
                (log.metadata && log.metadata.toLowerCase().includes(query)) ||
                log.entityType.toLowerCase().includes(query);

            // Entity Type filter
            const matchesEntity = entityFilter === 'all' || log.entityType.toLowerCase() === entityFilter.toLowerCase();

            // Action filter
            const matchesAction = actionFilter === 'all' || log.action.toLowerCase() === actionFilter.toLowerCase();

            return matchesSearch && matchesEntity && matchesAction;
        });
    }, [initialLogs, search, entityFilter, actionFilter]);

    // Unique entities list for select menu
    const uniqueEntities = useMemo(() => {
        const set = new Set(initialLogs.map(l => l.entityType));
        return Array.from(set);
    }, [initialLogs]);

    // Unique actions list for select menu
    const uniqueActions = useMemo(() => {
        const set = new Set(initialLogs.map(l => l.action));
        return Array.from(set);
    }, [initialLogs]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            {/* Header & Controls */}
            <div className="border-b border-gray-150 dark:border-gray-700/50 px-6 py-5 bg-gray-50/50 dark:bg-gray-900/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aktivitätsprotokoll</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Echtzeit-Überwachung aller Systemaktivitäten ({filteredLogs.length} Einträge)</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Aktivitäten durchsuchen..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 pl-9 pr-4 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                            />
                        </div>

                        {/* Entity Filter */}
                        <select 
                            value={entityFilter}
                            onChange={(e) => setEntityFilter(e.target.value)}
                            className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                        >
                            <option value="all">Alle Medientypen</option>
                            {uniqueEntities.map(entity => (
                                <option key={entity} value={entity}>
                                    {entityTranslations[entity] || entity}
                                </option>
                            ))}
                        </select>

                        {/* Action Filter */}
                        <select 
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                        >
                            <option value="all">Alle Aktionen</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>
                                    {actionTranslations[action] || action}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredLogs.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                        Keine Aktivitäten gefunden, die Ihren Filtern entsprechen.
                    </div>
                ) : filteredLogs.map((log) => {
                    const Icon = getIcon(log.entityType);
                    const isExpanded = expandedLogId === log.id;
                    const logDate = typeof log.createdAt === 'string' ? new Date(log.createdAt) : log.createdAt;

                    return (
                        <div key={log.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/10 transition-colors">
                            <div className="px-6 py-5 flex items-start gap-4">
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${getActionColor(log.action)}`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-gray-950 dark:text-white">{log.userName ?? 'System'}</span>
                                        <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getActionColor(log.action)}`}>
                                            {actionTranslations[log.action] || log.action}
                                        </span>
                                        <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 px-2 py-0.5 rounded-md">
                                            {entityTranslations[log.entityType] || log.entityType}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{log.description}</p>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mt-2.5">
                                        <span className="font-medium">{formatDistanceToNow(logDate, { addSuffix: true, locale: de })}</span>
                                        {log.ipAddress && (
                                            <>
                                                <span>•</span>
                                                <span className="font-mono">IP: {log.ipAddress}</span>
                                            </>
                                        )}
                                        {(log.metadata || log.userAgent) && (
                                            <>
                                                <span>•</span>
                                                <button
                                                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold transition-all"
                                                >
                                                    {isExpanded ? (
                                                        <>Details ausblenden <ChevronUp className="w-3.5 h-3.5" /></>
                                                    ) : (
                                                        <>Details anzeigen <ChevronDown className="w-3.5 h-3.5" /></>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Details Panel Expand */}
                            {isExpanded && (log.metadata || log.userAgent) && (
                                <div className="px-6 pb-6 pt-1 bg-gray-50/50 dark:bg-gray-900/30 border-t border-dashed border-gray-150 dark:border-gray-800 space-y-4">
                                    {log.userAgent && (
                                        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <Monitor className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold text-gray-700 dark:text-gray-300">Browser / User Agent:</span>
                                                <p className="font-mono mt-0.5 break-all text-[11px] bg-white dark:bg-gray-950 p-2 rounded-lg border border-gray-200/50 dark:border-gray-800">
                                                    {log.userAgent}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {log.metadata && (
                                        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <Cpu className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                            <div className="w-full">
                                                <span className="font-bold text-gray-700 dark:text-gray-300">Zusätzliche Metadaten (JSON):</span>
                                                <pre className="mt-1 text-[11px] font-mono p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-200/50 dark:border-gray-800 text-emerald-600 dark:text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all max-h-60">
                                                    {(() => {
                                                        try {
                                                            const parsed = JSON.parse(log.metadata);
                                                            return JSON.stringify(parsed, null, 2);
                                                        } catch (e) {
                                                            return log.metadata;
                                                        }
                                                    })()}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
