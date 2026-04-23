import React from 'react';
import prisma from '@/lib/prisma';

export default async function PickupEmailPreview() {
  const locations = await prisma.location.findMany();
  const defaultLocation = locations.find(l => l.name.toLowerCase().includes('feldkirch')) || locations[0];

  const address = defaultLocation
    ? `${defaultLocation.address}, ${defaultLocation.city}`
    : 'Hauptstraße 1, 6800 Feldkirch, Österreich';

  const locationName = defaultLocation?.name || 'Feldkirch';
  const phone = '+43 123 456789';

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f4f4f4', padding: '10px 0', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", lineHeight: 1.6, color: '#333' }}>
      <div style={{ maxWidth: 600, margin: '20px auto', border: '1px solid #eee', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#000000', padding: 30, textAlign: 'center', borderBottom: '4px solid #E31E24' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: 3 }}>RENTEX</h1>
        </div>

        {/* Content */}
        <div style={{ padding: 30 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: '#E31E24', marginTop: 0 }}>Gute Reise!</h2>
          <p>Hallo <strong>Max Mustermann</strong>,</p>
          <p>vielen Dank für Ihre Buchung bei <strong>RentEx</strong>. Ihr Fahrzeug steht für Sie bereit. Da Sie sich für den <strong>Self Check-in</strong> entschieden haben, finden Sie untenstehend alle Details zur Fahrzeugübernahme.</p>

          {/* Info Box */}
          <div style={{ backgroundColor: '#f2f2f2', padding: 20, borderRadius: 10, margin: '20px 0', borderLeft: '5px solid #E31E24' }}>
            <span style={{ fontWeight: 'bold', color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Abholort / Standort</span>
            <span style={{ fontSize: 16, marginBottom: 12, display: 'block', color: '#000', fontWeight: 600 }}>{address}</span>

            <span style={{ fontWeight: 'bold', color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Ihr Fahrzeug</span>
            <span style={{ fontSize: 16, marginBottom: 12, display: 'block', color: '#000', fontWeight: 600 }}>Ford Transit Custom - FK-FT 2002</span>

            <span style={{ fontWeight: 'bold', color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Termin zur Abholung</span>
            <span style={{ fontSize: 16, marginBottom: 12, display: 'block', color: '#000', fontWeight: 600 }}>25. April 2026 um 09:00 Uhr</span>
          </div>

          <h3 style={{ borderBottom: '2px solid #f2f2f2', paddingBottom: 10, fontWeight: 800, textTransform: 'uppercase', fontSize: 16 }}>Schließfach-Informationen</h3>
          <p>Ihren Fahrzeugschlüssel finden Sie im Schließfach direkt am Haupteingang unserer Filiale (<span style={{ color: '#E31E24', fontWeight: 800 }}>Standort {locationName}</span>).</p>

          <div style={{ textAlign: 'center', background: '#000', padding: 25, borderRadius: 14, margin: '20px 0' }}>
            <span style={{ fontWeight: 'bold', color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>IHR PERSÖNLICHER SCHLIESSBACH-CODE</span>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#E31E24', letterSpacing: 5, margin: '10px 0' }}>8 4 2 1</div>
          </div>

          <p style={{ marginTop: 25 }}><strong>Der Ablauf vor Ort:</strong></p>
          <ul style={{ paddingLeft: 20, color: '#444' }}>
            <li style={{ marginBottom: 10 }}>Geben Sie den oben genannten Code am Tastenfeld des Safes ein.</li>
            <li style={{ marginBottom: 10 }}>Entnehmen Sie den Schlüssel für Ihr gemietetes Fahrzeug.</li>
            <li style={{ marginBottom: 10 }}>Überprüfen Sie das Fahrzeug vor dem Losfahren kurz auf eventuelle Vorschäden (wir empfehlen Fotos zu machen).</li>
            <li>Gute und sichere Fahrt!</li>
          </ul>

          <div style={{ textAlign: 'center', marginTop: 45 }}>
            <a href="#" style={{ backgroundColor: '#E31E24', color: 'white', padding: '12px 25px', textDecoration: 'none', borderRadius: 5, display: 'inline-block', fontWeight: 'bold' }}>In der App öffnen</a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#f9f9f9', padding: 25, textAlign: 'center', fontSize: 13, borderTop: '1px solid #eee', color: '#666' }}>
          <p><strong>Rent-Ex GmbH</strong></p>
          <p>{address} | Österreich</p>
          <p>Telefon: {phone} | E-Mail: support@rent-ex.at</p>
          <p style={{ marginTop: 20, fontSize: 11, opacity: 0.6 }}>&copy; 2026 Rent-Ex GmbH. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
}
