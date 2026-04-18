import React from 'react';
import prisma from '@/lib/prisma';

export default async function PickupEmailPreview() {
  const locations = await prisma.location.findMany();
  const defaultLocation = locations.find(l => l.name.toLowerCase().includes('feldkirch')) || locations[0];

  const address = defaultLocation 
    ? `${defaultLocation.address}, ${defaultLocation.city}` 
    : 'Hauptstraße 1, 6800 Feldkirch, Österreich';
    
  const phone = '+43 123 456789'; 

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background-color: #000000; padding: 30px; text-align: center; border-bottom: 4px solid #E31E24; }
        .content { padding: 30px; }
        .footer { background-color: #f9f9f9; padding: 25px; text-align: center; font-size: 13px; border-top: 1px solid #eee; color: #666; }
        .button { background-color: #E31E24; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
        .info-box { background-color: #f2f2f2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #E31E24; }
        .locker-code { font-size: 24px; font-weight: bold; color: #E31E24; letter-spacing: 5px; margin: 10px 0; }
        h1 { color: white; margin: 0; font-size: 24px; }
        h2 { color: #E31E24; margin-top: 0; }
        .label { font-weight: bold; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .value { font-size: 16px; margin-bottom: 12px; display: block; color: #000; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: white; font-weight: 900; letter-spacing: 3px;">RENTEX</h1>
        </div>
        <div class="content">
            <h2 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Gute Reise! 🚗</h2>
            <p>Hallo <strong>Max Mustermann</strong>,</p>
            <p>vielen Dank für Ihre Buchung bei <strong>RentEx</strong>. Ihr Fahrzeug steht für Sie bereit. Da Sie sich für den <strong>Self Check-in</strong> entschieden haben, finden Sie untenstehend alle Details zur Fahrzeugübernahme.</p>
            
            <div class="info-box">
                <span class="label">Abholort / Standort</span>
                <span class="value">${address}</span>
                
                <span class="label">Ihr Fahrzeug</span>
                <span class="value">Ford Transit Custom - FK-FT 2002</span>
                
                <span class="label">Termin zur Abholung</span>
                <span class="value">25. April 2026 um 09:00 Uhr</span>
            </div>

            <h3 style="border-bottom: 2px solid #f2f2f2; padding-bottom: 10px; font-weight: 800; text-transform: uppercase; font-size: 16px;">Schließfach-Informationen</h3>
            <p>Ihren Fahrzeugschlüssel finden Sie im Schließfach direkt am Haupteingang unserer Filiale (<span style="color: #E31E24; font-weight: 800;">Standort ${defaultLocation?.name || 'Feldkirch'}</span>).</p>
            
            <div style="text-align: center; background: #000; padding: 25px; border-radius: 14px; margin: 20px 0;">
                <span class="label" style="color: #888;">IHR PERSÖNLICHER SCHLIEẞFACH-CODE</span>
                <div class="locker-code" style="font-size: 36px; color: #E31E24;">8 4 2 1</div>
            </div>

            <p style="margin-top: 25px;"><strong>Der Ablauf vor Ort:</strong></p>
            <ul style="padding-left: 20px; list-style-type: square; color: #444;">
                <li style="margin-bottom: 10px;">Geben Sie den oben genannten Code am Tastenfeld des Safes ein.</li>
                <li style="margin-bottom: 10px;">Entnehmen Sie den Schlüssel für Ihr gemietetes Fahrzeug.</li>
                <li style="margin-bottom: 10px;">Überprüfen Sie das Fahrzeug vor dem Losfahren kurz auf eventuelle Vorschäden (wir empfehlen Fotos zu machen).</li>
                <li>Gute und sichere Fahrt!</li>
            </ul>

            <div style="text-align: center; margin-top: 45px;">
                <a href="#" class="button">In der App öffnen</a>
            </div>
        </div>
        <div class="footer">
            <p><strong>Rent-Ex GmbH</strong></p>
            <p>${address} | Österreich</p>
            <p>Telefon: ${phone} | E-Mail: support@rent-ex.at</p>
            <p style="margin-top: 20px; font-size: 11px; opacity: 0.6;">&copy; 2026 Rent-Ex GmbH. Alle Rechte vorbehalten.</p>
        </div>
    </div>
</body>
</html>
  `;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f4f4f4', padding: '10px 0' }}>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
