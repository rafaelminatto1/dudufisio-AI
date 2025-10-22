import React, { Suspense, Component, ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { History } from '@tiptap/extension-history';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from './skeleton';

interface RobustTiptapEditorProps {
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
  retryCount: number;
}

/**
 * Error Boundary robusto para capturar erros no TiptapEditor
 */
class RobustTiptapEditorErrorBoundary extends Component<
  { children: ReactNode; onRetry?: () => void },
  ErrorBoundaryState
> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: { children: ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RobustTiptapEditor Error:', error, errorInfo);
    
    // Auto-retry após 3 segundos se não for um erro crítico
    if (this.state.retryCount < 3 && !this.isCriticalError(error)) {
      this.retryTimeout = setTimeout(() => {
        this.setState({ hasError: false, error: undefined, retryCount: this.state.retryCount + 1 });
      }, 3000);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private isCriticalError(error: Error): boolean {
    // Erros críticos que não devem ser auto-retry
    const criticalErrors = [
      'ChunkLoadError',
      'ModuleNotFoundError',
      'NetworkError'
    ];
    return criticalErrors.some(criticalError => error.message.includes(criticalError));
  }

  private handleManualRetry = () => {
    this.setState({ hasError: false, error: undefined, retryCount: this.state.retryCount + 1 });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-300 rounded-lg p-6 bg-red-50">
          <div className="flex items-center gap-2 text-red-700 mb-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Erro ao carregar editor</span>
          </div>
          <p className="text-sm text-red-600 mb-4">
            O editor de texto não pôde ser carregado. {this.state.retryCount < 3 ? 'Tentando novamente...' : 'Por favor, recarregue a página.'}
          </p>
          {this.state.retryCount < 3 ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span className="text-xs text-red-600">Tentativa {this.state.retryCount + 1}/3</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={this.handleManualRetry}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Tentar Novamente
              </button>
              <button
                onClick={this.handleReload}
                className="px-3 py-1.5 bg-red-800 text-white rounded text-sm hover:bg-red-900"
              >
                Recarregar Página
              </button>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Editor TipTap robusto com fallback para textarea
 */
const RobustTiptapEditor: React.FC<RobustTiptapEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Digite seu texto aqui...", 
  disabled = false,
  minHeight = "200px",
  showToolbar = true
}) => {
  const [useFallback, setUseFallback] = React.useState(false);
  const [editorError, setEditorError] = React.useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Timeout para detectar falha de inicialização
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isInitializing) {
        console.warn('TiptapEditor: Timeout na inicialização, ativando fallback');
        setUseFallback(true);
        setIsInitializing(false);
      }
    }, 3000); // 3 segundos timeout

    return () => clearTimeout(timeout);
  }, [isInitializing]);

  // Detectar falha do editor e ativar fallback
  React.useEffect(() => {
    if (editorError) {
      console.error('TiptapEditor: Erro detectado, ativando fallback:', editorError);
      setUseFallback(true);
      setIsInitializing(false);
    }
  }, [editorError]);

  // Configuração do editor com tratamento de erro robusto
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        link: false,
        strike: false,
        history: false,
      }),
      TextStyle,
      Color,
      History.configure({
        depth: 50, // Reduzido para melhor performance
        newGroupDelay: 1000,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      try {
        onChange(editor.getHTML());
      } catch (error) {
        console.error('Error updating editor content:', error);
        setEditorError(error as Error);
      }
    },
    onCreate: ({ editor }) => {
      // Editor criado com sucesso
      setEditorError(null);
      setIsInitializing(false);
      console.log('TiptapEditor: Inicializado com sucesso');
    },
    onDestroy: () => {
      // Cleanup
      setEditorError(null);
      setIsInitializing(false);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm mx-auto focus:outline-none p-4 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
        style: `min-height: ${minHeight};`,
      },
    },
  }, [disabled, minHeight]);

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      try {
        editor.commands.setContent(value);
      } catch (error) {
        console.error('Error setting editor content:', error);
        setEditorError(error as Error);
      }
    }
  }, [value, editor]);

  // Fallback para textarea se o editor falhar ou não inicializar
  if (useFallback || editorError || (!editor && !isInitializing)) {
    return (
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        {showToolbar && (
          <div className="p-2 bg-slate-50 border-b border-slate-300">
            <span className="text-sm text-slate-600">Editor simples (modo de compatibilidade)</span>
          </div>
        )}
        <textarea
          value={value.replace(/<[^>]*>/g, '')} // Remove HTML tags para textarea
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-4 border-0 resize-none focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ minHeight }}
        />
      </div>
    );
  }

  // Loading state enquanto inicializa
  if (!editor && isInitializing) {
    return (
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <div className="p-4" style={{ minHeight }}>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled: buttonDisabled = false, 
    children, 
    title 
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={buttonDisabled || disabled}
      title={title}
      className={`p-2 rounded hover:bg-slate-200 transition-colors ${
        isActive ? 'bg-slate-300 text-slate-800' : 'text-slate-600'
      } ${buttonDisabled || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  const Separator = () => <div className="w-px h-6 bg-slate-300 mx-1" />;

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-300">
          {/* Botões básicos apenas */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Negrito (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Itálico (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Sublinhado"
          >
            <u>U</u>
          </ToolbarButton>

          <Separator />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Lista com marcadores"
          >
            •
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Lista numerada"
          >
            1.
          </ToolbarButton>

          <Separator />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Desfazer (Ctrl+Z)"
          >
            ↶
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Refazer (Ctrl+Y)"
          >
            ↷
          </ToolbarButton>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className={`${disabled ? 'pointer-events-none' : ''}`}
      />
      
      {placeholder && !editor.getText() && (
        <div className="absolute top-4 left-4 text-slate-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

/**
 * Wrapper com lazy loading e error boundary
 */
const RobustTiptapEditorLazy: React.FC<RobustTiptapEditorProps> = (props) => {
  return (
    <RobustTiptapEditorErrorBoundary>
      <Suspense fallback={
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-300">
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
        <RobustTiptapEditor {...props} />
      </Suspense>
    </RobustTiptapEditorErrorBoundary>
  );
};

export default RobustTiptapEditorLazy;
