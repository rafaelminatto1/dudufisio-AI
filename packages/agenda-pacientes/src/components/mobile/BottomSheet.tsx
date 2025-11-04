import React, { ReactNode, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  snapPoints?: number[];
  defaultSnap?: number;
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  className,
}: BottomSheetProps) {
  // Lock body scroll when bottom sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          'rounded-t-[10px] border-t',
          'max-h-[85vh] overflow-y-auto',
          className
        )}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        {children}
      </SheetContent>
    </Sheet>
  );
}

