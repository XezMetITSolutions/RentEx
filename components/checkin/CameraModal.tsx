'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => Promise<void>;
    target: 'mileage' | 'fuel' | 'damage';
    title: string;
    guidelineText: string;
}

export default function CameraModal({
    isOpen,
    onClose,
    onCapture,
    target,
    title,
    guidelineText,
}: CameraModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Start live camera stream
    useEffect(() => {
        if (!isOpen) {
            stopStream();
            return;
        }

        let activeStream: MediaStream | null = null;

        async function startCamera() {
            setCameraError(null);
            setCapturedBlob(null);
            setPreviewUrl(null);

            try {
                // Request environment (back) camera on mobile, with fallback to any camera
                activeStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                    audio: false,
                });

                setStream(activeStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = activeStream;
                }
            } catch (err: any) {
                console.error('[Camera Access Error]', err);
                setCameraError(
                    'Kamerazugriff wurde verweigert oder ist nicht verfügbar. Bitte erlauben Sie den Kamerazugriff in Ihrem Browser.'
                );
            }
        }

        startCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach((t) => t.stop());
            }
        };
    }, [isOpen]);

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const takePhoto = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    setCapturedBlob(blob);
                    setPreviewUrl(URL.createObjectURL(blob));
                }
            },
            'image/jpeg',
            0.9
        );
    };

    const retake = () => {
        setCapturedBlob(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const confirmPhoto = async () => {
        if (!capturedBlob) return;
        setIsProcessing(true);

        try {
            const fileName = `live-${target}-${Date.now()}.jpg`;
            const file = new File([capturedBlob], fileName, { type: 'image/jpeg' });
            await onCapture(file);
            stopStream();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between z-10">
                <div className="text-white">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        <Camera className="w-3.5 h-3.5" /> Live-Kamera
                    </div>
                    <h3 className="text-lg font-bold">{title}</h3>
                </div>
                <button
                    onClick={() => {
                        stopStream();
                        onClose();
                    }}
                    disabled={isProcessing}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Viewfinder / Preview */}
            <div className="relative flex-1 my-4 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-2xl">
                {cameraError ? (
                    <div className="p-6 text-center max-w-sm text-white">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-300 mb-4">{cameraError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold"
                        >
                            Seite neu laden
                        </button>
                    </div>
                ) : previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Aufnahme" className="w-full h-full object-contain" />
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* Interactive HUD / Overlay Guide */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                            {target === 'mileage' || target === 'fuel' ? (
                                <div className="w-72 h-44 border-2 border-dashed border-red-500/70 rounded-2xl flex flex-col items-center justify-center bg-red-500/5 backdrop-blur-[1px]">
                                    <span className="text-xs font-semibold text-white/90 bg-black/60 px-3 py-1.5 rounded-lg text-center">
                                        Tachostand & Tankanzeige hier zentrieren
                                    </span>
                                </div>
                            ) : (
                                <div className="w-80 h-56 border-2 border-dashed border-emerald-500/70 rounded-2xl flex flex-col items-center justify-center bg-emerald-500/5 backdrop-blur-[1px]">
                                    <span className="text-xs font-semibold text-white/90 bg-black/60 px-3 py-1.5 rounded-lg text-center">
                                        Fahrzeugteil / Schaden vollständig erfassen
                                    </span>
                                </div>
                            )}
                            <p className="mt-4 text-xs font-medium text-white/80 bg-black/70 px-4 py-2 rounded-xl text-center shadow-lg max-w-xs">
                                {guidelineText}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-4 z-10 pb-2">
                {previewUrl ? (
                    <>
                        <button
                            type="button"
                            onClick={retake}
                            disabled={isProcessing}
                            className="flex-1 max-w-[160px] py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" /> Wiederholen
                        </button>
                        <button
                            type="button"
                            onClick={confirmPhoto}
                            disabled={isProcessing}
                            className="flex-1 max-w-[200px] py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Prüfe...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" /> Foto verwenden
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={takePhoto}
                        disabled={!!cameraError}
                        className="w-20 h-20 rounded-full border-4 border-white bg-red-600 active:scale-95 transition-transform flex items-center justify-center shadow-2xl hover:bg-red-500"
                        aria-label="Foto aufnehmen"
                    >
                        <div className="w-14 h-14 rounded-full border-2 border-white/40" />
                    </button>
                )}
            </div>
        </div>
    );
}
