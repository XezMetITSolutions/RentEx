"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MoreHorizontal, MapPin, Calendar, Clock, ChevronDown, Check, X, Info, User } from "lucide-react";
import { checkCarAvailability, previewCoupon, type CouponPreview } from "@/app/actions/booking-checks";
import { calculateChargeableDays, todayInBusinessTimeZone } from "@/lib/bookingUtils";
import CustomDatePicker from "@/components/ui/CustomDatePicker";


export default function MobileCheckoutClient({ car, customer, locations, options = [] }: { car: any, customer: any, locations: any[], options?: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const todayISO = todayInBusinessTimeZone();
  const threeDaysLater = new Date(`${todayISO}T12:00:00Z`);
  threeDaysLater.setUTCDate(threeDaysLater.getUTCDate() + 3);
  const defaultEndISO = threeDaysLater.toISOString().split("T")[0];
  
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  
  // Pickup and return always happen at the car's own location.
  const carLocation = locations.find((loc) => loc.id === car.locationId);
  
  const [abholdatum, setAbholdatum] = useState(fromParam || todayISO);
  const [abholzeit, setAbholzeit] = useState("10:00");
  const [rueckgabedatum, setRueckgabedatum] = useState(toParam || defaultEndISO);
  const [rueckgabezeit, setRueckgabezeit] = useState("10:00");
  
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  
  const [promoCode, setPromoCode] = useState("");
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  // "YYYY-MM-DD" / "HH:MM" strings compare correctly as plain strings.
  const isValidDate = !!abholdatum && !!rueckgabedatum && abholdatum >= todayISO &&
    (rueckgabedatum > abholdatum || (rueckgabedatum === abholdatum && rueckgabezeit > abholzeit));
  const isFormValid = abholdatum && rueckgabedatum && isValidDate && isAvailable && !isChecking;

  useEffect(() => {
    if (!isValidDate) return;
    let cancelled = false;
    setIsChecking(true);
    checkCarAvailability(car.id, abholdatum, abholzeit, rueckgabedatum, rueckgabezeit).then((available) => {
      if (cancelled) return;
      setIsAvailable(available);
      setIsChecking(false);
    });
    return () => { cancelled = true; };
  }, [abholdatum, abholzeit, rueckgabedatum, rueckgabezeit, car.id, isValidDate]);

  // Pricing math using actual options and calculateChargeableDays
  const days = calculateChargeableDays(abholdatum, abholzeit, rueckgabedatum, rueckgabezeit);
  const basePrice = Number(car.dailyRate);
  const totalBase = days * basePrice;
  
  const selectedOptions = options.filter(o => selectedOptionIds.includes(o.id));
  let extrasCost = 0;
  selectedOptions.forEach(opt => {
    if (opt.isPerDay) {
      extrasCost += (Number(opt.price) || 0) * days;
    } else {
      extrasCost += (Number(opt.price) || 0);
    }
  });

  const discount = coupon?.valid ? coupon.discountAmount : 0;
  const total = Math.max(0, totalBase + extrasCost - discount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsCheckingCoupon(true);
    try {
      setCoupon(await previewCoupon(promoCode, car.id, abholdatum, abholzeit, rueckgabedatum, rueckgabezeit, selectedOptionIds));
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  // The discount depends on period and extras; drop a stale preview when they change.
  useEffect(() => {
    setCoupon((prev) => (prev?.valid ? null : prev));
  }, [abholdatum, abholzeit, rueckgabedatum, rueckgabezeit, selectedOptionIds]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white pb-[360px] transition-colors">
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#141414] sticky top-0 z-20 transition-colors">
        <Link href={`/mobile/fleet/${car.id}`} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Buchungsdetails</h1>
        <button className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Step Indicator */}
      <div className="px-5 py-6 bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-white/5 transition-colors">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-white/5 -translate-y-1/2 z-0 transition-colors"></div>
          <div className="absolute top-1/2 left-0 w-0 h-0.5 bg-[#E53935] -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(229,57,53,0.4)]">
            1
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-[#A3A3A3] text-sm font-bold transition-colors">
            2
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-[#A3A3A3] text-sm font-bold transition-colors">
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-[#E53935] font-bold">Details</span>
          <span className="text-[10px] text-gray-400 dark:text-[#A3A3A3] font-medium">Übersicht</span>
          <span className="text-[10px] text-gray-400 dark:text-[#A3A3A3] font-medium">Zahlung</span>
        </div>
      </div>

      {/* Selected Vehicle Summary */}
      <div className="px-5 mt-6">
        <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-2xl p-3 flex items-center gap-4 transition-colors">
          <div className="relative w-20 h-14 bg-gray-100 dark:bg-black/20 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            <Image src={car.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800"} alt={car.model} fill className="object-cover" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">{car.brand} {car.model}</h3>
            <div className="text-[12px] mt-0.5">
              <span className="text-[#E53935] font-bold">{new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(basePrice)}</span>
              <span className="text-gray-500 dark:text-[#A3A3A3]"> / Tag</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Info (Who is paying?) */}
      <div className="px-5 mt-6">
        <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#E53935]/10 dark:bg-[#E53935]/20 flex items-center justify-center text-[#E53935]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
              {customer ? `${customer.firstName} ${customer.lastName}` : "Gast (Nicht angemeldet)"}
            </h3>
            <div className="text-[12px] text-gray-500 dark:text-[#A3A3A3] mt-0.5">
              {customer ? customer.email : "Bitte melden Sie sich an, um schneller zu buchen"}
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="px-5 mt-6 space-y-5">
        
        {/* Abhol- & Rückgabeort */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Abhol- & Rückgabeort</label>
          <div className="relative w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 pl-12 pr-4 text-[14px] text-gray-900 dark:text-white transition-colors">
            {carLocation ? carLocation.name : "Standort des Fahrzeugs"}
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#A3A3A3] pointer-events-none" />
          </div>
        </div>

        {/* Abholdatum & Zeit */}
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Abholdatum</label>
            <CustomDatePicker value={abholdatum} onChange={setAbholdatum} min={todayISO} />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Zeit</label>
            <div className="relative">
              <input type="time" value={abholzeit} onChange={(e) => setAbholzeit(e.target.value)} className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 pl-10 pr-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] dark:[color-scheme:dark] transition-colors" />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#A3A3A3] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Rückgabedatum & Zeit */}
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Rückgabedatum</label>
            <CustomDatePicker value={rueckgabedatum} onChange={setRueckgabedatum} min={abholdatum} />
            {!isValidDate && <span className="text-[#E53935] text-[10px] ml-1">Muss gültig sein</span>}
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Zeit</label>
            <div className="relative">
              <input type="time" value={rueckgabezeit} onChange={(e) => setRueckgabezeit(e.target.value)} className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 pl-10 pr-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] dark:[color-scheme:dark] transition-colors" />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#A3A3A3] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error message for availability */}
        {!isChecking && !isAvailable && isValidDate && (
          <div className="bg-[#E53935]/10 border border-[#E53935]/30 rounded-xl p-4 text-center">
            <p className="text-[#E53935] text-sm font-bold">Fahrzeug ist in diesem Zeitraum nicht verfügbar.</p>
            <p className="text-[#E53935]/80 text-xs mt-1">Bitte wählen Sie andere Daten.</p>
          </div>
        )}

        {/* Zusatzleistungen (Options) */}
        {options.length > 0 && (
          <div className="space-y-3">
            <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Zusatzleistungen</label>
            <div className="space-y-2">
              {options.map((opt) => {
                const isSelected = selectedOptionIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedOptionIds(selectedOptionIds.filter(id => id !== opt.id));
                      } else {
                        setSelectedOptionIds([...selectedOptionIds, opt.id]);
                      }
                    }}
                    className={`flex items-center justify-between w-full p-4 rounded-xl border text-left transition-colors ${
                      isSelected 
                        ? 'bg-[#E53935]/10 border-[#E53935]' 
                        : 'bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-white/5'
                    }`}
                  >
                    <div>
                      <span className={`text-[14px] font-medium block ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-[#A3A3A3]'}`}>
                        {opt.name}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {opt.isPerDay ? `€${Number(opt.price).toFixed(2)} / Tag` : `€${Number(opt.price).toFixed(2)} einmalig`}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-[#E53935] bg-[#E53935]' : 'border-gray-300 dark:border-[#A3A3A3]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-50" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Aktionscode */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Aktionscode</label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value); setCoupon(null); }}
              placeholder="Code eingeben" 
              className={`flex-1 bg-white dark:bg-[#1C1C1C] border rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none transition-colors ${
                coupon?.valid === false ? "border-[#E53935]" : coupon?.valid ? "border-green-500" : "border-gray-200 dark:border-white/5 focus:border-[#E53935]"
              }`} 
            />
            <button type="button" onClick={handleApplyPromo} disabled={isCheckingCoupon || !promoCode.trim()} className="px-6 py-4 disabled:opacity-50 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 rounded-[1rem] text-[14px] font-medium text-gray-900 dark:text-white transition-colors">
              {isCheckingCoupon ? "..." : "Anwenden"}
            </button>
          </div>
          {coupon?.valid === false && <span className="text-[#E53935] text-[10px] ml-1">Ungültiger oder abgelaufener Code</span>}
          {coupon?.valid && <span className="text-green-500 text-[10px] ml-1">Rabatt angewendet</span>}
        </div>

      </div>

      {/* Sticky Bottom Section */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#141414] border-t border-gray-200 dark:border-white/10 z-30 flex flex-col transition-colors">
        
        {/* Live Price Summary (Collapsible) */}
        <div className="px-5 border-b border-gray-200 dark:border-white/5 transition-colors">
          <button 
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full py-4 flex items-center justify-between"
          >
            <span className="text-[14px] font-bold text-gray-900 dark:text-white">Preisübersicht</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-[#A3A3A3] transition-transform ${summaryOpen ? "rotate-180" : ""}`} />
          </button>
          
          {summaryOpen && (
            <div className="pb-4 space-y-2 text-[12px]">
              <div className="flex items-center justify-between text-gray-500 dark:text-[#A3A3A3]">
                <span>{days} Tage × €{basePrice.toFixed(2)}</span>
                <span className="text-gray-900 dark:text-white">€{totalBase.toFixed(2)}</span>
              </div>
              
              {selectedOptions.map(opt => (
                <div key={opt.id} className="flex items-center justify-between text-gray-500 dark:text-[#A3A3A3]">
                  <span>{opt.name} {opt.isPerDay && `(${days}x)`}</span>
                  <span className="text-gray-900 dark:text-white">
                    €{(opt.isPerDay ? (Number(opt.price) * days) : Number(opt.price)).toFixed(2)}
                  </span>
                </div>
              ))}

              {discount > 0 && (
                <div className="flex items-center justify-between text-green-500">
                  <span>Rabatt ({coupon?.valid ? coupon.code : "Code"})</span>
                  <span>-€{discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200 dark:border-white/5 transition-colors">
                <span className="font-bold text-gray-900 dark:text-white text-[14px]">Gesamt</span>
                <span className="font-bold text-[#E53935] text-[16px]">€{total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <button 
            disabled={!isFormValid}
            onClick={() => {
              const params = new URLSearchParams({
                startDate: abholdatum,
                endDate: rueckgabedatum,
                pickupTime: abholzeit,
                returnTime: rueckgabezeit,
                options: selectedOptionIds.join(","),
              });
              if (coupon?.valid) params.set("couponCode", coupon.code);
              router.push(`/mobile/payment/${car.id}?${params}`);
            }}
            className={`flex items-center justify-center w-full py-4 font-bold text-[16px] rounded-[1rem] transition-colors ${
              isFormValid 
                ? "bg-[#E53935] hover:bg-red-700 text-white shadow-lg shadow-[#E53935]/30" 
                : "bg-gray-100 dark:bg-[#1C1C1C] text-gray-400 dark:text-[#A3A3A3] cursor-not-allowed border border-gray-200 dark:border-transparent"
            }`}
          >
            {isChecking ? "Wird geprüft..." : (isAvailable ? "Weiter zur Übersicht" : "Nicht verfügbar")}
          </button>
        </div>
      </div>

    </div>
  );
}
