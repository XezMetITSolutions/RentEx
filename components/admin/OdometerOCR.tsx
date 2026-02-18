
'use client';

import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { detectMileageFromImage } from '@/lib/ocr';

interface OdometerOCRProps {
    onDetected: (mileage: string) => void;
    className?: string;
}

export default function OdometerOCR({ onDetected, className }: OdometerOCRProps) {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const mileage = await detectMileageFromImage(file);
            if (mileage) {
                onDetected(mileage);
            } else {
                alert('Kilometerstand konnte nicht erkannt werden. Bitte deutlichere Aufnahme machen oder manuell eingeben.');
            }
        } catch (error) {
            console.error('OCR Error:', error);
            alert('Fehler bei der Texterkennung');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={className || "p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center border border-blue-100 min-w-[52px]"}
                title="Kilometerstand per Foto erfassen"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Camera className="w-5 h-5" />
                )}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
            />
        </>
    );
}
