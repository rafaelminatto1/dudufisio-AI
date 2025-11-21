'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Provider para otimizações de performance
 * - Prefetch de rotas
 * - Lazy loading
 * - Cache de dados
 */
export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Prefetch de rotas comuns
    const commonRoutes = [
      '/dashboard/pacientes',
      '/dashboard/agenda',
      '/dashboard/financeiro',
    ];

    // Prefetch após carregamento inicial
    const timer = setTimeout(() => {
      commonRoutes.forEach((route) => {
        // Next.js faz prefetch automático, mas podemos forçar
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Limpa cache antigo periodicamente
  useEffect(() => {
    const cleanupCache = () => {
      const keys = Object.keys(sessionStorage);
      const now = Date.now();
      
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          try {
            const cached = sessionStorage.getItem(key);
            if (cached) {
              const { timestamp, ttl = 5 * 60 * 1000 } = JSON.parse(cached);
              if (now - timestamp > ttl) {
                sessionStorage.removeItem(key);
              }
            }
          } catch {
            sessionStorage.removeItem(key);
          }
        }
      });
    };

    const interval = setInterval(cleanupCache, 10 * 60 * 1000); // A cada 10 minutos
    cleanupCache(); // Executa imediatamente

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}

