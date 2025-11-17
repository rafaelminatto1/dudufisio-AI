'use client';

import { Button } from '~/components/ui/button';
import { Plus, Calendar, Users } from 'lucide-react';

export function QuickActionsPanel() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Users className="mr-2 h-4 w-4" />
        Lista de Espera
      </Button>
      <Button variant="outline" size="sm">
        <Calendar className="mr-2 h-4 w-4" />
        Bloqueios
      </Button>
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Novo Agendamento
      </Button>
    </div>
  );
}

