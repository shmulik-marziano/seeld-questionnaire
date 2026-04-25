'use client';

import { ArrowUp, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function Composer({ onSubmit, onStop, isStreaming, disabled }: Props) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSubmit(trimmed);
    setText('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end rounded-2xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="שאל את שמואל..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent resize-none outline-none px-4 py-3 max-h-[280px] min-h-[48px] text-base placeholder:text-muted-foreground"
          />
          <div className="p-2">
            {isStreaming ? (
              <Button type="button" size="icon" variant="secondary" onClick={onStop} aria-label="עצור">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!text.trim() || disabled}
                aria-label="שלח"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Shift + Enter למעבר שורה. שמואל יכול לטעות — בדוק עובדות חשובות.
        </p>
      </div>
    </form>
  );
}
