# RentEx - Standorte Seed Script

## Feldkirch Standort Hinzufügen

Um den Feldkirch Standort zur Datenbank hinzuzufügen, führen Sie folgenden Befehl aus:

```bash
npx tsx prisma/seed-locations.ts
```

## Standort Details

**Rent-Ex Feldkirch**
- Adresse: Illstraße 75a, 6800 Feldkirch
- Telefon: +43 5522 12345
- E-Mail: feldkirch@rent-ex.at
- Öffnungszeiten: 08:00 - 18:00 (Mo-Sa)
- Sonntag: Geschlossen

## Hinweis

Das Script überprüft automatisch, ob der Standort bereits existiert, um Duplikate zu vermeiden.
