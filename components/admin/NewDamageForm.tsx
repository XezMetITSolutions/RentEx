'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Car, 
    AlertTriangle, 
    Loader2, 
    CheckCircle, 
    ChevronRight,
    Camera
} from 'lucide-react';
import CheckInDamageSelector, { Damage } from '@/components/admin/CheckInDamageSelector';
import { createDamageRecord } from '@/app/actions/damage-admin';

interface SimpleCar {
    id: number;
    brand: string;
    model: string;
    plate: string;
    checkInTemplate: string | null;
}

interface Props {
    cars: SimpleCar[];
}

export default function NewDamageForm({ cars }: Props) {
    const router = useRouter();
    const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
    const [damages, setDamages] = useState<Damage[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedCar = cars.find(c => c.id === selectedCarId);

    const handleSubmit = async () => {
        if (!selectedCarId || damages.length === 0) return;

        setIsSubmitting(true);
        try {
            // In this manual form, we might create multiple records if multiple damages were marked
            // Or just the first one. Let's create all.
            for (const d of damages) {
                await createDamageRecord({
                    carId: selectedCarId,
                    type: d.reason,
                    description: d.location,
                    locationOnCar: d.side,
                    xPosition: d.x,
                    yPosition: d.y,
                    photoUrl: d.photoUrl,
                    severity: 'Medium',
                    status: 'open'
                });
            }
            router.push('/admin/damage');
            router.refresh();
        } catch (error) {
            alert('Fehler beim Speichern');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Car Selection */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Fahrzeug auswählen</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cars.map((car) => (
                        <button
                            key={car.id}
                            type="button"
                            onClick={() => setSelectedCarId(car.id)}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-start ${
                                selectedCarId === car.id 
                                ? 'border-blue-600 bg-blue-50/50' 
                                : 'border-gray-100 dark:border-gray-800 hover:border-blue-200'
                            }`}
                        >
                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{car.brand} {car.model}</span>
                            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase mt-0.5">{car.plate}</span>
                        </button>
                    ))}
                </div>
            </div>

            {selectedCar && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-1 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-600" />
                        <p className="text-xs font-bold text-blue-700">Tippen Sie auf das Fahrzeug, um Schäden zu markieren.</p>
                    </div>

                    <CheckInDamageSelector 
                        templateFolder={selectedCar.checkInTemplate || 'default'}
                        onChange={setDamages}
                    />

                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button
                            disabled={isSubmitting || damages.length === 0}
                            onClick={handleSubmit}
                            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl flex items-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> SCHÄDEN SPEICHERN</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
