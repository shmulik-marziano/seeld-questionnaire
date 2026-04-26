import type { MemoryFact, ProposedFact } from '@shmuel/shared-types';
import { loadAllActiveFacts } from './load';
import type { SupabaseLike } from './types';

// Heuristic contradiction detection: same category + significant token overlap.
// Phase 2 will replace this with embedding-based semantic comparison.
//
// Pass `existingFacts` when calling in a loop to avoid re-querying the DB on
// every invocation. When omitted, the function loads them itself.
export async function findContradictions(
  newFact: ProposedFact,
  userId: string,
  sb: SupabaseLike,
  existingFacts?: MemoryFact[],
): Promise<MemoryFact[]> {
  const existing = existingFacts ?? (await loadAllActiveFacts(userId, sb));
  if (existing.length === 0) return [];

  const candidates = existing.filter((f) => f.category === newFact.category);
  if (candidates.length === 0) return [];

  const newTokens = tokenize(newFact.fact_text);
  if (newTokens.size === 0) return [];

  const matches = candidates.filter((c) => {
    const oldTokens = tokenize(c.fact_text);
    const overlap = countOverlap(newTokens, oldTokens);
    const ratio = overlap / Math.min(newTokens.size, oldTokens.size);
    return ratio >= 0.4 && c.fact_text !== newFact.fact_text;
  });

  return matches;
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

function countOverlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}
