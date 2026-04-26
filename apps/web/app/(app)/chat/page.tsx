import { createClient } from '@/lib/supabase/server';
import { ChatShell } from '@/components/chat/chat-shell';

export const metadata = { title: 'צ׳אט' };

export default async function ChatIndexPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [conversations, profile] = await Promise.all([
    supabase
      .from('conversations')
      .select('id, title, message_count, updated_at')
      .eq('user_id', user!.id)
      .eq('archived', false)
      .order('updated_at', { ascending: false })
      .limit(100),
    supabase.from('profiles').select('email, display_name').eq('id', user!.id).maybeSingle(),
  ]);

  return (
    <ChatShell
      conversations={conversations.data ?? []}
      currentId={null}
      messages={[]}
      profile={profile.data ?? { email: user!.email!, display_name: null }}
    />
  );
}
