import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Buscar...",
  className,
  autoFocus = false,
  disabled = false,
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
        autoFocus={autoFocus}
        disabled={disabled}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={handleClear}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpar busca</span>
        </Button>
      )}
    </div>
  );
}

