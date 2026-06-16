"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal, CheckCircle2, Lock, Info, Loader2 } from "lucide-react";
import Image from "next/image";

export default function MobilePayment({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [method, setMethod] = useState("Kreditkarte");
  
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Hardcoded for demo
  const totalAmount = 195.00;

  const validateAndSubmit = () => {
    if (method !== "Kreditkarte") {
      processPayment();
      return;
    }

    const newErrors: Record<string, string> = {};
    if (cardNumber.replace(/\s/g, "").length < 15) newErrors.cardNumber = "Ungültige Kartennummer";
    if (expiry.length < 5) newErrors.expiry = "Ungültiges Ablaufdatum";
    if (cvc.length < 3) newErrors.cvc = "Ungültige CVC";
    if (cardName.length < 3) newErrors.cardName = "Bitte geben Sie den Namen ein";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      processPayment();
    }
  };

  const processPayment = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      router.push(`/mobile/payment/success?id=${resolvedParams.id}`);
    }, 2000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
    setErrors(prev => ({...prev, cardNumber: ""}));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
    setErrors(prev => ({...prev, expiry: ""}));
  };

  return (
    <div className="flex flex-col min-h-screen text-white pb-32 bg-[#0A0A0A]">
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5 bg-[#141414] sticky top-0 z-20">
        <Link href={`/mobile/checkout/${resolvedParams.id}`} className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white hover:bg-white/5 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Zahlung</h1>
        <button className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white hover:bg-white/5 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Step Indicator */}
      <div className="px-5 py-6 bg-[#141414] border-b border-white/5">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#E53935] -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(229,57,53,0.4)]">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(229,57,53,0.4)]">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(229,57,53,0.4)]">
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-[#E53935] font-bold">Details</span>
          <span className="text-[10px] text-[#E53935] font-bold">Übersicht</span>
          <span className="text-[10px] text-[#E53935] font-bold">Zahlung</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="px-5 mt-8 space-y-4">
        <h2 className="text-[18px] font-bold text-white mb-2">Zahlungsmethode</h2>
        
        <div className="space-y-3">
          <button 
            onClick={() => setMethod("Kreditkarte")}
            className={`flex items-center w-full p-4 rounded-[1rem] border transition-all ${method === "Kreditkarte" ? "bg-[#E53935]/10 border-[#E53935]" : "bg-[#1C1C1C] border-white/5"}`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${method === "Kreditkarte" ? "border-[#E53935]" : "border-[#A3A3A3]"}`}>
              {method === "Kreditkarte" && <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />}
            </div>
            <div className="w-8 h-6 bg-white/10 rounded mr-3 flex items-center justify-center text-[10px] font-bold text-white">CARD</div>
            <span className={`text-[14px] font-medium flex-1 text-left ${method === "Kreditkarte" ? "text-white" : "text-[#A3A3A3]"}`}>Kreditkarte</span>
            <Info className="w-4 h-4 text-[#A3A3A3]" />
          </button>
          
          <button 
            onClick={() => setMethod("PayPal")}
            className={`flex items-center w-full p-4 rounded-[1rem] border transition-all ${method === "PayPal" ? "bg-[#E53935]/10 border-[#E53935]" : "bg-[#1C1C1C] border-white/5"}`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${method === "PayPal" ? "border-[#E53935]" : "border-[#A3A3A3]"}`}>
              {method === "PayPal" && <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />}
            </div>
            <div className="w-8 h-6 bg-white/10 rounded mr-3 flex items-center justify-center text-[14px] font-bold text-blue-500 italic">P</div>
            <span className={`text-[14px] font-medium flex-1 text-left ${method === "PayPal" ? "text-white" : "text-[#A3A3A3]"}`}>PayPal</span>
          </button>

          <button 
            onClick={() => setMethod("Apple Pay")}
            className={`flex items-center w-full p-4 rounded-[1rem] border transition-all ${method === "Apple Pay" ? "bg-[#E53935]/10 border-[#E53935]" : "bg-[#1C1C1C] border-white/5"}`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${method === "Apple Pay" ? "border-[#E53935]" : "border-[#A3A3A3]"}`}>
              {method === "Apple Pay" && <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />}
            </div>
            <div className="w-8 h-6 bg-white rounded mr-3 flex items-center justify-center text-[14px] font-bold text-black"></div>
            <span className={`text-[14px] font-medium flex-1 text-left ${method === "Apple Pay" ? "text-white" : "text-[#A3A3A3]"}`}>Apple Pay</span>
          </button>
        </div>
      </div>

      {/* Card Information */}
      {method === "Kreditkarte" && (
        <div className="px-5 mt-8 space-y-4 animate-in fade-in slide-in-from-top-2">
          <h2 className="text-[18px] font-bold text-white mb-2">Karteninformationen</h2>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456" 
                  className={`w-full bg-[#1C1C1C] border rounded-[1rem] py-4 pl-4 pr-12 text-[14px] text-white outline-none transition-colors ${errors.cardNumber ? "border-[#E53935]" : "border-white/5 focus:border-[#E53935]"} placeholder-[#A3A3A3]`} 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
                  <div className="w-6 h-4 bg-orange-500 rounded-sm"></div>
                  <div className="w-6 h-4 bg-red-500 rounded-sm -ml-3 mix-blend-multiply"></div>
                </div>
              </div>
              {errors.cardNumber && <span className="text-[#E53935] text-[10px] ml-1">{errors.cardNumber}</span>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <input 
                  type="text" 
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/JJ" 
                  className={`w-full bg-[#1C1C1C] border rounded-[1rem] py-4 pl-4 pr-4 text-[14px] text-white outline-none transition-colors ${errors.expiry ? "border-[#E53935]" : "border-white/5 focus:border-[#E53935]"} placeholder-[#A3A3A3]`} 
                />
                {errors.expiry && <span className="text-[#E53935] text-[10px] ml-1">{errors.expiry}</span>}
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <input 
                    type="text" 
                    value={cvc}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCvc(val);
                      setErrors(prev => ({...prev, cvc: ""}));
                    }}
                    placeholder="123" 
                    className={`w-full bg-[#1C1C1C] border rounded-[1rem] py-4 pl-4 pr-10 text-[14px] text-white outline-none transition-colors ${errors.cvc ? "border-[#E53935]" : "border-white/5 focus:border-[#E53935]"} placeholder-[#A3A3A3]`} 
                  />
                  <Info className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                </div>
                {errors.cvc && <span className="text-[#E53935] text-[10px] ml-1">{errors.cvc}</span>}
              </div>
            </div>
            
            <div className="space-y-1">
              <input 
                type="text" 
                value={cardName}
                onChange={(e) => { setCardName(e.target.value); setErrors(prev => ({...prev, cardName: ""})); }}
                placeholder="Name auf der Karte" 
                className={`w-full bg-[#1C1C1C] border rounded-[1rem] py-4 pl-4 pr-4 text-[14px] text-white outline-none transition-colors ${errors.cardName ? "border-[#E53935]" : "border-white/5 focus:border-[#E53935]"} placeholder-[#A3A3A3]`} 
              />
              {errors.cardName && <span className="text-[#E53935] text-[10px] ml-1">{errors.cardName}</span>}
            </div>

            <button 
              onClick={() => setSaveCard(!saveCard)}
              className="flex items-center gap-3 mt-2"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${saveCard ? "bg-[#E53935] border-[#E53935]" : "bg-[#1C1C1C] border-white/20"}`}>
                {saveCard && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-[12px] text-white">Karte für zukünftige Buchungen speichern</span>
            </button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#141414] border-t border-white/10 z-30">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[12px] text-[#A3A3A3] block">Gesamtbetrag</span>
            <span className="text-[10px] text-[#A3A3A3]">inkl. MwSt.</span>
          </div>
          <span className="text-[20px] font-bold text-white">
            {new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(totalAmount)}
          </span>
        </div>
        
        <div className="p-4">
          <button 
            disabled={isProcessing}
            onClick={validateAndSubmit}
            className={`flex items-center justify-center w-full py-4 font-bold text-[16px] rounded-[1rem] transition-colors ${
              isProcessing 
                ? "bg-[#E53935]/80 text-white cursor-wait" 
                : "bg-[#E53935] hover:bg-red-700 text-white shadow-lg shadow-[#E53935]/30"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Wird verarbeitet...
              </>
            ) : (
              `Bezahlen €${totalAmount.toFixed(2).replace('.', ',')}`
            )}
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <Lock className="w-3.5 h-3.5 text-[#A3A3A3]" />
            <span className="text-[10px] text-[#A3A3A3]">Sichere Zahlung durch Stripe</span>
          </div>
        </div>
      </div>

    </div>
  );
}
