'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckInLinkShare({ rentalId, token }: { rentalId: number; token?: string }) {
    const [copied, setCopied] = useState(false);
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
    const link = typeof window !== 'undefined'
        ? `${window.location.origin}/self-checkin/${rentalId}${tokenQuery}`
        : `/self-checkin/${rentalId}${tokenQuery}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success('Sicherer Self Check-in Link kopiert!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Link konnte nicht kopiert werden.');
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                <span>{copied ? 'Kopiert!' : 'Sicheren Link kopieren'}</span>
            </button>
            <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors"
            >
                <Key className="w-3.5 h-3.5 text-gray-500" />
                <span>Vorschau öffnen</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
        </div>
    );
}
