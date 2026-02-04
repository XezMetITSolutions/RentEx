import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Car, Plane, Clock, ShieldCheck, Gem, UserCheck } from "lucide-react";

export default function ServicesPage() {
    const services = [
        {
            icon: Car,
            title: "Kurzzeitmiete",
            description: "Perfekt für Wochenendausflüge oder Geschäftstermine. Mieten Sie flexibel von einem Tag bis zu mehreren Wochen."
        },
        {
            icon: Clock,
            title: "Langzeitmiete",
            description: "Benötigen Sie ein Fahrzeug für einen Monat oder länger? Profitieren Sie von unseren attraktiven Langzeittarifen."
        },
        {
            icon: Plane,
            title: "Flughafentransfer",
            description: "Starten Sie Ihre Reise entspannt. Wir bringen das Fahrzeug direkt zum Flughafen oder holen Sie dort ab."
        },
        {
            icon: Gem,
            title: "Luxus & Sportwagen",
            description: "Erleben Sie Fahrspaß pur mit unserer exklusiven Auswahl an Premium- und Sportfahrzeugen für besondere Anlässe."
        },
        {
            icon: UserCheck,
            title: "Chauffeur-Service",
            description: "Lehnen Sie sich zurück und lassen Sie sich von unseren professionellen Chauffeuren sicher an Ihr Ziel bringen."
        },
        {
            icon: ShieldCheck,
            title: "Firmenkundenservice",
            description: "Maßgeschneiderte Mobilitätslösungen für Ihr Unternehmen. Sonderkonditionen und vereinfachte Abrechnung."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Unsere Dienstleistungen</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Wir bieten mehr als nur Autos. Entdecken Sie unsere umfassenden Mobilitätslösungen,
                        die genau auf Ihre Bedürfnisse zugeschnitten sind.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-zinc-900/50 p-8 rounded-3xl border border-white/10 hover:border-red-500/30 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                                <service.icon className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
