'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';

interface Props {
  plan: string;
}

const BASIC_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY;

export function BillingActions({ plan }: Props) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const upgrade = async () => {
    if (!BASIC_PRICE_ID) {
      toast({ title: 'הקונפיגורציה חסרה', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: BASIC_PRICE_ID }),
      });
      const body = await res.json();
      if (!res.ok || !body.url) {
        toast({ title: 'שגיאה', description: body.error ?? 'נסה שוב', variant: 'destructive' });
        return;
      }
      window.location.href = body.url;
    } finally {
      setBusy(false);
    }
  };

  const portal = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const body = await res.json();
      if (!res.ok || !body.url) {
        toast({ title: 'שגיאה בפתיחת הפורטל', variant: 'destructive' });
        return;
      }
      window.location.href = body.url;
    } finally {
      setBusy(false);
    }
  };

  if (plan === 'free') {
    return (
      <Button onClick={upgrade} disabled={busy} className="w-full">
        {busy ? 'טוען...' : 'שדרג למסלול בסיסי — 80₪ לחודש (7 ימים חינם)'}
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={portal} disabled={busy} className="w-full">
      {busy ? 'טוען...' : 'נהל מנוי דרך Stripe'}
    </Button>
  );
}
