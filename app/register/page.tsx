import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="max-w-md w-full bg-zinc-900/50 p-8 rounded-3xl border border-white/10 text-center">
                    <h1 className="text-3xl font-bold mb-6 text-white">Registrieren</h1>
                    <p className="text-gray-400 mb-4">Registrierungs-Funktionalität wird bald verfügbar sein.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
