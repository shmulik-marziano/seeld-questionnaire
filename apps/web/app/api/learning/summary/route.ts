import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { extractFacts } from '@shmuel/memory-engine';
import { anthropic, MEMORY_MODEL } from '@/lib/anthropic';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const requestSchema = z.object({
  conversationId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const sb = createServiceClient();

  // Verify ownership and fetch transcript
  const { data: msgs } = await sb
    .from('messages')
    .select('role, content')
    .eq('conversation_id', parsed.data.conversationId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!msgs || msgs.length < 10) {
    return NextResponse.json({ error: 'too_short', minimum: 10 }, { status: 400 });
  }

  const transcript = msgs
    .map((m) => `${m.role === 'user' ? 'משתמש' : 'שמואל'}: ${m.content}`)
    .join('\n\n');

  const summary = await extractFacts({
    client: anthropic,
    model: MEMORY_MODEL,
    conversationText: transcript,
  });

  // Open a learning_session row to track answers later
  const { data: session } = await sb
    .from('learning_sessions')
    .insert({
      user_id: user.id,
      conversation_id: parsed.data.conversationId,
      facts_proposed: summary.facts.length,
      questions_asked: summary.questions,
      status: 'in_progress',
    })
    .select('id')
    .single();

  return NextResponse.json({ sessionId: session?.id, ...summary });
}
