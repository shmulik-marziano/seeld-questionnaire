import Link from 'next/link';
import { Brain, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <>
      <section className="container py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            הצ׳אט שלומד <span className="text-primary">אותך</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            שמואל זוכר מה חשוב לך, מסתגל לסגנון שלך, ואומר לך במפורש מה הוא לומד.
            הזיכרון שלך — בשליטה שלך.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/signup">התחל בחינם</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">למסלולים</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-16 grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Brain className="h-8 w-8 mb-2" />
            <CardTitle>הסתגלות אישית</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            שמואל לומד אותך לעומק עם הזמן. כל משתמש מקבל שמואל שונה מעט — מתאים לסגנון, לעבודה, לחיים שלו.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Lock className="h-8 w-8 mb-2" />
            <CardTitle>שליטה על הפרטיות</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            אתה בוחר איפה הזיכרון שלך חי. בענן שלנו, על המכשיר שלך, או באחסון הפרטי שלך. בלי שאלות.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Eye className="h-8 w-8 mb-2" />
            <CardTitle>שקיפות מלאה</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            שמואל מסביר לך מה למד, מבקש אישור על שינויים, ומציג סתירות. אתה שותף בלמידה — לא צרכן פסיבי.
          </CardContent>
        </Card>
      </section>

      <section className="container py-16">
        <div className="max-w-3xl mx-auto bg-muted/40 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4">כפתור הלמידה</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            אחרי שיחה משמעותית, לחץ על "סיכום למידה". שמואל יציג לך את כל מה שלמד עליך
            באותה שיחה, ישאל שאלות הבהרה, ויבקש אישור לפני שהוא שומר משהו לזיכרון.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            כל עובדה — בשליטתך. אתה מאשר, דוחה, או עורך. הזיכרון שלך לא צומח בלי הסכמתך.
          </p>
        </div>
      </section>
    </>
  );
}
