'use client';

import Link from 'next/link';
import { submitDamageReport } from '@/app/actions/dashboard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Rental, Car, Customer, Location } from '@prisma/client';

type RentalWithRelations = Rental & {
    car: Car;
    pickupLocation: Location | null;
    returnLocation: Location | null;
};

const CIRCUMSTANCE_OPTIONS = [
    { id: '1', label: 'Parkplatz verlassen / Einparken' },
    { id: '2', label: 'Rückwärtsfahren' },
    { id: '3', label: 'Einfahren nach dem Anhalten' },
    { id: '4', label: 'Spurwechsel' },
    { id: '5', label: 'Überholen' },
    { id: '6', label: 'Kreuzung / Einmündung – Vorfahrt' },
    { id: '7', label: 'Ampel / Zeichen' },
    { id: '8', label: 'Abstand' },
    { id: '9', label: 'Abbiegen' },
    { id: '10', label: 'Wenden / Rückwärts' },
    { id: '11', label: 'Fahrbahnmitte' },
    { id: '12', label: 'Andere (siehe Bemerkungen)' },
];

export default function DamageReportForm({ rental, customer }: { rental: RentalWithRelations; customer: Customer }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [circumstances, setCircumstances] = useState<string[]>([]);

    const toggleCircumstance = (id: string) => {
        setCircumstances((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        setLoading(true);
        formData.set('rentalId', String(rental.id));
        formData.set('carId', String(rental.carId));
        formData.set('circumstances', circumstances.join(','));
        const result = await submitDamageReport(formData);
        setLoading(false);
        if (result?.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Schadenmeldung wurde gesendet. Wir werden uns zeitnah bei Ihnen melden.' });
            router.refresh();
        }
    }

    const customerAddress = [customer.address, customer.postalCode, customer.city].filter(Boolean).join(', ') || '–';
    const today = new Date().toISOString().slice(0, 10);

    return (
        <form action={handleSubmit} className="space-y-8">
            {message && (
                <div
                    className={`rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}
                >
                    {message.text}
                </div>
            )}

            {/* A – Unfallort & -zeit */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">A – Unfallort und -zeit</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Datum *</label>
                        <input name="accidentDate" type="date" required defaultValue={today} className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Uhrzeit</label>
                        <input name="accidentTime" type="time" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ort (Straße, PLZ Ort) *</label>
                        <input name="accidentPlace" type="text" required placeholder="z.B. Illstraße 1, 6800 Feldkirch" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Land</label>
                        <input name="accidentCountry" type="text" defaultValue="Österreich" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Verletzte?</label>
                        <select name="injuries" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                            <option value="">Nein</option>
                            <option value="yes">Ja</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* B – Fahrzeug 1 (unser Mietfahrzeug) – nur Anzeige */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">B – Fahrzeug 1 (Ihr Mietfahrzeug) – aus Vertrag</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                        <dt className="text-zinc-500 dark:text-zinc-400">Vermieter / Standort</dt>
                        <dd className="font-medium text-zinc-900 dark:text-zinc-100">{rental.pickupLocation?.name ?? 'RentEx'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500 dark:text-zinc-400">Fahrer (Mieter)</dt>
                        <dd className="font-medium text-zinc-900 dark:text-zinc-100">{customer.firstName} {customer.lastName}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500 dark:text-zinc-400">Adresse</dt>
                        <dd className="font-medium text-zinc-900 dark:text-zinc-100">{customerAddress}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500 dark:text-zinc-400">Telefon</dt>
                        <dd className="font-medium text-zinc-900 dark:text-zinc-100">{customer.phone ?? '–'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500 dark:text-zinc-400">Kennzeichen</dt>
                        <dd className="font-medium text-zinc-900 dark:text-zinc-100">{rental.car.plate}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500 dark:text-zinc-400">Marke / Typ</dt>
                        <dd className="font-medium text-zinc-900 dark:text-zinc-100">{rental.car.brand} {rental.car.model}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500 dark:text-zinc-400">Versicherung (Fahrzeug)</dt>
                        <dd className="font-medium text-zinc-900 dark:text-zinc-100">{rental.car.insuranceCompany ?? '–'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500 dark:text-zinc-400">Vertrag / Miete</dt>
                        <dd className="font-medium text-zinc-900 dark:text-zinc-100">#{rental.contractNumber ?? rental.id} ({format(new Date(rental.startDate), 'dd.MM.yy', { locale: de })} – {format(new Date(rental.endDate), 'dd.MM.yy', { locale: de })})</dd>
                    </div>
                </dl>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Schaden am Mietfahrzeug (Beschreibung)</label>
                    <input name="type" type="hidden" value="Unfall" />
                    <textarea name="description" rows={2} placeholder="Kurze Beschreibung des Schadens …" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    <input name="locationOnCar" type="text" placeholder="z.B. vorn links, Heck, Dach" className="mt-2 w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                </div>
            </div>

            {/* B – Fahrzeug 2 (anderer Beteiligter) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">B – Anderer Beteiligter (Fahrzeug 2)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name des Fahrers</label>
                        <input name="otherPartyDriverName" type="text" placeholder="Vor- und Nachname" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Adresse</label>
                        <input name="otherPartyAddress" type="text" placeholder="Straße, PLZ Ort" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Telefon</label>
                        <input name="otherPartyPhone" type="tel" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Kennzeichen</label>
                        <input name="otherPartyRegistration" type="text" placeholder="z.B. FK 1234 AB" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Marke / Typ Fahrzeug</label>
                        <input name="otherPartyVehicle" type="text" placeholder="z.B. VW Golf" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Versicherung</label>
                        <input name="otherPartyInsurance" type="text" placeholder="Versicherungsgesellschaft" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Policennummer</label>
                        <input name="otherPartyPolicyNumber" type="text" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Schaden (Fahrzeug 2)</label>
                        <textarea name="otherPartyDamage" rows={2} placeholder="Beschreibung …" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                </div>
            </div>

            {/* Zeuge */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Zeuge (optional)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                        <input name="witnessName" type="text" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Telefon</label>
                        <input name="witnessPhone" type="tel" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Adresse</label>
                        <input name="witnessAddress" type="text" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                    </div>
                </div>
            </div>

            {/* C – Unfallumstände */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">C – Unfallumstände (bitte zutreffende ankreuzen)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {CIRCUMSTANCE_OPTIONS.map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={circumstances.includes(opt.id)}
                                onChange={() => toggleCircumstance(opt.id)}
                                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">{opt.label}</span>
                        </label>
                    ))}
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Skizze / Bemerkungen</label>
                    <textarea name="sketchNotes" rows={4} placeholder="Ort des Unfalls, Fahrtrichtungen, Skizze in Worten …" className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Wird gesendet…' : 'Schadenmeldung absenden'}
                </button>
                <Link href="/dashboard/rentals" className="rounded-xl border border-zinc-300 dark:border-zinc-600 px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    Abbrechen
                </Link>
            </div>
        </form>
    );
}
