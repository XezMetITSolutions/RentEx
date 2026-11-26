import React from 'react';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export default async function PickupEmailPreview() {
  const locations = await prisma.location.findMany();
  const defaultLocation = locations.find(l => l.name.toLowerCase().includes('feldkirch')) || locations[0];

  const address = defaultLocation && defaultLocation.address && defaultLocation.address.includes('Illstraße')
    ? `${defaultLocation.address}, ${defaultLocation.city}`
    : 'Illstraße 75a, 6800 Feldkirch, Österreich';

  const locationName = 'Feldkirch';
  const phone = '+43 660 9996800';

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0a0a0a', padding: '30px 10px', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", lineHeight: 1.6, color: '#f4f4f5' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', background: '#141416', border: '1px solid #27272a', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Brand Header with Authentic Logo */}
        <div style={{ backgroundColor: '#000000', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo.png" alt="Rent-Ex Logo" style={{ height: 38, width: 'auto', display: 'block' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e11d48', background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.3)', padding: '5px 12px', borderRadius: 999 }}>
            Self Check-in
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '36px 32px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 750, color: '#ffffff', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
            Bereit zur Fahrzeugübernahme.
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: 15, margin: '0 0 24px 0' }}>
            Guten Tag <strong>Alex Schneider</strong>,<br />
            Ihre Reservierung bei <strong>Rent-Ex</strong> liegt außerhalb unserer personell besetzten Öffnungszeiten. Ihr Fahrzeug steht frisch gereinigt an unserem Standort bereit.
          </p>

          {/* Booking Info Box */}
          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: 22, margin: '0 0 28px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a' }}>Standort</span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#ffffff', marginTop: 4 }}>{address}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a' }}>Fahrzeug & Kennzeichen</span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#ffffff', marginTop: 4 }}>Ford Transit Custom L1 · FK-FT 1001</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a' }}>Vereinbarte Abholung</span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#ffffff', marginTop: 4 }}>Sonntag, 29.11.2026 um 10:00 Uhr</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a' }}>Mietvertrag</span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#ffffff', marginTop: 4 }}>RNT-2026-0000033</span>
              </div>
            </div>
          </div>

          {/* Key Safe Box */}
          <div style={{ border: '1px solid rgba(225,29,72,0.3)', background: 'linear-gradient(180deg, rgba(225,29,72,0.08) 0%, rgba(225,29,72,0.02) 100%)', borderRadius: 14, padding: 24, textAlign: 'center', margin: '0 0 28px 0' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e11d48' }}>
              Ihr persönlicher Schlüsselkasten-Code
            </span>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#ffffff', letterSpacing: 8, margin: '12px 0 6px 0', fontFamily: 'monospace' }}>
              8 4 2 1
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#a1a1aa' }}>
              Der Schlüsselkasten befindet sich direkt am Haupteingang der Filiale ({locationName}).
            </p>
          </div>

          {/* Mandatory Check-in Action before driving */}
          <div style={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: 14, padding: 22, margin: '0 0 28px 0' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 15, fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ Wichtig: Vor Fahrtantritt digital freischalten & protokollieren
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#d6d3d1', lineHeight: 1.5 }}>
              Vor dem Losfahren müssen Sie den Fahrzeugzustand über unser Online-Protokoll bestätigen. <strong>Ab dem Zeitpunkt der Schlüsselentnahme bis zur endgültigen Rückgabe haften Sie in vollem Umfang für alle neuen Schäden.</strong> Für Beschädigungen, die vor Fahrtantritt nicht per Foto dokumentiert und gemeldet wurden, haftet der Mieter.
            </p>

            <div style={{ textAlign: 'center' }}>
              <Link
                href="/self-checkin/33"
                style={{ display: 'inline-block', backgroundColor: '#e11d48', color: '#ffffff', padding: '14px 32px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 15, letterSpacing: '0.02em', boxShadow: '0 4px 14px rgba(225,29,72,0.3)' }}
              >
                Übergabe starten & Fahrzeugzustand prüfen →
              </Link>
            </div>
          </div>

          {/* Step-by-Step Procedure */}
          <h4 style={{ margin: '0 0 14px 0', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ffffff' }}>
            Ablauf der schlüssellosen Übergabe:
          </h4>
          <ol style={{ margin: 0, paddingLeft: 20, color: '#a1a1aa', fontSize: 14, lineHeight: 1.7 }}>
            <li style={{ marginBottom: 8 }}>Tippen Sie den 4-stelligen Code <strong>8421</strong> am Tastenfeld des Schlüsselkastens ein und entnehmen Sie den Fahrzeugschlüssel.</li>
            <li style={{ marginBottom: 8 }}>Öffnen Sie obigen Link <strong>„Übergabe starten“</strong> auf Ihrem Smartphone.</li>
            <li style={{ marginBottom: 8 }}>Fotografieren Sie den aktuellen Kilometerstand und die Tankanzeige.</li>
            <li style={{ marginBottom: 8 }}>Prüfen Sie das Fahrzeug auf Vorschäden. Sollten Sie Kratzer oder Dellen feststellen, markieren und fotografieren Sie diese im Formular.</li>
            <li>Bestätigen Sie die Übernahme digital. Erst danach gilt die Miete als offiziell angetreten.</li>
          </ol>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#09090b', padding: '24px 32px', borderTop: '1px solid #27272a', fontSize: 12, color: '#71717a', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#a1a1aa' }}>Rent-Ex GmbH · Autovermietung Vorarlberg</p>
          <p style={{ margin: '0 0 6px 0' }}>{address} · Telefon: {phone} · E-Mail: info@rent-ex.at</p>
          <p style={{ margin: 0 }}>Bei Notfällen außerhalb der Öffnungszeiten: +43 660 9996800</p>
        </div>
      </div>
    </div>
  );
}
