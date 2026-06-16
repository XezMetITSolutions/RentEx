import { Car, CreditCard, Key } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Car className="w-8 h-8 text-red-500" />,
      title: "1. Fahrzeug wählen",
      description: "Finden Sie das perfekte Fahrzeug aus unserer exklusiven Premium-Flotte."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-red-500" />,
      title: "2. Online buchen",
      description: "Reservieren Sie Ihr Fahrzeug schnell und sicher in nur wenigen Klicks."
    },
    {
      icon: <Key className="w-8 h-8 text-red-500" />,
      title: "3. Einsteigen & Losfahren",
      description: "Holen Sie den Schlüssel ab und genießen Sie die Fahrt ohne Limits."
    }
  ];

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="inline-block text-[10px] font-black px-3 py-1 bg-red-500/10 text-red-500 rounded-full uppercase tracking-widest border border-red-500/20">So einfach geht's</span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            In 3 Schritten zum Ziel
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0 -translate-y-1/2 z-0" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-[#0f0f0f] border border-white/5 flex items-center justify-center mb-6 group-hover:border-red-500/50 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all duration-500">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-zinc-400 text-sm max-w-[280px] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
