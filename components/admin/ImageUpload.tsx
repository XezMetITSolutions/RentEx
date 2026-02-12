'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    defaultValue?: string;
    name: string;
    label?: string;
    onUploadSuccess?: (url: string) => void;
}

export default function ImageUpload({ defaultValue = '', name, label = 'Fahrzeugfoto', onUploadSuccess }: ImageUploadProps) {
    const [imageUrl, setImageUrl] = useState(defaultValue);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/admin/cars/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setImageUrl(data.url);
                if (onUploadSuccess) onUploadSuccess(data.url);
            } else {
                setError(data.error || 'Upload fehlgeschlagen');
            }
        } catch (err) {
            setError('Netzwerkfehler beim Upload');
            console.error(err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        setImageUrl('');
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

            <div className="flex flex-col gap-4">
                {/* Image Preview or Placeholder */}
                <div className="relative group w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center overflow-hidden transition-all hover:border-red-400 dark:hover:border-red-500">
                    {imageUrl ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt="Upload Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition-colors"
                                >
                                    <Upload className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-lg text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                                ) : (
                                    <Upload className="w-8 h-8" />
                                )}
                            </div>
                            <span className="text-sm font-medium">Bilder vom Computer wählen</span>
                            <span className="text-xs">PNG, JPG bis 10MB</span>
                        </button>
                    )}
                </div>

                {/* Manual URL Input as fallback */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <ImageIcon className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            name={name}
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Oder Bild-URL hier einfügen..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white"
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-xs text-red-500 font-medium">{error}</p>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
}
