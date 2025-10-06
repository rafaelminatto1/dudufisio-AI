import React, { useEffect } from 'react';
import { preload, preinit } from 'react-dom';

interface AssetLoaderProps {
  children: React.ReactNode;
  preloadAssets?: Array<{
    href: string;
    as: 'script' | 'style' | 'image' | 'font' | 'fetch';
    crossOrigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
  }>;
  preinitAssets?: Array<{
    href: string;
    as: 'script' | 'style';
    crossOrigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
  }>;
}

/**
 * React 19 Asset Loader Component
 * 
 * Este componente utiliza as novas funcionalidades de preload e preinit do React 19
 * para otimizar o carregamento de assets críticos, melhorando a performance da aplicação.
 */
export function React19AssetLoader({ 
  children, 
  preloadAssets = [], 
  preinitAssets = [] 
}: AssetLoaderProps) {
  useEffect(() => {
    // Preload assets críticos
    preloadAssets.forEach(asset => {
      preload(asset.href, {
        as: asset.as,
        crossOrigin: asset.crossOrigin,
        integrity: asset.integrity
      });
    });

    // Preinit assets que serão usados imediatamente
    preinitAssets.forEach(asset => {
      preinit(asset.href, {
        as: asset.as,
        crossOrigin: asset.crossOrigin,
        integrity: asset.integrity
      });
    });
  }, [preloadAssets, preinitAssets]);

  return <>{children}</>;
}

/**
 * Hook para preload dinâmico de assets
 */
export function useAssetPreloader() {
  const preloadAsset = (href: string, as: 'script' | 'style' | 'image' | 'font' | 'fetch', options?: {
    crossOrigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
  }) => {
    preload(href, {
      as,
      crossOrigin: options?.crossOrigin,
      integrity: options?.integrity
    });
  };

  const preinitAsset = (href: string, as: 'script' | 'style', options?: {
    crossOrigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
  }) => {
    preinit(href, {
      as,
      crossOrigin: options?.crossOrigin,
      integrity: options?.integrity
    });
  };

  return { preloadAsset, preinitAsset };
}

/**
 * Componente para preload de assets específicos do sistema
 */
export function SystemAssetLoader({ children }: { children: React.ReactNode }) {
  const preloadAssets = [
    // CSS crítico
    { href: '/styles/critical.css', as: 'style' as const },
    
    // Fonts
    { href: '/fonts/inter-var.woff2', as: 'font' as const, crossOrigin: 'anonymous' as const },
    
    // Imagens críticas
    { href: '/images/logo.png', as: 'image' as const },
    { href: '/images/hero-bg.jpg', as: 'image' as const },
    
    // Scripts críticos
    { href: '/js/analytics.js', as: 'script' as const },
  ];

  const preinitAssets = [
    // CSS que será usado imediatamente
    { href: '/styles/components.css', as: 'style' as const },
    
    // Scripts que serão executados imediatamente
    { href: '/js/theme-switcher.js', as: 'script' as const },
  ];

  return (
    <React19AssetLoader 
      preloadAssets={preloadAssets} 
      preinitAssets={preinitAssets}
    >
      {children}
    </React19AssetLoader>
  );
}

/**
 * Componente para preload de assets de dashboard
 */
export function DashboardAssetLoader({ children }: { children: React.ReactNode }) {
  const preloadAssets = [
    // Charts library
    { href: '/js/recharts.min.js', as: 'script' as const },
    
    // PDF generation library
    { href: '/js/jspdf.min.js', as: 'script' as const },
    
    // Icons
    { href: '/icons/lucide-icons.woff2', as: 'font' as const, crossOrigin: 'anonymous' as const },
  ];

  const preinitAssets = [
    // Dashboard CSS
    { href: '/styles/dashboard.css', as: 'style' as const },
    
    // Dashboard scripts
    { href: '/js/dashboard-utils.js', as: 'script' as const },
  ];

  return (
    <React19AssetLoader 
      preloadAssets={preloadAssets} 
      preinitAssets={preinitAssets}
    >
      {children}
    </React19AssetLoader>
  );
}

/**
 * Componente para preload de assets de teleconsulta
 */
export function TeleconsultaAssetLoader({ children }: { children: React.ReactNode }) {
  const preloadAssets = [
    // WebRTC libraries
    { href: '/js/webrtc-adapter.js', as: 'script' as const },
    { href: '/js/simple-peer.min.js', as: 'script' as const },
    
    // Video components
    { href: '/styles/video-components.css', as: 'style' as const },
  ];

  const preinitAssets = [
    // WebRTC initialization
    { href: '/js/webrtc-init.js', as: 'script' as const },
  ];

  return (
    <React19AssetLoader 
      preloadAssets={preloadAssets} 
      preinitAssets={preinitAssets}
    >
      {children}
    </React19AssetLoader>
  );
}

/**
 * Componente para preload de assets de relatórios
 */
export function ReportsAssetLoader({ children }: { children: React.ReactNode }) {
  const preloadAssets = [
    // Chart libraries
    { href: '/js/chart.min.js', as: 'script' as const },
    { href: '/js/chartjs-adapter-date-fns.min.js', as: 'script' as const },
    
    // Export libraries
    { href: '/js/html2canvas.min.js', as: 'script' as const },
    { href: '/js/html2pdf.min.js', as: 'script' as const },
  ];

  const preinitAssets = [
    // Reports CSS
    { href: '/styles/reports.css', as: 'style' as const },
  ];

  return (
    <React19AssetLoader 
      preloadAssets={preloadAssets} 
      preinitAssets={preinitAssets}
    >
      {children}
    </React19AssetLoader>
  );
}

/**
 * Hook para preload condicional baseado na rota
 */
export function useRouteBasedPreload(currentPath: string) {
  const { preloadAsset, preinitAsset } = useAssetPreloader();

  useEffect(() => {
    // Preload assets baseado na rota atual
    if (currentPath.startsWith('/dashboard')) {
      preloadAsset('/js/dashboard-charts.js', 'script');
      preloadAsset('/styles/dashboard.css', 'style');
    } else if (currentPath.startsWith('/teleconsulta')) {
      preloadAsset('/js/webrtc-adapter.js', 'script');
      preloadAsset('/styles/video-components.css', 'style');
    } else if (currentPath.startsWith('/relatorios')) {
      preloadAsset('/js/chart.min.js', 'script');
      preloadAsset('/js/html2pdf.min.js', 'script');
    } else if (currentPath.startsWith('/pacientes')) {
      preloadAsset('/js/patient-forms.js', 'script');
      preloadAsset('/styles/patient-forms.css', 'style');
    }
  }, [currentPath, preloadAsset, preinitAsset]);
}
