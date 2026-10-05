'use client';

import { createInvoiceFormAction } from '@/app/actions/admin';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50"
        >
            {pending ? (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Erstelle...
                </>
            ) : (
                <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    Rechnung erstellen
                </>
            )}
        </button>
    );
}

export default function CreateInvoiceButton({ rentalId }: { rentalId: number }) {
    return (
        <form action={createInvoiceFormAction}>
            <input type="hidden" name="rentalId" value={String(rentalId)} />
            <SubmitButton />
        </form>
    );
}
