import { Apple, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'הורדה' };

export default function DownloadPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">שמואל למחשב</h1>
        <p className="text-lg text-muted-foreground">
          חלון יעודי על שולחן העבודה. אותה חוויה בדיוק.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <Apple className="h-10 w-10 mb-2" />
            <CardTitle>macOS</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" disabled>
              <a href="/api/desktop/latest?platform=mac">
                הורד עבור macOS (בקרוב)
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">דורש macOS 12 ומעלה.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Monitor className="h-10 w-10 mb-2" />
            <CardTitle>Windows</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" disabled>
              <a href="/api/desktop/latest?platform=windows">
                הורד עבור Windows (בקרוב)
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">דורש Windows 10 ומעלה.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
