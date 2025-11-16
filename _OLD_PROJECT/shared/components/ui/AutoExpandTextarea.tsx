// components/ui/AutoExpandTextarea.tsx
import React, { useEffect, useRef, forwardRef } from 'react';

interface AutoExpandTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: string;
  maxHeight?: string;
}

export const AutoExpandTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoExpandTextareaProps
>(({ minHeight = '100px', maxHeight = '500px', className = '', ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Combina refs (interno + forwarded)
  const setRefs = (element: HTMLTextAreaElement | null) => {
    textareaRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  // Auto-expand quando conteúdo mudar
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto'; // Reset para calcular scrollHeight
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, parseInt(minHeight)),
        parseInt(maxHeight)
      );
      textarea.style.height = `${newHeight}px`;
    };

    adjustHeight();

    // Observer para mudanças no conteúdo
    const observer = new MutationObserver(adjustHeight);
    observer.observe(textarea, { characterData: true, subtree: true });

    return () => observer.disconnect();
  }, [minHeight, maxHeight, props.value]);

  return (
    <textarea
      ref={setRefs}
      style={{
        minHeight,
        maxHeight,
        resize: 'none',
        overflow: 'auto',
      }}
      className={className}
      {...props}
    />
  );
});

AutoExpandTextarea.displayName = 'AutoExpandTextarea';
