-- ════════════════════════════════════════
-- Shmuel Phase 1 - Initial chat schema
-- ════════════════════════════════════════

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ════════════════════════════════════════
-- profiles - one row per auth.users row
-- ════════════════════════════════════════
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  locale text default 'he',
  theme text default 'system' check (theme in ('light','dark','system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.behavior_patterns (user_id) values (new.id) on conflict do nothing;
  insert into public.subscriptions (user_id, plan, status) values (new.id, 'free', 'active') on conflict do nothing;
  return new;
end;
$$;

-- ════════════════════════════════════════
-- conversations
-- ════════════════════════════════════════
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'שיחה חדשה',
  model text not null default 'claude-opus-4-7',
  message_count int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_user_updated_idx
  on public.conversations(user_id, updated_at desc)
  where archived = false;

alter table public.conversations enable row level security;

create policy "users own conversations" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════════════════════════════════════
-- messages
-- ════════════════════════════════════════
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,

  -- token accounting
  input_tokens int default 0,
  output_tokens int default 0,
  model text,

  -- streaming state
  status text not null default 'complete' check (status in ('streaming','complete','error','stopped')),
  error_message text,

  -- editing
  parent_message_id uuid references public.messages(id) on delete set null,
  edited_at timestamptz,

  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages(conversation_id, created_at);
create index messages_user_idx on public.messages(user_id, created_at desc);

alter table public.messages enable row level security;

create policy "users own messages" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger: bump conversation updated_at + message_count
create or replace function public.bump_conversation()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
    set updated_at = now(),
        message_count = (select count(*) from public.messages where conversation_id = new.conversation_id)
    where id = new.conversation_id;
  return new;
end;
$$;

create trigger bump_conversation_after_message
  after insert on public.messages
  for each row execute function public.bump_conversation();

-- updated_at triggers
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger touch_conversations_updated_at
  before update on public.conversations
  for each row execute function public.touch_updated_at();
