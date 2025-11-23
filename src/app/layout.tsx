import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './globals.css';
import { Toaster } from '~/components/ui/sonner';
import { PerformanceProvider } from '~/components/providers/PerformanceProvider';
import { AccessibilityProvider } from '~/components/providers/AccessibilityProvider';
import { basePageMetadata } from '~/lib/metadata';

// Otimização de fontes com next/font/google
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = basePageMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <PerformanceProvider>
          <AccessibilityProvider>
            {children}
            <Toaster />
          </AccessibilityProvider>
        </PerformanceProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
