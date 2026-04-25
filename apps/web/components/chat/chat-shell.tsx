'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage } from '@shmuel/shared-types';
import { Button } from '@/components/ui/button';
import { useChat } from '@/lib/hooks/use-chat';
import { AdaptationBanner } from './adaptation-banner';
import { Composer } from './composer';
import { LearningSummaryDialog } from './learning-summary-dialog';
import { MessageList } from './message-list';
import { Sidebar, type ConversationListItem } from './sidebar';

interface Props {
  conversations: ConversationListItem[];
  currentId: string | null;
  currentTitle?: string;
  messages: ChatMessage[];
  profile: { email: string; display_name: string | null };
}

const LEARNING_THRESHOLD = 10;

export function ChatShell({ conversations, currentId, currentTitle, messages, profile }: Props) {
  const [learningOpen, setLearningOpen] = useState(false);

  const chat = useChat({
    initialConversationId: currentId,
    initialMessages: messages,
  });

  const learningEligible = chat.messages.length >= LEARNING_THRESHOLD && !chat.isStreaming;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar conversations={conversations} currentId={chat.conversationId} profile={profile} />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b bg-background flex items-center justify-between px-4 h-14">
          <h1 className="text-sm font-medium truncate">
            {currentTitle ?? 'שיחה חדשה'}
          </h1>
          <Button
            size="sm"
            variant="outline"
            disabled={!learningEligible || !chat.conversationId}
            onClick={() => setLearningOpen(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            סיכום למידה
          </Button>
        </header>
        <AdaptationBanner conversationId={chat.conversationId} />
        <MessageList
          messages={chat.messages}
          isStreaming={chat.isStreaming}
          onEdit={chat.editAndResend}
          onRegenerate={chat.regenerate}
        />
        <Composer
          isStreaming={chat.isStreaming}
          onSubmit={(content) => chat.send({ content })}
          onStop={chat.stop}
        />
      </main>

      {chat.conversationId && (
        <LearningSummaryDialog
          open={learningOpen}
          onOpenChange={setLearningOpen}
          conversationId={chat.conversationId}
        />
      )}
    </div>
  );
}
