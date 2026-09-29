import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { getBookingForConfirmation } from "@/lib/bookingConfirmation";

export default async function PaymentSuccess({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const booking = await getBookingForConfirmation(
    parseInt(params.rentalId as string, 10),
    params.t as string | undefined,
    params.session_id as string | undefined
  );

  if (!booking) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white items-center justify-center p-5 gap-4">
        <h1 className="text-[22px] font-bold">Buchung nicht gefunden</h1>
        <Link href="/mobile" className="text-[#E53935] font-bold">Zurück zur Startseite</Link>
      </div>
    );
  }

  const { rental, isPaid, isOnline } = booking;
  const isPaymentPending = isOnline && !isPaid;

  const message = isPaid
    ? "Ihre Zahlung war erfolgreich. Wir haben Ihnen eine Bestätigungs-E-Mail gesendet."
    : isPaymentPending
      ? "Ihre Reservierung ist eingegangen. Sobald die Zahlung bestätigt ist, erhalten Sie eine E-Mail."
      : "Ihre Reservierung ist eingegangen. Sie bezahlen bei der Abholung. Wir haben Ihnen eine Bestätigungs-E-Mail gesendet.";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white items-center justify-center p-5 transition-colors">

      <div className="w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-8 relative">
        <div className={`w-16 h-16 ${isPaymentPending ? "bg-amber-500" : "bg-green-500"} rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]`}>
          {isPaymentPending ? <Clock className="w-10 h-10 text-white" /> : <CheckCircle2 className="w-10 h-10 text-white" />}
        </div>
      </div>

      <h1 className="text-[28px] font-bold text-gray-900 dark:text-white mb-3 text-center">
        {isPaymentPending ? "Zahlung wird geprüft" : "Buchung bestätigt!"}
      </h1>
      <p className="text-gray-500 dark:text-[#A3A3A3] text-center text-[14px] leading-relaxed max-w-[280px] mb-8">
        {message}
      </p>

      <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center transition-colors">
        <span className="text-[12px] text-gray-500 dark:text-[#A3A3A3] mb-2">Ihre Buchungsnummer</span>
        <span className="text-[20px] font-bold text-gray-900 dark:text-white tracking-wider select-all">{rental.contractNumber}</span>
        <span className="text-[12px] text-gray-500 dark:text-[#A3A3A3] mt-3">{rental.car.brand} {rental.car.model}</span>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gray-50 dark:bg-[#0A0A0A] max-w-md mx-auto transition-colors">
        <Link
          href="/mobile/bookings"
          className="flex items-center justify-center w-full py-4 bg-[#E53935] hover:bg-red-700 text-white font-bold text-[16px] rounded-[1rem] transition-colors shadow-lg shadow-[#E53935]/30 mb-3"
        >
          Zu meinen Buchungen
        </Link>
        <Link
          href="/mobile"
          className="flex items-center justify-center w-full py-4 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-white font-bold text-[16px] rounded-[1rem] transition-colors"
        >
          Zurück zur Startseite
        </Link>
      </div>

    </div>
  );
}
