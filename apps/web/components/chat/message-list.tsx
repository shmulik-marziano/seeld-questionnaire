'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@shmuel/shared-types';
import { MessageRow } from './message';

interface Props {
  messages: ChatMessage[];
  isStreaming: boolean;
  onEdit: (id: string, content: string) => void;
  onRegenerate: (id: string) => void;
}

export function MessageList({ messages, isStreaming, onEdit, onRegenerate }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-3xl font-semibold mb-2">שמואל</h2>
        <p className="text-muted-foreground max-w-md">
          ספר לי מה אתה צריך. ככל שנדבר יותר — אכיר אותך טוב יותר, ואתאים את עצמי.
        </p>
      </div>
    );
  }

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id;

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((m) => (
        <MessageRow
          key={m.id}
          message={m}
          isLastAssistant={m.id === lastAssistantId}
          isStreaming={isStreaming}
          onEdit={onEdit}
          onRegenerate={onRegenerate}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
