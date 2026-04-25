import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const respondSchema = z.object({
  id: z.string().uuid(),
  response: z.enum(['confirmed', 'rejected', 'ignored']),
});

// List unread (not-yet-shown) adaptation messages, optionally filtered by conversation.
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const conversationId = req.nextUrl.searchParams.get('conversationId');
  let q = supabase
    .from('adaptation_log')
    .select('id, what_changed, previous_behavior, new_behavior, reason, created_at')
    .eq('user_id', user.id)
    .eq('shown_to_user', false)
    .order('created_at', { ascending: false })
    .limit(5);

  if (conversationId) q = q.eq('conversation_id', conversationId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

// Record the user's response to an adaptation prompt.
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = respondSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { error } = await supabase
    .from('adaptation_log')
    .update({
      shown_to_user: true,
      user_response: parsed.data.response,
      responded_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
