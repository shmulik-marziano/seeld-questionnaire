import type { Metadata, Viewport } from 'next';
import { Assistant } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-assistant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'שמואל',
    template: '%s · שמואל',
  },
  description: 'שמואל — צ׳אט בינה מלאכותית שלומד אותך, שומר על פרטיותך, ושקוף בלמידה שלו.',
  applicationName: 'שמואל',
  authors: [{ name: 'Shmuel' }],
  keywords: ['שמואל', 'בינה מלאכותית', 'צ׳אט', 'AI'],
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    siteName: 'שמואל',
    title: 'שמואל',
    description: 'צ׳אט שלומד אותך.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning className={assistant.variable}>
      <body className="font-sans">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
