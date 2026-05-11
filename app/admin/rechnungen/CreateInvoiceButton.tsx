import { createInvoiceFormAction } from '@/app/actions/admin';
import { PlusCircle } from 'lucide-react';

export default function CreateInvoiceButton({ rentalId }: { rentalId: number }) {
    return (
        <form action={async (formData) => { await createInvoiceFormAction(formData); }}>
            <input type="hidden" name="rentalId" value={rentalId} />
            <button
                type="submit"
                className="group flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
                <PlusCircle className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                Rechnung Erstellen
            </button>
        </form>
    );
}
