import { createInvoiceFormAction } from '@/app/actions/admin';

export default function CreateInvoiceButton({ rentalId }: { rentalId: number }) {
    return (
        <form action={createInvoiceFormAction}>
            <input type="hidden" name="rentalId" value={rentalId} />
            <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                Rechnung erstellen
            </button>
        </form>
    );
}
