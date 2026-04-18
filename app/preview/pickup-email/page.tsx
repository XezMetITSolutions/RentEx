import React from 'react';

export default function PickupEmailPreview() {
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
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #eee; }
        .button { background-color: #E31E24; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
        .info-box { background-color: #f2f2f2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #E31E24; }
        .locker-code { font-size: 24px; font-weight: bold; color: #E31E24; letter-spacing: 5px; margin: 10px 0; }
        h1 { color: white; margin: 0; font-size: 24px; }
        h2 { color: #E31E24; margin-top: 0; }
        .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; margin-bottom: 10px; display: block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: white; font-weight: 900; letter-spacing: 2px;">RENTEX</h1>
        </div>
        <div class="content">
            <h2 style="font-size: 22px;">Gute Reise! 🚗</h2>
            <p>Hallo <strong>Max Mustermann</strong>,</p>
            <p>vielen Dank für Ihre Buchung bei <strong>RentEx</strong>. Ihr Fahrzeug steht für Sie bereit. Da Sie sich für den <strong>Self Check-in</strong> entschieden haben, finden Sie untenstehend alle Details zur Fahrzeugübernahme.</p>
            
            <div class="info-box">
                <span class="label">Abholort / Standort</span>
                <span class="value">Hauptstraße 1, 6800 Feldkirch, Österreich</span>
                
                <span class="label">Fahrzeug</span>
                <span class="value">Ford Transit Custom - FK-FT 2002</span>
                
                <span class="label">Datum & Uhrzeit</span>
                <span class="value">25. April 2026 um 09:00 Uhr</span>
            </div>

            <h3 style="border-bottom: 2px solid #f2f2f2; padding-bottom: 10px;">Schließfach-Informationen</h3>
            <p>Ihren Fahrzeugschlüssel finden Sie im Schließfach direkt am Haupteingang unserer Filiale.</p>
            
            <div style="text-align: center; background: #000; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <span class="label" style="color: #999;">IHR SCHLIEẞFACH-CODE</span>
                <div class="locker-code" style="font-size: 32px; color: #E31E24;">8 4 2 1</div>
            </div>

            <p style="margin-top: 25px;"><strong>So funktioniert es:</strong></p>
            <ul style="padding-left: 20px;">
                <li style="margin-bottom: 8px;">Geben Sie den oben genannten Code am Tastenfeld des Safes ein.</li>
                <li style="margin-bottom: 8px;">Entnehmen Sie den Schlüssel für Ihr Fahrzeug.</li>
                <li style="margin-bottom: 8px;">Überprüfen Sie das Fahrzeug kurz auf eventuelle Vorschäden (Fotos machen!).</li>
                <li>Gute Fahrt!</li>
            </ul>

            <div style="text-align: center; margin-top: 40px;">
                <a href="#" class="button">In der App ansehen</a>
            </div>
        </div>
        <div class="footer">
            <p><strong>RentEx Feldkirch</strong> | +43 123 456789 | support@rent-ex.at</p>
            <p>&copy; 2026 XezMet IT Solutions / RentEx. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>
  `;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f4f4f4', padding: '20px 0' }}>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <div style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
        <p>Preview Mode - RentEx Corporate Email Template</p>
      </div>
    </div>
  );
}
