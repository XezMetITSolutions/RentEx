import { getCurrentCustomer } from '@/lib/dashboardAuth';
import NoCustomer from '@/components/dashboard/NoCustomer';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const customer = await getCurrentCustomer();
    if (!customer) return <NoCustomer />;

    const fields = [
        { label: 'Vorname', value: customer.firstName, icon: User },
        { label: 'Nachname', value: customer.lastName, icon: User },
        { label: 'E-Mail', value: customer.email, icon: Mail },
        { label: 'Telefon', value: customer.phone ?? '–', icon: Phone },
        { label: 'Adresse', value: [customer.address, customer.postalCode, customer.city].filter(Boolean).join(', ') || '–', icon: MapPin },
        { label: 'Land', value: customer.country ?? '–', icon: MapPin },
        { label: 'Kunde seit', value: format(new Date(customer.createdAt), 'dd.MM.yyyy', { locale: de }), icon: Calendar },
    ];

    if (customer.company) fields.push({ label: 'Firma', value: customer.company, icon: User });
    if (customer.customerType) fields.push({ label: 'Kundentyp', value: customer.customerType, icon: User });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Profileinstellungen</h1>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">Ihre Kontodaten und Angaben.</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
                <div className="p-6 sm:p-8 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-2xl font-bold">
                        {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {customer.firstName} {customer.lastName}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{customer.email}</p>
                </div>

                <dl className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {fields.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="px-6 py-4 sm:px-8 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {label}
                            </dt>
                            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50 sm:mt-0 sm:col-span-2">{value}</dd>
                        </div>
                    ))}
                </dl>

                <div className="p-6 sm:p-8 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        Um Ihre Daten zu ändern, wenden Sie sich bitte an unseren Support oder besuchen Sie eine unserer Filialen.
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Kontakt aufnehmen →
                    </a>
                </div>
            </div>
        </div>
    );
}
