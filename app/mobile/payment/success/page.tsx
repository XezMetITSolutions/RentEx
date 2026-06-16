"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Copy } from "lucide-react";

import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingRef = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#0A0A0A] items-center justify-center p-5">
      
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 relative">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
      </div>

      <h1 className="text-[28px] font-bold text-white mb-3 text-center">Buchung bestätigt!</h1>
      <p className="text-[#A3A3A3] text-center text-[14px] leading-relaxed max-w-[280px] mb-8">
        Ihre Zahlung war erfolgreich. Wir haben Ihnen eine Bestätigungs-E-Mail gesendet.
      </p>

      <div className="bg-[#1C1C1C] border border-white/5 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center">
        <span className="text-[12px] text-[#A3A3A3] mb-2">Ihre Buchungsnummer</span>
        <div className="flex items-center gap-3">
          <span className="text-[20px] font-bold text-white tracking-wider">{bookingRef}</span>
          <button className="p-2 bg-[#2A2A2A] rounded-lg hover:bg-white/10 transition-colors">
            <Copy className="w-4 h-4 text-[#A3A3A3]" />
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0A0A0A] max-w-md mx-auto">
        <Link 
          href="/mobile/bookings" 
          className="flex items-center justify-center w-full py-4 bg-[#E53935] hover:bg-red-700 text-white font-bold text-[16px] rounded-[1rem] transition-colors shadow-lg shadow-[#E53935]/30 mb-3"
        >
          Zu meinen Buchungen
        </Link>
        <Link 
          href="/mobile" 
          className="flex items-center justify-center w-full py-4 bg-[#1C1C1C] border border-white/5 hover:border-white/20 text-white font-bold text-[16px] rounded-[1rem] transition-colors"
        >
          Zurück zur Startseite
        </Link>
      </div>

    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-[#0A0A0A] items-center justify-center text-white">Lade...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
