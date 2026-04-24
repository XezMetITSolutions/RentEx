'use client';

import { X } from 'lucide-react';
import CustomerForm from './CustomerForm';
import { useEffect } from 'react';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (customer: any) => void;
}

export default function CustomerModal({ isOpen, onClose, onSuccess }: CustomerModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 animate-in zoom-in-95 duration-200">
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Neuer Kunde</h2>
                        <p className="text-xs text-gray-500">Registrieren Sie einen neuen Kunden im System</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6">
                    <CustomerForm 
                        isModal={true}
                        onSuccess={(result) => {
                            onSuccess(result);
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
