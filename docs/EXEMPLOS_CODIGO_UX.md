# Exemplos de Código - Nova Interface de Atendimento

Este documento contém exemplos práticos e reutilizáveis de código para implementar a nova interface.

---

## Índice

1. [Hooks Customizados](#hooks-customizados)
2. [Componentes Reutilizáveis](#componentes-reutilizáveis)
3. [Utilitários](#utilitários)
4. [Schemas de Validação](#schemas-de-validação)

---

## Hooks Customizados

### useAtendimentoAutoSave.ts

```typescript
// hooks/useAtendimentoAutoSave.ts
import { useEffect, useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { useFormContext } from 'react-hook-form';
import { useToast } from '../contexts/ToastContext';
import * as soapNoteService from '../services/soapNoteService';
import { AttendanceFormData } from '../schemas/attendanceFormValidation';

type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

export const useAtendimentoAutoSave = (patientId: string) => {
  const { watch, formState: { isDirty } } = useFormContext<AttendanceFormData>();
  const { showToast } = useToast();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  const formData = watch();
  const [debouncedFormData] = useDebounce(formData, 2000); // 2s debounce

  // Auto-save quando debounced data mudar
  useEffect(() => {
    if (!isDirty || !patientId) return;

    const performAutoSave = async () => {
      setSaveStatus('saving');

      try {
        const noteData = {
          ...(currentNoteId && { id: currentNoteId }),
          patientId,
          date: new Date().toISOString(),
          subjective: debouncedFormData.subjective,
          objective: debouncedFormData.objective,
          assessment: debouncedFormData.assessment,
          plan: debouncedFormData.plan,
          ...(debouncedFormData.painScale !== undefined && {
            painScale: debouncedFormData.painScale,
          }),
          bodyParts: debouncedFormData.painPoints.map((p) => p.part),
          metricResults: debouncedFormData.metricResults.filter(
            (m): m is { metricId: string; value: number } => !!m.metricId
          ),
        };

        const savedNote = await soapNoteService.saveNote(noteData);
        setCurrentNoteId(savedNote.id);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Erro ao salvar:', error);
        setSaveStatus('error');
        showToast('Falha no salvamento automático', 'error');
      }
    };

    performAutoSave();
  }, [debouncedFormData, isDirty, patientId, currentNoteId, showToast]);

  // Marca como não salvo quando há mudanças
  useEffect(() => {
    if (isDirty && saveStatus === 'saved') {
      setSaveStatus('unsaved');
    }
  }, [isDirty, saveStatus]);

  // Função para salvar manualmente
  const saveManually = useCallback(async () => {
    if (saveStatus === 'saving') return;
    // Trigger auto-save imediatamente
    setSaveStatus('saving');
    // ... lógica de salvamento
  }, [saveStatus]);

  // Verifica se pode finalizar
  const canFinish =
    saveStatus === 'saved' &&
    formData.subjective?.trim() &&
    formData.objective?.trim() &&
    formData.assessment?.trim() &&
    formData.plan?.trim();

  return {
    saveStatus,
    saveManually,
    canFinish,
    currentNoteId,
  };
};
```

### useAtendimentoTimer.ts

```typescript
// hooks/useAtendimentoTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export const useAtendimentoTimer = () => {
  const [duration, setDuration] = useState(0); // em segundos
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const pausedDurationRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const start = startTimeRef.current || now;
        const elapsed = Math.floor((now - start) / 1000);
        setDuration(elapsed + pausedDurationRef.current);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    pausedDurationRef.current = duration;
  }, [duration]);

  const resume = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setDuration(0);
    startTimeRef.current = null;
    pausedDurationRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    setDuration(0);
    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
  }, []);

  return {
    duration,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};
```

### useAtendimentoKeyboardShortcuts.ts

```typescript
// hooks/useAtendimentoKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface UseKeyboardShortcutsOptions {
  onSave?: () => void;
  onFinish?: () => void;
  onGenerateAI?: () => void;
  onRepeatConduct?: () => void;
  onToggleContext?: () => void;
  onSwitchTab?: (tabIndex: number) => void;
}

export const useAtendimentoKeyboardShortcuts = (
  options: UseKeyboardShortcutsOptions
) => {
  // Ctrl+S - Salvar manualmente
  useHotkeys('ctrl+s', (e) => {
    e.preventDefault();
    options.onSave?.();
  }, { enableOnFormTags: true });

  // Ctrl+Enter - Finalizar sessão
  useHotkeys('ctrl+enter', (e) => {
    e.preventDefault();
    options.onFinish?.();
  }, { enableOnFormTags: true });

  // Ctrl+G - Gerar sugestão IA
  useHotkeys('ctrl+g', (e) => {
    e.preventDefault();
    options.onGenerateAI?.();
  }, { enableOnFormTags: true });

  // Ctrl+R - Repetir conduta
  useHotkeys('ctrl+r', (e) => {
    e.preventDefault();
    options.onRepeatConduct?.();
  }, { enableOnFormTags: true });

  // Ctrl+H - Toggle painel contexto
  useHotkeys('ctrl+h', (e) => {
    e.preventDefault();
    options.onToggleContext?.();
  }, { enableOnFormTags: true });

  // Ctrl+1-4 - Trocar tabs
  useHotkeys('ctrl+1', (e) => {
    e.preventDefault();
    options.onSwitchTab?.(0); // SOAP
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+2', (e) => {
    e.preventDefault();
    options.onSwitchTab?.(1); // Métricas
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+3', (e) => {
    e.preventDefault();
    options.onSwitchTab?.(2); // IA
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+4', (e) => {
    e.preventDefault();
    options.onSwitchTab?.(3); // Anexos
  }, { enableOnFormTags: true });

  // Log de atalhos disponíveis (dev mode)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Atalhos de teclado disponíveis:');
      console.log('  Ctrl+S: Salvar manualmente');
      console.log('  Ctrl+Enter: Finalizar sessão');
      console.log('  Ctrl+G: Gerar sugestão IA');
      console.log('  Ctrl+R: Repetir conduta');
      console.log('  Ctrl+H: Toggle painel contexto');
      console.log('  Ctrl+1-4: Trocar tabs');
    }
  }, []);
};
```

### useAtendimentoValidation.ts

```typescript
// hooks/useAtendimentoValidation.ts
import { useFormContext } from 'react-hook-form';
import { useMemo } from 'react';
import { AttendanceFormData } from '../schemas/attendanceFormValidation';

export const useAtendimentoValidation = () => {
  const { watch, formState: { errors } } = useFormContext<AttendanceFormData>();
  const formData = watch();

  // Calcula progresso de preenchimento
  const progress = useMemo(() => {
    const fields = [
      { name: 'subjective', weight: 25 },
      { name: 'objective', weight: 25 },
      { name: 'assessment', weight: 25 },
      { name: 'plan', weight: 25 },
    ];

    let totalProgress = 0;

    fields.forEach((field) => {
      const value = formData[field.name as keyof AttendanceFormData];
      if (typeof value === 'string' && value.trim().length >= 10) {
        totalProgress += field.weight;
      }
    });

    return totalProgress;
  }, [formData]);

  // Lista campos obrigatórios pendentes
  const pendingFields = useMemo(() => {
    const pending: string[] = [];

    if (!formData.subjective?.trim() || formData.subjective.length < 10) {
      pending.push('Subjetivo');
    }
    if (!formData.objective?.trim() || formData.objective.length < 10) {
      pending.push('Objetivo');
    }
    if (!formData.assessment?.trim() || formData.assessment.length < 10) {
      pending.push('Avaliação');
    }
    if (!formData.plan?.trim() || formData.plan.length < 10) {
      pending.push('Plano');
    }

    return pending;
  }, [formData]);

  // Verifica se formulário está pronto para finalizar
  const isReadyToFinish = useMemo(() => {
    return pendingFields.length === 0;
  }, [pendingFields]);

  // Conta erros por campo
  const errorCount = useMemo(() => {
    return Object.keys(errors).length;
  }, [errors]);

  return {
    progress,
    pendingFields,
    isReadyToFinish,
    errorCount,
    errors,
  };
};
```

---

## Componentes Reutilizáveis

### AutoExpandTextarea.tsx

```typescript
// components/ui/AutoExpandTextarea.tsx
import React, { useEffect, useRef, forwardRef } from 'react';

interface AutoExpandTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: string;
  maxHeight?: string;
}

export const AutoExpandTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoExpandTextareaProps
>(({ minHeight = '100px', maxHeight = '500px', ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Combina refs (interno + forwarded)
  const setRefs = (element: HTMLTextAreaElement | null) => {
    textareaRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  // Auto-expand quando conteúdo mudar
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto'; // Reset para calcular scrollHeight
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, parseInt(minHeight)),
        parseInt(maxHeight)
      );
      textarea.style.height = `${newHeight}px`;
    };

    adjustHeight();

    // Observer para mudanças no conteúdo
    const observer = new MutationObserver(adjustHeight);
    observer.observe(textarea, { characterData: true, subtree: true });

    return () => observer.disconnect();
  }, [minHeight, maxHeight, props.value]);

  return (
    <textarea
      ref={setRefs}
      style={{
        minHeight,
        maxHeight,
        resize: 'none',
        overflow: 'auto',
      }}
      {...props}
    />
  );
});

AutoExpandTextarea.displayName = 'AutoExpandTextarea';
```

### ProgressBar.tsx

```typescript
// components/ui/ProgressBar.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = true,
  className = '',
  variant = 'default',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-xs font-medium text-slate-700">
            Progresso
          </span>
        )}
        <span className="text-xs font-bold text-slate-900">
          {clampedValue}%
        </span>
      </div>

      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${variantClasses[variant]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
```

### CollapsiblePanel.tsx

```typescript
// components/ui/CollapsiblePanel.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsiblePanelProps {
  children: React.ReactNode;
  title?: string;
  defaultCollapsed?: boolean;
  position?: 'left' | 'right';
  width?: string;
  onToggle?: (isCollapsed: boolean) => void;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  children,
  title,
  defaultCollapsed = false,
  position = 'right',
  width = '280px',
  onToggle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };

  const Icon = position === 'left' ? ChevronRight : ChevronLeft;
  const collapsedIcon = position === 'left' ? ChevronLeft : ChevronRight;

  return (
    <AnimatePresence mode="wait">
      {isCollapsed ? (
        // Estado Colapsado
        <motion.div
          key="collapsed"
          initial={{ width: 0 }}
          animate={{ width: '40px' }}
          exit={{ width: 0 }}
          className="flex-shrink-0 bg-white border-l border-slate-200"
        >
          <button
            onClick={handleToggle}
            className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            aria-label="Expandir painel"
          >
            <Icon className="w-5 h-5 text-slate-600" />
            {title && (
              <span className="text-xs font-medium text-slate-600 [writing-mode:vertical-lr] rotate-180">
                {title}
              </span>
            )}
          </button>
        </motion.div>
      ) : (
        // Estado Expandido
        <motion.div
          key="expanded"
          initial={{ width: 0 }}
          animate={{ width }}
          exit={{ width: 0 }}
          className="flex-shrink-0 bg-white border-l border-slate-200 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header do Painel */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <button
                onClick={handleToggle}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                aria-label="Colapsar painel"
              >
                <collapsedIcon className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Conteúdo do Painel */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### TabsWrapper.tsx (Radix UI + Animações)

```typescript
// components/atendimento/TabsWrapper.tsx
import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsWrapperProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const TabsWrapper: React.FC<TabsWrapperProps> = ({
  tabs,
  defaultTab,
  onTabChange,
}) => {
  return (
    <Tabs.Root
      defaultValue={defaultTab || tabs[0].id}
      onValueChange={onTabChange}
    >
      {/* Tab List */}
      <Tabs.List className="flex gap-2 border-b border-slate-200 mb-6">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg transition-colors data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab Content */}
      {tabs.map((tab) => (
        <Tabs.Content key={tab.id} value={tab.id} asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab.content}
          </motion.div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
```

---

## Utilitários

### formatDuration.ts

```typescript
// utils/formatDuration.ts

/**
 * Formata duração em segundos para HH:MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
};

/**
 * Formata duração em formato legível (ex: "45 min", "1h 30min")
 */
export const formatDurationHuman = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  return `${minutes} min`;
};
```

### calculateProgress.ts

```typescript
// utils/calculateProgress.ts
import { AttendanceFormData } from '../schemas/attendanceFormValidation';

/**
 * Calcula progresso de preenchimento do formulário (0-100)
 */
export const calculateFormProgress = (
  formData: Partial<AttendanceFormData>
): number => {
  const fields = [
    { name: 'subjective', weight: 25, minLength: 10 },
    { name: 'objective', weight: 25, minLength: 10 },
    { name: 'assessment', weight: 25, minLength: 10 },
    { name: 'plan', weight: 25, minLength: 10 },
  ];

  let totalProgress = 0;

  fields.forEach((field) => {
    const value = formData[field.name as keyof AttendanceFormData];
    if (typeof value === 'string' && value.trim().length >= field.minLength) {
      totalProgress += field.weight;
    }
  });

  return totalProgress;
};

/**
 * Retorna lista de campos pendentes
 */
export const getPendingFields = (
  formData: Partial<AttendanceFormData>
): string[] => {
  const fields = [
    { name: 'subjective', label: 'Subjetivo', minLength: 10 },
    { name: 'objective', label: 'Objetivo', minLength: 10 },
    { name: 'assessment', label: 'Avaliação', minLength: 10 },
    { name: 'plan', label: 'Plano', minLength: 10 },
  ];

  return fields
    .filter((field) => {
      const value = formData[field.name as keyof AttendanceFormData];
      return !value || typeof value !== 'string' || value.trim().length < field.minLength;
    })
    .map((field) => field.label);
};
```

### cn.ts (ClassNames utility - já existe no projeto)

```typescript
// utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classNames com merge de Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Schemas de Validação

### attendanceSchemaV2.ts

```typescript
// schemas/attendanceSchemaV2.ts
import { z } from 'zod';

// Schema para ponto de dor
export const painPointSchema = z.object({
  part: z.string().min(1, 'Região é obrigatória'),
  observation: z.string().optional(),
});

// Schema para resultado de métrica
export const metricResultSchema = z.object({
  metricId: z.string().min(1, 'ID da métrica é obrigatório'),
  value: z.number().min(0, 'Valor deve ser positivo'),
});

// Schema principal do formulário
export const attendanceFormSchema = z.object({
  // Campos SOAP
  subjective: z
    .string()
    .min(10, 'Subjetivo deve ter pelo menos 10 caracteres')
    .max(5000, 'Subjetivo deve ter no máximo 5000 caracteres'),

  objective: z
    .string()
    .min(10, 'Objetivo deve ter pelo menos 10 caracteres')
    .max(5000, 'Objetivo deve ter no máximo 5000 caracteres'),

  assessment: z
    .string()
    .min(10, 'Avaliação deve ter pelo menos 10 caracteres')
    .max(5000, 'Avaliação deve ter no máximo 5000 caracteres'),

  plan: z
    .string()
    .min(10, 'Plano deve ter pelo menos 10 caracteres')
    .max(5000, 'Plano deve ter no máximo 5000 caracteres'),

  // Campos opcionais
  painScale: z.number().min(0).max(10).optional(),
  painPoints: z.array(painPointSchema).default([]),
  metricResults: z.array(metricResultSchema).default([]),
  attachments: z.array(z.instanceof(File)).default([]),
});

// Tipo derivado do schema
export type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

// Valores padrão
export const defaultFormValues: AttendanceFormData = {
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
  painScale: undefined,
  painPoints: [],
  metricResults: [],
  attachments: [],
};
```

---

## Exemplo Completo: Página Principal

```typescript
// pages/AtendimentoPageV2.tsx
import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, BarChart3, BrainCircuit, Paperclip } from 'lucide-react';

import { AtendimentoLayout } from '../components/atendimento/layout/AtendimentoLayout';
import { TabsWrapper } from '../components/atendimento/TabsWrapper';
import { SoapTab } from '../components/atendimento/tabs/SoapTab';
import { MetricsTab } from '../components/atendimento/tabs/MetricsTab';
import { AITab } from '../components/atendimento/tabs/AITab';
import { AttachmentsTab } from '../components/atendimento/tabs/AttachmentsTab';

import { usePageData } from '../hooks/usePageData';
import { useToast } from '../contexts/ToastContext';
import { useAtendimentoAutoSave } from '../hooks/useAtendimentoAutoSave';
import { useAtendimentoKeyboardShortcuts } from '../hooks/useAtendimentoKeyboardShortcuts';

import {
  attendanceFormSchema,
  defaultFormValues,
  type AttendanceFormData,
} from '../schemas/attendanceSchemaV2';

import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';

import PageLoader from '../components/ui/PageLoader';

const AtendimentoPageV2: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Estado
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState('soap');

  // Form
  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    mode: 'onBlur',
    defaultValues: defaultFormValues,
  });

  // Hooks customizados
  const { saveStatus, canFinish, saveManually } = useAtendimentoAutoSave(
    patient?.id || ''
  );

  // Carregar dados
  const fetchData = useCallback(async () => {
    if (!appointmentId) return;

    const appointments = await appointmentService.getAppointments();
    const apt = appointments.find((a) => a.id === appointmentId);

    if (!apt) throw new Error('Agendamento não encontrado');

    setAppointment(apt);

    const pat = await patientService.getPatientById(apt.patientId);
    if (!pat) throw new Error('Paciente não encontrado');

    setPatient(pat);
  }, [appointmentId]);

  const { isLoading, error } = usePageData([fetchData], [appointmentId]);

  // Handlers
  const handleFinishSession = useCallback(async () => {
    if (!canFinish || !appointment || !patient) {
      showToast('Aguarde o salvamento antes de finalizar', 'warning');
      return;
    }

    try {
      await appointmentService.saveAppointment({
        ...appointment,
        status: 'completed' as AppointmentStatus,
      });

      showToast('Sessão finalizada com sucesso!', 'success');
      navigate(`/patients/${patient.id}`);
    } catch (err) {
      showToast('Erro ao finalizar sessão', 'error');
    }
  }, [canFinish, appointment, patient, navigate, showToast]);

  const handleGenerateAI = useCallback(() => {
    setActiveTab('ai');
  }, []);

  const handleRepeatConduct = useCallback(() => {
    // TODO: Implementar lógica de repetir conduta
    showToast('Funcionalidade em desenvolvimento', 'info');
  }, [showToast]);

  // Atalhos de teclado
  useAtendimentoKeyboardShortcuts({
    onSave: saveManually,
    onFinish: handleFinishSession,
    onGenerateAI: handleGenerateAI,
    onRepeatConduct: handleRepeatConduct,
    onSwitchTab: (index) => {
      const tabs = ['soap', 'metrics', 'ai', 'attachments'];
      setActiveTab(tabs[index]);
    },
  });

  // Loading
  if (isLoading) {
    return <PageLoader />;
  }

  // Error
  if (error || !patient || !appointment) {
    return (
      <div className="text-center p-10 text-red-500">
        {error?.message || 'Erro ao carregar dados'}
      </div>
    );
  }

  // Tabs
  const tabs = [
    {
      id: 'soap',
      label: 'SOAP',
      icon: <FileText className="w-4 h-4" />,
      content: <SoapTab />,
    },
    {
      id: 'metrics',
      label: 'Métricas',
      icon: <BarChart3 className="w-4 h-4" />,
      content: <MetricsTab />,
    },
    {
      id: 'ai',
      label: 'IA',
      icon: <BrainCircuit className="w-4 h-4" />,
      content: <AITab />,
    },
    {
      id: 'attachments',
      label: 'Anexos',
      icon: <Paperclip className="w-4 h-4" />,
      content: <AttachmentsTab />,
    },
  ];

  return (
    <FormProvider {...form}>
      <AtendimentoLayout
        patient={patient}
        appointment={appointment}
        onFinish={handleFinishSession}
      >
        <TabsWrapper
          tabs={tabs}
          defaultTab={activeTab}
          onTabChange={setActiveTab}
        />
      </AtendimentoLayout>
    </FormProvider>
  );
};

export default AtendimentoPageV2;
```

---

## Conclusão

Estes exemplos fornecem uma base sólida para implementar a nova interface. Todos os componentes são:

✅ **Type-safe**: TypeScript completo
✅ **Reutilizáveis**: Separados em módulos independentes
✅ **Testáveis**: Lógica isolada em hooks
✅ **Acessíveis**: ARIA labels e navegação por teclado
✅ **Performáticos**: Memoization e lazy loading

Use-os como referência e adapte conforme necessário para o seu projeto!
