import React, { useCallback, useRef, useState } from 'react';
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
import { Mention } from '@tiptap/extension-mention';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Palette,
  Type,
  Code,
  AtSign,
  Link2,
  Upload,
  Save,
  Eye
} from 'lucide-react';

interface AdvancedMaterialEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  showToolbar?: boolean;
  onSave?: () => void;
  onPreview?: () => void;
  isSaving?: boolean;
  materialId?: string;
}

const AdvancedMaterialEditor: React.FC<AdvancedMaterialEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Digite seu conteúdo aqui...", 
  disabled = false,
  minHeight = "400px",
  showToolbar = true,
  onSave,
  onPreview,
  isSaving = false,
  materialId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

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
        depth: 100,
        newGroupDelay: 500,
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
      MentionExtension.configure({
        suggestion: {
          items: async ({ query }: { query: string }) => {
            // Mock users for now - will be replaced with real data
            const mockUsers = [
              { id: '1', name: 'Amanda Silva', email: 'amanda@clinic.com', role: 'Fisioterapeuta' as any, avatarUrl: '' },
              { id: '2', name: 'Carlos Santos', email: 'carlos@clinic.com', role: 'Fisioterapeuta' as any, avatarUrl: '' },
              { id: '3', name: 'Maria Oliveira', email: 'maria@clinic.com', role: 'Admin' as any, avatarUrl: '' },
              { id: '4', name: 'João Pereira', email: 'joao@clinic.com', role: 'Fisioterapeuta' as any, avatarUrl: '' },
            ];
            
            return mockUsers.filter(user => 
              user.name.toLowerCase().includes(query.toLowerCase())
            );
          },
        },
      }),
      WikiLinkExtension,
      MediaUploadExtension,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Update word and character count
      const text = editor.getText();
      setCharCount(text.length);
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
        style: `min-height: ${minHeight};`,
      },
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file type and size
      const maxSize = file.type.startsWith('image/') ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
      if (file.size > maxSize) {
        alert(`Arquivo muito grande. Tamanho máximo: ${file.type.startsWith('image/') ? '5MB' : '50MB'}`);
        return;
      }

      // Create a mock media attachment for now
      const mockAttachment = {
        id: Math.random().toString(36).substr(2, 9),
        type: file.type.startsWith('image/') ? 'image' as const : 
              file.type.startsWith('video/') ? 'video' as const : 'document' as const,
        url: URL.createObjectURL(file),
        filename: file.name,
        size: file.size,
        alt: file.name,
      };

      // Insert media using the extension command
      editor?.commands.insertMedia(mockAttachment);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    title, 
    children, 
    disabled: buttonDisabled = false 
  }: {
    onClick: () => void;
    isActive?: boolean;
    title: string;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={buttonDisabled || disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-600 border border-blue-200' 
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
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
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Sublinhado (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Riscado"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <Separator />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Parágrafo"
          >
            <Type className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Título 1"
          >
            H1
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Título 2"
          >
            H2
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Título 3"
          >
            H3
          </ToolbarButton>

          <Separator />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Lista com marcadores"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Citação"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Bloco de código"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <Separator />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Centralizar"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Alinhar à direita"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justificar"
          >
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>

          <Separator />

          {/* Special Features */}
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Digite a URL do link:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive('link')}
            title="Inserir link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Digite a URL da imagem:');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            title="Inserir imagem por URL"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            title="Upload de mídia"
          >
            <Upload className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Digite a URL do vídeo (YouTube, Vimeo, etc):');
              if (url) {
                // This would create a media upload node with the external URL
                const mockAttachment = {
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'video' as const,
                  url: url,
                  filename: 'Vídeo externo',
                  size: 0,
                  alt: 'Vídeo externo',
                };
                editor.commands.insertMedia(mockAttachment);
              }
            }}
            title="Inserir vídeo externo"
          >
            <Link2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Inserir tabela"
          >
            <TableIcon className="w-4 h-4" />
          </ToolbarButton>

          <Separator />

          {/* History */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Refazer (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>

          <Separator />

          {/* Action Buttons */}
          {onSave && (
            <ToolbarButton
              onClick={onSave}
              disabled={isSaving}
              title="Salvar material"
            >
              <Save className="w-4 h-4" />
              {isSaving && <span className="ml-1 text-xs">Salvando...</span>}
            </ToolbarButton>
          )}

          {onPreview && (
            <ToolbarButton
              onClick={onPreview}
              title="Visualizar material"
            >
              <Eye className="w-4 h-4" />
            </ToolbarButton>
          )}
        </div>
      )}

      <EditorContent 
        editor={editor} 
        className="focus-within:outline-none"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{charCount} caracteres</span>
          <span>{wordCount} palavras</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-green-600">●</span>
          <span>Conectado</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMaterialEditor;
