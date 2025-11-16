import React from 'react';

interface SkeletonCardProps {
  variant?: 'default' | 'metric' | 'chart' | 'list';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'default' }) => {
  if (variant === 'metric') {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4 sm:p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md border border-slate-200 p-4"
          >
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
};

export default SkeletonCard;

