import { Mail, ArrowRight } from "lucide-react";

export default function NewsletterCta() {
  return (
    <section className="py-24 relative z-10 overflow-hidden transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 md:p-16 overflow-hidden shadow-sm dark:shadow-none transition-colors">
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900/10 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 text-red-500 mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                Bleiben Sie auf dem Laufenden
              </h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm md:text-base max-w-md">
                Abonnieren Sie unseren Newsletter für exklusive Angebote, neue Fahrzeuge in der Flotte und spezielle Rabatte.
              </p>
            </div>

            <div className="w-full md:w-[400px]">
              <form className="relative flex items-center group">
                <input 
                  type="email" 
                  placeholder="Ihre E-Mail Adresse" 
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-6 pr-16 text-gray-900 dark:text-white outline-none focus:border-red-500 transition-all font-medium text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                  required
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 w-12 bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-3 text-center md:text-left">
                Wir respektieren Ihre Privatsphäre. Kein Spam.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
