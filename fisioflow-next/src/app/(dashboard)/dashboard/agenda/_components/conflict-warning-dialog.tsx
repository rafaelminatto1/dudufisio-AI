'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConflictWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: any[];
}

export function ConflictWarningDialog({ open, onOpenChange, conflicts }: ConflictWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Conflitos Detectados
          </DialogTitle>
          <DialogDescription>
            Foram detectados conflitos que impedem a criação/edição deste agendamento:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {conflicts.map((conflict, index) => (
            <div key={index} className="rounded border border-destructive/50 bg-destructive/10 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <div className="font-medium text-destructive">{conflict.message}</div>
                  <div className="text-xs text-muted-foreground">Tipo: {conflict.type}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

