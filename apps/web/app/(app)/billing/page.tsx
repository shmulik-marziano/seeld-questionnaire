import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PLAN_LIMITS } from '@shmuel/shared-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlanState } from '@/lib/plan';
import { createClient } from '@/lib/supabase/server';
import { BillingActions } from './billing-actions';

export const metadata = { title: 'חיוב ומנוי' };

const PLAN_NAMES: Record<string, string> = {
  free: 'חינם',
  basic: 'בסיסי',
  mid: 'אמצעי',
  premium: 'יקר',
  pro_basic: 'מקצועי בסיסי',
  pro_mid: 'מקצועי אמצעי',
  pro_premium: 'מקצועי יקר',
};

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const plan = await getPlanState(user!.id);

  const limits = PLAN_LIMITS[plan.plan];

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1 -ms-3">
          <Link href="/chat">
            <ChevronRight className="h-4 w-4" />
            חזרה לצ׳אט
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mt-2">חיוב ומנוי</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            המסלול שלך: {PLAN_NAMES[plan.plan]}
            <Badge variant="outline">{plan.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="הודעות היום" value={`${plan.messages_today} / ${limits.daily_messages}`} />
            <Stat label="הודעות בחודש" value={`${limits.monthly_messages} מותר`} />
            <Stat label="עובדות בזיכרון" value={`עד ${limits.memory_facts_max}`} />
            <Stat
              label="הודעות בשיחה"
              value={`עד ${limits.max_conversation_messages}`}
            />
          </div>
          <BillingActions plan={plan.plan} />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-md p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
