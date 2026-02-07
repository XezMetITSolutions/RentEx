import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CouponForm from './CouponForm';

export const dynamic = 'force-dynamic';

export default function NewCouponPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Neuer Gutschein</h1>
                <Link
                    href="/admin/marketing"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück
                </Link>
            </div>
            <CouponForm />
        </div>
    );
}
