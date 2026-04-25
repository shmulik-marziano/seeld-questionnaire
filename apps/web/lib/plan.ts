import { PLAN_LIMITS, type PlanId } from '@shmuel/shared-types';
import { createServiceClient } from './supabase/server';

export interface PlanState {
  plan: PlanId;
  status: string;
  messages_today: number;
  daily_limit: number;
  remaining_today: number;
  at_limit: boolean;
}

export async function getPlanState(userId: string): Promise<PlanState> {
  const sb = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: sub }, { data: usage }] = await Promise.all([
    sb.from('subscriptions').select('plan, status').eq('user_id', userId).maybeSingle(),
    sb
      .from('usage_daily')
      .select('messages_sent')
      .eq('user_id', userId)
      .eq('day', today)
      .maybeSingle(),
  ]);

  const plan = (sub?.plan ?? 'free') as PlanId;
  const messages_today = usage?.messages_sent ?? 0;
  const daily_limit = PLAN_LIMITS[plan].daily_messages;
  const remaining_today = Math.max(0, daily_limit - messages_today);

  return {
    plan,
    status: sub?.status ?? 'active',
    messages_today,
    daily_limit,
    remaining_today,
    at_limit: remaining_today <= 0,
  };
}
