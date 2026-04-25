import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'מחירים' };

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'חינם',
    price: '0',
    period: 'לחודש',
    features: [
      'עד 20 הודעות ביום',
      'שמירת זיכרון בענן (עד 30 עובדות)',
      'כפתור סיכום למידה',
      'גישה למודל הראשי',
    ],
    cta: 'התחל חינם',
    href: '/signup',
  },
  {
    name: 'בסיסי',
    price: '80',
    period: 'לחודש',
    features: [
      'עד 500 הודעות ביום',
      'זיכרון מורחב (עד 500 עובדות)',
      'היסטוריה ארוכה',
      'תמיכה מועדפת',
      '7 ימי ניסיון חינם',
    ],
    cta: 'התחל ניסיון',
    href: '/signup',
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">מחירים</h1>
        <p className="text-lg text-muted-foreground">פשוט, ברור, בלי הפתעות.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.highlighted ? 'border-primary shadow-lg' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-bold">₪{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full" variant={plan.highlighted ? 'default' : 'outline'}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-12 max-w-xl mx-auto">
        מסלולים מקצועיים מותאמים אישית עבור עסקים — בקרוב.
        ביטול בכל עת. הזיכרון שלך — תמיד שלך.
      </p>
    </div>
  );
}
