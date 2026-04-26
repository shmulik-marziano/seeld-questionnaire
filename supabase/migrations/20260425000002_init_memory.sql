-- ════════════════════════════════════════
-- Shmuel Phase 1 - Memory schema
-- ════════════════════════════════════════

-- ════════════════════════════════════════
-- memory_facts
-- ════════════════════════════════════════
create table public.memory_facts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  fact_text text not null,
  category text not null,

  source_conversation_id uuid references public.conversations(id) on delete set null,
  source_message_id uuid references public.messages(id) on delete set null,
  source_type text not null check (source_type in ('user_explicit','inferred','learning_summary')),

  status text not null default 'active' check (status in ('active','deprecated','pending_confirm')),
  superseded_by uuid references public.memory_facts(id) on delete set null,
  supersedes uuid references public.memory_facts(id) on delete set null,
  confidence numeric(3,2) default 0.80 check (confidence between 0 and 1),

  tags text[] default '{}',
  embedding vector(1536),

  user_confirmed boolean default false,
  user_confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index memory_facts_user_active_idx
  on public.memory_facts(user_id, status)
  where status = 'active';

create index memory_facts_user_category_idx
  on public.memory_facts(user_id, category);

create index memory_facts_tags_idx
  on public.memory_facts using gin(tags);

create trigger touch_memory_facts_updated_at
  before update on public.memory_facts
  for each row execute function public.touch_updated_at();

alter table public.memory_facts enable row level security;
create policy "users own memory facts" on public.memory_facts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════════════════════════════════════
-- behavior_patterns
-- ════════════════════════════════════════
create table public.behavior_patterns (
  user_id uuid primary key references auth.users(id) on delete cascade,

  preferred_response_length text default 'medium' check (preferred_response_length in ('short','medium','long')),
  active_hours int[] default '{}',
  active_days int[] default '{}',
  preferred_tone text default 'professional',
  uses_humor boolean default false,
  prefers_examples boolean default true,
  prefers_lists boolean default true,
  primary_language text default 'he',
  uses_secondary_language boolean default false,
  top_topics text[] default '{}',

  conversations_since_last_recap int default 0,

  updated_at timestamptz default now()
);

create trigger touch_behavior_patterns_updated_at
  before update on public.behavior_patterns
  for each row execute function public.touch_updated_at();

alter table public.behavior_patterns enable row level security;
create policy "users own behavior" on public.behavior_patterns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════════════════════════════════════
-- learning_sessions
-- ════════════════════════════════════════
create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,

  facts_proposed int default 0,
  facts_confirmed int default 0,
  facts_rejected int default 0,
  facts_modified int default 0,

  questions_asked jsonb default '[]',
  user_answers jsonb default '[]',

  status text default 'in_progress' check (status in ('in_progress','completed','abandoned')),

  started_at timestamptz default now(),
  completed_at timestamptz
);

create index learning_sessions_user_idx on public.learning_sessions(user_id, started_at desc);

alter table public.learning_sessions enable row level security;
create policy "users own learning sessions" on public.learning_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════════════════════════════════════
-- adaptation_log (transparency mechanism)
-- ════════════════════════════════════════
create table public.adaptation_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,

  what_changed text not null,
  previous_behavior text not null,
  new_behavior text not null,
  reason text not null,

  shown_to_user boolean default false,
  user_response text check (user_response in ('confirmed','rejected','ignored')),
  responded_at timestamptz,

  created_at timestamptz default now()
);

create index adaptation_log_user_idx on public.adaptation_log(user_id, created_at desc);

alter table public.adaptation_log enable row level security;
create policy "users own adaptation log" on public.adaptation_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
