# RentEx - Fahrzeuge zu Feldkirch zuweisen

## Übersicht

Dieses Script weist alle vorhandenen Fahrzeuge dem Feldkirch-Standort zu und aktualisiert die Kennzeichen auf österreichisches Format.

## Österreichische Kennzeichen Format

Das Script verwendet authentische Vorarlberger Kennzeichen-Präfixe:
- **FK** - Feldkirch
- **BZ** - Bregenz
- **DO** - Dornbirn
- **BL** - Bludenz
- **FE** - Feldkirch (alternativ)

Format: `FK 1234 AB`
- Präfix (2 Buchstaben)
- 4-stellige Nummer
- 2 Buchstaben

## Verwendung

### Schritt 1: Feldkirch Standort initialisieren
Falls noch nicht geschehen:
```bash
npx tsx prisma/seed-locations.ts
```

### Schritt 2: Fahrzeuge zuweisen
```bash
npx tsx prisma/assign-cars-to-feldkirch.ts
```

## Was macht das Script?

1. ✅ Sucht den Feldkirch-Standort in der Datenbank
2. 🚗 Findet alle aktiven Fahrzeuge
3. 📍 Weist jedem Fahrzeug Feldkirch als aktuellen und Heimatstandort zu
4. 🚗 Aktualisiert Kennzeichen, die nicht im österreichischen Format sind
5. ✨ Stellt sicher, dass alle Kennzeichen eindeutig sind
6. 📊 Zeigt detaillierte Fortschrittsinformationen

## Ausgabe Beispiel

```
🚗 Assigning all cars to Feldkirch location...

✅ Found Feldkirch location (ID: 1)

📊 Found 15 active cars

🔧 Updating cars...

   1. BMW 320i
      📍 Location: → Feldkirch
      🚗 Plate: ABC123 → FK 3456 XY
   
   2. Mercedes E-Class
      📍 Location: → Feldkirch
      🚗 Plate: FK 1234 AB (kept)

✅ Update completed!

📊 Summary:
   • Total cars updated: 15
   • Plates updated to Austrian format: 12
   • All cars now assigned to: Rent-Ex Feldkirch
   • Location: Illstraße 75a, 6800 Feldkirch

🎉 Process completed successfully!
```

## Hinweise

- ⚠️ Das Script überschreibt vorhandene Standort-Zuweisungen
- ✅ Kennzeichen im korrekten Format werden beibehalten
- 🔄 Duplikate werden automatisch vermieden
- 📝 Alle Änderungen werden protokolliert
