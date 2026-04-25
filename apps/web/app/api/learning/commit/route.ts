import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { findContradictions } from '@shmuel/memory-engine';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const decisionSchema = z.object({
  fact_text: z.string().min(2).max(300),
  category: z.string(),
  confidence: z.number().min(0).max(1),
  decision: z.enum(['confirm', 'reject', 'edit']),
  edited_text: z.string().optional(),
});

const requestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  conversationId: z.string().uuid(),
  decisions: z.array(decisionSchema).max(20),
  answers: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .max(10)
    .optional(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', details: parsed.error.format() }, { status: 400 });
  }

  const sb = createServiceClient();
  let confirmed = 0;
  let rejected = 0;
  let modified = 0;
  const conflicts: { newText: string; existingFactId: string; existingText: string }[] = [];

  for (const dec of parsed.data.decisions) {
    if (dec.decision === 'reject') {
      rejected += 1;
      continue;
    }

    const finalText = dec.decision === 'edit' ? (dec.edited_text ?? dec.fact_text) : dec.fact_text;
    if (dec.decision === 'edit') modified += 1;
    else confirmed += 1;

    const proposed = {
      fact_text: finalText,
      category: dec.category,
      confidence: dec.confidence,
    };

    const contradicts = await findContradictions(proposed, user.id, sb);

    const { data: inserted } = await sb
      .from('memory_facts')
      .insert({
        user_id: user.id,
        fact_text: finalText,
        category: dec.category,
        source_conversation_id: parsed.data.conversationId,
        source_type: 'learning_summary',
        status: 'active',
        confidence: 1.0,
        user_confirmed: true,
        user_confirmed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    // Mark each contradicting older fact as deprecated, link to the new one
    if (inserted && contradicts.length > 0) {
      for (const c of contradicts) {
        await sb
          .from('memory_facts')
          .update({ status: 'deprecated', superseded_by: inserted.id })
          .eq('id', c.id)
          .eq('user_id', user.id);
        conflicts.push({
          newText: finalText,
          existingFactId: c.id,
          existingText: c.fact_text,
        });
      }
      if (conflicts.length > 0) {
        await sb
          .from('memory_facts')
          .update({ supersedes: contradicts[0].id })
          .eq('id', inserted.id)
          .eq('user_id', user.id);
      }
    }
  }

  if (parsed.data.sessionId) {
    await sb
      .from('learning_sessions')
      .update({
        facts_confirmed: confirmed,
        facts_rejected: rejected,
        facts_modified: modified,
        user_answers: parsed.data.answers ?? [],
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.sessionId)
      .eq('user_id', user.id);
  }

  return NextResponse.json({ ok: true, confirmed, rejected, modified, conflicts });
}
