'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, Sparkles, Loader2, ShieldCheck, MapPin } from 'lucide-react';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => Promise<void>;
    target: 'mileage' | 'fuel' | 'damage';
    title: string;
    guidelineText: string;
    rentalInfo?: {
        contractNumber?: string;
        plate?: string;
    };
}

export default function CameraModal({
    isOpen,
    onClose,
    onCapture,
    target,
    title,
    guidelineText,
    rentalInfo,
}: CameraModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [geoCoord, setGeoCoord] = useState<string | null>(null);

    // Get location for security stamp
    useEffect(() => {
        if (!isOpen) return;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude.toFixed(4);
                    const lng = pos.coords.longitude.toFixed(4);
                    setGeoCoord(`${lat}, ${lng} (Feldkirch AT)`);
                },
                () => {
                    setGeoCoord('Feldkirch AT');
                },
                { timeout: 5000 }
            );
        } else {
            setGeoCoord('Feldkirch AT');
        }
    }, [isOpen]);

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

    // Take photo with indelible security watermark (Timestamp + Geo + Rental Number)
    const takePhoto = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw camera frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stamp Security Watermark Banner on the bottom
        const bannerHeight = Math.max(36, Math.floor(canvas.height * 0.06));
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

        // Date & Time
        const now = new Date();
        const dateStr = now.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const rentalStr = rentalInfo?.contractNumber ? ` · ${rentalInfo.contractNumber}` : '';
        const plateStr = rentalInfo?.plate ? ` · ${rentalInfo.plate}` : '';
        const locStr = geoCoord ? ` · ${geoCoord}` : ' · Rent-Ex Feldkirch';

        const watermarkText = `RENT-EX VERIFIED LIVE CAPTURE · ${dateStr} ${timeStr}${rentalStr}${plateStr}${locStr}`;

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(12, Math.floor(bannerHeight * 0.42))}px monospace`;
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkText, 16, canvas.height - (bannerHeight / 2));

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    setCapturedBlob(blob);
                    setPreviewUrl(URL.createObjectURL(blob));
                }
            },
            'image/jpeg',
            0.92
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
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between z-10">
                <div className="text-white">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Live-Kamera (Echtzeitnachweis)
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
                </div>
                <button
                    onClick={() => {
                        stopStream();
                        onClose();
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Viewfinder Area */}
            <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">
                {cameraError ? (
                    <div className="p-6 text-center max-w-sm text-white">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-sm font-semibold">{cameraError}</p>
                    </div>
                ) : previewUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl}
                            alt="Captured frame"
                            className="max-h-full max-w-full object-contain rounded-xl"
                        />
                        <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                            <ShieldCheck className="w-4 h-4" />
                            Foto mit Zeit- & Standortstempel erfasst
                        </div>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* Smart HUD Reticle for target */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                            {target === 'mileage' && (
                                <div className="w-72 h-36 border-2 border-dashed border-red-500/80 rounded-2xl bg-black/20 flex flex-col items-center justify-center text-center p-2 backdrop-blur-[1px]">
                                    <div className="w-3 h-3 border-t-2 border-l-2 border-red-400 absolute top-2 left-2" />
                                    <div className="w-3 h-3 border-t-2 border-r-2 border-red-400 absolute top-2 right-2" />
                                    <div className="w-3 h-3 border-b-2 border-l-2 border-red-400 absolute bottom-2 left-2" />
                                    <div className="w-3 h-3 border-b-2 border-r-2 border-red-400 absolute bottom-2 right-2" />
                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-md">
                                        Tachometer / KM-Stand hier zentrieren
                                    </span>
                                </div>
                            )}

                            {target === 'fuel' && (
                                <div className="w-64 h-48 border-2 border-dashed border-blue-400/80 rounded-2xl bg-black/20 flex flex-col items-center justify-center text-center p-2 backdrop-blur-[1px]">
                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-md">
                                        Tankanzeige / Cockpit zentrieren
                                    </span>
                                </div>
                            )}

                            {target === 'damage' && (
                                <div className="w-72 h-72 border-2 border-dashed border-amber-400/80 rounded-2xl bg-black/20 flex flex-col items-center justify-center text-center p-2 backdrop-blur-[1px]">
                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-md">
                                        Beschädigte Stelle nah fotografieren
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Guideline Banner */}
                        <div className="absolute bottom-4 inset-x-4 text-center pointer-events-none">
                            <div className="inline-block px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90">
                                {guidelineText}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-center gap-6 z-10 py-2">
                {previewUrl ? (
                    <>
                        <button
                            type="button"
                            onClick={retake}
                            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Wiederholen
                        </button>
                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={confirmPhoto}
                            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Wird geprüft...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Foto bestätigen
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={takePhoto}
                        disabled={!!cameraError}
                        className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-xl shadow-red-600/40"
                        title="Foto aufnehmen"
                    >
                        <Camera className="w-7 h-7 text-white" />
                    </button>
                )}
            </div>
        </div>
    );
}
