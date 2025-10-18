import React, { lazy, Suspense } from 'react';
import { Skeleton } from './skeleton';

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

/**
 * Wrapper com lazy loading para o TiptapEditor
 * Reduz o bundle inicial carregando o editor apenas quando necessário
 */
const TiptapEditorLazy: React.FC<TiptapEditorLazyProps> = (props) => {
  return (
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
  );
};

export default TiptapEditorLazy;

