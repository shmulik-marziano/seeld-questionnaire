-- ════════════════════════════════════════
-- Shmuel Phase 1 - Billing & usage
-- ════════════════════════════════════════

-- ════════════════════════════════════════
-- subscriptions
-- ════════════════════════════════════════
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,

  plan text not null default 'free' check (plan in ('free','basic','mid','premium','pro_basic','pro_mid','pro_premium')),
  status text not null default 'active' check (status in ('active','trialing','past_due','canceled','incomplete')),

  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,

  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  trial_ends_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger touch_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

alter table public.subscriptions enable row level security;
create policy "users read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ════════════════════════════════════════
-- usage (per user, per UTC day)
-- ════════════════════════════════════════
create table public.usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,

  messages_sent int not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,

  primary key (user_id, day)
);

create index usage_daily_user_idx on public.usage_daily(user_id, day desc);

alter table public.usage_daily enable row level security;
create policy "users read own usage" on public.usage_daily
  for select using (auth.uid() = user_id);

-- Atomic usage increment (server-side only)
create or replace function public.bump_usage(
  p_user_id uuid,
  p_input_tokens int,
  p_output_tokens int
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usage_daily (user_id, day, messages_sent, input_tokens, output_tokens)
  values (p_user_id, (now() at time zone 'utc')::date, 1, p_input_tokens, p_output_tokens)
  on conflict (user_id, day) do update
    set messages_sent = usage_daily.messages_sent + 1,
        input_tokens = usage_daily.input_tokens + excluded.input_tokens,
        output_tokens = usage_daily.output_tokens + excluded.output_tokens;
end;
$$;

-- ════════════════════════════════════════
-- Hook the new-user trigger now that all tables exist
-- ════════════════════════════════════════
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
