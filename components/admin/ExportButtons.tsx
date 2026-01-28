'use client';

import { FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonsProps {
    onExportExcel: () => void;
    onExportPDF?: () => void;
    onExportCSV?: () => void;
}

export default function ExportButtons({ onExportExcel, onExportPDF, onExportCSV }: ExportButtonsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <FileDown className="h-4 w-4" />
                Exportieren
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-20">
                        <div className="p-1">
                            <button
                                onClick={() => {
                                    onExportExcel();
                                    setIsOpen(false);
                                }}
                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                Excel (.xlsx)
                            </button>

                            {onExportPDF && (
                                <button
                                    onClick={() => {
                                        onExportPDF();
                                        setIsOpen(false);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <FileText className="h-4 w-4 text-red-600" />
                                    PDF (.pdf)
                                </button>
                            )}

                            {onExportCSV && (
                                <button
                                    onClick={() => {
                                        onExportCSV();
                                        setIsOpen(false);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    CSV (.csv)
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
