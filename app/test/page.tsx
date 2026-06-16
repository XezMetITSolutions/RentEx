import prisma from "@/lib/prisma";
import TestClient from "./TestClient";

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

            <TestClient 
                car={car} 
                startDate={startDate.toISOString()} 
                endDate={endDate.toISOString()} 
                randomEmail={randomEmail} 
            />
        </div>
    );
}
