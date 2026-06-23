import Link from "next/link";
import { ChevronLeft, Phone, Mail, MapPin } from "lucide-react";

export default function MobileContact() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white pb-24 transition-colors">
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#141414] sticky top-0 z-20 transition-colors">
        <Link href="/mobile" className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Kontakt</h1>
        <div className="w-10"></div>
      </header>

      <div className="px-5 mt-8 space-y-4">
        <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 transition-colors">
          <Phone className="w-6 h-6 text-[#E53935]" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-[14px]">Telefon</h3>
            <p className="text-[12px] text-gray-500 dark:text-[#A3A3A3]">+43 660 9996800</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 transition-colors">
          <Mail className="w-6 h-6 text-[#E53935]" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-[14px]">E-Mail</h3>
            <p className="text-[12px] text-gray-500 dark:text-[#A3A3A3]">info@rentex.at</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 transition-colors">
          <MapPin className="w-6 h-6 text-[#E53935]" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-[14px]">Adresse</h3>
            <p className="text-[12px] text-gray-500 dark:text-[#A3A3A3]">Feldkirch, Österreich</p>
          </div>
        </div>
      </div>
    </div>
  );
}
