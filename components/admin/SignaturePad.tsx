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
            <div className="relative aspect-[2/1] w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden touch-none">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full cursor-crosshair"
                />
                {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300">
                        <p className="text-sm">Hier unterschreiben</p>
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={clear}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Eraser className="w-3.5 h-3.5" />
                    Löschen
                </button>
            </div>
        </div>
    );
}
