/**
 * Exemplo de uso do useOptimistic (React 19)
 * Para implementar em AgendaCalendar e outros componentes
 */

'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';

// ============================================
// EXEMPLO 1: Lista de Agendamentos com useOptimistic
// ============================================

type Appointment = {
  id: string;
  title: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  time: string;
};

export function AppointmentListOptimistic({
  initialAppointments,
  onUpdateStatus,
}: {
  initialAppointments: Appointment[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  // useOptimistic permite atualização otimista da UI
  const [optimisticAppointments, setOptimisticAppointments] = useOptimistic(
    initialAppointments,
    (state, { id, status }: { id: string; status: string }) => {
      return state.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: status as Appointment['status'] }
          : appointment
      );
    }
  );

  const handleUpdateStatus = async (id: string, status: string) => {
    // Atualização otimista - UI atualiza imediatamente
    startTransition(() => {
      setOptimisticAppointments({ id, status });
    });

    // Atualização real no servidor
    try {
      await onUpdateStatus(id, status);
      // Se der erro, o React automaticamente reverte a mudança otimista
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      // O estado otimista é revertido automaticamente
    }
  };

  return (
    <div className="space-y-2">
      {optimisticAppointments.map((appointment) => (
        <Card
          key={appointment.id}
          className={`p-4 ${isPending ? 'opacity-70' : 'opacity-100'} transition-opacity`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{appointment.title}</h3>
              <p className="text-sm text-muted-foreground">{appointment.time}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={appointment.status === 'completed' ? 'default' : 'outline'}
                onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                disabled={isPending}
              >
                Completar
              </Button>
              <Button
                size="sm"
                variant={appointment.status === 'cancelled' ? 'destructive' : 'outline'}
                onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                disabled={isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
          {appointment.status !== 'scheduled' && (
            <div className="mt-2 text-xs text-muted-foreground">
              Status: {appointment.status}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ============================================
// EXEMPLO 2: Formulário com useOptimistic
// ============================================

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export function TaskListOptimistic({
  initialTasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: {
  initialTasks: Task[];
  onAddTask: (text: string) => Promise<void>;
  onToggleTask: (id: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState('');

  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    initialTasks,
    (state, action: { type: 'add' | 'toggle' | 'delete'; id?: string; task?: Task }) => {
      switch (action.type) {
        case 'add':
          return action.task ? [...state, action.task] : state;
        case 'toggle':
          return state.map((task) =>
            task.id === action.id ? { ...task, completed: !task.completed } : task
          );
        case 'delete':
          return state.filter((task) => task.id !== action.id);
        default:
          return state;
      }
    }
  );

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      text: inputValue,
      completed: false,
    };

    startTransition(() => {
      updateOptimisticTasks({ type: 'add', task: tempTask });
    });

    setInputValue('');

    try {
      await onAddTask(inputValue);
    } catch (error) {
      console.error('Erro ao adicionar:', error);
    }
  };

  const handleToggleTask = async (id: string) => {
    startTransition(() => {
      updateOptimisticTasks({ type: 'toggle', id });
    });

    try {
      await onToggleTask(id);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    startTransition(() => {
      updateOptimisticTasks({ type: 'delete', id });
    });

    try {
      await onDeleteTask(id);
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Nova tarefa..."
          className="flex-1 px-3 py-2 border rounded"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          Adicionar
        </Button>
      </form>

      <div className="space-y-2">
        {optimisticTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 border rounded ${
              isPending ? 'opacity-70' : 'opacity-100'
            } transition-opacity`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleTask(task.id)}
              disabled={isPending}
              className="w-4 h-4"
            />
            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
              {task.text}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteTask(task.id)}
              disabled={isPending}
              className="ml-auto"
            >
              Deletar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXEMPLO 3: Form Actions (React 19)
// ============================================

export function FormActionExample({
  onSubmit,
}: {
  onSubmit: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await onSubmit(formData);
      setMessage(result.message);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nome
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-3 py-2 border rounded"
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-3 py-2 border rounded"
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>

      {message && <div className="text-sm text-muted-foreground">{message}</div>}
    </form>
  );
}

// ============================================
// GUIA DE USO
// ============================================

/*
 * COMO IMPLEMENTAR useOptimistic NO AgendaCalendar:
 *
 * 1. Substituir useState por useOptimistic:
 *
 * const [optimisticAppointments, updateOptimisticAppointments] = useOptimistic(
 *   initialAppointments,
 *   (state, updatedAppointment) => {
 *     return state.map(apt =>
 *       apt.id === updatedAppointment.id ? updatedAppointment : apt
 *     );
 *   }
 * );
 *
 * 2. Ao atualizar status:
 *
 * const handleUpdateStatus = async (id: string, status: string) => {
 *   // Atualização otimista
 *   const updatedAppointment = { ...appointment, status };
 *   updateOptimisticAppointments(updatedAppointment);
 *
 *   // Atualização real
 *   await updateAppointmentStatus(id, status);
 * };
 *
 * 3. Benefícios:
 * - UI atualiza instantaneamente
 * - Reverte automaticamente se der erro
 * - Melhor UX com feedback imediato
 */
