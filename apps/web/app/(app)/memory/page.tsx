import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { MemoryList } from './memory-list';

export const metadata = { title: 'הזיכרון שלי' };

export default async function MemoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: facts } = await supabase
    .from('memory_facts')
    .select('id, fact_text, category, status, confidence, user_confirmed, created_at, updated_at')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(500);

  const active = (facts ?? []).filter((f) => f.status === 'active');
  const deprecated = (facts ?? []).filter((f) => f.status === 'deprecated');

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="gap-1 -ms-3">
            <Link href="/chat">
              <ChevronRight className="h-4 w-4" />
              חזרה לצ׳אט
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mt-2">הזיכרון שלי</h1>
          <p className="text-muted-foreground mt-1">
            כל מה ששמואל יודע עליך. כאן אתה בשליטה — תוכל למחוק כל עובדה.
          </p>
        </div>
      </div>

      <MemoryList active={active} deprecated={deprecated} />
    </div>
  );
}
