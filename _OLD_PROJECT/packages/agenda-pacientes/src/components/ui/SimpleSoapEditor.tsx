import React from 'react';

interface SimpleSoapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  showToolbar?: boolean;
}

/**
 * Editor simplificado para notas SOAP
 * Usa textarea com formatação básica - mais estável que TipTap para múltiplas instâncias
 */
const SimpleSoapEditor: React.FC<SimpleSoapEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Digite seu texto aqui...", 
  disabled = false,
  minHeight = "200px",
  showToolbar = true
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleBold = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
    onChange(newValue);
    
    // Restaurar foco e seleção
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, end + 2);
    }, 0);
  };

  const handleItalic = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, end + 1);
    }, 0);
  };

  const handleBulletList = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + `\n• ${selectedText}` + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 3, end + 3);
    }, 0);
  };

  const handleNumberedList = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + `\n1. ${selectedText}` + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 4, end + 4);
    }, 0);
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    title 
  }: {
    onClick: () => void;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-slate-200 transition-colors text-slate-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  const Separator = () => <div className="w-px h-6 bg-slate-300 mx-1" />;

  // Remove HTML tags do value para exibir em textarea
  const cleanValue = value?.replace(/<[^>]*>/g, '') || '';

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-300">
          <ToolbarButton
            onClick={handleBold}
            title="Negrito - Selecione o texto e clique (adiciona **texto**)"
          >
            <strong>B</strong>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={handleItalic}
            title="Itálico - Selecione o texto e clique (adiciona *texto*)"
          >
            <em>I</em>
          </ToolbarButton>

          <Separator />

          <ToolbarButton
            onClick={handleBulletList}
            title="Lista com marcadores (adiciona • )"
          >
            •
          </ToolbarButton>
          
          <ToolbarButton
            onClick={handleNumberedList}
            title="Lista numerada (adiciona 1. )"
          >
            1.
          </ToolbarButton>
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        value={cleanValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-4 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
        style={{ minHeight }}
      />
    </div>
  );
};

export default SimpleSoapEditor;

