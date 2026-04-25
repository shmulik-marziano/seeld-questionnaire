import type { BehaviorPatterns, MemoryFact } from '@shmuel/shared-types';
import type { SupabaseLike } from './types';

const MAX_FACTS_IN_CONTEXT = 25;

export async function loadAllActiveFacts(userId: string, sb: SupabaseLike): Promise<MemoryFact[]> {
  const { data, error } = await sb
    .from('memory_facts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('confidence', { ascending: false });
  if (error) return [];
  return (data ?? []) as MemoryFact[];
}

// Token-aware relevance: keyword overlap between fact text and the user message.
// Cheap and deterministic. We will swap to embedding similarity in phase 2.
export async function loadRelevantFacts(
  userId: string,
  currentMessage: string,
  sb: SupabaseLike,
): Promise<MemoryFact[]> {
  const all = await loadAllActiveFacts(userId, sb);
  if (all.length === 0) return [];

  const tokens = tokenize(currentMessage);
  if (tokens.size === 0) return all.slice(0, MAX_FACTS_IN_CONTEXT);

  const scored = all.map((f) => ({
    fact: f,
    score: scoreFact(f, tokens),
  }));

  scored.sort((a, b) => b.score - a.score);
  // Always keep highest-confidence + at least include profession/personality category.
  const top = scored.slice(0, MAX_FACTS_IN_CONTEXT).map((s) => s.fact);
  return top;
}

export async function loadBehavior(
  userId: string,
  sb: SupabaseLike,
): Promise<BehaviorPatterns | null> {
  const { data, error } = await sb
    .from('behavior_patterns')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as BehaviorPatterns;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2),
  );
}

function scoreFact(fact: MemoryFact, queryTokens: Set<string>): number {
  const factTokens = tokenize(fact.fact_text);
  let overlap = 0;
  for (const t of factTokens) if (queryTokens.has(t)) overlap += 1;
  // Boost evergreen categories so we never lose them entirely.
  const categoryBoost =
    fact.category === 'profession' || fact.category === 'personality' ? 0.5 : 0;
  return overlap + categoryBoost + (fact.confidence ?? 0.5) * 0.1;
}
