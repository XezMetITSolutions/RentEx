import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { CheckCircle, Calendar, MapPin, Car } from "lucide-react";
import prisma from "@/lib/prisma";
import Image from "next/image";

export default async function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const rentalId = parseInt(resolvedParams.id);

    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: {
            car: true,
            customer: true
        }
    });

    if (!rental) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Buchung nicht gefunden</h1>
                    <Link href="/" className="text-red-500 hover:text-red-400">Zurück zur Startseite</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-red-500/10 blur-3xl rounded-full -z-10" />

                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Buchung bestätigt!</h1>
                    <p className="text-gray-400 text-lg mb-8">
                        Vielen Dank, {rental.customer.firstName}. Ihre Reservierung wurde erfolgreich entgegengenommen.
                    </p>

                    <div className="bg-black/30 rounded-2xl p-6 border border-white/10 text-left mb-8">
                        <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-4">Buchungsdetails</h2>

                        <div className="grid gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Buchungsnummer</span>
                                <span className="font-mono font-bold text-white">{rental.contractNumber}</span>
                            </div>

                            <div className="flex items-center gap-4 py-4 my-2 border-y border-white/5">
                                <div className="relative w-20 h-14 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                                    {rental.car.imageUrl && <Image src={rental.car.imageUrl} alt={rental.car.model} fill className="object-cover" />}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{rental.car.brand} {rental.car.model}</p>
                                    <p className="text-xs text-gray-500">{rental.car.plate}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Abholung</p>
                                    <p className="text-white font-medium">{new Date(rental.startDate).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-400">10:00 Uhr</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Rückgabe</p>
                                    <p className="text-white font-medium">{new Date(rental.endDate).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-400">10:00 Uhr</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link href="/fleet" className="block w-full py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors">
                            Weitere Fahrzeuge ansehen
                        </Link>
                        <p className="text-sm text-gray-500">
                            Eine Bestätigung wurde an <span className="text-white">{rental.customer.email}</span> gesendet.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
