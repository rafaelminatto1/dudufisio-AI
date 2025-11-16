import { Extension } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { WikiLinkList } from '../components/tiptap/WikiLinkList';
import { Material } from '../../types';

export interface WikiLinkOptions {
  HTMLAttributes: Record<string, any>;
  suggestion: {
    items: (query: string) => Promise<Material[]>;
    render: () => {
      onStart: (props: any) => void;
      onUpdate: (props: any) => void;
      onKeyDown: (props: any) => boolean;
      onExit: () => void;
    };
  };
}

export const WikiLinkExtension = Extension.create<WikiLinkOptions>({
  name: 'wikiLink',

  addOptions() {
    return {
      HTMLAttributes: {},
      suggestion: {
        items: async ({ query }: { query: string }) => {
          // This will be replaced with real material data from the service
          const mockMaterials: Partial<Material>[] = [
            { id: 'mat001', name: 'Escala Visual Analógica de Dor (EVA)' },
            { id: 'mat002', name: 'Questionário de Incapacidade Roland-Morris' },
            { id: 'mat003', name: 'Teste de Força Muscular de Oxford' },
            { id: 'mat004', name: 'Goniometria - Manual Completo' },
            { id: 'mat005', name: 'Escala WOMAC para Osteoartrite de Joelho' },
            { id: 'mat016', name: 'Protocolo Pós-operatório de Reconstrução de LCA' },
            { id: 'mat017', name: 'Protocolo para Síndrome do Impacto Subacromial' },
            { id: 'mat018', name: 'Diretrizes para Lombalgia Mecânica Crônica' },
          ];
          
          return mockMaterials.filter(material => 
            material.name?.toLowerCase().includes(query.toLowerCase())
          ) as Material[];
        },
        render: () => {
          let component: any;
          let popup: any;

          return {
            onStart: (props: any) => {
              component = ReactNodeViewRenderer(WikiLinkList);
              popup = component({
                items: props.items,
                command: props.command,
              });
            },

            onUpdate: (props: any) => {
              component?.updateProps(props);
            },

            onKeyDown: (props: any) => {
              if (props.event.key === 'Escape') {
                popup.hide();
                return true;
              }
              return component?.onKeyDown?.(props);
            },

            onExit: () => {
              popup.hide();
            },
          };
        },
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['wikiLink'],
        attributes: {
          class: {
            default: 'wiki-link',
            renderHTML: attributes => ({
              class: `wiki-link ${attributes.class}`,
            }),
          },
          'data-material-id': {
            default: null,
            renderHTML: attributes => ({
              'data-material-id': attributes['data-material-id'],
            }),
          },
          'data-material-name': {
            default: null,
            renderHTML: attributes => ({
              'data-material-name': attributes['data-material-name'],
            }),
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('wikiLink'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            const { doc } = state;

            doc.descendants((node, pos) => {
              if (node.type.name === 'wikiLink') {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: 'wiki-link-node',
                  'data-material-id': node.attrs['data-material-id'],
                  'data-material-name': node.attrs['data-material-name'],
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
    return ReactNodeViewRenderer(WikiLinkNode);
  },
});

// Component for rendering wiki link nodes
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface WikiLinkNodeProps {
  node: {
    attrs: {
      'data-material-id': string;
      'data-material-name': string;
    };
  };
}

const WikiLinkNode: React.FC<WikiLinkNodeProps> = ({ node }) => {
  const navigate = useNavigate();
  const { 'data-material-id': materialId, 'data-material-name': materialName } = node.attrs;

  const handleClick = () => {
    if (materialId) {
      navigate(`/material-detail/${materialId}`);
    }
  };

  return (
    <span
      className="wiki-link-node bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium cursor-pointer hover:bg-green-200 transition-colors border border-green-300"
      data-material-id={materialId}
      data-material-name={materialName}
      title={`Link para: ${materialName}`}
      onClick={handleClick}
    >
      [[{materialName}]]
    </span>
  );
};
