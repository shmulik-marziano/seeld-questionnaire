'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

export function SignInForm({ mode }: { mode: 'signin' | 'signup' }) {
  const supabase = createClient();
  const params = useSearchParams();
  const next = params.get('next') ?? '/chat';
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: mode === 'signup',
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'שגיאה',
        description: err instanceof Error ? err.message : 'משהו השתבש. נסה שוב.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <Mail className="h-8 w-8 mx-auto mb-2" />
          <CardTitle>בדוק את המייל</CardTitle>
          <CardDescription>שלחנו קישור התחברות אל {email}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            לחיצה על הקישור תכניס אותך ישר לשמואל.
            <br />
            אם הקישור לא הגיע — בדוק בספאם, או נסה שוב.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={() => setSent(false)} className="w-full">
            כתובת אחרת
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'signin' ? 'התחברות' : 'הרשמה'}</CardTitle>
        <CardDescription>
          {mode === 'signin'
            ? 'נשלח לך קישור קסם להתחברות.'
            : 'צור חשבון חדש בשמואל. נשלח לך קישור התחלה.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">כתובת אימייל</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" disabled={loading || !email} className="w-full">
            {loading ? 'שולח...' : mode === 'signin' ? 'שלח קישור' : 'צור חשבון'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {mode === 'signin' ? (
              <>
                אין לך חשבון? <Link href="/signup" className="underline">הרשם</Link>
              </>
            ) : (
              <>
                כבר יש לך חשבון? <Link href="/signin" className="underline">התחבר</Link>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
