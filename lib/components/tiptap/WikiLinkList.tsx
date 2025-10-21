import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Material } from '../../../types';
import { FileText, BookOpen, ClipboardList } from 'lucide-react';

interface WikiLinkListProps {
  items: Material[];
  command: (item: Material) => void;
}

export interface WikiLinkListRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
  updateProps: (props: Partial<WikiLinkListProps>) => void;
}

export const WikiLinkList = forwardRef<WikiLinkListRef, WikiLinkListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
      updateProps: (props) => {
        if (props.items) {
          setSelectedIndex(0);
        }
      },
    }));

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];

      if (item) {
        command({
          id: item.id,
          label: item.name,
          'data-material-id': item.id,
          'data-material-name': item.name,
        });
      }
    };

    const getMaterialIcon = (type?: string) => {
      switch (type) {
        case 'Escala de Avaliação':
          return <ClipboardList className="w-4 h-4 text-blue-500" />;
        case 'Protocolo Clínico':
          return <FileText className="w-4 h-4 text-green-500" />;
        default:
          return <BookOpen className="w-4 h-4 text-purple-500" />;
      }
    };

    return (
      <div className="wiki-link-list bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
        {items.length ? (
          items.map((item, index) => (
            <button
              key={item.id}
              className={`wiki-link-item w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center space-x-3 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onClick={() => selectItem(index)}
            >
              <div className="flex-shrink-0">
                {getMaterialIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {item.description}
                  </p>
                )}
                {item.type && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                    {item.type}
                  </span>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-3 text-sm text-gray-500">
            Nenhum material encontrado
          </div>
        )}
      </div>
    );
  }
);

WikiLinkList.displayName = 'WikiLinkList';
