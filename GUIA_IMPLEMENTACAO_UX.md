# Guia de Implementação - Nova Página de Atendimento

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Componentes Base](#componentes-base)
4. [Implementação por Fase](#implementação-por-fase)
5. [Checklist de Qualidade](#checklist-de-qualidade)
6. [Testes](#testes)

---

## Pré-requisitos

### Dependências Necessárias

```bash
# Já instaladas no projeto
npm install react-hook-form zod @hookform/resolvers/zod
npm install framer-motion
npm install lucide-react

# A instalar
npm install @radix-ui/react-tabs
npm install @radix-ui/react-collapsible
npm install @radix-ui/react-tooltip
npm install zustand # Para gerenciamento de estado global (opcional)
npm install react-hotkeys-hook # Para atalhos de teclado
```

### Stack Atual do Projeto

✅ React 19
✅ TypeScript
✅ Vite
✅ Tailwind CSS
✅ React Hook Form + Zod
✅ Framer Motion

---

## Estrutura de Arquivos

### Nova Estrutura Proposta

```
src/
├── pages/
│   └── AtendimentoPageV2.tsx              # Nova página principal
│
├── components/
│   ├── atendimento/                       # Novo diretório
│   │   ├── layout/
│   │   │   ├── AtendimentoLayout.tsx      # Layout 3 painéis
│   │   │   ├── AtendimentoHeader.tsx      # Header fixo
│   │   │   ├── AtendimentoSidebar.tsx     # Sidebar esquerda
│   │   │   └── AtendimentoContextPanel.tsx # Painel direito
│   │   │
│   │   ├── tabs/
│   │   │   ├── SoapTab.tsx                # Tab formulário SOAP
│   │   │   ├── MetricsTab.tsx             # Tab métricas & dor
│   │   │   ├── AITab.tsx                  # Tab assistente IA
│   │   │   └── AttachmentsTab.tsx         # Tab anexos
│   │   │
│   │   ├── soap/
│   │   │   ├── SoapField.tsx              # Campo SOAP individual
│   │   │   ├── SoapProgress.tsx           # Barra de progresso
│   │   │   └── SoapValidation.tsx         # Mensagens de validação
│   │   │
│   │   ├── metrics/
│   │   │   ├── PainScaleVisual.tsx        # Escala de dor visual
│   │   │   ├── BodyMapInteractive.tsx     # Mapa corporal
│   │   │   └── MetricsTable.tsx           # Tabela de métricas
│   │   │
│   │   ├── ai/
│   │   │   ├── AISuggestion.tsx           # Card de sugestão IA
│   │   │   ├── RiskAnalysis.tsx           # Análise de risco
│   │   │   └── EvidenceReferences.tsx     # Referências científicas
│   │   │
│   │   └── context/
│   │       ├── SessionHistoryCard.tsx     # Card histórico
│   │       ├── TreatmentPlanCard.tsx      # Card plano
│   │       └── ExercisesCard.tsx          # Card exercícios
│   │
│   └── ui/
│       ├── StatusBadge.tsx                # Badge de status (salvo, erro, etc)
│       ├── ProgressBar.tsx                # Barra de progresso genérica
│       └── AutoExpandTextarea.tsx         # Textarea auto-expansível
│
├── hooks/
│   ├── useAtendimentoAutoSave.ts          # Hook de auto-save otimizado
│   ├── useAtendimentoKeyboardShortcuts.ts # Hook de atalhos
│   ├── useAtendimentoValidation.ts        # Hook de validação
│   └── useAtendimentoTimer.ts             # Hook de timer de sessão
│
├── stores/
│   └── atendimentoStore.ts                # Zustand store (opcional)
│
└── schemas/
    └── atendimentoSchemaV2.ts             # Schemas Zod atualizados
```

---

## Componentes Base

### 1. AtendimentoLayout.tsx

```typescript
// components/atendimento/layout/AtendimentoLayout.tsx
import React, { useState } from 'react';
import { AtendimentoHeader } from './AtendimentoHeader';
import { AtendimentoSidebar } from './AtendimentoSidebar';
import { AtendimentoContextPanel } from './AtendimentoContextPanel';

interface AtendimentoLayoutProps {
  children: React.ReactNode;
  patient: Patient;
  appointment: Appointment;
  onFinish: () => void;
}

export const AtendimentoLayout: React.FC<AtendimentoLayoutProps> = ({
  children,
  patient,
  appointment,
  onFinish,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header Fixo */}
      <AtendimentoHeader
        patient={patient}
        appointment={appointment}
        onFinish={onFinish}
      />

      {/* Área Principal - 3 Painéis */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Esquerda */}
        <AtendimentoSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Área Central (Tabs) */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Painel Contexto Direita */}
        <AtendimentoContextPanel
          patient={patient}
          isCollapsed={isContextCollapsed}
          onToggleCollapse={() => setIsContextCollapsed(!isContextCollapsed)}
        />
      </div>
    </div>
  );
};
```

### 2. AtendimentoHeader.tsx

```typescript
// components/atendimento/layout/AtendimentoHeader.tsx
import React from 'react';
import { ArrowLeft, Play, Pause, Square, Save } from 'lucide-react';
import { StatusBadge } from '../../ui/StatusBadge';
import { useAtendimentoTimer } from '../../../hooks/useAtendimentoTimer';
import { useAtendimentoAutoSave } from '../../../hooks/useAtendimentoAutoSave';

interface AtendimentoHeaderProps {
  patient: Patient;
  appointment: Appointment;
  onFinish: () => void;
}

export const AtendimentoHeader: React.FC<AtendimentoHeaderProps> = ({
  patient,
  appointment,
  onFinish,
}) => {
  const {
    duration,
    isActive,
    start,
    pause,
    stop
  } = useAtendimentoTimer();

  const { saveStatus, canFinish } = useAtendimentoAutoSave();

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Esquerda: Voltar + Info Paciente */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {patient.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{patient.name}</h1>
              <p className="text-sm text-slate-600">
                {new Date(appointment.date).toLocaleDateString('pt-BR')} às{' '}
                {appointment.time}
              </p>
            </div>
          </div>
        </div>

        {/* Centro: Timer + Controles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-mono text-sm font-medium text-slate-700">
              {formatDuration(duration)}
            </span>
            {isActive && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>

          {!isActive ? (
            <button
              onClick={start}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={pause}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Direita: Status + Finalizar */}
        <div className="flex items-center gap-3">
          <StatusBadge status={saveStatus} />

          <button
            onClick={onFinish}
            disabled={!canFinish || saveStatus === 'saving'}
            className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-sm transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Finalizar Sessão
          </button>
        </div>
      </div>
    </header>
  );
};
```

### 3. SoapTab.tsx (Tab Principal)

```typescript
// components/atendimento/tabs/SoapTab.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { MessageSquare, Stethoscope, ClipboardCheck, ClipboardList, BrainCircuit } from 'lucide-react';
import { SoapField } from '../soap/SoapField';
import { SoapProgress } from '../soap/SoapProgress';
import { AttendanceFormData } from '../../../schemas/attendanceFormValidation';

export const SoapTab: React.FC = () => {
  const { watch, formState: { errors } } = useFormContext<AttendanceFormData>();
  const formData = watch();

  const [isAiLoading, setIsAiLoading] = React.useState(false);

  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    // Lógica de IA aqui
    setIsAiLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header da Tab */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          Registro SOAP da Sessão
        </h2>
        <SoapProgress formData={formData} />
      </div>

      {/* Campos SOAP - Layout Vertical */}
      <div className="space-y-6 bg-white rounded-xl p-6 border border-slate-200">
        {/* Subjetivo */}
        <SoapField
          name="subjective"
          label="S - Subjetivo"
          icon={MessageSquare}
          iconColor="text-blue-600"
          placeholder="Queixas e sintomas relatados pelo paciente..."
          required
          error={errors.subjective}
        />

        {/* Objetivo */}
        <SoapField
          name="objective"
          label="O - Objetivo"
          icon={Stethoscope}
          iconColor="text-green-600"
          placeholder="Observações clínicas, testes realizados, medições..."
          required
          error={errors.objective}
        />

        {/* Botão IA - Entre S/O e A/P */}
        <div className="flex justify-center py-4">
          <button
            onClick={handleGenerateAI}
            disabled={isAiLoading || (!formData.subjective?.trim() && !formData.objective?.trim())}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all"
          >
            <BrainCircuit className="w-5 h-5" />
            {isAiLoading ? 'IA gerando sugestões...' : '✨ Gerar Avaliação e Plano com IA'}
          </button>
        </div>

        {/* Avaliação */}
        <SoapField
          name="assessment"
          label="A - Avaliação"
          icon={ClipboardCheck}
          iconColor="text-purple-600"
          placeholder="Análise e interpretação clínica dos achados..."
          required
          error={errors.assessment}
        />

        {/* Plano */}
        <SoapField
          name="plan"
          label="P - Plano"
          icon={ClipboardList}
          iconColor="text-orange-600"
          placeholder="Conduta e intervenções realizadas, próximos passos..."
          required
          error={errors.plan}
        />
      </div>
    </div>
  );
};
```

### 4. SoapField.tsx (Campo Reutilizável)

```typescript
// components/atendimento/soap/SoapField.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { LucideIcon, AlertCircle } from 'lucide-react';
import { AutoExpandTextarea } from '../../ui/AutoExpandTextarea';

interface SoapFieldProps {
  name: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  placeholder: string;
  required?: boolean;
  error?: any;
  maxLength?: number;
}

export const SoapField: React.FC<SoapFieldProps> = ({
  name,
  label,
  icon: Icon,
  iconColor,
  placeholder,
  required = false,
  error,
  maxLength = 5000,
}) => {
  const { register, watch } = useFormContext();
  const value = watch(name) || '';

  const charCount = value.length;
  const charCountColor =
    charCount < 10 ? 'text-red-500' :
    charCount > maxLength * 0.9 ? 'text-amber-600' :
    'text-slate-500';

  return (
    <div className="space-y-2">
      {/* Label + Contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <label className="text-base font-bold text-slate-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        <span className={`text-xs ${charCountColor}`}>
          {charCount}/{maxLength}
        </span>
      </div>

      {/* Textarea */}
      <AutoExpandTextarea
        {...register(name)}
        placeholder={placeholder}
        minHeight="120px"
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
      />

      {/* Mensagem de Erro */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message}
        </p>
      )}
    </div>
  );
};
```

### 5. StatusBadge.tsx (Badge de Status)

```typescript
// components/ui/StatusBadge.tsx
import React from 'react';
import { CheckCircle, Loader, AlertCircle, AlertTriangle } from 'lucide-react';

type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

interface StatusBadgeProps {
  status: SaveStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    saved: {
      icon: CheckCircle,
      text: 'Salvo',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    saving: {
      icon: Loader,
      text: 'Salvando...',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      animate: true,
    },
    error: {
      icon: AlertCircle,
      text: 'Erro',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    unsaved: {
      icon: AlertTriangle,
      text: 'Não salvo',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${config.className}`}>
      <Icon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
      <span>{config.text}</span>
    </div>
  );
};
```

---

## Implementação por Fase

### Fase 1: Fundação (Semana 1-2)

#### Objetivos
- Criar estrutura base do layout 3 painéis
- Implementar header fixo
- Sistema de tabs básico
- Migrar formulário SOAP

#### Tarefas

**Semana 1**:
- [ ] Criar `AtendimentoLayout.tsx`
- [ ] Criar `AtendimentoHeader.tsx`
- [ ] Criar `AtendimentoSidebar.tsx` (básico, sem funcionalidades)
- [ ] Criar `AtendimentoContextPanel.tsx` (básico, sem funcionalidades)
- [ ] Configurar Radix UI Tabs
- [ ] Criar `SoapTab.tsx`
- [ ] Criar `SoapField.tsx`

**Semana 2**:
- [ ] Criar `AutoExpandTextarea.tsx`
- [ ] Implementar `useAtendimentoTimer.ts`
- [ ] Implementar `StatusBadge.tsx`
- [ ] Integrar React Hook Form com layout
- [ ] Migrar validações Zod para novo schema
- [ ] Testes básicos de navegação

**Entregável**: Layout funcionando com formulário SOAP básico

---

### Fase 2: Funcionalidades Core (Semana 3-4)

#### Objetivos
- Implementar sidebar com ações rápidas
- Implementar painel de contexto
- Auto-save otimizado
- Validações e feedback visual

#### Tarefas

**Semana 3**:
- [ ] Implementar `useAtendimentoAutoSave.ts`
- [ ] Criar `SoapProgress.tsx` (barra de progresso)
- [ ] Criar `SoapValidation.tsx` (mensagens de validação)
- [ ] Implementar ações rápidas na sidebar:
  - [ ] Repetir conduta
  - [ ] Tirar foto
  - [ ] Adicionar anexo
- [ ] Criar `SessionHistoryCard.tsx`
- [ ] Criar `TreatmentPlanCard.tsx`

**Semana 4**:
- [ ] Implementar lógica de repetir conduta
- [ ] Implementar toggle collapse de painéis
- [ ] Criar `ProgressBar.tsx` genérico
- [ ] Adicionar feedback visual completo (toasts, badges)
- [ ] Implementar salvamento incremental
- [ ] Testes de usabilidade básicos

**Entregável**: Interface completa sem IA

---

### Fase 3: Inteligência (Semana 5-6)

#### Objetivos
- Tab de IA com sugestões
- Tab de métricas e dor
- Alertas inteligentes
- Repetição de conduta otimizada

#### Tarefas

**Semana 5**:
- [ ] Criar `AITab.tsx`
- [ ] Criar `AISuggestion.tsx`
- [ ] Criar `RiskAnalysis.tsx`
- [ ] Criar `EvidenceReferences.tsx`
- [ ] Integrar com `aiOrchestratorService`
- [ ] Implementar lógica de aplicar/editar/descartar sugestões

**Semana 6**:
- [ ] Criar `MetricsTab.tsx`
- [ ] Criar `PainScaleVisual.tsx`
- [ ] Criar `BodyMapInteractive.tsx`
- [ ] Criar `MetricsTable.tsx` com comparação automática
- [ ] Implementar alertas de testes obrigatórios
- [ ] Testes de integração IA

**Entregável**: Sistema completo com IA

---

### Fase 4: Polimento (Semana 7-8)

#### Objetivos
- Animações e transições
- Atalhos de teclado
- Responsividade completa
- Testes de usabilidade

#### Tarefas

**Semana 7**:
- [ ] Implementar `useAtendimentoKeyboardShortcuts.ts`
- [ ] Adicionar animações com Framer Motion:
  - [ ] Transições de tabs
  - [ ] Collapse/expand de painéis
  - [ ] Feedback de ações
- [ ] Criar `AttachmentsTab.tsx`
- [ ] Implementar upload de arquivos
- [ ] Implementar captura de foto/vídeo/áudio

**Semana 8**:
- [ ] Implementar responsividade mobile
- [ ] Implementar responsividade tablet
- [ ] Realizar testes de usabilidade com fisioterapeutas
- [ ] Coletar feedback e iterar
- [ ] Otimizações de performance
- [ ] Documentação final

**Entregável**: Produto pronto para produção

---

## Checklist de Qualidade

### Performance

- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Code splitting implementado
- [ ] Lazy loading de tabs
- [ ] Debounce de auto-save configurado
- [ ] Virtual scrolling em listas longas

### Acessibilidade

- [ ] Contraste mínimo 4.5:1
- [ ] Navegação completa por teclado
- [ ] ARIA labels em todos os elementos interativos
- [ ] Focus visible claro
- [ ] Screen reader testado
- [ ] Heading hierarchy correta (H1 → H2 → H3)

### Funcionalidade

- [ ] Auto-save funcionando corretamente
- [ ] Validações em tempo real
- [ ] Mensagens de erro claras
- [ ] Timer de sessão preciso
- [ ] Repetição de conduta testada
- [ ] IA retornando sugestões válidas
- [ ] Upload de arquivos funcionando
- [ ] Métricas calculando corretamente

### UX/UI

- [ ] Layout responsivo em todos os breakpoints
- [ ] Animações suaves (não jarring)
- [ ] Feedback visual em todas as ações
- [ ] Estados de loading claros
- [ ] Mensagens de erro contextuais
- [ ] Tooltips informativos
- [ ] Atalhos de teclado documentados

---

## Testes

### Testes Unitários

```typescript
// __tests__/components/SoapField.test.tsx
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { SoapField } from '../components/atendimento/soap/SoapField';
import { MessageSquare } from 'lucide-react';

describe('SoapField', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm();
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  it('renderiza label corretamente', () => {
    render(
      <Wrapper>
        <SoapField
          name="subjective"
          label="S - Subjetivo"
          icon={MessageSquare}
          iconColor="text-blue-600"
          placeholder="Placeholder"
          required
        />
      </Wrapper>
    );

    expect(screen.getByText('S - Subjetivo')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('mostra contador de caracteres', () => {
    render(
      <Wrapper>
        <SoapField
          name="subjective"
          label="S - Subjetivo"
          icon={MessageSquare}
          iconColor="text-blue-600"
          placeholder="Placeholder"
          maxLength={5000}
        />
      </Wrapper>
    );

    expect(screen.getByText('0/5000')).toBeInTheDocument();
  });

  it('mostra mensagem de erro quando presente', () => {
    const error = { message: 'Campo obrigatório' };

    render(
      <Wrapper>
        <SoapField
          name="subjective"
          label="S - Subjetivo"
          icon={MessageSquare}
          iconColor="text-blue-600"
          placeholder="Placeholder"
          error={error}
        />
      </Wrapper>
    );

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });
});
```

### Testes de Integração

```typescript
// __tests__/integration/atendimento.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtendimentoPageV2 } from '../pages/AtendimentoPageV2';

describe('Fluxo Completo de Atendimento', () => {
  it('permite preencher formulário SOAP e finalizar sessão', async () => {
    const user = userEvent.setup();

    render(<AtendimentoPageV2 />);

    // Preencher Subjetivo
    const subjectiveField = screen.getByPlaceholderText(/queixas e sintomas/i);
    await user.type(subjectiveField, 'Paciente relata dor no joelho');

    // Preencher Objetivo
    const objectiveField = screen.getByPlaceholderText(/observações clínicas/i);
    await user.type(objectiveField, 'ROM joelho: 0-110°');

    // Preencher Avaliação
    const assessmentField = screen.getByPlaceholderText(/análise e interpretação/i);
    await user.type(assessmentField, 'Evolução positiva');

    // Preencher Plano
    const planField = screen.getByPlaceholderText(/conduta e intervenções/i);
    await user.type(planField, 'Mobilização patelar');

    // Aguardar auto-save
    await waitFor(() => {
      expect(screen.getByText('Salvo')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Finalizar sessão
    const finishButton = screen.getByText('Finalizar Sessão');
    expect(finishButton).not.toBeDisabled();

    await user.click(finishButton);

    // Verificar redirecionamento ou mensagem de sucesso
    await waitFor(() => {
      expect(screen.getByText(/sessão finalizada/i)).toBeInTheDocument();
    });
  });
});
```

### Testes E2E (Playwright)

```typescript
// tests/e2e/atendimento.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Página de Atendimento V2', () => {
  test('fluxo completo de registro de sessão', async ({ page }) => {
    // Navegar para página de atendimento
    await page.goto('/atendimento/123');

    // Verificar header
    await expect(page.locator('header')).toContainText('RAFAEL MINATTO');

    // Iniciar timer
    await page.click('button[aria-label="Iniciar sessão"]');
    await expect(page.locator('text=00:00:')).toBeVisible();

    // Preencher SOAP
    await page.fill('textarea[name="subjective"]', 'Paciente relata dor no joelho direito');
    await page.fill('textarea[name="objective"]', 'ROM joelho: 0-110°, edema leve');

    // Gerar sugestão IA
    await page.click('button:has-text("Gerar Avaliação e Plano com IA")');
    await expect(page.locator('text=IA gerando sugestões')).toBeVisible();

    // Aguardar resposta IA (mock)
    await page.waitForSelector('button:has-text("Aplicar")');
    await page.click('button:has-text("Aplicar")');

    // Verificar campos preenchidos pela IA
    await expect(page.locator('textarea[name="assessment"]')).not.toHaveValue('');
    await expect(page.locator('textarea[name="plan"]')).not.toHaveValue('');

    // Aguardar auto-save
    await expect(page.locator('text=Salvo')).toBeVisible({ timeout: 5000 });

    // Trocar para tab de métricas
    await page.click('button:has-text("Métricas")');
    await expect(page.locator('text=Escala de Dor')).toBeVisible();

    // Selecionar dor
    await page.click('button[aria-label="Dor 5"]');

    // Voltar para SOAP
    await page.click('button:has-text("SOAP")');

    // Finalizar sessão
    await page.click('button:has-text("Finalizar Sessão")');

    // Verificar redirecionamento
    await expect(page).toHaveURL(/\/patients\/\d+/);
  });

  test('atalhos de teclado funcionam', async ({ page }) => {
    await page.goto('/atendimento/123');

    // Ctrl+1 para ir para SOAP
    await page.keyboard.press('Control+1');
    await expect(page.locator('text=Registro SOAP')).toBeVisible();

    // Ctrl+2 para ir para Métricas
    await page.keyboard.press('Control+2');
    await expect(page.locator('text=Escala de Dor')).toBeVisible();

    // Ctrl+3 para ir para IA
    await page.keyboard.press('Control+3');
    await expect(page.locator('text=Assistente IA')).toBeVisible();

    // Ctrl+H para toggle contexto
    await page.keyboard.press('Control+H');
    await expect(page.locator('[aria-label="Painel de contexto"]')).toBeHidden();
  });
});
```

---

## Dicas de Implementação

### 1. Comece Simples

Não tente implementar tudo de uma vez. Siga as fases:
1. Layout básico
2. Formulário funcionando
3. Auto-save
4. IA
5. Polimentos

### 2. Use Componentes Existentes

Aproveite componentes já criados no projeto:
- `PainScale` para escala de dor
- `InteractiveBodyMap` para mapa corporal
- `SimpleSoapEditor` para textareas
- `InfoCard` para cards

### 3. Mantenha Estado Próximo ao Uso

Use React Hook Form para estado do formulário, não Redux/Zustand, a menos que precise compartilhar entre muitas páginas.

### 4. Teste Incrementalmente

Não espere tudo pronto para testar. Teste cada componente conforme implementa.

### 5. Documentação Inline

Adicione comentários claros no código:

```typescript
// ✅ BOM: Comentário explica o "porquê"
// Debounce de 2s para evitar salvamentos excessivos durante digitação
const [debouncedFormData] = useDebounce(formData, 2000);

// ❌ RUIM: Comentário repete o código
// Set debounced form data to form data with 2000ms delay
const [debouncedFormData] = useDebounce(formData, 2000);
```

---

## Recursos Úteis

### Documentação
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)

### Ferramentas
- [Playwright](https://playwright.dev/) - Testes E2E
- [Testing Library](https://testing-library.com/) - Testes de componentes
- [Storybook](https://storybook.js.org/) - Documentação visual de componentes

---

## Conclusão

Este guia fornece um caminho claro para implementar a nova interface de atendimento. Siga as fases, teste incrementalmente e colete feedback de usuários reais o mais cedo possível.

**Próximos Passos**:
1. Revisar este guia com a equipe
2. Estimar tempo necessário
3. Começar pela Fase 1
4. Iterar baseado em feedback

Boa implementação! 🚀
