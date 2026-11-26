'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, Save, ArrowLeft, Trash2, Loader2, Navigation, Compass } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idParam } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [geocoding, setGeocoding] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        city: '',
        country: 'Österreich',
        phone: '',
        email: '',
        openingTime: '08:00',
        closingTime: '18:00',
        isOpenSundays: false,
        latitude: '',
        longitude: '',
        status: 'active'
    });

    useEffect(() => {
        fetchLocation();
    }, [idParam]);

    const fetchLocation = async () => {
        try {
            const response = await fetch(`/api/locations/${idParam}`);
            if (!response.ok) throw new Error('Failed to fetch location');

            const data = await response.json();
            setFormData({
                name: data.name || '',
                code: data.code || '',
                address: data.address || '',
                city: data.city || '',
                country: data.country || 'Österreich',
                phone: data.phone || '',
                email: data.email || '',
                openingTime: data.openingTime || '08:00',
                closingTime: data.closingTime || '18:00',
                isOpenSundays: data.isOpenSundays || false,
                latitude: data.latitude?.toString() || '',
                longitude: data.longitude?.toString() || '',
                status: data.status || 'active'
            });
        } catch (error) {
            console.error('Error fetching location:', error);
            toast.error('Fehler beim Laden des Standorts');
        } finally {
            setLoading(false);
        }
    };

    // Automatisches Finden der Koordinaten per OpenStreetMap Nominatim
    const handleAutoGeocode = async () => {
        const fullQuery = [formData.address, formData.city, formData.country].filter(Boolean).join(', ');
        if (!fullQuery) {
            toast.error('Bitte zuerst Adresse oder Stadt eingeben.');
            return;
        }

        setGeocoding(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`, {
                headers: { 'Accept-Language': 'de' }
            });
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat).toFixed(6);
                const lon = parseFloat(data[0].lon).toFixed(6);
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon
                }));
                toast.success(`Koordinaten automatisch ermittelt: ${lat}, ${lon}`);
            } else {
                toast.error('Keine exakten GPS-Koordinaten für diese Adresse gefunden. Bitte manuell eingeben oder Adresse präzisieren.');
            }
        } catch (err) {
            console.error('Geocoding error', err);
            toast.error('Fehler bei der automatischen Koordinaten-Ermittlung.');
        } finally {
            setGeocoding(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`/api/locations/${idParam}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                }),
            });

            if (!response.ok) throw new Error('Failed to update location');

            toast.success('Standort erfolgreich aktualisiert');
            router.push(`/admin/locations/${idParam}`);
            router.refresh();
        } catch (error) {
            console.error('Error updating location:', error);
            toast.error('Fehler beim Aktualisieren des Standorts');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Sind Sie sicher, dass Sie diesen Standort löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`/api/locations/${idParam}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Fehler beim Löschen des Standorts');
            }

            toast.success('Standort gelöscht');
            router.push('/admin/locations');
            router.refresh();
        } catch (error: any) {
            console.error('Error deleting location:', error);
            toast.error(error.message || 'Fehler beim Löschen des Standorts');
        } finally {
            setDeleting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-hm-muted">
                <Loader2 className="w-6 h-6 animate-spin text-hm-accent" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-6 text-hm-ink">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-hm-rule">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/locations/${idParam}`}
                        className="p-2.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-muted hover:text-hm-ink transition-colors"
                        title="Zurück zum Standort"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                            Standort bearbeiten
                        </h1>
                        <p className="text-xs font-mono text-hm-muted mt-1">
                            Stammdaten, Öffnungszeiten und Standort-Koordinaten anpassen
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-rose-50 border border-hm-rule hover:border-rose-300 text-rose-700 font-mono text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Löschen</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-hm-paper p-6 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                    <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted pb-2 border-b border-hm-rule">
                        Grundinformationen
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Standortname *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="z.B. Rent-Ex Feldkirch (Illstraße)"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs text-hm-ink font-medium outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Standortcode / Kürzel
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="z.B. FK-01"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Betriebsstatus
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            >
                                <option value="active">Aktiv (Buchbar)</option>
                                <option value="inactive">Inaktiv (Gesperrt)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Address & GPS Coordinates */}
                <div className="bg-hm-paper p-6 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-hm-rule">
                        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-hm-accent" />
                            Adresse & GPS-Koordinaten
                        </h2>

                        <button
                            type="button"
                            onClick={handleAutoGeocode}
                            disabled={geocoding}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule font-mono text-xs font-semibold text-hm-ink hover:text-hm-accent transition-colors disabled:opacity-50 cursor-pointer"
                            title="Sucht Breiten- und Längengrad automatisch anhand der Adresse"
                        >
                            {geocoding ? <Loader2 className="w-3 h-3 animate-spin text-hm-accent" /> : <Compass className="w-3 h-3 text-hm-accent" />}
                            <span>GPS automatisch aus Adresse ermitteln</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Straße und Hausnummer
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="z.B. Illstraße 75a"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Postleitzahl & Ort
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="z.B. 6800 Feldkirch"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Land
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted flex items-center justify-between">
                                <span>Breitengrad (Latitude)</span>
                                <span className="text-[10px] text-hm-muted">Optional / Auto</span>
                            </label>
                            <input
                                type="text"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                placeholder="z.B. 47.2394"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted flex items-center justify-between">
                                <span>Längengrad (Longitude)</span>
                                <span className="text-[10px] text-hm-muted">Optional / Auto</span>
                            </label>
                            <input
                                type="text"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                placeholder="z.B. 9.5941"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-hm-paper p-6 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                    <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted pb-2 border-b border-hm-rule flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-hm-accent" />
                        Kontaktangaben des Standorts
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Telefonnummer
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="z.B. +43 660 9996800"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                E-Mail-Adresse
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="z.B. office@rent-ex.at"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Opening Hours & 24/7 Key Safe Policy */}
                <div className="bg-hm-paper p-6 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                    <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted pb-2 border-b border-hm-rule flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-hm-accent" />
                        Öffnungszeiten & Schlüsseltresor
                    </h2>

                    <div className="p-3.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-xs space-y-1">
                        <p className="font-bold text-hm-ink">ℹ️ Wie werden unterschiedliche Zeiten geregelt?</p>
                        <p className="text-hm-muted leading-relaxed">
                            Die hier hinterlegten Zeiten regeln die Anwesenheit im Büro (z.B. Mo–Fr 08:00 – 18:00 Uhr). 
                            Für alle anderen Tage (wie Samstag, Sonntag oder nachts) greift automatisch das kontaktlose <strong>24/7 Schlüsseltresor-System</strong>, sodass Kunden Fahrzeuge rund um die Uhr per PIN-Code abholen und zurückgeben können.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Büroöffnung (Standard Mo–Fr)
                            </label>
                            <input
                                type="time"
                                name="openingTime"
                                value={formData.openingTime}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Büroschluss (Standard Mo–Fr)
                            </label>
                            <input
                                type="time"
                                name="closingTime"
                                value={formData.closingTime}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="md:col-span-2 pt-1">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isOpenSundays"
                                    checked={formData.isOpenSundays}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded text-hm-accent focus:ring-hm-accent border-hm-rule"
                                />
                                <span className="text-xs font-mono font-medium text-hm-ink">
                                    Büro ist auch sonntags besetzt (andernfalls nur 24/7 Schlüsseltresor)
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer Save Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href={`/admin/locations/${idParam}`}
                        className="px-4 py-2 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule font-mono text-xs font-semibold text-hm-muted hover:text-hm-ink uppercase tracking-wider transition-colors"
                    >
                        Abbrechen
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-hm-ink text-hm-paper font-mono text-xs font-semibold uppercase tracking-wider rounded-[var(--hm-radius-input)] hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{saving ? 'Wird gespeichert…' : 'Änderungen speichern'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
