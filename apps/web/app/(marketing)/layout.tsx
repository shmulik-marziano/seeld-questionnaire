import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            שמואל
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground px-3">
              מחירים
            </Link>
            <Link href="/download" className="text-sm text-muted-foreground hover:text-foreground px-3">
              הורדה
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/signin">התחברות</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">הרשמה</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8">
        <div className="container text-sm text-muted-foreground flex flex-wrap gap-4 justify-between">
          <span>© {new Date().getFullYear()} שמואל</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              פרטיות
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              תנאי שימוש
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
