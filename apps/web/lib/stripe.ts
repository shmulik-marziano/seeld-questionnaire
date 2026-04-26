import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('STRIPE_SECRET_KEY is not set');
  stripeClient = new Stripe(secret, {
    apiVersion: '2024-10-28.acacia',
    appInfo: { name: 'shmuel', version: '0.1.0' },
  });
  return stripeClient;
}

export const PRICE_TO_PLAN: Record<string, 'basic' | 'mid' | 'premium'> = {
  // populated from env vars at runtime
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY ?? '_basic']: 'basic',
};
