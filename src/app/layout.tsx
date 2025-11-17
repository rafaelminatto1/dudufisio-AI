import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from '~/components/providers/supabase-provider';
import { ThemeProvider } from '~/components/theme-provider';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FisioFlow - Gestão para Clínicas de Fisioterapia',
  description: 'Sistema completo de gestão para clínicas de fisioterapia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            {children}
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

