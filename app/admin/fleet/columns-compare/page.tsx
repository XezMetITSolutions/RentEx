import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Form alanları – CarEditForm.tsx sekmelere göre (name="...")
const FORM_BY_TAB: { tab: string; fields: string[] }[] = [
    {
        tab: 'Basis & Design',
        fields: ['brand', 'model', 'year', 'color', 'plate', 'category', 'status', 'vin', 'chassisNumber', 'isActive', 'imageUrl', 'images', 'description', 'internalNotes', 'damageHistory'],
    },
    {
        tab: 'Technische Daten',
        fields: ['fuelType', 'transmission', 'engineSize', 'horsePower', 'fuelConsumption', 'co2Emission', 'doors', 'seats', 'currentMileage', 'maxMileagePerDay', 'latitude', 'longitude'],
    },
    {
        tab: 'Ausstattung',
        fields: ['hasAirConditioning', 'hasGPS', 'hasHeatedSeats', 'hasParkingSensors', 'hasBackupCamera', 'hasCruiseControl', 'hasBluetoothAudio', 'hasUSBPorts', 'hasChildSeatAnchors', 'hasSkiRack', 'hasTowHitch', 'features'],
    },
    {
        tab: 'Zusatzoptionen',
        fields: ['options', 'carId'], // carId hidden, options checkbox listesi – Car sütunu değil
    },
    {
        tab: 'Preise & Kampagnen',
        fields: ['dailyRate', 'weeklyRate', 'monthlyRate', 'depositAmount', 'longTermRate', 'minDaysForLongTerm', 'promoPrice', 'promoStartDate', 'promoEndDate'],
    },
    {
        tab: 'Versicherung & Dokumente',
        fields: ['insuranceCompany', 'insurancePolicyNumber', 'insuranceValidUntil', 'registrationDate', 'nextInspection', 'vignetteValidUntil', 'vignetteType', 'locationId', 'homeLocationId'],
    },
    {
        tab: 'Wartung & Service',
        fields: ['lastOilChange', 'nextOilChange', 'lastTireChange', 'tireType', 'lastServiceDate', 'nextServiceDate'],
    },
    {
        tab: 'Finanzielle Daten',
        fields: ['purchasePrice', 'purchaseDate', 'currentValue', 'purchaseMileage'],
    },
];

// Prisma Car model sütunları (schema.prisma – relations hariç)
const SCHEMA_CAR_COLUMNS: { name: string; type: string; group: string }[] = [
    { name: 'id', type: 'Int', group: 'System' },
    { name: 'brand', type: 'String', group: 'Basis & Design' },
    { name: 'model', type: 'String', group: 'Basis & Design' },
    { name: 'plate', type: 'String', group: 'Basis & Design' },
    { name: 'year', type: 'Int', group: 'Basis & Design' },
    { name: 'color', type: 'String', group: 'Basis & Design' },
    { name: 'fuelType', type: 'String', group: 'Technische Daten' },
    { name: 'transmission', type: 'String?', group: 'Technische Daten' },
    { name: 'category', type: 'String?', group: 'Technische Daten' },
    { name: 'doors', type: 'Int?', group: 'Technische Daten' },
    { name: 'seats', type: 'Int?', group: 'Technische Daten' },
    { name: 'engineSize', type: 'String?', group: 'Technische Daten' },
    { name: 'horsePower', type: 'Int?', group: 'Technische Daten' },
    { name: 'fuelConsumption', type: 'String?', group: 'Technische Daten' },
    { name: 'co2Emission', type: 'String?', group: 'Technische Daten' },
    { name: 'status', type: 'String', group: 'Basis & Design' },
    { name: 'vin', type: 'String?', group: 'Basis & Design' },
    { name: 'chassisNumber', type: 'String?', group: 'Basis & Design' },
    { name: 'dailyRate', type: 'Decimal', group: 'Preise & Kampagnen' },
    { name: 'weeklyRate', type: 'Decimal?', group: 'Preise & Kampagnen' },
    { name: 'monthlyRate', type: 'Decimal?', group: 'Preise & Kampagnen' },
    { name: 'longTermRate', type: 'Decimal?', group: 'Preise & Kampagnen' },
    { name: 'minDaysForLongTerm', type: 'Int?', group: 'Preise & Kampagnen' },
    { name: 'depositAmount', type: 'Decimal?', group: 'Preise & Kampagnen' },
    { name: 'promoPrice', type: 'Decimal?', group: 'Preise & Kampagnen' },
    { name: 'promoStartDate', type: 'DateTime?', group: 'Preise & Kampagnen' },
    { name: 'promoEndDate', type: 'DateTime?', group: 'Preise & Kampagnen' },
    { name: 'insuranceCompany', type: 'String?', group: 'Versicherung & Dokumente' },
    { name: 'insurancePolicyNumber', type: 'String?', group: 'Versicherung & Dokumente' },
    { name: 'insuranceValidUntil', type: 'DateTime?', group: 'Versicherung & Dokumente' },
    { name: 'registrationDate', type: 'DateTime?', group: 'Versicherung & Dokumente' },
    { name: 'nextInspection', type: 'DateTime?', group: 'Versicherung & Dokumente' },
    { name: 'currentMileage', type: 'Int?', group: 'Technische Daten' },
    { name: 'purchaseMileage', type: 'Int?', group: 'Finanzielle Daten' },
    { name: 'maxMileagePerDay', type: 'Int?', group: 'Technische Daten' },
    { name: 'imageUrl', type: 'String?', group: 'Basis & Design' },
    { name: 'images', type: 'String?', group: 'Basis & Design' },
    { name: 'description', type: 'String?', group: 'Basis & Design' },
    { name: 'features', type: 'String?', group: 'Ausstattung' },
    { name: 'hasAirConditioning', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasGPS', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasHeatedSeats', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasParkingSensors', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasBackupCamera', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasCruiseControl', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasBluetoothAudio', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasUSBPorts', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasChildSeatAnchors', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasSkiRack', type: 'Boolean', group: 'Ausstattung' },
    { name: 'hasTowHitch', type: 'Boolean', group: 'Ausstattung' },
    { name: 'vignetteValidUntil', type: 'DateTime?', group: 'Versicherung & Dokumente' },
    { name: 'vignetteType', type: 'String?', group: 'Versicherung & Dokumente' },
    { name: 'lastOilChange', type: 'DateTime?', group: 'Wartung & Service' },
    { name: 'nextOilChange', type: 'DateTime?', group: 'Wartung & Service' },
    { name: 'lastTireChange', type: 'DateTime?', group: 'Wartung & Service' },
    { name: 'tireType', type: 'String?', group: 'Wartung & Service' },
    { name: 'nextServiceDate', type: 'DateTime?', group: 'Wartung & Service' },
    { name: 'lastServiceDate', type: 'DateTime?', group: 'Wartung & Service' },
    { name: 'locationId', type: 'Int?', group: 'Standort' },
    { name: 'homeLocationId', type: 'Int?', group: 'Standort' },
    { name: 'purchasePrice', type: 'Decimal?', group: 'Finanzielle Daten' },
    { name: 'purchaseDate', type: 'DateTime?', group: 'Finanzielle Daten' },
    { name: 'currentValue', type: 'Decimal?', group: 'Finanzielle Daten' },
    { name: 'internalNotes', type: 'String?', group: 'Basis & Design' },
    { name: 'damageHistory', type: 'String?', group: 'Basis & Design' },
    { name: 'isActive', type: 'Boolean', group: 'System' },
    { name: 'latitude', type: 'Float?', group: 'GPS' },
    { name: 'longitude', type: 'Float?', group: 'GPS' },
    { name: 'createdAt', type: 'DateTime', group: 'System' },
    { name: 'updatedAt', type: 'DateTime', group: 'System' },
];

const schemaSet = new Set(SCHEMA_CAR_COLUMNS.map((c) => c.name));
const formFieldsSet = new Set(FORM_BY_TAB.flatMap((t) => t.fields).filter((f) => f !== 'options' && f !== 'carId'));

const onlyInSchema = SCHEMA_CAR_COLUMNS.filter((c) => !formFieldsSet.has(c.name) && !['id', 'createdAt', 'updatedAt'].includes(c.name));
const onlyInForm = [...formFieldsSet].filter((f) => !schemaSet.has(f));

export default function FleetColumnsComparePage() {
    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fahrzeug-Formular vs. Datenbank</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Formular-Spalten (Edit) und Prisma Car-Schema im Vergleich</p>
                </div>
                <Link
                    href="/admin/fleet"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück
                </Link>
            </div>

            {/* 1) Formular nach Tab */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">1. Formularfelder nach Tab (CarEditForm)</h2>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Tab</th>
                                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Felder (name=)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {FORM_BY_TAB.map((row) => (
                                <tr key={row.tab} className="bg-white dark:bg-gray-900">
                                    <td className="p-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.tab}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{row.fields.join(', ')}</code>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 2) Datenbank-Spalten (Prisma Car) */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">2. Datenbank-Spalten (Prisma Car)</h2>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Spalte</th>
                                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Typ</th>
                                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Gruppe</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {SCHEMA_CAR_COLUMNS.map((col) => (
                                <tr key={col.name} className="bg-white dark:bg-gray-900">
                                    <td className="p-3">
                                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{col.name}</code>
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{col.type}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{col.group}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 3) Differenz: Nur in DB / Nur im Formular */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Nur in der Datenbank (evtl. im Formular fehlend)</h3>
                    <ul className="text-sm text-amber-900 dark:text-amber-100 space-y-1">
                        {onlyInSchema.length === 0 ? (
                            <li>— Keine</li>
                        ) : (
                            onlyInSchema.map((c) => (
                                <li key={c.name}>
                                    <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">{c.name}</code>
                                    <span className="text-amber-700 dark:text-amber-300 ml-1">({c.type})</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Nur im Formular (keine Car-Spalte)</h3>
                    <ul className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
                        {onlyInForm.length === 0 ? (
                            <li>— Keine</li>
                        ) : (
                            onlyInForm.map((f) => (
                                <li key={f}>
                                    <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">{f}</code>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </section>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <strong>Hinweis:</strong> <code>options</code> und <code>carId</code> sind keine Car-Spalten; sie steuern die Zusatzoptionen-Zuordnung. System-Spalten <code>id</code>, <code>createdAt</code>, <code>updatedAt</code> sind in „Nur in DB“ ausgeblendet.
            </p>
        </div>
    );
}
