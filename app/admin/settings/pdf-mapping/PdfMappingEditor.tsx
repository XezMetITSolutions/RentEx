'use client';

import { useState, useRef, useTransition } from 'react';
import { PdfFieldMapping } from '@/lib/pdfMapping';
import { Save, Loader2, Info, Upload, X, Plus, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FieldMarker extends PdfFieldMapping {
    id: string;
}

export default function PdfMappingEditor({ initialMapping }: { initialMapping: PdfFieldMapping[] }) {
    const [mapping, setMapping] = useState<PdfFieldMapping[]>(initialMapping);
    const [isPending, startTransition] = useTransition();
    const [uploadPending, setUploadPending] = useState(false);
    const router = useRouter();
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // PDF Viewer State
    const [pdfFile, setPdfFile] = useState<string | null>('/damage-report-template.pdf');
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [markers, setMarkers] = useState<FieldMarker[]>(
        initialMapping.map((m, i) => ({ ...m, id: `marker-${i}` }))
    );
    const pageRef = useRef<HTMLDivElement>(null);

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadPending(true);
        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const res = await fetch('/api/admin/upload-pdf-template', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            setStatus({ type: 'success', message: 'PDF hochgeladen' });
            setPdfFile(`/damage-report-template.pdf?t=${Date.now()}`); // Cache bust
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus({ type: 'error', message: 'Fehler beim Hochladen' });
        } finally {
            setUploadPending(false);
        }
    };

    const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedField || !pageRef.current) return;

        const rect = pageRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert to PDF coordinates (accounting for scale)
        // PDF coordinate system: (0,0) is bottom-left
        const pageHeight = rect.height / scale;
        const pdfX = Math.round(clickX / scale);
        const pdfY = Math.round(pageHeight - (clickY / scale));

        // Update or create marker
        const existingMarkerIndex = markers.findIndex(m => m.field === selectedField);
        const fieldInfo = mapping.find(m => m.field === selectedField);

        if (existingMarkerIndex >= 0) {
            const newMarkers = [...markers];
            newMarkers[existingMarkerIndex] = {
                ...newMarkers[existingMarkerIndex],
                x: pdfX,
                y: pdfY,
                page: currentPage - 1,
            };
            setMarkers(newMarkers);
        } else if (fieldInfo) {
            const newMarker: FieldMarker = {
                ...fieldInfo,
                id: `marker-${Date.now()}`,
                x: pdfX,
                y: pdfY,
                page: currentPage - 1,
            };
            setMarkers([...markers, newMarker]);
        }

        setSelectedField(null);
    };

    const handleSave = async () => {
        setStatus(null);
        startTransition(async () => {
            try {
                // Update mapping with marker positions
                const updatedMapping = mapping.map(field => {
                    const marker = markers.find(m => m.field === field.field);
                    return marker ? { ...field, x: marker.x, y: marker.y, page: marker.page } : field;
                });

                const res = await fetch('/api/admin/pdf-mapping', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedMapping),
                });

                if (!res.ok) throw new Error('Save failed');

                setMapping(updatedMapping);
                setStatus({ type: 'success', message: 'Einstellungen gespeichert' });
                router.refresh();

                setTimeout(() => setStatus(null), 3000);
            } catch {
                setStatus({ type: 'error', message: 'Fehler beim Speichern' });
            }
        });
    };

    const handleRemoveMarker = (markerId: string) => {
        setMarkers(markers.filter(m => m.id !== markerId));
    };

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-200">
                <Info className="w-5 h-5 flex-shrink-0" />
                <div>
                    <p className="font-semibold mb-1">So funktioniert's</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>PDF-Vorlage hochladen</li>
                        <li>Ein Feld aus der Liste auswählen</li>
                        <li>Auf die gewünschte Position im PDF klicken</li>
                        <li>Speichern wenn alle Felder platziert sind</li>
                    </ol>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">PDF-Vorlage</h3>
                    <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                        {uploadPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        PDF hochladen
                        <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handlePdfUpload}
                            disabled={uploadPending}
                        />
                    </label>
                </div>
            </div>

            {status && (
                <div className={`p-3 text-sm text-center font-medium rounded-lg ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {status.message}
                </div>
            )}

            {/* Main Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Field Selector */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Felder</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Klicken Sie auf ein Feld, dann auf das PDF</p>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {mapping.map((field) => {
                            const hasMarker = markers.some(m => m.field === field.field);
                            const isSelected = selectedField === field.field;

                            return (
                                <button
                                    key={field.field}
                                    onClick={() => setSelectedField(field.field)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${isSelected
                                            ? 'bg-blue-600 text-white'
                                            : hasMarker
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{field.label}</span>
                                        {hasMarker && <span className="text-xs">✓</span>}
                                    </div>
                                    <div className="text-[10px] opacity-60 font-mono mt-0.5">{field.field}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PDF Viewer with Markers */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">PDF Vorschau</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                                className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm"
                            >
                                −
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-16 text-center">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={() => setScale(s => Math.min(2, s + 0.1))}
                                className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm"
                            >
                                +
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="ml-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Speichern
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-96 flex items-center justify-center overflow-auto">
                        <div
                            ref={pageRef}
                            className="relative bg-white shadow-2xl"
                            onClick={handlePageClick}
                            style={{ cursor: selectedField ? 'crosshair' : 'default' }}
                        >
                            <Document
                                file={pdfFile}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                loading={
                                    <div className="w-96 h-96 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                    </div>
                                }
                                error={
                                    <div className="w-96 h-96 flex flex-col items-center justify-center text-gray-500">
                                        <p className="text-sm">Kein PDF geladen</p>
                                        <p className="text-xs mt-2">Bitte laden Sie eine Vorlage hoch</p>
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={currentPage}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>

                            {/* Field Markers */}
                            {markers
                                .filter(m => m.page === currentPage - 1)
                                .map((marker) => {
                                    // Convert PDF coordinates to screen coordinates
                                    const pageHeight = pageRef.current ? pageRef.current.clientHeight / scale : 595;
                                    const screenX = marker.x * scale;
                                    const screenY = (pageHeight - marker.y) * scale;

                                    return (
                                        <div
                                            key={marker.id}
                                            className="absolute group"
                                            style={{
                                                left: `${screenX}px`,
                                                top: `${screenY}px`,
                                                transform: 'translate(-50%, -100%)',
                                            }}
                                        >
                                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium shadow-lg flex items-center gap-1 whitespace-nowrap">
                                                {marker.label}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveMarker(marker.id);
                                                    }}
                                                    className="ml-1 hover:bg-blue-700 rounded p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mx-auto mt-1"></div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Page Navigation */}
                    {numPages > 1 && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm disabled:opacity-50"
                            >
                                ←
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Seite {currentPage} / {numPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                                disabled={currentPage === numPages}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm disabled:opacity-50"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
