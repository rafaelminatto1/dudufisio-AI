import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'flat';
  icon?: ReactNode;
}

export function FormSection({
  title,
  description,
  children,
  className,
  variant = 'default',
  icon,
}: FormSectionProps) {
  if (variant === 'flat') {
    return (
      <div className={cn("space-y-4", className)}>
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <div className="flex items-center gap-2">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                <h3 className="text-lg font-medium leading-none">{title}</h3>
              </div>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {(title || description) && <Separator />}
        <div className="space-y-4">{children}</div>
      </div>
    );
  }

  if (variant === 'bordered') {
    return (
      <div className={cn("rounded-lg border p-6 space-y-4", className)}>
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <div className="flex items-center gap-2">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                <h3 className="text-lg font-medium leading-none">{title}</h3>
              </div>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {(title || description) && <Separator />}
        <div className="space-y-4">{children}</div>
      </div>
    );
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            {title && <CardTitle>{title}</CardTitle>}
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

