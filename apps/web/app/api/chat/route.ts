import { NextResponse, type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { anthropic, MAIN_MODEL } from '@/lib/anthropic';
import { loadRelevantFacts, loadBehavior } from '@shmuel/memory-engine';
import { getPlanState } from '@/lib/plan';
import { getRateLimit } from '@/lib/rate-limit';
import { buildSystemPrompt } from '@/lib/system-prompt';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 300;

const requestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z.string().min(1).max(50_000),
  regenerateFromMessageId: z.string().uuid().optional(),
});

const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const limiter = getRateLimit();
  if (limiter) {
    const { success } = await limiter.limit(user.id);
    if (!success) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const plan = await getPlanState(user.id);
  if (plan.at_limit) {
    return NextResponse.json(
      { error: 'plan_limit', plan: plan.plan, limit: plan.daily_limit },
      { status: 402 },
    );
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const sb = createServiceClient();

  // Resolve conversation
  let conversationId = parsed.data.conversationId;
  if (!conversationId) {
    const { data: convo, error } = await sb
      .from('conversations')
      .insert({ user_id: user.id, title: parsed.data.content.slice(0, 60) })
      .select('id')
      .single();
    if (error || !convo) {
      return NextResponse.json({ error: 'create_conversation_failed' }, { status: 500 });
    }
    conversationId = convo.id;
  }

  // If regenerating, delete the old assistant reply (and after) before continuing
  if (parsed.data.regenerateFromMessageId) {
    const { data: anchor } = await sb
      .from('messages')
      .select('created_at')
      .eq('id', parsed.data.regenerateFromMessageId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (anchor) {
      await sb
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .gte('created_at', anchor.created_at);
    }
  }

  // Persist user message (skip if regenerating - the user message already exists)
  if (!parsed.data.regenerateFromMessageId) {
    await sb.from('messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content: parsed.data.content,
    });
  }

  // Load full conversation history
  const { data: history } = await sb
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  // Load memory + behavior
  const [facts, behavior] = await Promise.all([
    loadRelevantFacts(user.id, parsed.data.content, sb),
    loadBehavior(user.id, sb),
  ]);

  const system = buildSystemPrompt({ facts, behavior });

  // Pre-create the assistant message row in 'streaming' state
  const { data: assistantRow, error: assistantErr } = await sb
    .from('messages')
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'assistant',
      content: '',
      status: 'streaming',
      model: MAIN_MODEL,
    })
    .select('id')
    .single();

  if (assistantErr || !assistantRow) {
    return NextResponse.json({ error: 'create_message_failed' }, { status: 500 });
  }

  const assistantMessageId = assistantRow.id;

  const messages: Anthropic.MessageParam[] = (history ?? []).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const encoder = new TextEncoder();
  let aborted = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send('meta', { conversationId, assistantMessageId });

      let attempt = 0;
      let fullText = '';
      let inputTokens = 0;
      let outputTokens = 0;

      while (attempt <= MAX_RETRIES && !aborted) {
        try {
          const apiStream = await anthropic.messages.stream({
            model: MAIN_MODEL,
            max_tokens: 4096,
            system,
            messages,
          });

          for await (const event of apiStream) {
            if (aborted) break;
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              fullText += event.delta.text;
              send('delta', { text: event.delta.text });
            } else if (event.type === 'message_delta' && event.usage) {
              outputTokens = event.usage.output_tokens ?? outputTokens;
            }
          }

          const finalMessage = await apiStream.finalMessage();
          inputTokens = finalMessage.usage.input_tokens;
          outputTokens = finalMessage.usage.output_tokens;
          break; // success
        } catch (err) {
          attempt += 1;
          if (attempt > MAX_RETRIES) {
            send('error', { message: err instanceof Error ? err.message : 'stream_failed' });
            await sb
              .from('messages')
              .update({
                content: fullText,
                status: 'error',
                error_message: err instanceof Error ? err.message : 'unknown',
              })
              .eq('id', assistantMessageId);
            controller.close();
            return;
          }
          await new Promise((r) => setTimeout(r, RETRY_BASE_MS * 2 ** (attempt - 1)));
        }
      }

      await sb
        .from('messages')
        .update({
          content: fullText,
          status: aborted ? 'stopped' : 'complete',
          input_tokens: inputTokens,
          output_tokens: outputTokens,
        })
        .eq('id', assistantMessageId);

      await sb.rpc('bump_usage', {
        p_user_id: user.id,
        p_input_tokens: inputTokens,
        p_output_tokens: outputTokens,
      });

      send('done', { inputTokens, outputTokens, status: aborted ? 'stopped' : 'complete' });
      controller.close();
    },
    cancel() {
      aborted = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
