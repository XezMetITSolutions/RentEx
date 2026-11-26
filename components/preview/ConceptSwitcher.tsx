import React from 'react';
import Link from 'next/link';

interface SwitcherProps {
  current: 'dark-godly' | 'editorial' | 'high-conversion' | 'hyper-minimal' | 'local-story' | 'all-in-one';
}

export default function ConceptSwitcher({ current }: SwitcherProps) {
  const concepts = [
    { id: 'dark-godly', label: '1. Godly Dark', href: '/preview/concepts/dark-godly' },
    { id: 'editorial', label: '2. Swiss Editorial', href: '/preview/concepts/editorial' },
    { id: 'high-conversion', label: '3. High-Conversion', href: '/preview/concepts/high-conversion' },
    { id: 'hyper-minimal', label: '4. Hyper Minimal', href: '/preview/concepts/hyper-minimal' },
    { id: 'local-story', label: '5. Feldkirch Local', href: '/preview/concepts/local-story' },
    { id: 'all-in-one', label: '★ All-Together (Master)', href: '/preview/concepts/all-in-one' },
  ];

  return (
    <aside aria-label="Design-Konzepte Vorschau Switcher" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[96vw] overflow-x-auto no-scrollbar">
      <div className="bg-[#121216]/95 backdrop-blur-xl border border-white/15 px-3 py-2 rounded-full shadow-2xl flex items-center gap-1.5 text-xs whitespace-nowrap">
        <span className="text-zinc-400 font-semibold px-2 text-[11px] uppercase tracking-wider">Konzepte:</span>
        {concepts.map((c) => {
          const isActive = current === c.id;
          return (
            <Link
              key={c.id}
              href={c.href}
              className={`px-3 py-1.5 rounded-full transition-all text-xs ${
                isActive
                  ? 'bg-[#E31E24] text-white font-bold shadow-md shadow-[#E31E24]/30'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
