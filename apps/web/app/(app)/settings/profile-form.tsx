'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

interface Props {
  email: string;
  displayName: string | null;
}

export function ProfileForm({ email, displayName }: Props) {
  const supabase = createClient();
  const { toast } = useToast();
  const [name, setName] = useState(displayName ?? '');
  const [busy, setBusy] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name || null })
      .eq('id', user.id);
    setBusy(false);
    if (error) {
      toast({ title: 'שמירה נכשלה', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'נשמר' });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input id="email" value={email} dir="ltr" readOnly />
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">שם להצגה</Label>
        <Input
          id="displayName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="איך לקרוא לך?"
        />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? 'שומר...' : 'שמור'}
      </Button>
    </form>
  );
}
