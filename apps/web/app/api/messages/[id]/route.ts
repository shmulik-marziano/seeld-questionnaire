import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const patchSchema = z.object({
  content: z.string().min(1).max(50_000),
});

// Edit a user message: update its content and delete every message that came after it.
// Calling /api/chat afterwards with the same conversationId will produce a fresh assistant reply.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: msg } = await supabase
    .from('messages')
    .select('id, conversation_id, role, created_at')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!msg) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (msg.role !== 'user') return NextResponse.json({ error: 'only_user_messages' }, { status: 400 });

  await supabase
    .from('messages')
    .update({ content: parsed.data.content, edited_at: new Date().toISOString() })
    .eq('id', msg.id)
    .eq('user_id', user.id);

  await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', msg.conversation_id)
    .eq('user_id', user.id)
    .gt('created_at', msg.created_at);

  return NextResponse.json({ ok: true, conversationId: msg.conversation_id });
}
