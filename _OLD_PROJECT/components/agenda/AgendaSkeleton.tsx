import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';

interface AgendaSkeletonProps {
  viewType?: 'daily' | 'weekly' | 'monthly' | 'list';
  therapistCount?: number;
}

const AgendaSkeleton: React.FC<AgendaSkeletonProps> = ({ 
  viewType = 'weekly', 
  therapistCount = 3 
}) => {
  const renderDailySkeleton = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Therapist Columns */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: therapistCount }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              {/* Therapist Header */}
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                {Array.from({ length: 14 }).map((_, slotIndex) => (
                  <Skeleton 
                    key={slotIndex} 
                    className="h-12 w-full" 
                  />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWeeklySkeleton = () => (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-3">
            <div className="text-center space-y-2">
              <Skeleton className="h-4 w-8 mx-auto" />
              <Skeleton className="h-6 w-6 mx-auto rounded-full" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          </Card>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Time Column */}
        <div className="flex">
          <div className="w-16 border-r bg-muted/50 p-2">
            {Array.from({ length: 14 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full mb-1" />
            ))}
          </div>
          
          {/* Days Columns */}
          {Array.from({ length: 6 }).map((_, dayIndex) => (
            <div key={dayIndex} className="flex-1 border-r last:border-r-0">
              {Array.from({ length: 14 }).map((_, slotIndex) => (
                <Skeleton 
                  key={slotIndex} 
                  className="h-12 w-full border-b last:border-b-0" 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMonthlySkeleton = () => (
    <div className="space-y-4">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <Card key={index} className="p-2 h-20">
              <div className="space-y-1">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <div className="flex space-x-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (viewType) {
      case 'daily':
        return renderDailySkeleton();
      case 'weekly':
        return renderWeeklySkeleton();
      case 'monthly':
        return renderMonthlySkeleton();
      case 'list':
        return renderListSkeleton();
      default:
        return renderWeeklySkeleton();
    }
  };

  return (
    <div className="animate-pulse">
      {renderSkeleton()}
    </div>
  );
};

export default AgendaSkeleton;
