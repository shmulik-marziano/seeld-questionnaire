import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <Link href="/" className="text-2xl font-bold mb-8">
        שמואל
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
