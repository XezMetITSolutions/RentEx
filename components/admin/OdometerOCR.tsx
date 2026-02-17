'use client';

import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { createWorker } from 'tesseract.js';

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
            const worker = await createWorker('eng');
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789'
            });

            const imageUrl = URL.createObjectURL(file);
            const { data: { text } } = await worker.recognize(imageUrl);

            const numbers = text.match(/\d+/g);
            if (numbers && numbers.length > 0) {
                const likelyMileage = numbers.reduce((a, b) => a.length > b.length ? a : b);
                onDetected(likelyMileage);
            } else {
                alert('Kilometerstand konnte nicht erkannt werden. Bitte deutlichere Aufnahme machen oder manuell eingeben.');
            }

            await worker.terminate();
            URL.revokeObjectURL(imageUrl);
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
