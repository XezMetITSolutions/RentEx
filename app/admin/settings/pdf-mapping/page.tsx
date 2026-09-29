import { getPdfMapping } from '@/lib/pdfMapping';
import PdfMappingEditor from './PdfMappingEditor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { guardAdminArea } from '@/lib/adminAccess';

export const dynamic = 'force-dynamic';

export default async function PdfMappingPage() {
    // Admin-only (the /admin/settings/2fa page stays open to every staff member).
    await guardAdminArea('settings');
    const mapping = await getPdfMapping();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/settings"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF Formular Mapping</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Positionen der Felder auf dem Unfallbericht anpassen</p>
                </div>
            </div>

            <PdfMappingEditor initialMapping={mapping} />
        </div>
    );
}
