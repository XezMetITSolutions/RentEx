"use client";

import { Shield, Clock, Award, Smartphone } from "lucide-react";

const features = [
    {
        icon: Shield,
        title: "Vollkasko",
        description: "Alle unsere Fahrzeuge sind vollkaskoversichert. Keine überraschenden Kosten."
    },
    {
        icon: Clock,
        title: "24/7 Übergabe",
        description: "Ob Flughafen oder Hotel, Sie können Ihr Fahrzeug rund um die Uhr abholen und zurückgeben."
    },
    {
        icon: Award,
        title: "Premium Flotte",
        description: "Wir bieten nur die neuesten und gepflegtesten Fahrzeuge an. Ihr Komfort hat Priorität."
    },
    {
        icon: Smartphone,
        title: "Einfache Anmietung",
        description: "Schließen Sie den Mietvorgang in nur 2 Minuten über unsere mobile App oder Website ab."
    }
];

export default function Features() {
    return (
        <div className="py-24 bg-black/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Warum RentEx?</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Wir vermieten nicht nur Autos, wir bieten Ihnen ein perfektes Reiseerlebnis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                                <feature.icon className="w-6 h-6 text-red-500" />
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-3">
                                {feature.title}
                            </h3>

                            <p className="text-gray-400 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
