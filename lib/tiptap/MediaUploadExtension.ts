import { Extension } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { MediaUploadNode } from '../components/tiptap/MediaUploadNode';
import { MediaAttachment } from '../../types';

export interface MediaUploadOptions {
  HTMLAttributes: Record<string, any>;
  uploadHandler: (file: File) => Promise<MediaAttachment>;
}

export const MediaUploadExtension = Extension.create<MediaUploadOptions>({
  name: 'mediaUpload',

  addOptions() {
    return {
      HTMLAttributes: {},
      uploadHandler: async (file: File) => {
        // Mock upload handler - will be replaced with real Supabase upload
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockAttachment: MediaAttachment = {
              id: Math.random().toString(36).substr(2, 9),
              type: file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : 'document',
              url: URL.createObjectURL(file),
              filename: file.name,
              size: file.size,
              alt: file.name,
            };
            resolve(mockAttachment);
          }, 1000);
        });
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['mediaUpload'],
        attributes: {
          class: {
            default: 'media-upload',
            renderHTML: attributes => ({
              class: `media-upload ${attributes.class}`,
            }),
          },
          'data-media-type': {
            default: null,
            renderHTML: attributes => ({
              'data-media-type': attributes['data-media-type'],
            }),
          },
          'data-media-url': {
            default: null,
            renderHTML: attributes => ({
              'data-media-url': attributes['data-media-url'],
            }),
          },
          'data-media-filename': {
            default: null,
            renderHTML: attributes => ({
              'data-media-filename': attributes['data-media-filename'],
            }),
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('mediaUpload'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            const { doc } = state;

            doc.descendants((node, pos) => {
              if (node.type.name === 'mediaUpload') {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: 'media-upload-node',
                  'data-media-type': node.attrs['data-media-type'],
                  'data-media-url': node.attrs['data-media-url'],
                  'data-media-filename': node.attrs['data-media-filename'],
                });
                decorations.push(decoration);
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaUploadNode);
  },

  addCommands() {
    return {
      insertMedia: (mediaAttachment: MediaAttachment) => ({ commands }) => {
        return commands.insertContent({
          type: 'mediaUpload',
          attrs: {
            'data-media-type': mediaAttachment.type,
            'data-media-url': mediaAttachment.url,
            'data-media-filename': mediaAttachment.filename,
            'data-media-alt': mediaAttachment.alt,
            'data-media-caption': mediaAttachment.caption,
          },
        });
      },
    };
  },
});

// Component for rendering media upload nodes
import React, { useState } from 'react';
import { Image, Video, File, X, Upload } from 'lucide-react';

interface MediaUploadNodeProps {
  node: {
    attrs: {
      'data-media-type': string;
      'data-media-url': string;
      'data-media-filename': string;
      'data-media-alt'?: string;
      'data-media-caption'?: string;
    };
  };
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
}

const MediaUploadNode: React.FC<MediaUploadNodeProps> = ({ 
  node, 
  updateAttributes, 
  deleteNode 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    'data-media-type': mediaType, 
    'data-media-url': mediaUrl, 
    'data-media-filename': filename,
    'data-media-alt': alt,
    'data-media-caption': caption
  } = node.attrs;

  const handleDelete = () => {
    deleteNode();
  };

  const handleAltChange = (newAlt: string) => {
    updateAttributes({ 'data-media-alt': newAlt });
  };

  const handleCaptionChange = (newCaption: string) => {
    updateAttributes({ 'data-media-caption': newCaption });
  };

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const renderMedia = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
          <Upload className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Carregando...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-32 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <X className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">Erro ao carregar mídia</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        </div>
      );
    }

    switch (mediaType) {
      case 'image':
        return (
          <img
            src={mediaUrl}
            alt={alt || filename}
            className="max-w-full h-auto rounded-lg shadow-sm"
            onError={() => setError('Erro ao carregar imagem')}
          />
        );
      case 'video':
        return (
          <video
            src={mediaUrl}
            controls
            className="max-w-full h-auto rounded-lg shadow-sm"
            onError={() => setError('Erro ao carregar vídeo')}
          >
            Seu navegador não suporta vídeos.
          </video>
        );
      default:
        return (
          <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
            {getMediaIcon()}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{filename}</p>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Abrir arquivo
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="media-upload-node my-4 group">
      <div className="relative">
        {renderMedia()}
        
        {/* Controls overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            title="Remover mídia"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alt text and caption inputs */}
      <div className="mt-2 space-y-2">
        <input
          type="text"
          placeholder="Texto alternativo (alt)"
          value={alt || ''}
          onChange={(e) => handleAltChange(e.target.value)}
          className="w-full px-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Legenda (opcional)"
          value={caption || ''}
          onChange={(e) => handleCaptionChange(e.target.value)}
          className="w-full px-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};
