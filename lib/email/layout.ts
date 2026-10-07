/**
 * One layout for every e-mail Rent-Ex sends. Templates describe content as
 * blocks; this module renders them twice — as table-based HTML that holds up
 * in Outlook/Gmail/Apple Mail, and as a plain-text part for spam filters and
 * text-only clients.
 */
import { SITE_URL, BUSINESS, OPENING_HOURS } from '@/lib/config';

export const COMPANY = {
    NAME: process.env.COMPANY_NAME || 'Rent-Ex GmbH',
    STREET: BUSINESS.PICKUP_ADDRESS,
    CITY: `${BUSINESS.PICKUP_POSTAL_CODE} ${BUSINESS.PICKUP_CITY}`,
    PHONE: BUSINESS.PHONE,
    PHONE_TEL: BUSINESS.PHONE_TEL,
    EMAIL: process.env.COMPANY_EMAIL || 'rent-ex@metechnik.at',
    REGISTER: 'FN 660833p, Landesgericht Feldkirch',
    VAT: 'ATU76189189',
} as const;

/** Single row of a facts table. `strong` draws a total line above it. */
export type Fact = { label: string; value: string; strong?: boolean };

export type Block =
    | { kind: 'p'; text: string }
    | { kind: 'title'; text: string }
    | { kind: 'facts'; rows: (Fact | null | false | undefined)[] }
    | { kind: 'button'; label: string; href: string }
    | { kind: 'note'; title?: string; text: string }
    | { kind: 'list'; items: string[] }
    | { kind: 'code'; value: string; caption?: string };

export interface EmailSpec {
    /** Inbox preview line. */
    preheader: string;
    /** Small line above the heading, e.g. the booking number. */
    eyebrow?: string;
    heading: string;
    /** "Guten Tag Max Muster," — omitted for staff notices. */
    greeting?: string;
    blocks: (Block | null | false | undefined)[];
    /** Adds the contact line and "Freundliche Grüße". Default true. */
    signoff?: boolean;
    /** Why the recipient got this mail; shown small in the footer. */
    reason?: string;
}

export interface RenderedEmail {
    html: string;
    text: string;
}

const C = {
    bg: '#f1f0ed',
    paper: '#ffffff',
    ink: '#151515',
    text: '#3b3b3b',
    muted: '#76746f',
    rule: '#e5e3de',
    accent: '#c8161d',
    tint: '#f8f6f3',
    bar: '#141414',
};

const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;

export function esc(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Escapes, then turns **x** into bold and newlines into <br>. */
function inline(text: string): string {
    return esc(text)
        .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${C.ink};font-weight:600;">$1</strong>`)
        .replace(/\n/g, '<br>');
}

const plain = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1');

const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** "Mo–Fr 08:00–18:00, Sa 09:00–15:00 Uhr", derived from OPENING_HOURS. */
export function openingHoursLine(): string {
    const groups: { from: number; to: number; hours: string }[] = [];
    for (const day of [1, 2, 3, 4, 5, 6, 0]) {
        const h = OPENING_HOURS[day];
        if (!h) continue;
        const hours = `${h.open}–${h.close}`;
        const last = groups[groups.length - 1];
        if (last && last.hours === hours && (last.to + 1) % 7 === day) last.to = day;
        else groups.push({ from: day, to: day, hours });
    }
    return groups
        .map((g) => `${DAY_NAMES[g.from]}${g.to !== g.from ? `–${DAY_NAMES[g.to]}` : ''} ${g.hours}`)
        .join(', ') + ' Uhr';
}

function renderBlockHtml(block: Block): string {
    switch (block.kind) {
        case 'p':
            return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.text};">${inline(block.text)}</p>`;
        case 'title':
            return `<p style="margin:28px 0 10px;font-size:13px;line-height:1.4;font-weight:600;color:${C.ink};">${inline(block.text)}</p>`;
        case 'facts': {
            const rows = block.rows.filter((r): r is Fact => !!r);
            const trs = rows.map((r, i) => {
                const top = r.strong
                    ? `border-top:1px solid ${C.ink};`
                    : i === 0 ? '' : `border-top:1px solid ${C.rule};`;
                const size = r.strong ? '16px' : '14px';
                const weight = r.strong ? '700' : '400';
                return `<tr>
<td valign="top" style="${top}padding:10px 12px 10px 0;width:38%;font-size:13px;line-height:1.45;color:${C.muted};">${esc(r.label)}</td>
<td valign="top" style="${top}padding:10px 0;font-size:${size};line-height:1.45;font-weight:${weight};color:${C.ink};">${inline(r.value)}</td>
</tr>`;
            }).join('');
            return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;border-collapse:collapse;">${trs}</table>`;
        }
        case 'button':
            return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
<tr><td bgcolor="${C.accent}" style="border-radius:4px;">
<a href="${esc(block.href)}" style="display:inline-block;padding:13px 22px;font-family:${FONT};font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:4px;">${esc(block.label)}</a>
</td></tr></table>`;
        case 'note':
            return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;">
<tr><td style="background:${C.tint};border-left:3px solid ${C.accent};padding:14px 16px;font-size:14px;line-height:1.55;color:${C.text};">
${block.title ? `<strong style="display:block;margin-bottom:3px;color:${C.ink};font-weight:600;">${esc(block.title)}</strong>` : ''}${inline(block.text)}
</td></tr></table>`;
        case 'list':
            return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">${block.items.map((item) => `<tr>
<td valign="top" style="width:18px;padding:3px 0;font-size:15px;line-height:1.55;color:${C.muted};">–</td>
<td valign="top" style="padding:3px 0;font-size:15px;line-height:1.55;color:${C.text};">${inline(item)}</td>
</tr>`).join('')}</table>`;
        case 'code':
            return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;">
<tr><td style="border:1px dashed #bdbab3;padding:18px;text-align:center;">
<span style="display:block;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:22px;letter-spacing:2px;font-weight:700;color:${C.ink};">${esc(block.value)}</span>
${block.caption ? `<span style="display:block;margin-top:6px;font-size:13px;color:${C.muted};">${esc(block.caption)}</span>` : ''}
</td></tr></table>`;
    }
}

function renderBlockText(block: Block): string {
    switch (block.kind) {
        case 'p':
            return plain(block.text);
        case 'title':
            return plain(block.text).toUpperCase();
        case 'facts': {
            const rows = block.rows.filter((r): r is Fact => !!r);
            return rows.map((r) => `${r.strong ? '\n' : ''}${r.label}: ${plain(r.value).replace(/\n/g, ', ')}`).join('\n');
        }
        case 'button':
            return `${block.label}: ${block.href}`;
        case 'note':
            return `${block.title ? `${block.title}: ` : ''}${plain(block.text)}`;
        case 'list':
            return block.items.map((i) => `- ${plain(i)}`).join('\n');
        case 'code':
            return `${block.value}${block.caption ? `\n(${block.caption})` : ''}`;
    }
}

export function renderEmail(spec: EmailSpec): RenderedEmail {
    const blocks = spec.blocks.filter((b): b is Block => !!b);
    const signoff = spec.signoff !== false;
    const contact = `Bei Fragen erreichen Sie uns unter ${COMPANY.PHONE} (${openingHoursLine()}) oder durch eine Antwort auf diese E-Mail.`;

    const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(spec.heading)}</title>
<style>
  @media (max-width: 620px) {
    .px { padding-left: 22px !important; padding-right: 22px !important; }
    .h1 { font-size: 21px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(spec.preheader)}${'&#8203;&nbsp;'.repeat(30)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${C.paper};border:1px solid ${C.rule};">
<tr><td class="px" style="background:${C.bar};padding:18px 36px;">
<a href="${esc(SITE_URL)}" style="text-decoration:none;"><img src="${esc(SITE_URL)}/assets/logo.png" width="104" height="44" alt="Rent-Ex" style="display:block;border:0;width:104px;height:auto;"></a>
</td></tr>
<tr><td class="px" style="padding:36px 36px 12px;">
${spec.eyebrow ? `<p style="margin:0 0 8px;font-size:13px;line-height:1.4;color:${C.muted};">${esc(spec.eyebrow)}</p>` : ''}
<h1 class="h1" style="margin:0 0 22px;font-size:23px;line-height:1.3;font-weight:700;letter-spacing:-0.2px;color:${C.ink};">${esc(spec.heading)}</h1>
${spec.greeting ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.text};">${esc(spec.greeting)}</p>` : ''}
${blocks.map(renderBlockHtml).join('\n')}
${signoff ? `<p style="margin:8px 0 16px;font-size:14px;line-height:1.6;color:${C.muted};">${esc(contact)}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${C.text};">Freundliche Grüße<br>Ihr Rent-Ex Team</p>` : ''}
</td></tr>
<tr><td class="px" style="padding:22px 36px 28px;border-top:1px solid ${C.rule};font-size:12px;line-height:1.6;color:${C.muted};">
<strong style="color:${C.text};font-weight:600;">${esc(COMPANY.NAME)}</strong> · ${esc(COMPANY.STREET)} · ${esc(COMPANY.CITY)}<br>
<a href="tel:${esc(COMPANY.PHONE_TEL)}" style="color:${C.muted};text-decoration:none;">${esc(COMPANY.PHONE)}</a> · <a href="mailto:${esc(COMPANY.EMAIL)}" style="color:${C.muted};text-decoration:none;">${esc(COMPANY.EMAIL)}</a> · <a href="${esc(SITE_URL)}" style="color:${C.muted};text-decoration:none;">${esc(SITE_URL.replace(/^https?:\/\//, ''))}</a><br>
${esc(COMPANY.REGISTER)} · UID ${esc(COMPANY.VAT)}
${spec.reason ? `<br><br>${esc(spec.reason)}` : ''}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    const text = [
        spec.eyebrow,
        spec.heading,
        '',
        spec.greeting,
        ...blocks.map((b) => `${renderBlockText(b)}\n`),
        signoff ? `${contact}\n\nFreundliche Grüße\nIhr Rent-Ex Team` : '',
        '',
        '--',
        `${COMPANY.NAME}, ${COMPANY.STREET}, ${COMPANY.CITY}`,
        `${COMPANY.PHONE} · ${COMPANY.EMAIL} · ${SITE_URL}`,
        `${COMPANY.REGISTER} · UID ${COMPANY.VAT}`,
        spec.reason ? `\n${spec.reason}` : '',
    ].filter((line) => line !== undefined).join('\n').replace(/\n{3,}/g, '\n\n').trim();

    return { html, text };
}
