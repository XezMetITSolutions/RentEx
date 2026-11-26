'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckInLinkShare({ rentalId }: { rentalId: number }) {
    const [copied, setCopied] = useState(false);
    const link = typeof window !== 'undefined'
        ? `${window.location.origin}/self-checkin/${rentalId}`
        : `/self-checkin/${rentalId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success('Self Check-in Link kopiert!');
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule font-mono text-xs font-semibold text-hm-ink transition-colors cursor-pointer"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-hm-accent" />}
                <span>{copied ? 'Kopiert!' : 'Link kopieren'}</span>
            </button>
            <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 hover:bg-hm-paper border border-hm-rule font-mono text-xs font-semibold text-hm-ink transition-colors"
            >
                <Key className="w-3.5 h-3.5 text-hm-muted" />
                <span>Vorschau öffnen</span>
                <ExternalLink className="w-3 h-3 text-hm-muted" />
            </a>
        </div>
    );
}
