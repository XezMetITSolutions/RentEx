import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, User, Tag } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function MobileCheckoutDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id, 10);
  const car = await prisma.car.findUnique({ where: { id: carId } });

  return (
    <div className="flex flex-col min-h-screen text-white pb-24 bg-[#0A0A0A]">
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5 bg-[#141414] sticky top-0 z-20">
        <Link href={`/mobile/fleet/${carId}`} className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Buchungsdetails</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Progress Indicator */}
      <div className="px-5 py-6 bg-[#141414] border-b border-white/5">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
          <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-[#E53935] -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(229,57,53,0.4)]">
            1
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#1C1C1C] border border-white/10 flex items-center justify-center text-[#A3A3A3] text-sm font-bold">
            2
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#1C1C1C] border border-white/10 flex items-center justify-center text-[#A3A3A3] text-sm font-bold">
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-[#E53935] font-bold">Details</span>
          <span className="text-[10px] text-[#A3A3A3] font-medium">Zahlung</span>
          <span className="text-[10px] text-[#A3A3A3] font-medium">Fertig</span>
        </div>
      </div>

      {/* Form Fields */}
      <div className="px-5 mt-8 space-y-5">
        <h2 className="text-[18px] font-bold text-white mb-2">Reisedaten eingeben</h2>

        {/* Abholort */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Abholort</label>
          <div className="relative">
            <select className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-12 text-[16px] text-white outline-none focus:border-[#E53935] appearance-none">
              <option>Feldkirch</option>
              <option>Dornbirn</option>
              <option>Bregenz</option>
              <option>Bludenz</option>
              <option>Hohenems</option>
            </select>
            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3] pointer-events-none" />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Abholdatum</label>
            <div className="relative">
              <input type="date" defaultValue="2026-05-12" className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-10 text-[14px] text-white outline-none focus:border-[#E53935] [color-scheme:dark]" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Rückgabedatum</label>
            <div className="relative">
              <input type="date" defaultValue="2026-05-15" className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-10 text-[14px] text-white outline-none focus:border-[#E53935] [color-scheme:dark]" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Alter des Fahrers */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Alter des Fahrers</label>
          <div className="relative">
            <input type="number" placeholder="z.B. 28" defaultValue="28" className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-12 text-[16px] text-white outline-none focus:border-[#E53935]" />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3] pointer-events-none" />
          </div>
        </div>

        {/* Aktionscode */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Aktionscode (Optional)</label>
          <div className="relative">
            <input type="text" placeholder="Code eingeben" className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-12 text-[16px] text-white placeholder-[#A3A3A3] outline-none focus:border-[#E53935]" />
            <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3] pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-[#141414] border-t border-white/10 z-30">
        <Link href={`/mobile/payment/${carId}`} className="flex items-center justify-center w-full py-4 bg-[#E53935] hover:bg-red-700 text-white font-bold text-[16px] rounded-[1rem] transition-colors shadow-lg shadow-[#E53935]/30">
          Weiter
        </Link>
      </div>

    </div>
  );
}
