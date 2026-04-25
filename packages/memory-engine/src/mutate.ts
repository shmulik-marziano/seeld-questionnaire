import type { SupabaseLike } from './types';

export async function confirmFact(
  factId: string,
  userId: string,
  sb: SupabaseLike,
): Promise<void> {
  await sb
    .from('memory_facts')
    .update({
      status: 'active',
      user_confirmed: true,
      user_confirmed_at: new Date().toISOString(),
      confidence: 1.0,
    })
    .eq('id', factId)
    .eq('user_id', userId);
}

export async function rejectFact(
  factId: string,
  userId: string,
  sb: SupabaseLike,
): Promise<void> {
  await sb
    .from('memory_facts')
    .update({ status: 'deprecated' })
    .eq('id', factId)
    .eq('user_id', userId);
}

export async function deprecateFact(
  oldFactId: string,
  userId: string,
  sb: SupabaseLike,
  replacedById?: string,
): Promise<void> {
  await sb
    .from('memory_facts')
    .update({ status: 'deprecated', superseded_by: replacedById ?? null })
    .eq('id', oldFactId)
    .eq('user_id', userId);

  if (replacedById) {
    await sb
      .from('memory_facts')
      .update({ supersedes: oldFactId })
      .eq('id', replacedById)
      .eq('user_id', userId);
  }
}
