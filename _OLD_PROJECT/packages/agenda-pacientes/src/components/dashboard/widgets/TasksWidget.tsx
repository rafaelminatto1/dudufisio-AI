import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  completed: boolean;
}

interface TasksWidgetProps {
  tasks?: Task[];
  maxItems?: number;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Revisar prontuário de Maria Silva',
    priority: 'high',
    dueDate: new Date(),
    completed: false,
  },
  {
    id: '2',
    title: 'Preparar relatório mensal',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000),
    completed: false,
  },
  {
    id: '3',
    title: 'Atualizar protocolos clínicos',
    priority: 'low',
    completed: false,
  },
];

export function TasksWidget({ tasks = mockTasks, maxItems = 5 }: TasksWidgetProps) {
  const pendingTasks = tasks.filter((t) => !t.completed).slice(0, maxItems);

  if (pendingTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle2 className="mb-2 h-8 w-8 text-green-600" />
        <p className="text-sm text-muted-foreground">Todas as tarefas concluídas!</p>
      </div>
    );
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
    }
  };

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
          >
            <button className="mt-0.5">
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', task.completed && 'line-through')}>
                {task.title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                  {task.priority === 'high' && 'Alta'}
                  {task.priority === 'medium' && 'Média'}
                  {task.priority === 'low' && 'Baixa'}
                </Badge>
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(task.dueDate, 'dd/MM', { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

