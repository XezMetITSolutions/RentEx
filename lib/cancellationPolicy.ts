/** AGB §7: 20% of net rent, at least EUR 48 inclusive, plus EUR 18 inclusive. */
export const CANCELLATION_TERMS = 'Stornierung vor Mietbeginn gemäß AGB §7: 20 % der Nettomiete, mindestens 48 € inkl. MwSt., zuzüglich 18 € inkl. MwSt. Nach Mietbeginn kontaktieren Sie uns bitte.';
const round = (value: number) => Math.round(value * 100) / 100;
export function cancellationQuote(rental: { totalAmount: unknown; extrasCost?: unknown; insuranceCost?: unknown }, paid: number) {
    const grossRent = Math.max(0, Number(rental.totalAmount) - Number(rental.extrasCost || 0) - Number(rental.insuranceCost || 0));
    const fee = round(Math.max(48, round(grossRent / 1.2 * 0.2)) + 18);
    return { fee, refund: round(Math.max(0, paid - fee)), outstanding: round(Math.max(0, fee - paid)) };
}
export function cancellationBlockReason(rental: { status: string; startDate: Date; paymentStatus?: string }, now = new Date()): string | null {
    if (rental.status === 'Cancelled') return 'Die Reservierung ist bereits storniert.';
    if (!['Pending', 'Confirmed'].includes(rental.status) || new Date(rental.startDate) <= now) {
        return 'Online-Stornierung ist nur vor Mietbeginn möglich. Bitte kontaktieren Sie uns.';
    }
    return null;
}
