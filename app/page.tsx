import Link from "next/link";
import { ArrowRight, LayoutDashboard, Car } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/30 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px]" />

      <main className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-red-300 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Next.js 15 + Tailwind v4 • Modernste Infrastruktur
        </div>

        {/* Logo */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/50">
            <Car className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">RENT</span>
          <span className="bg-gradient-to-b from-red-500 to-red-600 bg-clip-text text-transparent">-EX</span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
          Das Autovermietungssystem der nächsten Generation. <br />
          Verwalten Sie Ihre Flotte mit einer modernen, schnellen und zuverlässigen Infrastruktur.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/admin"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all hover:scale-105"
          >
            <LayoutDashboard className="w-5 h-5" />
            Admin Panel
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/customer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-xl font-semibold transition-all hover:scale-105"
          >
            Kundenportal
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
