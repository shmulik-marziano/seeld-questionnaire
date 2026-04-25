'use client';

import { Loader2, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ClarificationQuestion, ProposedFact } from '@shmuel/shared-types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conversationId: string;
}

type Decision = 'pending' | 'confirm' | 'reject' | 'edit';

interface FactRow {
  fact: ProposedFact;
  decision: Decision;
  edited: string;
}

export function LearningSummaryDialog({ open, onOpenChange, conversationId }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [facts, setFacts] = useState<FactRow[]>([]);
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/learning/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId }),
        });
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          if (body.error === 'too_short') {
            toast({ title: 'השיחה קצרה מדי', description: 'דרושות לפחות 10 הודעות.' });
          } else {
            toast({ title: 'שגיאה', description: body.error ?? 'משהו השתבש', variant: 'destructive' });
          }
          onOpenChange(false);
          return;
        }
        setSessionId(body.sessionId ?? null);
        setFacts(
          (body.facts ?? []).map((f: ProposedFact) => ({
            fact: f,
            decision: 'pending' as Decision,
            edited: f.fact_text,
          })),
        );
        setQuestions(body.questions ?? []);
        setAnswers({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, conversationId, onOpenChange, toast]);

  const handleSave = async () => {
    setCommitting(true);
    try {
      const decisions = facts
        .filter((r) => r.decision !== 'pending')
        .map((r) => ({
          fact_text: r.fact.fact_text,
          category: r.fact.category,
          confidence: r.fact.confidence,
          decision: r.decision,
          edited_text: r.decision === 'edit' ? r.edited : undefined,
        }));
      const answersList = Object.entries(answers).map(([question, answer]) => ({ question, answer }));

      const res = await fetch('/api/learning/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conversationId,
          decisions,
          answers: answersList,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast({ title: 'שמירה נכשלה', variant: 'destructive' });
        return;
      }
      toast({
        title: 'נשמר',
        description: `${body.confirmed} עובדות נשמרו, ${body.modified} עודכנו, ${body.rejected} נדחו.`,
      });
      onOpenChange(false);
    } finally {
      setCommitting(false);
    }
  };

  const setDecision = (i: number, d: Decision) =>
    setFacts((rows) => rows.map((r, idx) => (idx === i ? { ...r, decision: d } : r)));

  const setEdited = (i: number, text: string) =>
    setFacts((rows) => rows.map((r, idx) => (idx === i ? { ...r, edited: text } : r)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> סיכום למידה
          </DialogTitle>
          <DialogDescription>
            הנה מה שלמדתי עליך בשיחה הזאת. אשר רק את מה שנכון.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {facts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                לא זיהיתי עובדות חדשות יציבות. נמשיך לדבר.
              </p>
            )}

            {facts.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">עובדות שהוצעו</h3>
                {facts.map((row, i) => (
                  <FactDecision
                    key={`${row.fact.fact_text}-${i}`}
                    row={row}
                    onDecide={(d) => setDecision(i, d)}
                    onEdit={(t) => setEdited(i, t)}
                  />
                ))}
              </section>
            )}

            {questions.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">שאלות הבהרה</h3>
                {questions.map((q) => (
                  <div key={q.question} className="space-y-2">
                    <Label className="text-sm leading-relaxed">{q.question}</Label>
                    <RadioGroup
                      value={answers[q.question] ?? ''}
                      onValueChange={(v) => setAnswers((a) => ({ ...a, [q.question]: v }))}
                    >
                      {q.options.map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <RadioGroupItem value={opt} id={`${q.question}-${opt}`} />
                          <Label htmlFor={`${q.question}-${opt}`} className="text-sm font-normal">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={committing}>
            ביטול
          </Button>
          <Button
            onClick={handleSave}
            disabled={committing || loading || facts.every((r) => r.decision === 'pending')}
          >
            {committing && <Loader2 className="h-4 w-4 animate-spin" />}
            שמור לזיכרון
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FactDecision({
  row,
  onDecide,
  onEdit,
}: {
  row: FactRow;
  onDecide: (d: Decision) => void;
  onEdit: (t: string) => void;
}) {
  return (
    <div
      className={cn(
        'border rounded-md p-3 space-y-2',
        row.decision === 'confirm' && 'border-primary bg-primary/5',
        row.decision === 'reject' && 'opacity-60 line-through',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm">
          <span className="text-xs text-muted-foreground">[{row.fact.category}]</span>{' '}
          {row.fact.fact_text}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            size="sm"
            variant={row.decision === 'confirm' ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => onDecide('confirm')}
          >
            נכון
          </Button>
          <Button
            size="sm"
            variant={row.decision === 'edit' ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => onDecide('edit')}
          >
            ערוך
          </Button>
          <Button
            size="sm"
            variant={row.decision === 'reject' ? 'destructive' : 'outline'}
            className="h-7 text-xs"
            onClick={() => onDecide('reject')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {row.decision === 'edit' && (
        <Textarea
          value={row.edited}
          onChange={(e) => onEdit(e.target.value)}
          className="min-h-16 text-sm"
        />
      )}
    </div>
  );
}
