/**
 * Every e-mail Rent-Ex sends, as content only. Layout lives in ./layout.ts,
 * data loading and sending in lib/rentalMail.ts.
 */
import { formatInTimeZone } from 'date-fns-tz';
import { de } from 'date-fns/locale';
import { BUSINESS, RENTAL_TERMS, SITE_URL } from '@/lib/config';
import { COMPANY, renderEmail, type Block, type Fact } from './layout';

export interface EmailMessage {
    subject: string;
    /** Plain-text part. */
    body: string;
    html?: string;
}

/** A rental, flattened to what the e-mails show. Built by lib/rentalMail.ts. */
export interface MailRental {
    id: number;
    contractNumber: string;
    customer: { firstName: string; lastName: string; email: string; hasAccount: boolean };
    car: { brand: string; model: string; plate: string };
    startDate: Date;
    endDate: Date;
    pickupPlace: { name: string; address: string };
    returnPlace: { name: string; address: string };
    totalDays: number;
    totalAmount: number;
    /** Sum of all payments (refunds are negative). */
    paid: number;
    /** 'Online' | 'arrival' | 'Cash' | … */
    paymentMethod: string | null;
    paymentStatus: string;
    extras: string[];
    includedKm: number | null;
    deposit: number | null;
    discount: number;
    pickupOutsideHours: boolean;
    returnOutsideHours: boolean;
    /** Return data, set once the car is back. */
    returned?: {
        at: Date;
        drivenKm: number | null;
        fuelCharge: number;
        extraCharges: number;
        extraChargesNote: string | null;
    };
}

const TZ = BUSINESS.TIME_ZONE;
const eurFmt = new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' });
export const eur = (n: number) => eurFmt.format(n);
const dateTime = (d: Date) => `${formatInTimeZone(d, TZ, 'EEEE, dd.MM.yyyy', { locale: de })}, ${formatInTimeZone(d, TZ, 'HH:mm')} Uhr`;
const dateOnly = (d: Date) => formatInTimeZone(d, TZ, 'dd.MM.yyyy');
const time = (d: Date) => `${formatInTimeZone(d, TZ, 'HH:mm')} Uhr`;
const km = (n: number) => `${n.toLocaleString('de-AT')} km`;
/** Bank details are only printed when configured; a wrong IBAN on a payment request is worse than none. */
const IBAN = process.env.COMPANY_IBAN || null;

const name = (r: MailRental) => `${r.customer.firstName} ${r.customer.lastName}`.trim();
const greeting = (firstName: string, lastName = '') => `Guten Tag ${`${firstName} ${lastName}`.trim()},`;
const vehicle = (r: MailRental) => `${r.car.brand} ${r.car.model}`;
const mapsUrl = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const isOnline = (r: MailRental) => (r.paymentMethod || '').toLowerCase() === 'online';
const isTransfer = (r: MailRental) => (r.paymentMethod || '').toLowerCase() === 'transfer';
const paymentLabel = (r: MailRental) =>
    isOnline(r) ? 'Online' : isTransfer(r) ? 'Überweisung' : 'Bei Abholung, bar oder mit Karte';
const openAmount = (r: MailRental) => Math.max(0, Math.round((r.totalAmount - r.paid) * 100) / 100);
const bookingUrl = (r: MailRental) => `${SITE_URL}/dashboard/rentals/${r.id}`;

function build(subject: string, spec: Parameters<typeof renderEmail>[0]): EmailMessage {
    const { html, text } = renderEmail(spec);
    return { subject, body: text, html };
}

function placeValue(place: { name: string; address: string }): string {
    return place.address && place.address !== place.name ? `${place.name}\n${place.address}` : place.name;
}

/** Pickup/return/vehicle rows shared by most rental mails. */
function periodFacts(r: MailRental): Fact[] {
    const samePlace = r.pickupPlace.address === r.returnPlace.address;
    return [
        { label: 'Fahrzeug', value: `**${vehicle(r)}**${r.car.plate ? `\n${r.car.plate}` : ''}` },
        { label: 'Abholung', value: `${dateTime(r.startDate)}${samePlace ? '' : `\n${placeValue(r.pickupPlace)}`}` },
        { label: 'Rückgabe', value: `${dateTime(r.endDate)}${samePlace ? '' : `\n${placeValue(r.returnPlace)}`}` },
        ...(samePlace ? [{ label: 'Ort', value: placeValue(r.pickupPlace) }] : []),
    ];
}

function priceFacts(r: MailRental): (Fact | null)[] {
    const open = openAmount(r);
    return [
        { label: 'Mietdauer', value: `${r.totalDays} ${r.totalDays === 1 ? 'Tag' : 'Tage'}` },
        r.includedKm ? { label: 'Inklusive', value: km(r.includedKm) } : null,
        r.extras.length ? { label: 'Extras', value: r.extras.join(', ') } : null,
        r.discount > 0 ? { label: 'Rabatt', value: `− ${eur(r.discount)}` } : null,
        { label: 'Gesamtpreis inkl. MwSt.', value: eur(r.totalAmount), strong: true },
        r.paid > 0.004
            ? { label: open > 0 ? 'Bereits bezahlt' : 'Bezahlt', value: eur(r.paid) }
            : { label: 'Zahlung', value: paymentLabel(r) },
        r.paid > 0.004 && open > 0 ? { label: 'Offen', value: eur(open) } : null,
    ];
}

function handoverNote(r: MailRental, which: 'pickup' | 'return' | 'both'): Block | null {
    const outside =
        (which !== 'return' && r.pickupOutsideHours) || (which !== 'pickup' && r.returnOutsideHours);
    if (!outside) return null;
    return {
        kind: 'note',
        title: 'Übergabe außerhalb der Öffnungszeiten',
        text: `Bitte rufen Sie uns vorab unter ${BUSINESS.PHONE} an. Wir vereinbaren dann die schlüssellose Übergabe mit Ihnen.`,
    };
}

const BRING: Block = {
    kind: 'list',
    items: [
        'Führerschein im Original',
        'Personalausweis oder Reisepass',
        'Kredit- oder Debitkarte für die Kaution',
    ],
};

function depositLine(r: MailRental): Block | null {
    if (r.deposit == null || r.deposit <= 0) return null;
    return { kind: 'p', text: `Bei der Abholung hinterlegen Sie eine Kaution von **${eur(r.deposit)}**. Sie ist nicht im Mietpreis enthalten und wird nach der Rückgabe freigegeben.` };
}

// ─── Customer: booking ────────────────────────────────────────────────────────

/** Reservation confirmed. `paid` = online payment just arrived. */
function bookingConfirmation(r: MailRental, opts: { paid?: boolean } = {}): EmailMessage {
    const paid = !!opts.paid;
    const heading = paid ? 'Ihre Buchung ist bezahlt und bestätigt' : 'Ihre Reservierung ist bestätigt';
    return build(`${paid ? 'Zahlung erhalten – ' : ''}Buchungsbestätigung ${r.contractNumber}`, {
        preheader: `${vehicle(r)}, Abholung ${dateTime(r.startDate)}.`,
        eyebrow: `Buchung ${r.contractNumber}`,
        heading,
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            {
                kind: 'p',
                text: paid
                    ? `vielen Dank für Ihre Zahlung über **${eur(r.paid || r.totalAmount)}**. Ihr Fahrzeug ist fest für Sie reserviert.`
                    : isTransfer(r)
                        ? 'vielen Dank für Ihre Reservierung. Das Fahrzeug ist für Sie reserviert. Die Zahlungsdetails für die Überweisung erhalten Sie gesondert.'
                        : 'vielen Dank für Ihre Reservierung. Das Fahrzeug ist für Sie reserviert, bezahlt wird bei der Abholung.',
            },
            { kind: 'facts', rows: periodFacts(r) },
            handoverNote(r, 'both'),
            { kind: 'title', text: 'Preis' },
            { kind: 'facts', rows: priceFacts(r) },
            depositLine(r),
            { kind: 'title', text: 'Bitte zur Abholung mitbringen' },
            BRING,
            { kind: 'p', text: `Sie erhalten das Fahrzeug vollgetankt und geben es vollgetankt zurück. Fehlender Kraftstoff wird zuzüglich ${eur(RENTAL_TERMS.REFUEL_FEE_EUR)} Servicegebühr verrechnet.` },
            { kind: 'p', text: `Bis ${RENTAL_TERMS.FREE_CANCEL_HOURS} Stunden vor der Abholung können Sie kostenlos stornieren${r.customer.hasAccount ? ' – direkt in Ihrem Kundenkonto' : ''}.` },
            r.customer.hasAccount ? { kind: 'button', label: 'Buchung ansehen', href: bookingUrl(r) } : null,
        ],
        reason: 'Sie erhalten diese E-Mail, weil Sie bei Rent-Ex ein Fahrzeug gebucht haben.',
    });
}

function pickupReminder(r: MailRental): EmailMessage {
    const open = openAmount(r);
    return build(`Ihre Abholung morgen um ${time(r.startDate)} – ${r.contractNumber}`, {
        preheader: `${vehicle(r)} steht morgen für Sie bereit.`,
        eyebrow: `Buchung ${r.contractNumber}`,
        heading: `Morgen um ${time(r.startDate)} steht Ihr ${r.car.brand} bereit`,
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            { kind: 'p', text: 'hier noch einmal alles Wichtige für die Abholung morgen.' },
            {
                kind: 'facts',
                rows: [
                    { label: 'Fahrzeug', value: `**${vehicle(r)}**` },
                    { label: 'Abholung', value: dateTime(r.startDate) },
                    { label: 'Adresse', value: placeValue(r.pickupPlace) },
                    open > 0 ? { label: 'Bei Abholung zu zahlen', value: eur(open) } : { label: 'Zahlung', value: 'Bereits bezahlt' },
                    r.deposit ? { label: 'Kaution', value: eur(r.deposit) } : null,
                ],
            },
            handoverNote(r, 'pickup'),
            { kind: 'button', label: 'Route in Google Maps', href: mapsUrl(r.pickupPlace.address || r.pickupPlace.name) },
            { kind: 'title', text: 'Bitte mitbringen' },
            BRING,
            { kind: 'p', text: 'Falls Sie sich verspäten, geben Sie uns bitte kurz telefonisch Bescheid.' },
        ],
        reason: 'Sie erhalten diese Erinnerung zu Ihrer Buchung bei Rent-Ex.',
    });
}

function returnReminder(r: MailRental): EmailMessage {
    return build(`Rückgabe morgen um ${time(r.endDate)} – ${r.contractNumber}`, {
        preheader: `Bitte bringen Sie den ${vehicle(r)} morgen zurück.`,
        eyebrow: `Buchung ${r.contractNumber}`,
        heading: `Ihre Miete endet morgen um ${time(r.endDate)}`,
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            {
                kind: 'facts',
                rows: [
                    { label: 'Fahrzeug', value: `**${vehicle(r)}**${r.car.plate ? `\n${r.car.plate}` : ''}` },
                    { label: 'Rückgabe', value: dateTime(r.endDate) },
                    { label: 'Adresse', value: placeValue(r.returnPlace) },
                ],
            },
            handoverNote(r, 'return'),
            { kind: 'title', text: 'Vor der Rückgabe' },
            {
                kind: 'list',
                items: [
                    `Vollgetankt zurückgeben, sonst verrechnen wir den Kraftstoff plus ${eur(RENTAL_TERMS.REFUEL_FEE_EUR)}.`,
                    'Persönliche Gegenstände aus dem Fahrzeug nehmen.',
                    'Schäden bitte bei der Rückgabe melden.',
                ],
            },
            { kind: 'p', text: `Sie brauchen das Fahrzeug länger? Rufen Sie uns an, solange es frei ist, verlängern wir gern. Eine verspätete Rückgabe ohne Absprache wird als zusätzlicher Miettag berechnet.` },
        ],
        reason: 'Sie erhalten diese Erinnerung zu Ihrer Buchung bei Rent-Ex.',
    });
}

export type CancelReason = 'customer' | 'company' | 'noShow';

function cancellation(r: MailRental, opts: { by: CancelReason; refundedAmount?: number }): EmailMessage {
    const refunded = opts.refundedAmount ?? 0;
    const intro: Record<CancelReason, string> = {
        customer: 'wie gewünscht haben wir Ihre Buchung storniert.',
        company: 'wir haben Ihre Buchung storniert. Falls Sie dazu Fragen haben, melden Sie sich bitte bei uns.',
        noShow: `Ihre Reservierung wurde storniert, da das Fahrzeug nicht innerhalb von ${RENTAL_TERMS.NO_SHOW_GRACE_HOURS} Stunden nach der vereinbarten Zeit abgeholt wurde.`,
    };
    const paidSomething = r.paid > 0.004 || refunded > 0;
    return build(`Stornierungsbestätigung ${r.contractNumber}`, {
        preheader: `Buchung ${r.contractNumber} für den ${vehicle(r)} ist storniert.`,
        eyebrow: `Buchung ${r.contractNumber}`,
        heading: 'Ihre Buchung ist storniert',
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            { kind: 'p', text: intro[opts.by] },
            {
                kind: 'facts',
                rows: [
                    { label: 'Fahrzeug', value: vehicle(r) },
                    { label: 'Zeitraum', value: `${dateOnly(r.startDate)} – ${dateOnly(r.endDate)}` },
                    refunded > 0 ? { label: 'Erstattet', value: `**${eur(refunded)}**` } : null,
                ],
            },
            refunded > 0
                ? { kind: 'p', text: 'Die Erstattung geht auf das Zahlungsmittel, mit dem Sie bezahlt haben. Je nach Bank dauert die Gutschrift 5 bis 10 Werktage.' }
                : paidSomething && opts.by === 'company'
                    ? { kind: 'p', text: 'Bereits geleistete Zahlungen erstatten wir Ihnen. Sie erhalten dazu eine eigene Bestätigung.' }
                    : null,
            { kind: 'p', text: 'Wir freuen uns, wenn Sie bei einer anderen Gelegenheit wieder bei uns buchen.' },
            { kind: 'button', label: 'Fahrzeuge ansehen', href: `${SITE_URL}/fleet` },
        ],
        reason: 'Sie erhalten diese E-Mail zu Ihrer Buchung bei Rent-Ex.',
    });
}

function paymentExpired(r: MailRental, opts: { retryUrl: string | null }): EmailMessage {
    return build(`Ihre Reservierung wurde nicht abgeschlossen – ${r.contractNumber}`, {
        preheader: 'Die Online-Zahlung wurde nicht abgeschlossen, das Fahrzeug ist wieder freigegeben.',
        eyebrow: `Reservierung ${r.contractNumber}`,
        heading: 'Die Zahlung wurde nicht abgeschlossen',
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            { kind: 'p', text: `Sie hatten den **${vehicle(r)}** reserviert, die Online-Zahlung aber nicht abgeschlossen. Nach 30 Minuten geben wir das Fahrzeug wieder frei. Es wurde nichts abgebucht.` },
            { kind: 'facts', rows: [
                { label: 'Fahrzeug', value: vehicle(r) },
                { label: 'Zeitraum', value: `${dateTime(r.startDate)}\nbis ${dateTime(r.endDate)}` },
                { label: 'Preis', value: eur(r.totalAmount) },
            ] },
            opts.retryUrl
                ? { kind: 'p', text: 'Wenn Sie das Fahrzeug noch brauchen, können Sie die Buchung mit denselben Daten neu starten, sofern es noch frei ist.' }
                : null,
            { kind: 'button', label: opts.retryUrl ? 'Buchung neu starten' : 'Fahrzeuge ansehen', href: opts.retryUrl || `${SITE_URL}/fleet` },
            { kind: 'p', text: 'Gab es ein Problem bei der Zahlung? Rufen Sie uns an, dann reservieren wir telefonisch für Sie.' },
        ],
        reason: 'Sie erhalten diese E-Mail, weil Sie auf rent-ex.at eine Buchung begonnen haben.',
    });
}

function refund(r: MailRental, opts: { amount: number; reason?: string | null }): EmailMessage {
    return build(`Erstattung über ${eur(opts.amount)} – ${r.contractNumber}`, {
        preheader: `Wir haben ${eur(opts.amount)} an Sie zurückgezahlt.`,
        eyebrow: `Buchung ${r.contractNumber}`,
        heading: `Wir haben ${eur(opts.amount)} erstattet`,
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            { kind: 'p', text: 'wir haben eine Erstattung zu Ihrer Buchung veranlasst.' },
            { kind: 'facts', rows: [
                { label: 'Betrag', value: `**${eur(opts.amount)}**` },
                { label: 'Fahrzeug', value: vehicle(r) },
                { label: 'Zeitraum', value: `${dateOnly(r.startDate)} – ${dateOnly(r.endDate)}` },
                opts.reason ? { label: 'Grund', value: opts.reason } : null,
            ] },
            { kind: 'p', text: 'Der Betrag geht auf das Zahlungsmittel, mit dem Sie bezahlt haben. Je nach Bank dauert die Gutschrift 5 bis 10 Werktage.' },
        ],
        reason: 'Sie erhalten diese E-Mail zu Ihrer Buchung bei Rent-Ex.',
    });
}

function bookingChanged(r: MailRental, opts: { previousEnd: Date; previousTotal: number }): EmailMessage {
    const open = openAmount(r);
    return build(`Ihre Buchung wurde geändert – ${r.contractNumber}`, {
        preheader: `Neue Rückgabe: ${dateTime(r.endDate)}.`,
        eyebrow: `Buchung ${r.contractNumber}`,
        heading: 'Ihre Miete wurde verlängert',
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            { kind: 'p', text: 'wir haben Ihre Buchung wie besprochen angepasst. Hier die neuen Daten:' },
            { kind: 'facts', rows: [
                { label: 'Fahrzeug', value: `**${vehicle(r)}**` },
                { label: 'Abholung', value: dateTime(r.startDate) },
                { label: 'Neue Rückgabe', value: `**${dateTime(r.endDate)}**\nbisher ${dateTime(opts.previousEnd)}` },
                { label: 'Mietdauer', value: `${r.totalDays} ${r.totalDays === 1 ? 'Tag' : 'Tage'}` },
                { label: 'Neuer Gesamtpreis', value: eur(r.totalAmount), strong: true },
                { label: 'Bisher', value: eur(opts.previousTotal) },
                open > 0 ? { label: 'Noch offen', value: eur(open) } : null,
            ] },
            open > 0 ? { kind: 'p', text: 'Den offenen Betrag begleichen Sie bitte bei der Rückgabe.' } : null,
            handoverNote(r, 'return'),
        ],
        reason: 'Sie erhalten diese E-Mail zu Ihrer Buchung bei Rent-Ex.',
    });
}

function rentalCompleted(r: MailRental): EmailMessage {
    const ret = r.returned;
    const extras = (ret?.fuelCharge || 0) + (ret?.extraCharges || 0);
    const total = r.totalAmount + extras;
    const open = Math.max(0, Math.round((total - r.paid) * 100) / 100);
    return build(`Rückgabe bestätigt – ${r.contractNumber}`, {
        preheader: `Danke, dass Sie mit Rent-Ex unterwegs waren.`,
        eyebrow: `Buchung ${r.contractNumber}`,
        heading: 'Danke, das Fahrzeug ist zurück',
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            { kind: 'p', text: `wir haben den ${vehicle(r)} zurückgenommen. Hier die Abrechnung Ihrer Miete:` },
            { kind: 'facts', rows: [
                { label: 'Zurückgegeben', value: dateTime(ret?.at ?? new Date()) },
                ret?.drivenKm != null ? { label: 'Gefahren', value: `${km(ret.drivenKm)}${r.includedKm ? ` (inklusive ${km(r.includedKm)})` : ''}` } : null,
                { label: 'Miete', value: eur(r.totalAmount) },
                ret?.fuelCharge ? { label: 'Betankung', value: eur(ret.fuelCharge) } : null,
                ret?.extraCharges ? { label: 'Zusatzkosten', value: `${eur(ret.extraCharges)}${ret.extraChargesNote ? `\n${cleanChargeNote(ret.extraChargesNote)}` : ''}` } : null,
                { label: 'Gesamt', value: eur(total), strong: true },
                { label: 'Bezahlt', value: eur(Math.max(0, r.paid)) },
                open > 0 ? { label: 'Offen', value: `**${eur(open)}**` } : null,
            ] },
            open > 0 && IBAN
                ? { kind: 'p', text: `Bitte überweisen Sie den offenen Betrag innerhalb von 7 Tagen an **${COMPANY.NAME}**, IBAN **${IBAN}**, Verwendungszweck **${r.contractNumber}**. Sie können auch bei uns vor Ort bezahlen.` }
                : open > 0
                    ? { kind: 'p', text: `Bitte begleichen Sie den offenen Betrag innerhalb von 7 Tagen bei uns vor Ort, bar oder mit Karte. Für eine Überweisung schicken wir Ihnen gern unsere Bankverbindung, antworten Sie dazu einfach auf diese E-Mail.` }
                    : { kind: 'p', text: 'Alles ist beglichen.' },
            r.deposit ? { kind: 'p', text: 'Ihre Kaution geben wir frei, sobald die Abrechnung abgeschlossen ist.' } : null,
            { kind: 'p', text: 'Danke, dass Sie mit uns gefahren sind. Wir freuen uns auf Ihre nächste Buchung.' },
        ],
        reason: 'Sie erhalten diese E-Mail zu Ihrer Buchung bei Rent-Ex.',
    });
}

/** Strips internal markers like "rental:12:km" from charge notes. */
function cleanChargeNote(note: string): string {
    return note
        .split('\n')
        .map((line) => line.replace(/rental:\d+:km\s*/g, '').trim())
        .filter(Boolean)
        .join('\n');
}

function reviewRequest(r: MailRental, opts: { reviewUrl: string }): EmailMessage {
    return build('Wie war Ihre Fahrt mit Rent-Ex?', {
        preheader: 'Eine kurze Bewertung hilft uns sehr.',
        heading: 'Wie war Ihre Fahrt?',
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            { kind: 'p', text: `Sie waren mit unserem ${vehicle(r)} unterwegs. Wir sind ein kleines Team in Feldkirch und lesen jede Rückmeldung.` },
            { kind: 'p', text: 'Wenn Sie zufrieden waren, freuen wir uns über eine kurze Bewertung auf Google. Das dauert eine Minute und hilft anderen bei der Entscheidung.' },
            { kind: 'button', label: 'Bewertung schreiben', href: opts.reviewUrl },
            { kind: 'p', text: 'Lief etwas nicht wie erwartet? Dann antworten Sie einfach auf diese E-Mail, wir kümmern uns darum.' },
        ],
        reason: 'Sie erhalten diese einmalige E-Mail nach Ihrer Miete bei Rent-Ex.',
    });
}

// ─── Customer: account ────────────────────────────────────────────────────────

function passwordReset(c: { firstName: string; lastName: string }, opts: { url: string; validMinutes: number }): EmailMessage {
    return build('Passwort zurücksetzen', {
        preheader: `Der Link ist ${opts.validMinutes} Minuten gültig.`,
        heading: 'Neues Passwort festlegen',
        greeting: greeting(c.firstName, c.lastName),
        blocks: [
            { kind: 'p', text: 'Sie haben ein neues Passwort für Ihr Rent-Ex Kundenkonto angefordert. Über den folgenden Link legen Sie es fest:' },
            { kind: 'button', label: 'Passwort festlegen', href: opts.url },
            { kind: 'p', text: `Der Link ist ${opts.validMinutes} Minuten gültig und funktioniert nur einmal.` },
            { kind: 'p', text: 'Sie haben das nicht angefordert? Dann ignorieren Sie diese E-Mail. Ihr Passwort bleibt unverändert.' },
        ],
        reason: 'Sie erhalten diese E-Mail, weil für Ihre Adresse ein neues Passwort angefordert wurde.',
    });
}

function welcome(c: { firstName: string; lastName: string }): EmailMessage {
    return build('Ihr Kundenkonto bei Rent-Ex', {
        preheader: 'Ihr Konto ist eingerichtet.',
        heading: 'Ihr Kundenkonto ist eingerichtet',
        greeting: greeting(c.firstName, c.lastName),
        blocks: [
            { kind: 'p', text: 'danke für Ihre Registrierung. In Ihrem Kundenkonto können Sie:' },
            { kind: 'list', items: [
                'Ihre Buchungen und Rechnungen einsehen',
                `bis ${RENTAL_TERMS.FREE_CANCEL_HOURS} Stunden vor der Abholung kostenlos stornieren`,
                'Ihre Daten und Ihren Führerschein hinterlegen, damit die nächste Buchung schneller geht',
            ] },
            { kind: 'button', label: 'Zum Kundenkonto', href: `${SITE_URL}/dashboard` },
        ],
        reason: 'Sie erhalten diese E-Mail, weil mit Ihrer Adresse ein Konto bei Rent-Ex angelegt wurde.',
    });
}

function birthday(c: { firstName: string; lastName: string }, opts: { code: string; percent: number; validUntil: Date }): EmailMessage {
    return build(`Alles Gute zum Geburtstag, ${c.firstName}`, {
        preheader: `${opts.percent} % Rabatt auf Ihre nächste Miete.`,
        heading: 'Alles Gute zum Geburtstag',
        greeting: greeting(c.firstName, c.lastName),
        blocks: [
            { kind: 'p', text: `das ganze Rent-Ex Team wünscht Ihnen alles Gute. Für Ihre nächste Miete schenken wir Ihnen **${opts.percent} % Rabatt**:` },
            { kind: 'code', value: opts.code, caption: `Gültig bis ${dateOnly(opts.validUntil)}, einmal einlösbar` },
            { kind: 'p', text: 'Geben Sie den Code bei der Buchung im Feld „Gutscheincode“ ein.' },
            { kind: 'button', label: 'Fahrzeug buchen', href: `${SITE_URL}/fleet` },
        ],
        reason: 'Sie erhalten diese E-Mail als Kunde von Rent-Ex.',
    });
}

function agbUpdate(c: { firstName: string; lastName: string }, opts: { version: string }): EmailMessage {
    return build('Aktualisierung unserer AGB', {
        preheader: `Neue Fassung ${opts.version} unserer Allgemeinen Geschäftsbedingungen.`,
        heading: 'Wir haben unsere AGB aktualisiert',
        greeting: greeting(c.firstName, c.lastName),
        blocks: [
            { kind: 'p', text: `wir haben unsere Allgemeinen Geschäftsbedingungen überarbeitet. Die neue Fassung **${opts.version}** gilt für alle Buchungen ab heute. Bestehende Buchungen laufen zu den Bedingungen weiter, die bei der Buchung galten.` },
            { kind: 'button', label: 'AGB lesen', href: `${SITE_URL}/terms` },
            { kind: 'p', text: 'Sie müssen nichts weiter tun.' },
        ],
        reason: 'Sie erhalten diese E-Mail, weil Sie Kunde von Rent-Ex sind. Über Änderungen der Vertragsbedingungen müssen wir Sie informieren.',
    });
}

// ─── Customer: dunning ────────────────────────────────────────────────────────

export type DunningLevel = 1 | 2 | 3;

function dunning(r: MailRental, opts: { level: DunningLevel; owed: number; dueDate: Date; iban: string | null }): EmailMessage {
    const titles: Record<DunningLevel, string> = {
        1: 'Zahlungserinnerung',
        2: '1. Mahnung',
        3: 'Letzte Mahnung',
    };
    const intros: Record<DunningLevel, string> = {
        1: 'zu Ihrer Miete ist noch ein Betrag offen. Vermutlich ist die Zahlung nur untergegangen, daher erinnern wir Sie kurz daran.',
        2: 'trotz unserer Zahlungserinnerung ist zu Ihrer Miete noch ein Betrag offen. Bitte begleichen Sie ihn bis zum unten genannten Datum.',
        3: 'zu Ihrer Miete ist trotz Erinnerung und Mahnung weiterhin ein Betrag offen. Wir bitten Sie, ihn bis zum unten genannten Datum zu begleichen. Danach müssen wir die Forderung leider an ein Inkassobüro übergeben, wodurch Ihnen zusätzliche Kosten entstehen.',
    };
    return build(`${titles[opts.level]} – Buchung ${r.contractNumber}`, {
        preheader: `Offener Betrag ${eur(opts.owed)}, zahlbar bis ${dateOnly(opts.dueDate)}.`,
        eyebrow: `Buchung ${r.contractNumber}`,
        heading: titles[opts.level],
        greeting: greeting(r.customer.firstName, r.customer.lastName),
        blocks: [
            { kind: 'p', text: intros[opts.level] },
            { kind: 'facts', rows: [
                { label: 'Buchung', value: r.contractNumber },
                { label: 'Fahrzeug', value: vehicle(r) },
                { label: 'Mietzeitraum', value: `${dateOnly(r.startDate)} – ${dateOnly(r.endDate)}` },
                { label: 'Offener Betrag', value: eur(opts.owed), strong: true },
                { label: 'Zahlbar bis', value: `**${dateOnly(opts.dueDate)}**` },
            ] },
            opts.iban
                ? { kind: 'facts', rows: [
                    { label: 'Empfänger', value: COMPANY.NAME },
                    { label: 'IBAN', value: opts.iban },
                    { label: 'Verwendungszweck', value: r.contractNumber },
                ] }
                : { kind: 'p', text: `Sie können bei uns vor Ort bar oder mit Karte bezahlen. Für eine Überweisung schicken wir Ihnen gern unsere Bankverbindung, antworten Sie dazu einfach auf diese E-Mail.` },
            { kind: 'p', text: 'Haben Sie inzwischen bezahlt? Dann betrachten Sie dieses Schreiben bitte als gegenstandslos.' },
        ],
        reason: 'Sie erhalten diese E-Mail zu einer offenen Rechnung bei Rent-Ex.',
    });
}

// ─── Staff ────────────────────────────────────────────────────────────────────

/** Internal notice to the office. Plain, scannable, with a link into the admin. */
function staffNotice(opts: { subject: string; heading: string; text?: string; facts: (Fact | null)[]; link?: { label: string; href: string } }): EmailMessage {
    return build(opts.subject, {
        preheader: opts.text || opts.heading,
        eyebrow: 'Interne Mitteilung',
        heading: opts.heading,
        signoff: false,
        blocks: [
            opts.text ? { kind: 'p', text: opts.text } : null,
            { kind: 'facts', rows: opts.facts },
            opts.link ? { kind: 'button', label: opts.link.label, href: opts.link.href } : null,
        ],
    });
}

function staffRentalFacts(r: MailRental): Fact[] {
    return [
        { label: 'Kunde', value: `${name(r)}\n${r.customer.email}` },
        { label: 'Fahrzeug', value: `${vehicle(r)}${r.car.plate ? ` · ${r.car.plate}` : ''}` },
        { label: 'Zeitraum', value: `${dateTime(r.startDate)}\nbis ${dateTime(r.endDate)}` },
        { label: 'Betrag', value: eur(r.totalAmount) },
    ];
}

const adminRentalLink = (r: MailRental) => ({ label: 'In der Verwaltung öffnen', href: `${SITE_URL}/admin/reservations/${r.id}` });

function staffNewBooking(r: MailRental, opts: { paid: boolean }): EmailMessage {
    return staffNotice({
        subject: `${opts.paid ? 'Bezahlt' : 'Neue Reservierung'}: ${r.contractNumber} – ${name(r)}`,
        heading: opts.paid ? 'Online-Zahlung eingegangen' : 'Neue Reservierung',
        text: opts.paid
            ? `Die Buchung ist bezahlt (${eur(r.paid)}) und bestätigt.`
            : 'Zahlung bei Abholung.',
        facts: [
            ...staffRentalFacts(r),
            r.pickupOutsideHours || r.returnOutsideHours ? { label: 'Hinweis', value: 'Übergabe außerhalb der Öffnungszeiten, Kunde ruft an.' } : null,
        ],
        link: adminRentalLink(r),
    });
}

function staffCancellation(r: MailRental, opts: { by: CancelReason; refundedAmount?: number }): EmailMessage {
    const who = { customer: 'vom Kunden', company: 'intern', noShow: 'automatisch (nicht abgeholt)' }[opts.by];
    return staffNotice({
        subject: `Storniert: ${r.contractNumber} – ${name(r)}`,
        heading: 'Buchung storniert',
        text: `Storniert ${who}. Das Fahrzeug ist für diesen Zeitraum wieder frei.`,
        facts: [
            ...staffRentalFacts(r),
            opts.refundedAmount ? { label: 'Erstattet', value: eur(opts.refundedAmount) } : null,
        ],
        link: adminRentalLink(r),
    });
}

function staffMaintenance(cars: { label: string; reasons: string[] }[]): EmailMessage {
    return staffNotice({
        subject: `Wartung fällig: ${cars.length} ${cars.length === 1 ? 'Fahrzeug' : 'Fahrzeuge'}`,
        heading: 'Fällige Wartungen',
        text: 'Diese Fahrzeuge sollten in den nächsten Tagen eingeplant werden:',
        facts: cars.map((c) => ({ label: c.label, value: c.reasons.join('\n') })),
        link: { label: 'Wartung öffnen', href: `${SITE_URL}/admin/maintenance` },
    });
}

export const emailTemplates = {
    bookingConfirmation,
    pickupReminder,
    returnReminder,
    cancellation,
    paymentExpired,
    refund,
    bookingChanged,
    rentalCompleted,
    reviewRequest,
    passwordReset,
    welcome,
    birthday,
    agbUpdate,
    dunning,
    staffNotice,
    staffNewBooking,
    staffCancellation,
    staffMaintenance,
};
