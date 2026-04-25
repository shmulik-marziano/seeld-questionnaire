'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import type { ChatMessage } from '@shmuel/shared-types';
import { toast } from './use-toast';

interface SendArgs {
  content: string;
  conversationId?: string | null;
  regenerateFromMessageId?: string;
  optimisticUserId?: string;
}

interface UseChatOptions {
  initialConversationId: string | null;
  initialMessages: ChatMessage[];
}

export function useChat({ initialConversationId, initialMessages }: UseChatOptions) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const send = useCallback(
    async ({ content, conversationId: convoId, regenerateFromMessageId, optimisticUserId }: SendArgs) => {
      if (isStreaming) return;
      setIsStreaming(true);

      const localUserMsg: ChatMessage | null = regenerateFromMessageId
        ? null
        : {
            id: optimisticUserId ?? crypto.randomUUID(),
            role: 'user',
            content,
            status: 'complete',
            created_at: new Date().toISOString(),
          };
      const localAssistantId = crypto.randomUUID();
      const localAssistantMsg: ChatMessage = {
        id: localAssistantId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        ...(localUserMsg ? [localUserMsg] : []),
        localAssistantMsg,
      ]);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            conversationId: convoId ?? conversationId ?? undefined,
            regenerateFromMessageId,
          }),
          signal: ctrl.signal,
        });

        if (!res.ok) {
          let body: { error?: string } = {};
          try {
            body = await res.json();
          } catch {
            /* noop */
          }
          if (res.status === 402) {
            toast({
              title: 'הגעת למגבלה היומית',
              description: 'שדרג למסלול בתשלום כדי להמשיך.',
              variant: 'destructive',
            });
          } else if (res.status === 429) {
            toast({ title: 'הצ׳אט עמוס', description: 'נסה שוב בעוד רגע.', variant: 'destructive' });
          } else {
            toast({ title: 'שגיאה', description: body.error ?? 'משהו השתבש', variant: 'destructive' });
          }
          setMessages((prev) => prev.filter((m) => m.id !== localAssistantId));
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('no_reader');
        const decoder = new TextDecoder();
        let buffer = '';
        let serverConvoId: string | null = convoId ?? conversationId ?? null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';
          for (const block of events) {
            const lines = block.split('\n');
            const eventLine = lines.find((l) => l.startsWith('event:'));
            const dataLine = lines.find((l) => l.startsWith('data:'));
            if (!eventLine || !dataLine) continue;
            const ev = eventLine.slice(6).trim();
            let data: { text?: string; conversationId?: string; assistantMessageId?: string; status?: string; message?: string } = {};
            try {
              data = JSON.parse(dataLine.slice(5).trim());
            } catch {
              continue;
            }
            if (ev === 'meta') {
              if (data.conversationId) {
                serverConvoId = data.conversationId;
                setConversationId(data.conversationId);
              }
            } else if (ev === 'delta' && data.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === localAssistantId ? { ...m, content: m.content + data.text } : m,
                ),
              );
            } else if (ev === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === localAssistantId
                    ? { ...m, status: (data.status as ChatMessage['status']) ?? 'complete' }
                    : m,
                ),
              );
            } else if (ev === 'error') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === localAssistantId
                    ? { ...m, status: 'error', content: m.content || (data.message ?? 'שגיאה') }
                    : m,
                ),
              );
            }
          }
        }

        // If this was a new conversation, redirect to its url and refresh sidebar.
        if (!convoId && !conversationId && serverConvoId) {
          router.replace(`/chat/${serverConvoId}`);
        } else {
          router.refresh();
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setMessages((prev) =>
            prev.map((m) => (m.id === localAssistantId ? { ...m, status: 'stopped' } : m)),
          );
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== localAssistantId));
          toast({
            title: 'שגיאה',
            description: err instanceof Error ? err.message : 'משהו השתבש',
            variant: 'destructive',
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [conversationId, isStreaming, router],
  );

  const editAndResend = useCallback(
    async (messageId: string, newContent: string) => {
      if (!conversationId) return;
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) {
        toast({ title: 'שגיאה בעריכה', variant: 'destructive' });
        return;
      }
      // Refresh local state from server, then trigger a regen.
      const fresh = await fetch(`/api/conversations/${conversationId}`).then((r) => r.json());
      setMessages(fresh.messages);
      await send({ content: newContent, conversationId, regenerateFromMessageId: messageId });
    },
    [conversationId, send],
  );

  const regenerate = useCallback(
    async (assistantMessageId: string) => {
      if (!conversationId) return;
      const idx = messages.findIndex((m) => m.id === assistantMessageId);
      if (idx <= 0) return;
      const userMsg = messages[idx - 1];
      if (!userMsg || userMsg.role !== 'user') return;
      // Trim local view to before the assistant message.
      setMessages((prev) => prev.slice(0, idx));
      await send({
        content: userMsg.content,
        conversationId,
        regenerateFromMessageId: userMsg.id,
      });
    },
    [conversationId, messages, send],
  );

  return {
    messages,
    setMessages,
    conversationId,
    isStreaming,
    send,
    stop,
    editAndResend,
    regenerate,
  };
}
