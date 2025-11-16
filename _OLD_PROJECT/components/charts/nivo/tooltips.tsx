import type { ReactNode } from 'react';

interface TooltipRow {
  id: string;
  label: ReactNode;
  value: ReactNode;
  color?: string;
}

interface TooltipCardProps {
  title?: ReactNode;
  rows: TooltipRow[];
}

export function TooltipCard({ title, rows }: TooltipCardProps) {
  return (
    <div className="space-y-2">
      {title ? <p className="text-sm font-semibold text-gray-900">{title}</p> : null}
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2 text-sm">
            {row.color ? (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: row.color }}
              />
            ) : null}
            <span className="text-gray-600">{row.label}</span>
            <span className="ml-auto font-medium text-gray-900">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { TooltipRow };

