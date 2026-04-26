'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Adaptation {
  id: string;
  what_changed: string;
  previous_behavior: string;
  new_behavior: string;
  reason: string;
}

interface Props {
  conversationId: string | null;
}

const AUTO_DISMISS_MS = 30_000;

export function AdaptationBanner({ conversationId }: Props) {
  const [item, setItem] = useState<Adaptation | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    let active = true;
    (async () => {
      const res = await fetch(`/api/adaptation?conversationId=${conversationId}`);
      if (!res.ok) return;
      const body = await res.json();
      if (!active) return;
      const first = (body.items as Adaptation[])[0];
      if (first) setItem(first);
    })();
    return () => {
      active = false;
    };
  }, [conversationId]);

  const itemId = item?.id;
  useEffect(() => {
    if (!itemId) return;
    const t = setTimeout(() => {
      void fetch('/api/adaptation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, response: 'ignored' }),
      });
      setItem(null);
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [itemId]);

  if (!item) return null;

  const respond = async (response: 'confirmed' | 'rejected' | 'ignored') => {
    setItem(null);
    await fetch('/api/adaptation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, response }),
    });
  };

  return (
    <div className="px-4 pt-3">
      <Card className="border-primary/40 bg-primary/5 max-w-3xl mx-auto">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm leading-relaxed">
            <span className="font-medium">אגב — שינוי בגישה:</span>{' '}
            {item.what_changed}.<br />
            עד עכשיו {item.previous_behavior}. מהיום {item.new_behavior}.<br />
            <span className="text-muted-foreground">{item.reason}</span>
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => respond('confirmed')}>
              מתאים לי
            </Button>
            <Button size="sm" variant="outline" onClick={() => respond('rejected')}>
              חזור לקודם
            </Button>
            <Button size="sm" variant="ghost" onClick={() => respond('ignored')}>
              סגור
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
