import React, { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Você tem certeza?",
  description = "Esta ação não pode ser desfeita.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {loading ? 'Processando...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook para usar o ConfirmDialog de forma programática
 */
export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    title?: string;
    description?: string | ReactNode;
    onConfirm?: () => void;
    variant?: 'default' | 'destructive';
  }>({
    open: false,
  });

  const confirm = React.useCallback(
    (options: Omit<typeof state, 'open'>) => {
      return new Promise<boolean>((resolve) => {
        setState({
          open: true,
          ...options,
          onConfirm: () => {
            options.onConfirm?.();
            resolve(true);
          },
        });
      });
    },
    []
  );

  const dialog = (
    <ConfirmDialog
      open={state.open}
      onOpenChange={(open) => setState({ ...state, open })}
      onConfirm={state.onConfirm || (() => {})}
      title={state.title}
      description={state.description}
      variant={state.variant}
    />
  );

  return { confirm, dialog };
}
