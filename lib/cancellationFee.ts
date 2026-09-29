/**
 * Cancellation by the customer, as agreed in the AGB (/terms, "Rücktritt vom
 * Vertrag"): damages of 20 % of the net rental cost, at least EUR 48.00, plus
 * a EUR 18.00 handling fee. Keep in sync with the AGB text.
 */
const RATE_OF_NET_RENT = 0.2;
const MINIMUM = 48;
const HANDLING_FEE = 18;
const VAT_RATE = 0.2; // Austria

export function customerCancellationFee(totalAmount: number): number {
    const netRent = totalAmount / (1 + VAT_RATE);
    const fee = Math.max(netRent * RATE_OF_NET_RENT, MINIMUM) + HANDLING_FEE;
    return Math.round(fee * 100) / 100;
}
