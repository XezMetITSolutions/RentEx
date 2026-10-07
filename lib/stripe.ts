import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16' as any,
    typescript: true,
    // The bundle gets Stripe's Node build, whose node:https client hangs on
    // Cloudflare Workers ("code had hung"). fetch works on Workers and in Node.
    httpClient: Stripe.createFetchHttpClient(),
});
