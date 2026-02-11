'use client';

import { Trash2, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { deleteCar } from '@/app/actions';

export function DeleteCarButton({ carId }: { carId: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Sind Sie sicher, dass Sie dieses Fahrzeug löschen möchten?')) {
            startTransition(async () => {
                const result = await deleteCar(carId);
                if (!result.success) {
                    alert(result.error);
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-900/20"
            title="Fahrzeug löschen"
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </button>
    );
}
