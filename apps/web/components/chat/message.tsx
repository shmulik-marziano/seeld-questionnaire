'use client';

import { Check, Copy, Pencil, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage } from '@shmuel/shared-types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Markdown } from './markdown';

interface Props {
  message: ChatMessage;
  isLastAssistant: boolean;
  isStreaming: boolean;
  onEdit: (id: string, newContent: string) => void;
  onRegenerate: (id: string) => void;
}

export function MessageRow({ message, isLastAssistant, isStreaming, onEdit, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const startEdit = () => {
    setDraft(message.content);
    setEditing(true);
  };

  const submitEdit = () => {
    const next = draft.trim();
    if (!next || next === message.content) {
      setEditing(false);
      return;
    }
    setEditing(false);
    onEdit(message.id, next);
  };

  return (
    <div className={cn('group flex gap-3 px-4 py-5', isUser && 'bg-muted/40')}>
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <span className={cn('text-sm font-semibold', isUser ? 'text-foreground' : 'text-primary')}>
            {isUser ? 'אתה' : 'שמואל'}
          </span>
          {message.status === 'streaming' && (
            <span className="text-xs text-muted-foreground">כותב...</span>
          )}
          {message.status === 'stopped' && (
            <span className="text-xs text-muted-foreground">הופסק</span>
          )}
          {message.status === 'error' && (
            <span className="text-xs text-destructive">שגיאה</span>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-32" />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <X className="h-4 w-4" /> ביטול
              </Button>
              <Button size="sm" onClick={submitEdit}>
                <Check className="h-4 w-4" /> שמור ושלח שוב
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-base leading-relaxed">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <Markdown content={message.content || (message.status === 'streaming' ? '...' : '')} />
            )}
          </div>
        )}

        {!editing && message.status !== 'streaming' && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ms-1">{copied ? 'הועתק' : 'העתק'}</span>
            </Button>
            {isUser && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5" />
                <span className="ms-1">ערוך</span>
              </Button>
            )}
            {!isUser && isLastAssistant && !isStreaming && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onRegenerate(message.id)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="ms-1">צור מחדש</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
