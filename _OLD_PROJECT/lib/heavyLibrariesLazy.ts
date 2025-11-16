/**
 * 🚀 Heavy Libraries Lazy Loading
 *
 * Centraliza o lazy loading de bibliotecas pesadas para reduzir bundle inicial:
 * - Firebase (~400KB) - apenas para push notifications
 * - jsPDF (~200KB) - apenas quando gerar PDFs
 * - html2canvas (~100KB) - apenas quando capturar screenshots
 * - framer-motion (~100KB) - pode ser lazy loaded em animações não-críticas
 *
 * REDUÇÃO ESPERADA: ~800KB no bundle inicial
 */

// ============================================================
// FIREBASE LAZY LOADING
// ============================================================

/**
 * Lazy load do Firebase App
 * Usado apenas para Push Notifications
 */
export const loadFirebaseApp = async () => {
  const { initializeApp } = await import('firebase/app');
  return { initializeApp };
};

/**
 * Lazy load do Firebase Messaging
 * Usado apenas para Push Notifications
 */
export const loadFirebaseMessaging = async () => {
  const messaging = await import('firebase/messaging');
  return messaging;
};

/**
 * Hook para usar Firebase Messaging com lazy loading
 */
export const useFirebaseMessaging = () => {
  const initMessaging = async (firebaseConfig: any) => {
    try {
      const { initializeApp } = await loadFirebaseApp();
      const { getMessaging, getToken, onMessage } = await loadFirebaseMessaging();

      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      return { messaging, getToken, onMessage };
    } catch (error) {
      console.error('[Firebase] Error loading Firebase Messaging:', error);
      throw error;
    }
  };

  return { initMessaging };
};

// ============================================================
// PDF GENERATION LAZY LOADING
// ============================================================

/**
 * Lazy load do jsPDF
 * Carrega apenas quando for gerar um PDF
 */
export const loadJsPDF = async () => {
  const { default: jsPDF } = await import('jspdf');
  return jsPDF;
};

/**
 * Lazy load do jsPDF AutoTable
 * Carrega apenas quando for gerar tabelas em PDF
 */
export const loadJsPDFAutoTable = async () => {
  const autoTable = await import('jspdf-autotable');
  return autoTable;
};

/**
 * Lazy load do @react-pdf/renderer
 * Usado para geração de PDFs com React
 */
export const loadReactPDF = async () => {
  const reactPDF = await import('@react-pdf/renderer');
  return reactPDF;
};

/**
 * Hook para gerar PDFs com lazy loading
 */
export const usePDFGeneration = () => {
  /**
   * Gera PDF simples com jsPDF
   */
  const generateSimplePDF = async (
    content: string,
    filename: string = 'document.pdf'
  ) => {
    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();
      doc.text(content, 10, 10);
      doc.save(filename);
    } catch (error) {
      console.error('[PDF] Error generating PDF:', error);
      throw error;
    }
  };

  /**
   * Gera PDF com tabela usando AutoTable
   */
  const generateTablePDF = async (
    headers: string[],
    data: any[][],
    filename: string = 'table.pdf'
  ) => {
    try {
      const jsPDF = await loadJsPDF();
      await loadJsPDFAutoTable(); // Carrega plugin

      const doc = new jsPDF();
      (doc as any).autoTable({
        head: [headers],
        body: data
      });
      doc.save(filename);
    } catch (error) {
      console.error('[PDF] Error generating table PDF:', error);
      throw error;
    }
  };

  /**
   * Gera PDF com React PDF
   */
  const generateReactPDF = async (component: React.ReactElement) => {
    try {
      const { pdf } = await loadReactPDF();
      const blob = await pdf(component).toBlob();
      return blob;
    } catch (error) {
      console.error('[PDF] Error generating React PDF:', error);
      throw error;
    }
  };

  return {
    generateSimplePDF,
    generateTablePDF,
    generateReactPDF
  };
};

// ============================================================
// HTML2CANVAS LAZY LOADING
// ============================================================

/**
 * Lazy load do html2canvas
 * Usado para capturar screenshots de elementos HTML
 */
export const loadHtml2Canvas = async () => {
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas;
};

/**
 * Hook para capturar screenshots com lazy loading
 */
export const useScreenshot = () => {
  /**
   * Captura screenshot de um elemento
   */
  const captureElement = async (
    element: HTMLElement,
    options?: any
  ): Promise<string> => {
    try {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(element, options);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('[Screenshot] Error capturing screenshot:', error);
      throw error;
    }
  };

  /**
   * Captura screenshot e baixa como arquivo
   */
  const downloadScreenshot = async (
    element: HTMLElement,
    filename: string = 'screenshot.png',
    options?: any
  ) => {
    try {
      const dataUrl = await captureElement(element, options);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('[Screenshot] Error downloading screenshot:', error);
      throw error;
    }
  };

  return {
    captureElement,
    downloadScreenshot
  };
};

// ============================================================
// FRAMER MOTION LAZY LOADING
// ============================================================

/**
 * Lazy load do Framer Motion
 * Usado para animações não-críticas
 */
export const loadFramerMotion = async () => {
  const framerMotion = await import('framer-motion');
  return framerMotion;
};

/**
 * Hook para usar Framer Motion com lazy loading
 */
export const useMotion = () => {
  const loadMotionComponents = async () => {
    const { motion, AnimatePresence } = await loadFramerMotion();
    return { motion, AnimatePresence };
  };

  return { loadMotionComponents };
};

// ============================================================
// PRELOAD STRATEGIES
// ============================================================

/**
 * Preload de bibliotecas pesadas em background
 * Chame isso depois que a aplicação inicial carregar
 */
export const preloadHeavyLibraries = async () => {
  // Usar requestIdleCallback para preload quando o browser estiver ocioso
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(async () => {
      try {
        // Preload das bibliotecas mais usadas
        await Promise.allSettled([
          import('recharts'),
          // Firebase só se push notifications estiver habilitado
          // import('firebase/app'),
          // PDF só se usuário tiver permissão para gerar relatórios
          // import('jspdf')
        ]);

        console.log('[Preload] Heavy libraries preloaded successfully');
      } catch (error) {
        console.error('[Preload] Error preloading heavy libraries:', error);
      }
    });
  } else {
    // Fallback para browsers antigos
    setTimeout(async () => {
      try {
        await import('recharts');
        console.log('[Preload] Heavy libraries preloaded successfully');
      } catch (error) {
        console.error('[Preload] Error preloading heavy libraries:', error);
      }
    }, 3000); // 3 segundos depois do carregamento inicial
  }
};

/**
 * Preload condicional baseado em permissões do usuário
 */
export const preloadByUserRole = async (userRole: string) => {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(async () => {
      try {
        if (userRole === 'Admin' || userRole === 'Therapist') {
          // Admins e terapeutas usam mais gráficos e relatórios
          await Promise.allSettled([
            import('recharts'),
            import('jspdf'),
            import('html2canvas')
          ]);
          console.log('[Preload] Admin/Therapist libraries preloaded');
        } else if (userRole === 'Patient') {
          // Pacientes usam menos funcionalidades pesadas
          await import('recharts'); // Apenas gráficos
          console.log('[Preload] Patient libraries preloaded');
        }
      } catch (error) {
        console.error('[Preload] Error preloading by role:', error);
      }
    });
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Verifica se uma biblioteca já foi carregada
 */
export const isLibraryLoaded = (libraryName: string): boolean => {
  // Verifica se o módulo já está em cache
  return (performance as any)
    .getEntriesByType('resource')
    .some((entry: any) => entry.name.includes(libraryName));
};

/**
 * Retorna o tamanho aproximado de uma biblioteca
 */
export const getLibrarySize = (libraryName: string): number => {
  const sizes: Record<string, number> = {
    firebase: 400, // KB
    recharts: 500,
    jspdf: 200,
    'html2canvas': 100,
    'framer-motion': 100,
    '@react-pdf/renderer': 300
  };

  return sizes[libraryName] || 0;
};

/**
 * Calcula economia de bundle ao usar lazy loading
 */
export const calculateBundleSavings = (libraries: string[]): number => {
  return libraries.reduce((total, lib) => total + getLibrarySize(lib), 0);
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  // Firebase
  loadFirebaseApp,
  loadFirebaseMessaging,
  useFirebaseMessaging,

  // PDF
  loadJsPDF,
  loadJsPDFAutoTable,
  loadReactPDF,
  usePDFGeneration,

  // Screenshot
  loadHtml2Canvas,
  useScreenshot,

  // Motion
  loadFramerMotion,
  useMotion,

  // Preload
  preloadHeavyLibraries,
  preloadByUserRole,

  // Utilities
  isLibraryLoaded,
  getLibrarySize,
  calculateBundleSavings
};
