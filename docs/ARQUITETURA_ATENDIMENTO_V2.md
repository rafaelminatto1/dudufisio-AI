# 🏗️ Arquitetura da Página de Atendimento V2

## 📐 Visão Geral da Estrutura

```
┌──────────────────────────────────────────────────────────────────┐
│                     AtendimentoPageV2.tsx                        │
│                   (Orquestrador Principal)                       │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │    FormProvider         │
                │  (React Hook Form)      │
                └────────────┬────────────┘
                             │
                ┌────────────┴────────────┐
                │  AtendimentoLayout      │
                │  (Container Principal)  │
                └────────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
  ┌─────────┐      ┌──────────────┐      ┌──────────────┐
  │ Sidebar │      │ Main Content │      │   Context    │
  │  Left   │      │   (Tabs)     │      │    Panel     │
  │ (240px) │      │   (Fluid)    │      │   (320px)    │
  └─────────┘      └──────────────┘      └──────────────┘
```

---

## 🎨 Layout de 3 Painéis

### Painel Esquerdo: Sidebar (240px ↔ 48px)
**Arquivo**: `components/atendimento/layout/AtendimentoSidebar.tsx`

```
┌─────────────────────┐
│  Ações Rápidas   [<]│
├─────────────────────┤
│ 🔄 Repetir Conduta  │
│ 🧠 Sugestão IA      │
│ 📷 Tirar Foto       │
│ 📎 Adicionar Anexo  │
├─────────────────────┤
│      Resumo         │
│ 👥 12 sessões       │
│ 🕒 45 dias trat.    │
│ 📈 Em progresso     │
├─────────────────────┤
│ 💡 Dica: Ctrl+1-4   │
└─────────────────────┘
```

**Estados**:
- **Expandido**: 240px, botões com texto
- **Colapsado**: 48px, apenas ícones
- **Toggle**: Click na seta ou programaticamente

### Painel Central: Tabs (Fluido)
**Arquivo**: `pages/AtendimentoPageV2.tsx` + tabs individuais

```
┌────────────────────────────────────────┐
│ Header Fixo (sempre visível)           │
│ [Avatar] João Silva | ⏱️ 00:45:23     │
│ [Status: Salvo] [Finalizar Sessão]     │
├────────────────────────────────────────┤
│ [SOAP] [Métricas] [IA] [Anexos]        │
├────────────────────────────────────────┤
│                                        │
│         Conteúdo da Tab Ativa          │
│                                        │
│    (SoapTab | MetricsTab |             │
│     AITab | AttachmentsTab)            │
│                                        │
└────────────────────────────────────────┘
```

**Tabs Disponíveis**:
1. **SOAP** (Ctrl+1): Formulário vertical S→O→A→P
2. **Métricas** (Ctrl+2): Escala de dor, métricas
3. **IA** (Ctrl+3): Sugestões de IA, análise de risco
4. **Anexos** (Ctrl+4): Upload, fotos, áudios

### Painel Direito: Context Panel (320px ↔ 48px)
**Arquivo**: `components/atendimento/layout/AtendimentoContextPanel.tsx`

```
┌─────────────────────┐
│ Contexto         [>]│
├─────────────────────┤
│ 📋 Últimas Sessões  │
│ ┌─────────────────┐ │
│ │ 15/01 - Dor 5↘  │ │
│ │ 10/01 - Dor 6→  │ │
│ │ 05/01 - Dor 6   │ │
│ └─────────────────┘ │
├─────────────────────┤
│ 🎯 Plano Tratamento │
│ ┌─────────────────┐ │
│ │ Lombalgia       │ │
│ │ ████░░ 60%      │ │
│ └─────────────────┘ │
├─────────────────────┤
│ 💪 Exercícios (4)   │
│ • Ponte             │
│ • Prancha           │
│ • Cat-Camel         │
│ • Alongamento       │
└─────────────────────┘
```

**Cards**:
- **SessionHistoryCard**: Últimas 3 sessões com trend de dor
- **TreatmentPlanCard**: Objetivos, progresso, diagnóstico
- **ExercisesCard**: Lista de exercícios prescritos

---

## 🧩 Hierarquia de Componentes

### Árvore Completa

```
AtendimentoPageV2
├── FormProvider (React Hook Form)
│   └── AtendimentoLayout
│       ├── AtendimentoHeader (header)
│       │   ├── Avatar
│       │   ├── SessionTimer
│       │   ├── SaveStatusBadge
│       │   └── Button (Finalizar)
│       │
│       ├── AtendimentoSidebar (sidebar esquerda)
│       │   ├── Quick Actions Buttons
│       │   └── Session Summary
│       │
│       ├── Tabs.Root (conteúdo principal)
│       │   ├── Tabs.List
│       │   │   ├── Tab: SOAP
│       │   │   ├── Tab: Métricas
│       │   │   ├── Tab: IA
│       │   │   └── Tab: Anexos
│       │   │
│       │   └── Tabs.Content
│       │       ├── SoapTab
│       │       │   ├── ProgressBar
│       │       │   ├── SoapField (S)
│       │       │   ├── SoapField (O)
│       │       │   ├── Button (Gerar IA)
│       │       │   ├── SoapField (A)
│       │       │   └── SoapField (P)
│       │       │
│       │       ├── MetricsTab
│       │       │   └── PainScale
│       │       │
│       │       ├── AITab ⭐ NOVO
│       │       │   ├── Button (Gerar)
│       │       │   ├── RiskAnalysis
│       │       │   │   ├── Alert (Critical)
│       │       │   │   ├── Alert (Important)
│       │       │   │   └── Alert (Info)
│       │       │   │
│       │       │   ├── AISuggestion (Assessment)
│       │       │   │   ├── View Mode
│       │       │   │   └── Edit Mode
│       │       │   │
│       │       │   ├── AISuggestion (Plan)
│       │       │   │   ├── View Mode
│       │       │   │   └── Edit Mode
│       │       │   │
│       │       │   ├── Evidences Section
│       │       │   └── Disclaimer
│       │       │
│       │       └── AttachmentsTab
│       │           └── Placeholder
│       │
│       └── AtendimentoContextPanel (sidebar direita)
│           ├── SessionHistoryCard
│           │   └── SessionItem[] (últimas 3)
│           │
│           ├── TreatmentPlanCard
│           │   ├── Objectives
│           │   ├── ProgressBar
│           │   └── Diagnosis
│           │
│           └── ExercisesCard
│               └── ExerciseItem[] (até 4)
```

---

## 🔄 Fluxo de Dados

### 1. Carregamento Inicial

```
AtendimentoPageV2 (mount)
    │
    ├─→ fetchData()
    │   ├─→ getAppointments() → appointment
    │   ├─→ getPatientById() → patient
    │   ├─→ getNotesByPatientId() → sessions[]
    │   ├─→ getPlanByPatientId() → treatmentPlan
    │   └─→ getExercisesByPlanId() → exercises[]
    │
    └─→ setState() para cada entidade
```

### 2. Formulário SOAP

```
Usuário digita em SoapField
    │
    ├─→ onChange (React Hook Form)
    │   └─→ setValue('subjective', value, { shouldDirty: true })
    │
    ├─→ useAtendimentoAutoSave detecta mudança
    │   ├─→ Debounce 2s
    │   ├─→ setSaveStatus('saving')
    │   ├─→ soapNoteService.saveNote()
    │   └─→ setSaveStatus('saved')
    │
    └─→ SaveStatusBadge atualiza no header
```

### 3. Geração de IA

```
Usuário preenche S e O
    │
    ├─→ Ctrl+G (ou clica "Sugestão IA")
    │   └─→ setActiveTab('ai')
    │
    ├─→ Clica "Gerar Sugestões"
    │   ├─→ handleGenerateAI()
    │   ├─→ Valida S e O preenchidos
    │   ├─→ setIsGenerating(true)
    │   ├─→ Monta prompt contextualizado
    │   ├─→ aiOrchestratorService.getResponse(prompt)
    │   ├─→ Parse resposta JSON
    │   ├─→ setGeneratedContent({ assessment, plan, alerts, evidences })
    │   └─→ setIsGenerating(false)
    │
    ├─→ Renderiza componentes
    │   ├─→ RiskAnalysis (alerts)
    │   ├─→ AISuggestion (assessment)
    │   ├─→ AISuggestion (plan)
    │   └─→ Evidences
    │
    └─→ Usuário aplica sugestão
        ├─→ handleApplyAssessment(content)
        ├─→ setValue('assessment', content, { shouldDirty: true })
        ├─→ Auto-save detecta mudança
        └─→ Salva após 2s
```

### 4. Repetir Conduta

```
Usuário clica "Repetir Conduta" (sidebar)
    │
    ├─→ handleRepeatConduct()
    │   ├─→ Busca última sessão: sessions[0]
    │   ├─→ setValue('subjective', lastSession.subjective)
    │   ├─→ setValue('objective', lastSession.objective)
    │   ├─→ setValue('assessment', lastSession.assessment)
    │   ├─→ setValue('plan', lastSession.plan)
    │   └─→ setValue('painScale', lastSession.painScale)
    │
    ├─→ Auto-save detecta mudanças
    │   └─→ Salva após 2s
    │
    └─→ showToast('Conduta carregada!', 'success')
```

---

## 🎣 Hooks Customizados

### useAtendimentoTimer
**Arquivo**: `hooks/atendimento/useAtendimentoTimer.ts`

**Responsabilidade**: Gerenciar timer de sessão com play/pause/resume

**Estado**:
```typescript
{
  isActive: boolean,
  isPaused: boolean,
  elapsedTime: number,
  formattedTime: string // "HH:MM:SS"
}
```

**Métodos**:
- `start()`: Inicia timer
- `pause()`: Pausa e guarda duração
- `resume()`: Retoma do ponto pausado
- `stop()`: Zera tudo
- `reset()`: Reinicia

### useAtendimentoAutoSave
**Arquivo**: `hooks/atendimento/useAtendimentoAutoSave.ts`

**Responsabilidade**: Auto-save com debounce de 2s

**Estado**:
```typescript
{
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved',
  canFinish: boolean,
  isDirty: boolean
}
```

**Fluxo**:
1. Detecta mudança no formulário via `watch()`
2. Debounce de 2s (useDebounce)
3. Salva no backend via `soapNoteService`
4. Atualiza status visual

### useAtendimentoKeyboardShortcuts
**Arquivo**: `hooks/atendimento/useAtendimentoKeyboardShortcuts.ts`

**Responsabilidade**: Gerenciar atalhos de teclado

**Atalhos Implementados**:
- `Ctrl+S`: Salvar manualmente
- `Ctrl+Enter`: Finalizar sessão
- `Ctrl+G`: Ir para tab IA
- `Ctrl+R`: Repetir conduta
- `Ctrl+H`: Toggle painel contexto
- `Ctrl+1-4`: Trocar tabs

---

## 📦 Serviços e Integrações

### AI Orchestrator Service
**Arquivo**: `services/ai/aiOrchestratorService.ts`

**Métodos**:
```typescript
class AiOrchestratorService {
  async query(prompt: string, provider?: string): Promise<AIResponse>
  async getQueryHistory(): Promise<AIQueryLog[]>
  async getAvailableProviders(): Promise<AIProvider[]>
  async generateSoapNote(data: any): Promise<any>
  async getResponse(prompt: string): Promise<any>
}
```

**Nota**: Atualmente mock. Integrar com Gemini API real.

### SOAP Note Service
**Arquivo**: `services/soapNoteService.ts`

**Métodos**:
```typescript
async function saveNote(note: SoapNote): Promise<SoapNote>
async function getNotesByPatientId(patientId: string): Promise<SoapNote[]>
async function getNoteById(noteId: string): Promise<SoapNote | null>
```

### Treatment Service
**Arquivo**: `services/treatmentService.ts`

**Métodos**:
```typescript
async function getPlanByPatientId(patientId: string): Promise<TreatmentPlan | null>
async function getExercisesByPlanId(planId: string): Promise<ExercisePrescription[]>
```

---

## 🎨 Sistema de Design

### Cores Principais

```typescript
const colors = {
  // SOAP Fields
  subjective: 'blue-600',    // S
  objective: 'green-600',    // O
  assessment: 'purple-600',  // A
  plan: 'orange-600',        // P

  // Alerts
  critical: 'red-600',
  important: 'orange-600',
  info: 'blue-600',

  // Status
  saved: 'green-600',
  saving: 'amber-600',
  error: 'red-600',
  unsaved: 'orange-600',
};
```

### Gradientes

```css
/* Botão IA Principal */
.ai-button {
  background: linear-gradient(to right, #9333ea, #2563eb);
  /* purple-600 → blue-600 */
}

/* Card de Boas-Vindas */
.welcome-card {
  background: linear-gradient(to bottom right, #faf5ff, #eff6ff);
  /* purple-50 → blue-50 */
}

/* Treatment Plan Card */
.treatment-card {
  background: linear-gradient(to bottom right, #dbeafe, #e9d5ff);
  /* blue-100 → purple-100 */
}
```

### Espaçamentos (Tailwind)

```typescript
// Containers
padding: 'p-6'        // 24px
gap: 'gap-6'          // 24px

// Cards
padding: 'p-4'        // 16px
gap: 'gap-4'          // 16px

// Inline elements
padding: 'px-3 py-2'  // 12px 8px
gap: 'gap-2'          // 8px
```

---

## 🔐 Type Safety

### Principais Interfaces

```typescript
// Formulário de Atendimento
interface AttendanceFormData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  painScale?: number;
  painPoints: string[];
  metricResults: any[];
  attachments: any[];
}

// Alerta de IA
interface Alert {
  id: string;
  severity: 'critical' | 'important' | 'info';
  message: string;
  recommendation?: string;
}

// Conteúdo Gerado por IA
interface AIGeneratedContent {
  assessment: string;
  plan: string;
  alerts: Alert[];
  evidences: { title: string; reference: string }[];
}

// Props do AISuggestion
interface AISuggestionProps {
  field: string;
  title: string;
  content: string;
  color?: 'blue' | 'purple' | 'green' | 'orange';
  onApply: (content: string) => void;
  onDiscard: () => void;
  isLoading?: boolean;
}
```

---

## 📊 Métricas de Performance

### Build Output
```
Total JS: 5.85MB
Chunks: 249
Média por chunk: 23.49KB
Chunks > 300KB: 3 (charts, tiptap, jspdf)
```

### Lazy Loading
Todas as pages usam `React.lazy()`:
```typescript
const AtendimentoPageV2 = React.lazy(() => import('./pages/AtendimentoPageV2'));
```

### Code Splitting
Componentes grandes carregados sob demanda:
- Charts (443KB)
- Editor Tiptap (404KB)
- jsPDF (378KB)

---

## 🧪 Testing Strategy

### Unit Tests (Pendente - Fase 4)
```typescript
// Testar hooks
describe('useAtendimentoTimer', () => {
  it('should start timer', ...)
  it('should pause timer', ...)
  it('should resume from paused', ...)
});

// Testar componentes
describe('AISuggestion', () => {
  it('should render in view mode', ...)
  it('should switch to edit mode', ...)
  it('should apply suggestion', ...)
});
```

### E2E Tests (Pendente - Fase 4)
```typescript
// Playwright
test('should generate AI suggestions', async ({ page }) => {
  await page.goto('/atendimento-v2/123');
  await page.fill('[name="subjective"]', 'Dor lombar');
  await page.fill('[name="objective"]', 'Limitação ADM');
  await page.press('Control+G');
  await page.click('text=Gerar Sugestões');
  await expect(page.locator('.risk-analysis')).toBeVisible();
});
```

---

## 🔄 Estado Global vs Local

### Estado Global (Context)
- `ToastContext`: Feedback visual (toasts)
- `FormProvider`: Dados do formulário (React Hook Form)

### Estado Local (useState)
- `activeTab`: Tab atual selecionada
- `isSidebarCollapsed`: Estado da sidebar esquerda
- `isContextCollapsed`: Estado do painel direito
- `generatedContent`: Conteúdo gerado pela IA
- `isGenerating`: Loading da geração de IA

### Estado em Hooks
- `saveStatus`: Em `useAtendimentoAutoSave`
- `elapsedTime`: Em `useAtendimentoTimer`

---

## 📚 Dependências Principais

### UI Libraries
```json
{
  "@radix-ui/react-tabs": "Tab system",
  "@radix-ui/react-collapsible": "Painéis colapsáveis",
  "@radix-ui/react-tooltip": "Tooltips",
  "framer-motion": "Animações",
  "lucide-react": "Ícones"
}
```

### Form & Validation
```json
{
  "react-hook-form": "Gerenciamento de formulários",
  "@hookform/resolvers": "Integração com Zod",
  "zod": "Schema validation"
}
```

### Utilities
```json
{
  "react-hotkeys-hook": "Keyboard shortcuts",
  "use-debounce": "Debounce para auto-save"
}
```

---

## 🎯 Conclusão

A arquitetura da **AtendimentoPageV2** é modular, escalável e type-safe:

✅ **Separação de Responsabilidades**: Cada componente tem um propósito claro
✅ **Type Safety**: TypeScript completo com interfaces bem definidas
✅ **Performance**: Code splitting, lazy loading, debouncing
✅ **UX**: Feedback visual, animações, atalhos de teclado
✅ **Manutenibilidade**: Hooks customizados, serviços isolados
✅ **Testabilidade**: Estrutura pronta para unit e E2E tests

**Pronta para produção após integração com Gemini API real!** 🚀

---

**Última Atualização**: Janeiro 2025
**Versão**: 2.0.0 (Fase 3 Completa)
