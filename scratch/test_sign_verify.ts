import crypto from 'crypto';

const secret = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || 'dev-secret-only-for-local';
console.log(`Secret used for signing: ${secret}`);

function sign(value: string) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(value);
    return `${value}.${hmac.digest('hex')}`;
}

function verify(signedValue: string): string | null {
    const [value, signature] = signedValue.split('.');
    if (!value || !signature) return null;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(value);
    const expected = hmac.digest('hex');
    try {
        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
            return value;
        }
    } catch (e: any) {
        console.error('timingSafeEqual error:', e.message);
        return null;
    }
    return null;
}

const id = '5';
const signed = sign(id);
console.log(`Signed value: ${signed}`);
const verified = verify(signed);
console.log(`Verified value: ${verified}`);
