"use client";

import { useActionState } from "react";
import { createBooking } from "@/app/actions/booking";

export default function TestClient({ car, startDate, endDate, randomEmail }: any) {
    const [state, formAction, isPending] = useActionState(createBooking, null);

    return (
        <form action={formAction} className="flex flex-col items-center">
            <input type="hidden" name="carId" value={car.id} />
            <input type="hidden" name="startDate" value={startDate} />
            <input type="hidden" name="endDate" value={endDate} />
            
            <input type="hidden" name="firstName" value="Test" />
            <input type="hidden" name="lastName" value="User" />
            <input type="hidden" name="email" value={randomEmail} />
            <input type="hidden" name="phone" value="+43 123 456789" />
            <input type="hidden" name="address" value="Musterstraße 1" />
            <input type="hidden" name="city" value="Wien" />
            <input type="hidden" name="postalCode" value="1010" />
            <input type="hidden" name="country" value="Österreich" />
            <input type="hidden" name="customerType" value="Private" />
            <input type="hidden" name="paymentMethod" value="online" />
            
            <input type="hidden" name="licenseNumber" value={`A${Math.floor(Math.random() * 10000000)}`} />

            {state?.error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6 w-full max-w-md text-left">
                    <p className="font-bold mb-1">Hata Detayı:</p>
                    <p className="text-sm font-mono break-words">{JSON.stringify(state.error, null, 2)}</p>
                </div>
            )}

            <button disabled={isPending} type="submit" className="bg-[#E53935] disabled:bg-gray-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95 transition-all w-full max-w-sm">
                {isPending ? "İşleniyor..." : "Stripe Testini Başlat"}
            </button>
        </form>
    );
}
