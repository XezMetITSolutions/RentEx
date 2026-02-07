# RentEx – Ek Özellik Önerileri

Bu dokümanda mevcut özellikler ve ileride eklenebilecek özellikler listelenir.

---

## ✅ Yapılan Özellikler (Bu Turda)

- **Auth (Login / Register / Logout)**  
  Cookie tabanlı oturum, `Customer.passwordHash` (scrypt), middleware ile `/dashboard` koruması.

- **Login**  
  E-Mail + Passwort, hata mesajı, “from” ile geri yönlendirme.

- **Register**  
  Vorname, Nachname, E-Mail, Telefon (optional), Passwort (min. 6 Zeichen), kayıt sonrası otomatik login.

- **Abmelden**  
  Sidebar’da “Abmelden” ile session silinir ve ana sayfaya yönlendirilir.

- **Profil bearbeiten**  
  Dashboard → Profileinstellungen: Vorname, Nachname, Telefon, Adresse, PLZ, Stadt, Land düzenlenebilir; Server Action ile kayıt.

- **Reservierung stornieren**  
  Meine Anmietungen → Detail: Status “Pending” ise “Reservierung stornieren” butonu; onay sonrası status “Cancelled”.

---

## 🔮 Önerilen Ek Özellikler

### Kullanıcı / Müşteri

- **Passwort ändern**  
  Einstellungen veya Profil: Aktuelles Passwort + neues Passwort; `passwordHash` güncelleme.

- **E-Mail-Benachrichtigungen**  
  Buchungsbestätigung, Erinnerung (1 Tag vor Abholung), Rückgabe-Erinnerung; SystemSettings veya Notification-Tabelle.

- **Favoriten / Wunschliste**  
  Araçları favorilere ekleyip listeleme.

- **Bewertungen**  
  Abgeschlossene Mieten için 1–5 Sterne + Kurztext; neue Tabelle `RentalReview`.

- **Dokumente hochladen**  
  Führerschein, Ausweis (optional); Storage (z. B. S3/Vercel Blob) + DB-Referenz.

- **Mietverlängerung anfragen**  
  Aktive Miete için “Verlängern” → Antrag mit neuem Enddatum; Admin onayı veya otomatik.

### Admin

- **Echte Admin-Auth**  
  Ayrı Admin-Login (z. B. User-Tabelle veya NextAuth mit Rollen); `/admin` middleware ile koruma.

- **ActivityLog schreiben**  
  Önemli aksiyonlarda (Reservierung, Stornierung, Kunde bearbeitet) `ActivityLog` kaydı.

- **Reservierung bearbeiten**  
  Admin: Termin, Fahrzeug, Preis ändern; Stornierung mit Grund.

- **Zahlung erfassen**  
  Admin: Offene Buchung için “Zahlung eingegangen” (Payment anlegen, paymentStatus → Paid).

- **E-Mail-Vorlagen**  
  SystemSettings oder eigene Tabelle; Bestätigung, Erinnerung, Rechnung per E-Mail.

- **Export**  
  Kunden, Buchungen, Finanzen als Excel/CSV (teilweise schon z. B. excelExport).

### Technik / UX

- **NextAuth oder Clerk**  
  Statt eigener Cookie-Logik: OAuth (Google, Apple), Magic Link, bessere Session-Verwaltung.

- **Rate Limiting**  
  Login/Register ve kritik API’ler için (z. B. Vercel KV oder Upstash).

- **E2E-Tests**  
  Playwright/Cypress: Login, Buchung, Dashboard-Flows.

- **PWA / Mobile**  
  Service Worker, Install-Prompt, Offline-Hinweise.

- **Mehrsprachigkeit**  
  DE/EN/TR; next-intl oder ähnlich.

### Geschäft

- **Gutschein bei Buchung**  
  Checkout’ta Gutscheincode; `DiscountCoupon` prüfen, `discountAmount` anwenden.

- **Kaution / Deposit**  
  Buchung mit Kaution (z. B. Kreditkarten-Reserve); Status “deposit_pending” o. ä.

- **Standort-basierte Preise**  
  Abholort/Rückgabeort’a göre fiyat farkı (Location-Preislogik).

- **Fahrzeugverfügbarkeit**  
  Kalender-Ansicht: pro Fahrzeug belegte Tage; Doppelbuchungen verhindern.

---

## Datenbank-Hinweis

Nach dem Schema-Update (`Customer.passwordHash`) muss die Datenbank angepasst werden:

```bash
npx prisma db push
# oder für Migrations:
npx prisma migrate dev --name add_customer_password
```

Bestehende Kunden haben `passwordHash = null` und können sich nicht einloggen; erst nach “Passwort setzen” oder neuer Registrierung.
