import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { User } from '../../../types';

interface MentionListProps {
  items: User[];
  command: (item: User) => void;
}

export interface MentionListRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
  updateProps: (props: Partial<MentionListProps>) => void;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
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
        // Update props if needed
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
          'data-user-id': item.id,
          'data-user-name': item.name,
        });
      }
    };

    return (
      <div className="mention-list bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
        {items.length ? (
          items.map((item, index) => (
            <button
              key={item.id}
              className={`mention-item w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onClick={() => selectItem(index)}
            >
              <div className="flex-shrink-0">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {item.email}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {item.role}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500">
            Nenhum usuário encontrado
          </div>
        )}
      </div>
    );
  }
);

MentionList.displayName = 'MentionList';
