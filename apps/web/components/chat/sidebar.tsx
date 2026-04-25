'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserMenu } from '@/components/user-menu';
import { useToast } from '@/lib/hooks/use-toast';
import { cn, formatRelative } from '@/lib/utils';

export interface ConversationListItem {
  id: string;
  title: string;
  message_count: number;
  updated_at: string;
}

interface Props {
  conversations: ConversationListItem[];
  currentId: string | null;
  profile: { email: string; display_name: string | null };
}

export function Sidebar({ conversations, currentId, profile }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const startRename = (c: ConversationListItem) => {
    setRenamingId(c.id);
    setDraftTitle(c.title);
  };

  const commitRename = async (id: string) => {
    const next = draftTitle.trim();
    setRenamingId(null);
    if (!next) return;
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: next }),
    });
    if (!res.ok) toast({ title: 'שינוי השם נכשל', variant: 'destructive' });
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('למחוק את השיחה? אי אפשר לבטל.')) return;
    const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast({ title: 'מחיקה נכשלה', variant: 'destructive' });
      return;
    }
    if (currentId === id) router.push('/chat');
    else router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col w-72 border-s bg-muted/30">
      <div className="p-3 border-b flex items-center gap-2">
        <UserMenu email={profile.email} displayName={profile.display_name} />
        <Button asChild variant="outline" className="flex-1 justify-start gap-2">
          <Link href="/chat">
            <Plus className="h-4 w-4" />
            שיחה חדשה
          </Link>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <ul className="p-2 space-y-1">
          {conversations.length === 0 && (
            <li className="text-sm text-muted-foreground p-3 text-center">
              עוד אין שיחות. התחל אחת חדשה.
            </li>
          )}
          {conversations.map((c) => (
            <li key={c.id} className="group">
              {renamingId === c.id ? (
                <Input
                  autoFocus
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onBlur={() => commitRename(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(c.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="h-9"
                />
              ) : (
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-md hover:bg-accent transition-colors',
                    currentId === c.id && 'bg-accent',
                  )}
                >
                  <Link
                    href={`/chat/${c.id}`}
                    className="flex-1 min-w-0 px-3 py-2 text-sm"
                  >
                    <div className="truncate">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatRelative(c.updated_at)}
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => startRename(c)}>
                        <Pencil className="h-4 w-4" /> שנה שם
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" /> מחק
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
}
