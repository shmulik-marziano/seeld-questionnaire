import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">העמוד שחיפשת לא קיים.</p>
      <Button asChild>
        <Link href="/">חזרה לעמוד הבית</Link>
      </Button>
    </div>
  );
}
