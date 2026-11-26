import React from 'react';
import { clsx } from 'clsx';

interface AustrianPlateProps {
    plate: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function AustrianPlate({ plate, size = 'sm', className }: AustrianPlateProps) {
    if (!plate) return null;

    // Clean up plate string
    const cleanPlate = plate.trim().toUpperCase();

    // Size variants
    const sizeConfig = {
        sm: {
            container: 'h-6 px-1.5 py-0.5 text-[11px] gap-1.5 border-[1.5px] rounded-[3px]',
            euBand: 'w-2.5 h-full -ml-1.5 pl-0.5 pr-0.5 mr-0.5 text-[7px]',
            crest: 'w-3 h-3',
            font: 'font-mono font-black tracking-wider',
            stars: 'w-1.5 h-1.5 mb-[1px]'
        },
        md: {
            container: 'h-7 px-2 py-0.5 text-xs gap-1.5 border-[2px] rounded-[4px]',
            euBand: 'w-3 h-full -ml-2 pl-0.5 pr-0.5 mr-0.5 text-[8px]',
            crest: 'w-3.5 h-3.5',
            font: 'font-mono font-black tracking-wider',
            stars: 'w-2 h-2 mb-[1px]'
        },
        lg: {
            container: 'h-9 px-3 py-1 text-sm gap-2 border-[2px] rounded-[5px]',
            euBand: 'w-4 h-full -ml-3 pl-1 pr-1 mr-1 text-[9px]',
            crest: 'w-4 h-4',
            font: 'font-mono font-black tracking-wider',
            stars: 'w-2.5 h-2.5 mb-0.5'
        }
    }[size];

    // Austrian plates typically have: [District] [Number / Letter sequence], e.g. "FK 6001", "FK-SI 1414", "W 12345 X"
    // Split into prefix (e.g. FK) and the rest
    const parts = cleanPlate.split(/[\s-]+/);
    const district = parts[0] || '';
    const rest = parts.slice(1).join(' ');

    return (
        <span
            className={clsx(
                "inline-flex items-center bg-white text-zinc-950 border-zinc-900 shadow-xs select-none overflow-hidden relative font-sans leading-none whitespace-nowrap shrink-0",
                sizeConfig.container,
                className
            )}
            title={`Österreichisches Kennzeichen: ${cleanPlate}`}
        >
            {/* EU Band (Blue left stripe with stars and 'A') */}
            <span className={clsx(
                "bg-[#003399] text-white flex flex-col items-center justify-center shrink-0 font-bold self-stretch select-none",
                sizeConfig.euBand
            )}>
                {/* EU Stars circle representation */}
                <svg viewBox="0 0 24 24" className={sizeConfig.stars} fill="#FFCC00">
                    <circle cx="12" cy="3" r="1.5" />
                    <circle cx="17.5" cy="4.5" r="1.5" />
                    <circle cx="21" cy="9.5" r="1.5" />
                    <circle cx="21" cy="15.5" r="1.5" />
                    <circle cx="17.5" cy="19.5" r="1.5" />
                    <circle cx="12" cy="21" r="1.5" />
                    <circle cx="6.5" cy="19.5" r="1.5" />
                    <circle cx="3" cy="15.5" r="1.5" />
                    <circle cx="3" cy="9.5" r="1.5" />
                    <circle cx="6.5" cy="4.5" r="1.5" />
                </svg>
                <span className="font-sans font-black leading-none tracking-tighter">A</span>
            </span>

            {/* District Code */}
            <span className={clsx("font-mono font-black tracking-wide text-zinc-900 shrink-0 whitespace-nowrap")}>
                {district}
            </span>

            {/* Austrian Coat of Arms / Bundesadler Emblem */}
            <span className="shrink-0 flex items-center justify-center" title="Österreichisches Wappen">
                <svg
                    viewBox="0 0 24 28"
                    className={clsx(sizeConfig.crest, "drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.25)]")}
                >
                    {/* Shield with red-white-red Austrian flag */}
                    <path
                        d="M2 3 Q12 1 22 3 L22 17 Q12 27 2 17 Z"
                        fill="#ED2939"
                        stroke="#18181b"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M2 8.5 L22 8.5 L22 14.5 L2 14.5 Z"
                        fill="#FFFFFF"
                    />
                </svg>
            </span>

            {/* Remaining Numbers & Letters */}
            {rest && (
                <span className={clsx("font-mono font-black tracking-wider text-zinc-900 shrink-0 whitespace-nowrap")}>
                    {rest}
                </span>
            )}
        </span>
    );
}
