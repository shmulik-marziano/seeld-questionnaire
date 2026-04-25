import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

function priceToPlan(priceId: string | null): 'basic' | 'mid' | 'premium' | null {
  const map: Record<string, 'basic' | 'mid' | 'premium'> = {};
  if (process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY) {
    map[process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY] = 'basic';
  }
  if (!priceId) return null;
  return map[priceId] ?? null;
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const signature = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new Response('missing_signature', { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return new Response(`bad_signature: ${(err as Error).message}`, { status: 400 });
  }

  const sb = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = (session.metadata?.user_id as string | undefined) ??
        ((session.subscription_data as unknown as { metadata?: { user_id?: string } } | null)?.metadata
          ?.user_id);
      if (!userId || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price.id ?? null;
      const plan = priceToPlan(priceId) ?? 'basic';

      await sb
        .from('subscriptions')
        .update({
          plan,
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          stripe_price_id: priceId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        })
        .eq('user_id', userId);
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id ?? null;
      const plan = event.type === 'customer.subscription.deleted'
        ? 'free'
        : priceToPlan(priceId) ?? 'basic';

      await sb
        .from('subscriptions')
        .update({
          plan,
          status: event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status,
          stripe_subscription_id: event.type === 'customer.subscription.deleted' ? null : subscription.id,
          stripe_price_id: priceId,
          current_period_start: subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : null,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_customer_id', customerId);
      break;
    }
    default:
      // Acknowledge but ignore other events.
      break;
  }

  return NextResponse.json({ received: true });
}
