import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const requestSchema = z.object({
  priceId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const stripe = getStripe();
  const sb = createServiceClient();
  const origin = req.nextUrl.origin;

  const { data: sub } = await sb
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  let customerId = sub?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await sb
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { user_id: user.id },
    },
    allow_promotion_codes: true,
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?canceled=1`,
    locale: 'he',
  });

  return NextResponse.json({ url: session.url });
}
