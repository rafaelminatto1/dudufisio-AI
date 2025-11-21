import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '~/components/ui/sonner';
import { PerformanceProvider } from '~/components/providers/PerformanceProvider';
import { AccessibilityProvider } from '~/components/providers/AccessibilityProvider';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DuduFisio-AI - Sistema de Gestão de Clínica de Fisioterapia',
  description: 'Sistema completo de gestão para clínicas de fisioterapia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <PerformanceProvider>
          <AccessibilityProvider>
            {children}
            <Toaster />
          </AccessibilityProvider>
        </PerformanceProvider>
      </body>
    </html>
  );
}
