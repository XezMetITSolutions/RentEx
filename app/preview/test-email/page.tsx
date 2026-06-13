'use client';

import React, { useState } from 'react';
import { sendTestEmail } from '@/app/actions/test-email';

export default function TestEmailPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('sending');
        setErrorMessage('');

        const res = await sendTestEmail(email);
        if (res.success) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMessage(res.error || 'Fehler beim Senden');
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
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '450px',
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
            </div>
        </div>
    );
}
