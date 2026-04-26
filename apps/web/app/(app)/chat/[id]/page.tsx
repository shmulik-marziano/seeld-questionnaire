import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatShell } from '@/components/chat/chat-shell';

export default async function ChatConversationPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [conversations, current, messages, profile] = await Promise.all([
    supabase
      .from('conversations')
      .select('id, title, message_count, updated_at')
      .eq('user_id', user!.id)
      .eq('archived', false)
      .order('updated_at', { ascending: false })
      .limit(100),
    supabase
      .from('conversations')
      .select('id, title')
      .eq('id', params.id)
      .eq('user_id', user!.id)
      .maybeSingle(),
    supabase
      .from('messages')
      .select('id, role, content, status, created_at')
      .eq('conversation_id', params.id)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true }),
    supabase.from('profiles').select('email, display_name').eq('id', user!.id).maybeSingle(),
  ]);

  if (!current.data) notFound();

  return (
    <ChatShell
      conversations={conversations.data ?? []}
      currentId={params.id}
      currentTitle={current.data.title}
      messages={messages.data ?? []}
      profile={profile.data ?? { email: user!.email!, display_name: null }}
    />
  );
}
