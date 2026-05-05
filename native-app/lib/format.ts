import { Config } from '@/constants/Config';

export function formatCurrency(value: number | string | null | undefined): string {
  if (value == null || value === '') return `0${Config.currencySymbol}`;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return `0${Config.currencySymbol}`;
  return `${num.toFixed(2).replace('.', ',')}${Config.currencySymbol}`;
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return d.toLocaleDateString(Config.locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function formatShortDate(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return d.toLocaleDateString(Config.locale, {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return '';
  }
}

export function formatDateRange(
  start: string | Date,
  end: string | Date
): string {
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export function daysBetween(start: string | Date, end: string | Date): number {
  const a = typeof start === 'string' ? new Date(start) : start;
  const b = typeof end === 'string' ? new Date(end) : end;
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function resolveImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${Config.apiBase}${encodeURI(normalizedPath)}`;
}
