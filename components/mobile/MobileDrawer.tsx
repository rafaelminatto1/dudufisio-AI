import React, { ReactNode } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  trigger?: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileDrawer({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
}: MobileDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          {(title || description) && (
            <DrawerHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {title && <DrawerTitle>{title}</DrawerTitle>}
                  {description && <DrawerDescription>{description}</DrawerDescription>}
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
          )}

          <div className="p-4">{children}</div>

          {footer && <DrawerFooter>{footer}</DrawerFooter>}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

