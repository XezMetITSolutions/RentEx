'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-9 w-9 rounded-lg bg-gray-100 animate-pulse"></div>
        );
    }

    const cycleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    return (
        <button
            onClick={cycleTheme}
            className="rounded-[var(--hm-radius-input)] p-2 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 transition-colors border border-transparent hover:border-hm-rule"
            title={theme === 'dark' ? 'Design: Dunkel (Klicken für System)' : theme === 'light' ? 'Design: Hell (Klicken für Dunkel)' : 'Design: System (Klicken für Hell)'}
            aria-label="Farbschema wechseln"
        >
            {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-amber-400" />
            ) : theme === 'light' ? (
                <Sun className="h-4 w-4 text-amber-600" />
            ) : (
                <Monitor className="h-4 w-4 text-hm-muted" />
            )}
        </button>
    );
}
