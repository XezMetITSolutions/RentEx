import Link from "next/link";
import { ChevronLeft, User, Settings, LogOut, FileText } from "lucide-react";
import { getCurrentCustomer } from "@/lib/dashboardAuth";

export default async function MobileAccount() {
  const customer = await getCurrentCustomer();
  return (
    <div className="flex flex-col min-h-screen text-white pb-24 bg-[#0A0A0A]">
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5 bg-[#141414] sticky top-0 z-20">
        <Link href="/mobile" className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Mein Konto</h1>
        <div className="w-10"></div>
      </header>

      <div className="px-5 mt-8">
        {!customer ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1C1C1C] flex items-center justify-center mb-6">
              <User className="w-10 h-10 text-[#A3A3A3]" />
            </div>
            <h2 className="text-[20px] font-bold text-white mb-2">Willkommen bei RentEx</h2>
            <p className="text-[14px] text-[#A3A3A3] mb-8 px-4">
              Bitte melden Sie sich an, um Ihr Profil und Ihre Buchungen zu verwalten.
            </p>
            <Link href="/login" className="w-full bg-[#E53935] py-4 rounded-xl font-bold text-center hover:bg-red-700 transition-colors">
              Anmelden / Registrieren
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-[#E53935] flex items-center justify-center text-white text-2xl font-bold">
                {customer.firstName?.[0]}{customer.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-white">{customer.firstName} {customer.lastName}</h2>
                <p className="text-[12px] text-[#A3A3A3]">{customer.email}</p>
              </div>
            </div>

        <div className="space-y-3">
          <button className="w-full bg-[#1C1C1C] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#A3A3A3]" />
              <span className="text-[14px] font-medium text-white">Profil bearbeiten</span>
            </div>
          </button>
          <button className="w-full bg-[#1C1C1C] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#A3A3A3]" />
              <span className="text-[14px] font-medium text-white">Dokumente & Verträge</span>
            </div>
          </button>
          <button className="w-full bg-[#1C1C1C] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#A3A3A3]" />
              <span className="text-[14px] font-medium text-white">Einstellungen</span>
            </div>
          </button>
            <Link href="/api/admin/logout" className="w-full bg-[#1C1C1C] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-[#E53935]/10 group transition-colors mt-6">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-[#E53935]" />
                <span className="text-[14px] font-medium text-[#E53935]">Abmelden</span>
              </div>
            </Link>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
