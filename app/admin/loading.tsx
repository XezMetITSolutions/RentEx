import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
    return (
        <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600 dark:text-red-500" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lade Daten...</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Einen Moment bitte</p>
                </div>
            </div>
        </div>
    );
}
