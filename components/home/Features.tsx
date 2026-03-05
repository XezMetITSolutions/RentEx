"use client";

import Link from "next/link";
import { ArrowRight, Package, Car, Gem } from "lucide-react";

const categories = [
    {
        icon: Package,
        slug: "kastenwagen",
        title: "Kastenwagen",
        subtitle: "Transporter & Nutzfahrzeuge",
        description:
            "Perfekt für Umzüge, Lieferungen und Gewerbetreibende. Unsere Kastenwagen bieten maximales Ladevolumen bei optimaler Fahrbarkeit.",
        features: ["Großes Ladervolumen", "Einfaches Be- & Entladen", "Ideal für Gewerbe"],
        gradient: "from-slate-800 via-slate-700 to-slate-900",
        accent: "from-orange-500 to-amber-400",
        iconBg: "bg-orange-500/10 border-orange-500/20",
        iconColor: "text-orange-400",
        badgeColor: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        linkColor: "text-orange-400 hover:text-orange-300",
        glowColor: "group-hover:shadow-orange-500/10",
    },
    {
        icon: Car,
        slug: "pkw",
        title: "PKW",
        subtitle: "Kompakt & Komfortabel",
        description:
            "Von kompakten Stadtflitzern bis hin zu geräumigen Kombis. Unsere PKW-Flotte deckt jeden Bedarf ab – ob Alltag oder Familienausflug.",
        features: ["Breite Modellauswahl", "Sparsamer Verbrauch", "Für jeden Anlass"],
        gradient: "from-zinc-800 via-zinc-700 to-zinc-900",
        accent: "from-red-500 to-rose-400",
        iconBg: "bg-red-500/10 border-red-500/20",
        iconColor: "text-red-400",
        badgeColor: "bg-red-500/10 text-red-400 border border-red-500/20",
        linkColor: "text-red-400 hover:text-red-300",
        glowColor: "group-hover:shadow-red-500/10",
    },
    {
        icon: Gem,
        slug: "luxuswagen",
        title: "Luxuswagen",
        subtitle: "Premium & Exklusiv",
        description:
            "Erleben Sie Fahren auf höchstem Niveau. Unsere Luxusfahrzeuge der Spitzenklasse bieten Eleganz, Kraft und unvergleichlichen Komfort.",
        features: ["Premium Marken", "Höchster Fahrkomfort", "Exklusives Erlebnis"],
        gradient: "from-neutral-800 via-neutral-700 to-neutral-900",
        accent: "from-yellow-400 to-amber-300",
        iconBg: "bg-yellow-500/10 border-yellow-500/20",
        iconColor: "text-yellow-400",
        badgeColor: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
        linkColor: "text-yellow-400 hover:text-yellow-300",
        glowColor: "group-hover:shadow-yellow-500/10",
    },
];

export default function Features() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-black/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold tracking-wider uppercase mb-4">
                        Unsere Fahrzeugklassen
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Das Richtige für jeden Bedarf
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Ob Transporter, Alltagsfahrzeug oder Luxusklasse – wir haben die perfekte Lösung für Sie.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {categories.map((cat, index) => (
                        <div
                            key={index}
                            className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${cat.gradient} border border-white/10 shadow-2xl ${cat.glowColor} hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
                        >
                            {/* Top gradient accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.accent}`} />

                            {/* Noise texture overlay */}
                            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

                            {/* Glow blob */}
                            <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${cat.accent} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />

                            <div className="relative p-7 sm:p-8 flex flex-col h-full">
                                {/* Icon + badge row */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`w-14 h-14 rounded-xl ${cat.iconBg} border flex items-center justify-center`}>
                                        <cat.icon className={`w-7 h-7 ${cat.iconColor}`} />
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cat.badgeColor} tracking-wide`}>
                                        {cat.subtitle}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    {cat.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    {cat.description}
                                </p>

                                {/* Feature bullets */}
                                <ul className="space-y-2 mb-8">
                                    {cat.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                                            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${cat.accent} flex-shrink-0`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <div className="mt-auto">
                                    <Link
                                        href={`/fleet?category=${cat.slug}`}
                                        className={`group/link flex items-center gap-2 font-semibold text-sm ${cat.linkColor} transition-colors`}
                                    >
                                        Fahrzeuge ansehen
                                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
