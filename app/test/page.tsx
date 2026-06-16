import { createBooking } from "@/app/actions/booking";
import prisma from "@/lib/prisma";

export default async function TestPage() {
    const car = await prisma.car.findFirst();
    
    if (!car) return <div className="text-white p-10">Keine Autos in der Datenbank gefunden!</div>;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    const randomEmail = `test${Math.floor(Math.random() * 100000)}@beispiel.com`;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-10 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold mb-2">Stripe Otomatik Test Sayfası</h1>
            <p className="text-gray-400 mb-8 max-w-md text-sm">
                Aşağıdaki butona tıkladığınızda rastgele bir kullanıcı adı, adresi ve email'i oluşturularak gerçek <b>createBooking</b> fonksiyonu tetiklenir ve sizi doğrudan Stripe ödeme ekranına yönlendirir.
            </p>
            
            <div className="bg-[#1C1C1C] p-6 rounded-2xl border border-white/5 mb-8 text-left w-full max-w-sm">
                <p className="text-sm text-gray-400 mb-1">Seçilen Araç:</p>
                <p className="font-bold text-lg mb-4">{car.brand} {car.model}</p>
                
                <p className="text-sm text-gray-400 mb-1">Test Email:</p>
                <p className="font-mono text-red-400 text-sm mb-4">{randomEmail}</p>

                <p className="text-sm text-gray-400 mb-1">Tarih:</p>
                <p className="text-sm mb-1">{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</p>
            </div>

            <form action={createBooking}>
                <input type="hidden" name="carId" value={car.id} />
                <input type="hidden" name="startDate" value={startDate.toISOString()} />
                <input type="hidden" name="endDate" value={endDate.toISOString()} />
                
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
                
                {/* Randomize license number just in case */}
                <input type="hidden" name="licenseNumber" value={`A${Math.floor(Math.random() * 10000000)}`} />

                <button type="submit" className="bg-[#E53935] px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95 transition-all">
                    Stripe Testini Başlat
                </button>
            </form>
        </div>
    );
}
