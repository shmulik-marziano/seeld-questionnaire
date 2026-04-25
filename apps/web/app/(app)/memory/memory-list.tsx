'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { formatRelative } from '@/lib/utils';

interface Fact {
  id: string;
  fact_text: string;
  category: string;
  status: string;
  confidence: number | null;
  user_confirmed: boolean | null;
  created_at: string;
  updated_at: string;
}

export function MemoryList({ active, deprecated }: { active: Fact[]; deprecated: Fact[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('למחוק את העובדה לצמיתות?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/memory/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast({ title: 'מחיקה נכשלה', variant: 'destructive' });
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">פעיל ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            עוד לא נשמרו עובדות. סיים שיחה ולחץ "סיכום למידה" כדי להוסיף.
          </p>
        ) : (
          <div className="space-y-2">
            {active.map((f) => (
              <Card key={f.id}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="text-sm">{f.fact_text}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{f.category}</Badge>
                      {f.user_confirmed && <Badge variant="outline">מאושר</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(f.updated_at)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(f.id)}
                    disabled={busyId === f.id}
                    aria-label="מחק"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {deprecated.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            לא פעיל ({deprecated.length})
          </h2>
          <div className="space-y-2">
            {deprecated.map((f) => (
              <Card key={f.id} className="opacity-60">
                <CardContent className="p-4">
                  <p className="text-sm line-through">{f.fact_text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{f.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      עודכן {formatRelative(f.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
