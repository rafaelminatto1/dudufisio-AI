import React, { ReactNode } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface FilterPanelProps {
  children: ReactNode;
  title?: string;
  description?: string;
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
  trigger?: ReactNode;
}

export function FilterPanel({
  children,
  title = "Filtros",
  description = "Aplique filtros para refinar sua busca",
  activeFiltersCount = 0,
  onClearFilters,
  onApplyFilters,
  trigger,
}: FilterPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        
        <Separator className="my-4" />
        
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6">
            {children}
          </div>
        </ScrollArea>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
          <div className="flex w-full gap-2">
            {onClearFilters && (
              <Button
                type="button"
                variant="outline"
                onClick={onClearFilters}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            )}
            {onApplyFilters && (
              <Button
                type="button"
                onClick={onApplyFilters}
                className="flex-1"
              >
                Aplicar Filtros
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface FilterSectionProps {
  title: string;
  children: ReactNode;
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium leading-none">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

