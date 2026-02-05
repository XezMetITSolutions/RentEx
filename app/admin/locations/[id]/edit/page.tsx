'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, Save, X, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditLocationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
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
    }, [params.id]);

    const fetchLocation = async () => {
        try {
            const response = await fetch(`/api/locations/${params.id}`);
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
            alert('Fehler beim Laden des Standorts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`/api/locations/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                }),
            });

            if (!response.ok) throw new Error('Failed to update location');

            router.push('/admin/locations');
            router.refresh();
        } catch (error) {
            console.error('Error updating location:', error);
            alert('Fehler beim Aktualisieren des Standorts');
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
            const response = await fetch(`/api/locations/${params.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete location');
            }

            router.push('/admin/locations');
            router.refresh();
        } catch (error: any) {
            console.error('Error deleting location:', error);
            alert(error.message || 'Fehler beim Löschen des Standorts');
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Standort Bearbeiten</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Bearbeiten Sie die Details dieses Standorts.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Grundinformationen</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Standortname *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="z.B. Rent-Ex Feldkirch"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Standortcode
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="z.B. FK-01"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="active">Aktiv</option>
                                <option value="inactive">Inaktiv</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-500" />
                        Adresse
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Straße und Hausnummer
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="z.B. Illstraße 75a"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stadt
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="z.B. 6800 Feldkirch"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Land
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Breitengrad
                            </label>
                            <input
                                type="text"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                placeholder="z.B. 47.2394"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Längengrad
                            </label>
                            <input
                                type="text"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                placeholder="z.B. 9.5941"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-red-500" />
                        Kontaktinformationen
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="z.B. +43 5522 12345"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                E-Mail
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="z.B. feldkirch@rent-ex.at"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-500" />
                        Öffnungszeiten
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Öffnung
                            </label>
                            <input
                                type="time"
                                name="openingTime"
                                value={formData.openingTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Schließung
                            </label>
                            <input
                                type="time"
                                name="closingTime"
                                value={formData.closingTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isOpenSundays"
                                    checked={formData.isOpenSundays}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sonntags geöffnet
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-6 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center gap-2">
                            {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            {deleting ? 'Wird gelöscht...' : 'Standort löschen'}
                        </div>
                    </button>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/locations"
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <X className="w-5 h-5" />
                                Abbrechen
                            </div>
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-2">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
                            </div>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
