import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './profile-form';

export const metadata = { title: 'הגדרות' };

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, display_name')
    .eq('id', user!.id)
    .maybeSingle();

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1 -ms-3">
          <Link href="/chat">
            <ChevronRight className="h-4 w-4" />
            חזרה לצ׳אט
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mt-2">הגדרות</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרופיל</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            email={profile?.email ?? user!.email!}
            displayName={profile?.display_name ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
