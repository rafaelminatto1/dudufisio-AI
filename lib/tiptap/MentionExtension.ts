import { Extension } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { MentionList } from '../components/tiptap/MentionList';
import { User, MaterialMention } from '../../types';
import { materialTaskService } from '../../services/materialTaskService';

export interface MentionOptions {
  HTMLAttributes: Record<string, any>;
  suggestion: {
    items: (query: string) => Promise<User[]>;
    render: () => {
      onStart: (props: any) => void;
      onUpdate: (props: any) => void;
      onKeyDown: (props: any) => boolean;
      onExit: () => void;
    };
  };
}

export const MentionExtension = Extension.create<MentionOptions>({
  name: 'mention',

  addOptions() {
    return {
      HTMLAttributes: {},
      suggestion: {
        items: async ({ query }: { query: string }) => {
          // Mock users for now - will be replaced with real data
          const mockUsers: User[] = [
            { id: '1', name: 'Amanda Silva', email: 'amanda@clinic.com', role: 'Fisioterapeuta' as any, avatarUrl: '' },
            { id: '2', name: 'Carlos Santos', email: 'carlos@clinic.com', role: 'Fisioterapeuta' as any, avatarUrl: '' },
            { id: '3', name: 'Maria Oliveira', email: 'maria@clinic.com', role: 'Admin' as any, avatarUrl: '' },
            { id: '4', name: 'João Pereira', email: 'joao@clinic.com', role: 'Fisioterapeuta' as any, avatarUrl: '' },
          ];
          
          return mockUsers.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: () => {
          let component: any;
          let popup: any;

          return {
            onStart: (props: any) => {
              component = ReactNodeViewRenderer(MentionList);
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
        types: ['mention'],
        attributes: {
          class: {
            default: 'mention',
            renderHTML: attributes => ({
              class: `mention ${attributes.class}`,
            }),
          },
          'data-user-id': {
            default: null,
            renderHTML: attributes => ({
              'data-user-id': attributes['data-user-id'],
            }),
          },
          'data-user-name': {
            default: null,
            renderHTML: attributes => ({
              'data-user-name': attributes['data-user-name'],
            }),
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('mention'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            const { doc, selection } = state;

            doc.descendants((node, pos) => {
              if (node.type.name === 'mention') {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: 'mention-node',
                  'data-user-id': node.attrs['data-user-id'],
                  'data-user-name': node.attrs['data-user-name'],
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
    return ReactNodeViewRenderer(MentionNode);
  },

  addCommands() {
    return {
      insertMention: (attributes: any) => ({ commands, editor }) => {
        // Create mention in the document
        const result = commands.insertContent({
          type: 'mention',
          attrs: attributes,
        });

        // Create task if we have material context
        if (attributes['data-user-id'] && attributes['data-user-name']) {
          this.createMentionTask(attributes, editor);
        }

        return result;
      },
    };
  },

  // Helper method to create mention task
  async createMentionTask(attributes: any, editor: any) {
    try {
      const materialId = editor.options?.materialId; // This would be passed from the editor component
      if (!materialId) return;

      const mention: MaterialMention = {
        id: `mention-${Date.now()}`,
        userId: attributes['data-user-id'],
        userName: attributes['data-user-name'],
        position: editor.state.selection.from,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const content = `Você foi mencionado no material. Contexto: ${editor.getText().substring(0, 100)}...`;
      
      await materialTaskService.createTaskFromMention(mention, materialId, content);
    } catch (error) {
      console.error('Error creating mention task:', error);
    }
  },
});

// Component for rendering mention nodes
import React from 'react';

interface MentionNodeProps {
  node: {
    attrs: {
      'data-user-id': string;
      'data-user-name': string;
    };
  };
}

const MentionNode: React.FC<MentionNodeProps> = ({ node }) => {
  const { 'data-user-id': userId, 'data-user-name': userName } = node.attrs;

  return (
    <span
      className="mention-node bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors"
      data-user-id={userId}
      data-user-name={userName}
      title={`Menção para ${userName}`}
    >
      @{userName}
    </span>
  );
};
