import React, { lazy, Suspense, Component, ReactNode } from 'react';
import { Skeleton } from './skeleton';
import { AlertCircle } from 'lucide-react';

// Lazy load do TiptapEditor
const TiptapEditor = lazy(() => import('./TiptapEditor'));

interface TiptapEditorLazyProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  showToolbar?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary para capturar erros no TiptapEditor
 */
class TiptapEditorErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TiptapEditor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-300 rounded-lg p-4 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Erro ao carregar editor</span>
          </div>
          <p className="text-sm text-red-600 mt-2">
            O editor de texto não pôde ser carregado. Por favor, recarregue a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper com lazy loading para o TiptapEditor
 * Reduz o bundle inicial carregando o editor apenas quando necessário
 * Inclui error boundary para melhor experiência do usuário
 */
const TiptapEditorLazy: React.FC<TiptapEditorLazyProps> = (props) => {
  return (
    <TiptapEditorErrorBoundary>
      <Suspense fallback={
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-300">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <div className="p-4" style={{ minHeight: props.minHeight || '200px' }}>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      }>
        <TiptapEditor {...props} />
      </Suspense>
    </TiptapEditorErrorBoundary>
  );
};

export default TiptapEditorLazy;

