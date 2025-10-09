import React, { useEffect } from 'react';
/**
 * React 19 Asset Loader Component
 *
 * Este componente utiliza as novas funcionalidades de preload e preinit do React 19
 * para otimizar o carregamento de assets críticos, melhorando a performance da aplicação.
 */
export function React19AssetLoader({ children, preloadAssets = [], preinitAssets = [] }) {
    useEffect(() => {
        // Preload assets críticos - DISABLED: Not available in React 18
        // preloadAssets.forEach(asset => {
        //   preload(asset.href, {
        //     as: asset.as,
        //     crossOrigin: asset.crossOrigin,
        //     integrity: asset.integrity
        //   });
        // });
        // Preinit assets que serão usados imediatamente - DISABLED: Not available in React 18
        // preinitAssets.forEach(asset => {
        //   preinit(asset.href, {
        //     as: asset.as,
        //     crossOrigin: asset.crossOrigin,
        //     integrity: asset.integrity
        //   });
        // });
    }, [preloadAssets, preinitAssets]);
    return <>{children}</>;
}
/**
 * Hook para preload dinâmico de assets
 */
export function useAssetPreloader() {
    const preloadAsset = (href, as, options) => {
        // DISABLED: preload not available in React 18
        console.warn('preload not available in React 18');
    };
    const preinitAsset = (href, as, options) => {
        // DISABLED: preinit not available in React 18
        console.warn('preinit not available in React 18');
    };
    return { preloadAsset, preinitAsset };
}
/**
 * Componente para preload de assets específicos do sistema
 */
export function SystemAssetLoader({ children }) {
    const preloadAssets = [
        // CSS crítico
        { href: '/styles/critical.css', as: 'style' },
        // Fonts
        { href: '/fonts/inter-var.woff2', as: 'font', crossOrigin: 'anonymous' },
        // Imagens críticas
        { href: '/images/logo.png', as: 'image' },
        { href: '/images/hero-bg.jpg', as: 'image' },
        // Scripts críticos
        { href: '/js/analytics.js', as: 'script' },
    ];
    const preinitAssets = [
        // CSS que será usado imediatamente
        { href: '/styles/components.css', as: 'style' },
        // Scripts que serão executados imediatamente
        { href: '/js/theme-switcher.js', as: 'script' },
    ];
    return (<React19AssetLoader preloadAssets={preloadAssets} preinitAssets={preinitAssets}>
      {children}
    </React19AssetLoader>);
}
/**
 * Componente para preload de assets de dashboard
 */
export function DashboardAssetLoader({ children }) {
    const preloadAssets = [
        // Charts library
        { href: '/js/recharts.min.js', as: 'script' },
        // PDF generation library
        { href: '/js/jspdf.min.js', as: 'script' },
        // Icons
        { href: '/icons/lucide-icons.woff2', as: 'font', crossOrigin: 'anonymous' },
    ];
    const preinitAssets = [
        // Dashboard CSS
        { href: '/styles/dashboard.css', as: 'style' },
        // Dashboard scripts
        { href: '/js/dashboard-utils.js', as: 'script' },
    ];
    return (<React19AssetLoader preloadAssets={preloadAssets} preinitAssets={preinitAssets}>
      {children}
    </React19AssetLoader>);
}
/**
 * Componente para preload de assets de teleconsulta
 */
export function TeleconsultaAssetLoader({ children }) {
    const preloadAssets = [
        // WebRTC libraries
        { href: '/js/webrtc-adapter.js', as: 'script' },
        { href: '/js/simple-peer.min.js', as: 'script' },
        // Video components
        { href: '/styles/video-components.css', as: 'style' },
    ];
    const preinitAssets = [
        // WebRTC initialization
        { href: '/js/webrtc-init.js', as: 'script' },
    ];
    return (<React19AssetLoader preloadAssets={preloadAssets} preinitAssets={preinitAssets}>
      {children}
    </React19AssetLoader>);
}
/**
 * Componente para preload de assets de relatórios
 */
export function ReportsAssetLoader({ children }) {
    const preloadAssets = [
        // Chart libraries
        { href: '/js/chart.min.js', as: 'script' },
        { href: '/js/chartjs-adapter-date-fns.min.js', as: 'script' },
        // Export libraries
        { href: '/js/html2canvas.min.js', as: 'script' },
        { href: '/js/html2pdf.min.js', as: 'script' },
    ];
    const preinitAssets = [
        // Reports CSS
        { href: '/styles/reports.css', as: 'style' },
    ];
    return (<React19AssetLoader preloadAssets={preloadAssets} preinitAssets={preinitAssets}>
      {children}
    </React19AssetLoader>);
}
/**
 * Hook para preload condicional baseado na rota
 */
export function useRouteBasedPreload(currentPath) {
    const { preloadAsset, preinitAsset } = useAssetPreloader();
    useEffect(() => {
        // Preload assets baseado na rota atual - DISABLED: preload not available in React 18
        // if (currentPath.startsWith('/dashboard')) {
        //   preloadAsset('/js/dashboard-charts.js', 'script');
        //   preloadAsset('/styles/dashboard.css', 'style');
        // } else if (currentPath.startsWith('/teleconsulta')) {
        //   preloadAsset('/js/webrtc-adapter.js', 'script');
        //   preloadAsset('/styles/video-components.css', 'style');
        // } else if (currentPath.startsWith('/relatorios')) {
        //   preloadAsset('/js/chart.min.js', 'script');
        //   preloadAsset('/js/html2pdf.min.js', 'script');
        // } else if (currentPath.startsWith('/pacientes')) {
        //   preloadAsset('/js/patient-forms.js', 'script');
        //   preloadAsset('/styles/patient-forms.css', 'style');
        // }
    }, [currentPath, preloadAsset, preinitAsset]);
}
