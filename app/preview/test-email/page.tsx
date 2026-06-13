'use client';

import React, { useState } from 'react';
import { sendTestEmail, runRealBookingTest } from '@/app/actions/test-email';

export default function TestEmailPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [mailLogs, setMailLogs] = useState<string[]>([]);
    const [mailResponse, setMailResponse] = useState<any>(null);

    const [bookingEmail, setBookingEmail] = useState('');
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [bookingErrorMessage, setBookingErrorMessage] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('sending');
        setErrorMessage('');
        setMailLogs([]);
        setMailResponse(null);

        const res = await sendTestEmail(email);
        setMailLogs(res.logs || []);
        if (res.success) {
            setStatus('success');
            setMailResponse(res.response);
        } else {
            setStatus('error');
            setErrorMessage(res.error || 'Fehler beim Senden');
        }
    };

    const handleBookingTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingEmail) return;

        setBookingStatus('sending');
        setBookingErrorMessage('');

        const res = await runRealBookingTest(bookingEmail);
        if (res.success) {
            setBookingStatus('success');
        } else {
            setBookingStatus('error');
            setBookingErrorMessage(res.error || 'Fehler bei der Buchung');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            fontFamily: 'sans-serif',
            color: '#fff',
            padding: '20px',
            flexDirection: 'column',
            gap: '20px'
        }}>
            {/* CARD 1: Simple SMTP Test */}
            <div style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#161616',
                border: '1px solid #333',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#ff2d37' }}>RentEx SMTP Mail-Test</h2>
                <p style={{ fontSize: '14px', color: '#888', marginBottom: '25px' }}>
                    Geben Sie eine E-Mail-Adresse ein, um den SMTP-Versand zu testen. Die E-Mail wird an die eingegebene Adresse und als Kopie an <strong>rentex@metechnik.at</strong> gesendet.
                </p>

                <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 'bold' }}>Ziel-E-Mail-Adresse (Kunde)</label>
                        <input
                            type="email"
                            required
                            placeholder="muster@gmx.at"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'sending'}
                            style={{
                                backgroundColor: '#222',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                padding: '12px',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'sending'}
                        style={{
                            backgroundColor: '#ff2d37',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            opacity: status === 'sending' ? 0.7 : 1
                        }}
                    >
                        {status === 'sending' ? 'Wird gesendet...' : 'Test-E-Mail senden'}
                    </button>
                </form>

                {status === 'success' && (
                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        backgroundColor: 'rgba(46, 125, 50, 0.2)',
                        border: '1px solid #2e7d32',
                        borderRadius: '8px',
                        color: '#4caf50',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        ✓ Test-E-Mail erfolgreich an beide Empfänger gesendet!
                    </div>
                )}

                {status === 'error' && (
                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        backgroundColor: 'rgba(198, 40, 40, 0.2)',
                        border: '1px solid #c62828',
                        borderRadius: '8px',
                        color: '#ef5350',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        ❌ {errorMessage}
                    </div>
                )}

                {mailLogs.length > 0 && (
                    <div style={{ marginTop: '25px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ff2d37' }}>SMTP Logausgabe:</h4>
                        <div style={{
                            backgroundColor: '#000',
                            padding: '15px',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            maxHeight: '250px',
                            overflowY: 'auto',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid #222',
                            color: '#00ff00'
                        }}>
                            {mailLogs.map((log, i) => (
                                <div key={i} style={{ marginBottom: '4px' }}>{log}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CARD 2: Real Booking Flow Simulation */}
            <div style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#161616',
                border: '1px solid #333',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#ff9800' }}>Echter Buchungs-Ablauf Test</h2>
                <p style={{ fontSize: '14px', color: '#888', marginBottom: '25px' }}>
                    Buche ein zufälliges aktives Fahrzeug an einem konfliktfreien zukünftigen Datum. Dieser Test führt den echten Buchungsprozess inklusive Datenbankanlage, Kundenmail und Kopie-Mail an <strong>rentex@metechnik.at</strong> aus.
                </p>

                <form onSubmit={handleBookingTest} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 'bold' }}>Ziel-E-Mail-Adresse (Kunde)</label>
                        <input
                            type="email"
                            required
                            placeholder="kunde@gmx.at"
                            value={bookingEmail}
                            onChange={(e) => setBookingEmail(e.target.value)}
                            disabled={bookingStatus === 'sending'}
                            style={{
                                backgroundColor: '#222',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                padding: '12px',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={bookingStatus === 'sending'}
                        style={{
                            backgroundColor: '#ff9800',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            opacity: bookingStatus === 'sending' ? 0.7 : 1
                        }}
                    >
                        {bookingStatus === 'sending' ? 'Wird verarbeitet...' : 'Echte Buchung & Mails simulieren'}
                    </button>
                </form>

                {bookingStatus === 'success' && (
                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        backgroundColor: 'rgba(46, 125, 50, 0.2)',
                        border: '1px solid #2e7d32',
                        borderRadius: '8px',
                        color: '#4caf50',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        ✓ Buchung erfolgreich erstellt! Weiterleitung zum Beleg folgt veya Mails wurden gesendet.
                    </div>
                )}

                {bookingStatus === 'error' && (
                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        backgroundColor: 'rgba(198, 40, 40, 0.2)',
                        border: '1px solid #c62828',
                        borderRadius: '8px',
                        color: '#ef5350',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        ❌ {bookingErrorMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
