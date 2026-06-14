'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
    onClear: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set line style
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Match canvas pixel size to display size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            // Clear on resize
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            onSave(canvas.toDataURL());
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        if (!hasSignature) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            setHasSignature(true);
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasSignature(false);
            onClear();
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative aspect-[2.5/1] w-full bg-white rounded-2xl overflow-hidden touch-none border border-gray-200 dark:border-gray-800 shadow-inner group">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                />
                {!hasSignature ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-350 dark:text-gray-650 gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider">Unterschriftenfeld</span>
                        <p className="text-[10px] text-gray-400">Hier mit dem Finger oder der Maus unterschreiben</p>
                    </div>
                ) : (
                    <div className="absolute top-4 right-4 bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 z-25">
                        <Check className="w-3.5 h-3.5" />
                        Signiert
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={clear}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/80 rounded-xl transition-all"
                >
                    <Eraser className="w-3.5 h-3.5" />
                    Löschen
                </button>
            </div>
        </div>
    );
}
