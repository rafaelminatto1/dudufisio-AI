# 📋 TASKS - DuduFisio-AI Refactoring Tasks

**Data:** 2025-10-18
**Total de Tasks:** 89 tasks principais + 30 subtasks
**Progresso:** 0/119 (0%)

---

## 📖 LEGENDA

### Prioridades
- 🔴 **P0** - Crítico (bloqueador)
- 🟠 **P1** - Alto (importante)
- 🟡 **P2** - Médio (desejável)
- 🟢 **P3** - Baixo (nice-to-have)

### Status
- ⬜ **TODO** - Não iniciado
- 🟦 **IN PROGRESS** - Em andamento
- ✅ **DONE** - Concluído
- ❌ **BLOCKED** - Bloqueado
- ⏸️ **PAUSED** - Pausado

### Estimativas
- **XS** - < 1 hora
- **S** - 1-2 horas
- **M** - 2-4 horas
- **L** - 4-8 horas (1 dia)
- **XL** - 8-16 horas (2 dias)
- **XXL** - 16+ horas (3+ dias)

---

## 🎯 FASE 1: FUNDAÇÃO (Semanas 1-2)

### SEMANA 1: Limpeza Crítica

#### **TASK-001: Remover Imports de Next.js** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** L (6-8h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Remover todos os imports de `next/*` e substituir por equivalentes Vite/React Router.

**Arquivos Afetados:** (11 arquivos)
1. `lib/auth.ts`
2. `components/auth/AuthProvider.tsx`
3. `components/auth/UserMenu.tsx`
4. `components/pacientes/PatientList.tsx`
5. `components/ui/sonner.tsx`
6. `api/cron/process-whatsapp-queue.ts`
7. `middleware.ts.disabled`
8. (4 mais em docs)

**Acceptance Criteria:**
- [ ] Zero imports de `next/router`, `next/navigation`, `next-auth`
- [ ] Usar `useNavigate`, `useLocation` de `react-router-dom`
- [ ] Usar `useSupabaseAuth` ao invés de `next-auth`
- [ ] Build sem erros de "module not found"
- [ ] Testes passando

**Implementação:**
```typescript
// ANTES (ERRADO)
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

// DEPOIS (CORRETO)
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
```

**Testing:**
- Testar navegação entre páginas
- Testar autenticação e logout
- Verificar deep links funcionando

**Rollback Plan:**
- Manter commits pequenos (1 arquivo por commit)
- Tag de versão antes de iniciar
- Script de rollback preparado

---

#### **TASK-002: Adicionar Exports Faltando em geminiService** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** S (1-2h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Adicionar export `geminiService` em `services/geminiService.ts`.

**Arquivos Afetados:** (5 arquivos)
- `services/geminiService.ts` (modificar)
- `components/ai-tools/tool-modals/GenerateEvolutionModal.tsx`
- `components/ai-tools/tool-modals/GenerateHEPModal.tsx`
- `components/ai-tools/tool-modals/GenerateReportModal.tsx`
- `components/ai-tools/tool-modals/RiskAnalysisModal.tsx`

**Acceptance Criteria:**
- [ ] `geminiService` exportado corretamente
- [ ] Imports funcionando nos 4 modais
- [ ] TypeScript sem erros de "no exported member"
- [ ] Funcionalidade AI testada

**Implementação:**
```typescript
// services/geminiService.ts

// ADICIONAR no final do arquivo:
export const geminiService = {
  generateEvolution,
  generateHEP,
  generateReport,
  analyzeRisk,
  // ... outros métodos
};
```

**Testing:**
- Testar geração de evolução
- Testar geração de HEP
- Testar geração de relatório
- Testar análise de risco

---

#### **TASK-003: Corrigir Imports de Ícones Faltando** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** M (3-4h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Adicionar imports dos ícones faltando de `lucide-react`.

**Ícones Faltando:**
- `Clock` (10 usos)
- `XCircle` (3 usos)
- `Badge` (6 usos)
- `AlertCircle` (2 usos)
- `Mail` (2 usos)
- `Phone` (2 usos)
- `Activity` (3 usos)

**Arquivos Afetados:** (15+ arquivos)
- `components/assignments/AssignmentCard.tsx`
- `components/assignments/AssignExerciseModal.tsx`
- `components/atendimento/SurgeryManager.tsx`
- `components/patients/PatientListModern.tsx`
- `components/patient/EvolutionReport.tsx`
- `components/protocols/ProtocolPreview.tsx`
- (e mais 9 arquivos)

**Acceptance Criteria:**
- [ ] Todos os ícones importados de `lucide-react`
- [ ] Zero erros "Cannot find name 'Clock'"
- [ ] UI renderizando ícones corretamente
- [ ] Build sem warnings de ícones

**Implementação:**
```typescript
// ADICIONAR no topo de cada arquivo:
import { Clock, XCircle, Badge, AlertCircle, Mail, Phone, Activity } from 'lucide-react';
```

**Testing:**
- Verificar renderização visual de cada ícone
- Testar em diferentes resolções
- Verificar acessibilidade

---

#### **TASK-004: Remover/Reintegrar Arquivos Excluídos** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** M (3-4h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Decidir destino dos 11 arquivos excluídos do `tsconfig.json` mas ainda presentes.

**Arquivos em Questão:**
1. `components/auth/AuthProvider.tsx`
2. `components/auth/UserMenu.tsx`
3. `components/pacientes/PatientList.tsx`
4. `lib/actions/**/*`
5. `lib/auth.ts`
6. `middleware.ts`
7. `next.config.js`
8. `next.config.mjs`
9. (e mais 3)

**Opções:**
**A)** Remover permanentemente (se não usado)
**B)** Reintegrar no build (se ainda necessário)
**C)** Mover para `.archive/` (histórico)

**Acceptance Criteria:**
- [ ] Decisão documentada para cada arquivo
- [ ] Arquivos removidos OU reintegrados
- [ ] `tsconfig.json` atualizado
- [ ] Git history preservado
- [ ] Nenhum import quebrado

**Implementação:**
```bash
# Para cada arquivo, verificar uso:
grep -r "import.*AuthProvider" --include="*.tsx" --include="*.ts"

# Se não usado:
git rm components/auth/AuthProvider.tsx

# Se usado:
# Remover do exclude no tsconfig.json
```

**Testing:**
- Verificar que nenhum import quebrou
- Build completo sem erros
- Testes E2E passando

---

### SEMANA 2: Correções de Tipos Base

#### **TASK-005: Adicionar Propriedades Faltando em Patient** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** M (2-3h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Adicionar propriedades faltando na interface `Patient` em `types.ts`.

**Propriedades Faltando:**
- `main_pathology?: string`
- `main_pathology_region?: string`

**Arquivos Afetados:**
- `types.ts` (modificar)
- `components/body-map/BodyMapManager.tsx` (10 usos)

**Acceptance Criteria:**
- [ ] Propriedades adicionadas em `Patient` interface
- [ ] JSDoc comments adicionados
- [ ] TypeScript sem erros relacionados
- [ ] Migração de dados planejada (se necessário)

**Implementação:**
```typescript
// types.ts
export interface Patient {
  // ... existing properties ...

  // === Clínico - Patologia Principal ===
  /**
   * Patologia principal do paciente (ex: "Lesão de LCA", "Hérnia Discal")
   */
  main_pathology?: string;

  /**
   * Região do corpo afetada pela patologia principal
   * Valores: 'head', 'neck', 'shoulder', 'arm', 'hand', 'chest', 'abdomen',
   *          'back', 'hip', 'leg', 'knee', 'ankle', 'foot'
   */
  main_pathology_region?: string;

  // ... rest of properties ...
}
```

**Testing:**
- Criar paciente com novas propriedades
- Verificar body map manager
- Testar salvar/carregar paciente

**Migration Strategy:**
```sql
-- Supabase migration se necessário
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS main_pathology TEXT,
ADD COLUMN IF NOT EXISTS main_pathology_region TEXT;
```

---

#### **TASK-006: Adicionar Propriedades Faltando em PatientGoal** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** S (1-2h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Adicionar propriedade `completedAt` na interface `PatientGoal` (já existe `achievedAt`).

**Arquivos Afetados:**
- `types.ts` (verificar se já existe)
- `components/atendimento/PatientGoalsManager.tsx` (2 usos)

**Acceptance Criteria:**
- [ ] Verificar se `completedAt` já existe ou se deve usar `achievedAt`
- [ ] Padronizar uso (escolher 1 das 2)
- [ ] Atualizar componente
- [ ] Documentar decisão

**Implementação:**
```typescript
// OPÇÃO 1: Se completedAt é alias de achievedAt
export interface PatientGoal {
  // ... existing ...
  achievedAt?: string; // ISO date quando meta foi atingida
  // NÃO adicionar completedAt, usar achievedAt
}

// Atualizar componente para usar achievedAt:
// components/atendimento/PatientGoalsManager.tsx
const completionDate = goal.achievedAt; // ao invés de completedAt
```

**Testing:**
- Marcar meta como concluída
- Verificar data salva corretamente
- Testar filtros por metas completadas

---

#### **TASK-007: Renomear Surgery.recoveryTime → recoveryTimeDays** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** S (1-2h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Renomear propriedade `recoveryTime` para `recoveryTimeDays` na interface `Surgery`.

**Arquivos Afetados:**
- `types.ts` (já tem `recoveryTimeDays`)
- `components/atendimento/SurgeryManager.tsx` (7 usos de `recoveryTime`)

**Acceptance Criteria:**
- [ ] Todos os usos de `surgery.recoveryTime` substituídos por `surgery.recoveryTimeDays`
- [ ] TypeScript sem erros
- [ ] UI mostrando corretamente ("X dias")
- [ ] Migração de dados planejada

**Implementação:**
```typescript
// components/atendimento/SurgeryManager.tsx
// ANTES:
const recovery = surgery.recoveryTime;

// DEPOIS:
const recovery = surgery.recoveryTimeDays;
```

**Testing:**
- Criar nova cirurgia
- Editar cirurgia existente
- Verificar cálculo de datas
- Testar validação (1-365 dias)

**Migration:**
```sql
-- Se necessário migrar dados existentes
UPDATE surgeries
SET recovery_time_days = recovery_time
WHERE recovery_time_days IS NULL;

ALTER TABLE surgeries DROP COLUMN IF EXISTS recovery_time;
```

---

#### **TASK-008: Corrigir AppointmentStatus vs String Literais** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** M (3-4h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Padronizar uso de `AppointmentStatus` enum vs strings literais.

**Problema:**
Código comparando enum com strings: `appointment.status === "scheduled"`

**Arquivos Afetados:**
- `components/agenda/NotificationCenter.tsx` (2 erros)
- (potencialmente mais arquivos)

**Acceptance Criteria:**
- [ ] Todos os usos de status usando enum `AppointmentStatus`
- [ ] Zero comparações com strings literais
- [ ] Helper functions para conversão se necessário
- [ ] Testes passando

**Implementação:**
```typescript
// ANTES (ERRADO):
if (appointment.status === "scheduled") { ... }

// DEPOIS (CORRETO):
if (appointment.status === AppointmentStatus.Scheduled) { ... }

// OU criar helper:
const isScheduled = (status: AppointmentStatus) =>
  status === AppointmentStatus.Scheduled;

if (isScheduled(appointment.status)) { ... }
```

**Testing:**
- Testar cada status do appointment
- Verificar notificações
- Testar filtros por status

---

#### **TASK-009: Corrigir PatientStatus Enum** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** S (1-2h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Corrigir uso de string `"Active"` ao invés de `PatientStatus.Active`.

**Arquivos Afetados:**
- `components/agenda/QuickAddPatientDialog.tsx` (1 erro)

**Acceptance Criteria:**
- [ ] Usar `PatientStatus.Active` ao invés de `"Active"`
- [ ] TypeScript sem erros
- [ ] Funcionalidade de adicionar paciente testada

**Implementação:**
```typescript
// components/agenda/QuickAddPatientDialog.tsx
// ANTES:
status: "Active" // ❌

// DEPOIS:
status: PatientStatus.Active // ✅
```

**Testing:**
- Adicionar paciente rápido pela agenda
- Verificar status salvo corretamente
- Testar filtro por status

---

#### **TASK-010: Adicionar Propriedades em InventoryAlertType** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** M (2-3h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Adicionar propriedades faltando no enum/type `InventoryAlertType`.

**Propriedades Faltando:**
- `OverdueOrder`
- `HighConsumption`
- `LowTurnover`
- `PriceChange`
- `SupplierDelay`

**Arquivos Afetados:**
- `types.ts` ou arquivo de tipos de inventory
- `components/inventory/AlertsTab.tsx` (5 usos)

**Acceptance Criteria:**
- [ ] Enum/type completo com todas as propriedades
- [ ] TypeScript sem erros
- [ ] Alertas de inventário funcionando
- [ ] Documentação atualizada

**Implementação:**
```typescript
// types.ts ou types/inventoryTypes.ts
export enum InventoryAlertType {
  LowStock = 'LowStock',
  OutOfStock = 'OutOfStock',
  ExpirationSoon = 'ExpirationSoon',
  Expired = 'Expired',
  // ADICIONAR:
  OverdueOrder = 'OverdueOrder',
  HighConsumption = 'HighConsumption',
  LowTurnover = 'LowTurnover',
  PriceChange = 'PriceChange',
  SupplierDelay = 'SupplierDelay',
}
```

**Testing:**
- Testar cada tipo de alerta
- Verificar notificações
- Testar filtros

---

#### **TASK-011: Corrigir AppointmentTooltipProps** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** S (1h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Adicionar `children` na interface `AppointmentTooltipProps`.

**Arquivos Afetados:**
- `components/agenda/AppointmentTooltip.tsx` (definir interface)
- `components/agenda/ImprovedWeeklyView.tsx` (1 uso)

**Acceptance Criteria:**
- [ ] Interface com `children?: ReactNode`
- [ ] TypeScript sem erros
- [ ] Tooltip funcionando

**Implementação:**
```typescript
// components/agenda/AppointmentTooltip.tsx
interface AppointmentTooltipProps {
  appointment: EnrichedAppointment;
  children?: React.ReactNode; // ADICIONAR
}
```

**Testing:**
- Hover sobre appointments
- Verificar tooltip aparecendo
- Testar diferentes tipos de appointment

---

#### **TASK-012: Adicionar Types Faltando** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** M (2-3h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Criar types faltando referenciados no código.

**Types Faltando:**
- `OutcomeScenario` (usado em PredictionScenarioCard)
- `HealthTrend` (usado em PopulationTrendChart)

**Arquivos Afetados:**
- Criar `types/predictiveAnalyticsTypes.ts`
- Criar `types/populationHealthTypes.ts`
- `components/ai/PredictionScenarioCard.tsx`
- `components/analytics/PopulationTrendChart.tsx`

**Acceptance Criteria:**
- [ ] Arquivos de types criados
- [ ] Interfaces bem documentadas
- [ ] Exports corretos
- [ ] TypeScript sem erros
- [ ] Componentes funcionando

**Implementação:**
```typescript
// types/predictiveAnalyticsTypes.ts
export interface OutcomeScenario {
  id: string;
  scenario: string;
  probability: number; // 0-100
  outcome: 'positive' | 'neutral' | 'negative';
  factors: string[];
  recommendations: string[];
}

// types/populationHealthTypes.ts
export interface HealthTrend {
  id: string;
  metric: string;
  period: string; // 'week', 'month', 'quarter', 'year'
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  data: Array<{
    date: string;
    value: number;
  }>;
}
```

**Testing:**
- Renderizar componentes
- Testar com dados mock
- Verificar gráficos

---

## 🎯 FASE 2: QUALIDADE DE CÓDIGO (Semanas 3-4)

### SEMANA 3: Limpeza ESLint

#### **TASK-013: Remover Variáveis Não Usadas** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** L (6-8h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Remover 50+ variáveis/imports não usados identificados pelo ESLint.

**Categorias:**
- Imports não usados (30+)
- Variáveis não usadas (15+)
- Parâmetros não usados (5+)

**Arquivos Afetados:** (50+ arquivos)
- Ver output do `npm run lint`

**Acceptance Criteria:**
- [ ] Zero warnings `no-unused-vars`
- [ ] Zero warnings `@typescript-eslint/no-unused-vars`
- [ ] Código mais limpo
- [ ] Build size potencialmente menor

**Implementação:**
```typescript
// ANTES:
import { Users, Calendar, Settings } from 'lucide-react'; // só usa Users
const [count, setCount] = useState(0); // setCount não usado

// DEPOIS:
import { Users } from 'lucide-react';
const [count] = useState(0); // removido setCount
```

**Automação:**
```bash
# Usar ESLint autofix onde seguro:
npm run lint:fix
```

**Testing:**
- Build completo
- Testes E2E
- Verificar funcionalidade não quebrou

---

#### **TASK-014: Remover Console.log em Produção** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** M (3-4h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Remover 20+ `console.log` encontrados no código.

**Opções:**
A) Remover completamente
B) Substituir por logger apropriado
C) Comentar (não recomendado)

**Arquivos Afetados:** (20+ arquivos)
- `components/AiAssistant.tsx` (1)
- `components/AppointmentFormModal.tsx` (1)
- (e mais 18)

**Acceptance Criteria:**
- [ ] Zero warnings `no-console`
- [ ] Usar `logger` do projeto se logging necessário
- [ ] Production build limpo

**Implementação:**
```typescript
// ANTES:
console.log('Debug info:', data);

// OPÇÃO A - Remover:
// (nada)

// OPÇÃO B - Usar logger:
import { logger } from '@/lib/logger';
logger.debug('Debug info', { data });
```

**Testing:**
- Verificar que debugging necessário ainda funciona
- Testar em dev e production builds
- Verificar logs no Sentry (se necessário)

---

#### **TASK-015: Corrigir Non-Null Assertions** 🟡 P2
- **Status:** ⬜ TODO
- **Estimativa:** M (3-4h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Remover 10+ usos desnecessários de `!` (non-null assertion operator).

**Arquivos Afetados:**
- `api/cron/appointment-reminders.ts` (2)
- `api/cron/daily-summary.ts` (2)
- (e mais 6)

**Acceptance Criteria:**
- [ ] Zero warnings `@typescript-eslint/no-non-null-assertion`
- [ ] Usar type guards ou optional chaining
- [ ] Código mais seguro

**Implementação:**
```typescript
// ANTES:
const name = user!.name; // perigoso se user for null

// DEPOIS - Opção 1 (optional chaining):
const name = user?.name;

// DEPOIS - Opção 2 (type guard):
if (!user) throw new Error('User required');
const name = user.name;

// DEPOIS - Opção 3 (default):
const name = user?.name || 'Unknown';
```

**Testing:**
- Testar cenários onde valor pode ser null
- Verificar error handling
- Testes unitários

---

#### **TASK-016: Corrigir Parsing Errors em Checkly/** 🟡 P2
- **Status:** ⬜ TODO
- **Estimativa:** S (1-2h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Corrigir 4 parsing errors em arquivos `checkly/`.

**Arquivos Afetados:**
- `checkly/api.check.ts`
- `checkly/browser.check.ts`
- `checkly/homepage.spec.ts`
- `checkly/login.spec.ts`

**Problema:**
Arquivos não incluídos no `tsconfig.json`.

**Opções:**
A) Adicionar ao `tsconfig.json` include
B) Criar `tsconfig.checkly.json` separado
C) Mover para pasta tests/

**Acceptance Criteria:**
- [ ] Zero parsing errors
- [ ] Checkly tests rodando
- [ ] ESLint configurado corretamente

**Implementação:**
```json
// tsconfig.json - OPÇÃO A:
{
  "include": [
    // ... existing ...
    "checkly/**/*.ts"
  ]
}

// OU criar tsconfig.checkly.json - OPÇÃO B:
{
  "extends": "./tsconfig.json",
  "include": ["checkly/**/*.ts"]
}
```

**Testing:**
- Rodar checkly tests
- Verificar linting
- CI/CD passando

---

#### **TASK-017: Consolidar Componentes Duplicados** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** XL (12-16h)
- **Assignee:** TBD
- **Dependências:** TASK-001 a TASK-012 completas
- **Risco:** 🟡 Médio

**Descrição:**
Consolidar 15+ componentes duplicados.

**Duplicatas Identificadas:**
1. `EnhancedExerciseLibraryPage` + `ExerciseLibraryPage` + `ExerciseLibraryTestPage`
2. `MentoriaPage` + `MentoriaPageNew`
3. `AtendimentoPage` + `AtendimentoPageDemo`
4. `AdminDashboardPage` + `AdminDashboardPageSimple`
5. (e mais 11)

**Estratégia:**
Para cada duplicata:
1. Comparar funcionalidades
2. Escolher versão definitiva (geralmente a "New" ou "Enhanced")
3. Migrar funcionalidades únicas
4. Remover versão antiga
5. Atualizar imports

**Acceptance Criteria:**
- [ ] Apenas 1 versão de cada componente
- [ ] Funcionalidade preservada
- [ ] Imports atualizados
- [ ] Build sem erros
- [ ] Testes passando

**Implementação Exemplo:**
```typescript
// 1. Analisar:
// ExerciseLibraryPage.tsx - versão antiga
// EnhancedExerciseLibraryPage.tsx - versão nova (melhor)
// ExerciseLibraryTestPage.tsx - apenas testes

// 2. Decisão:
// MANTER: EnhancedExerciseLibraryPage (renomear para ExerciseLibraryPage)
// REMOVER: ExerciseLibraryPage antiga
// MOVER: Testes para tests/

// 3. Executar:
mv pages/EnhancedExerciseLibraryPage.tsx pages/ExerciseLibraryPage.tsx
git rm pages/ExerciseLibraryPage.tsx
mv pages/ExerciseLibraryTestPage.tsx tests/e2e/exercise-library.spec.tsx

// 4. Atualizar imports em ~10 arquivos
```

**Testing:**
- Testar cada funcionalidade do componente
- Comparar antes/depois visualmente
- Rodar testes E2E

---

### SEMANA 4: TypeScript Strict Mode

#### **TASK-018: Habilitar strictNullChecks** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** XXL (16-24h)
- **Assignee:** TBD
- **Dependências:** TASK-001 a TASK-017 completas
- **Risco:** 🔴 Alto

**Descrição:**
Habilitar `strictNullChecks: true` e corrigir todos os erros.

**Estimativa de Erros:** ~50-100 novos erros

**Acceptance Criteria:**
- [ ] `strictNullChecks: true` no tsconfig
- [ ] Zero erros TypeScript
- [ ] Código mais seguro contra null/undefined
- [ ] Testes passando

**Estratégia:**
1. Habilitar flag
2. Corrigir erros por categoria:
   - Propriedades opcionais
   - Return types
   - Function parameters
   - Array access
3. Usar optional chaining (`?.`)
4. Usar nullish coalescing (`??`)
5. Usar type guards quando necessário

**Implementação Comum:**
```typescript
// ANTES (sem strictNullChecks):
function getName(user: User) {
  return user.name; // OK mesmo se user for null
}

// DEPOIS (com strictNullChecks):
function getName(user: User | null) {
  return user?.name ?? 'Unknown'; // Safe
}

// Array access:
// ANTES:
const first = items[0]; // pode ser undefined

// DEPOIS:
const first = items[0] ?? defaultItem;
// OU:
if (items.length > 0) {
  const first = items[0]; // agora TypeScript sabe que existe
}
```

**Testing:**
- Testes unitários extensivos
- Testar edge cases (null, undefined)
- Regression testing

**Rollback:**
Se muitos problemas, pausar e retornar à `strictNullChecks: false`.

---

#### **TASK-019: Habilitar noImplicitAny** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** XL (12-16h)
- **Assignee:** TBD
- **Dependências:** TASK-018 completa
- **Risco:** 🟡 Médio

**Descrição:**
Habilitar `noImplicitAny: true` e tipar todos os `any` implícitos.

**Estimativa de Erros:** ~30-50 novos erros

**Acceptance Criteria:**
- [ ] `noImplicitAny: true` no tsconfig
- [ ] Zero tipos `any` implícitos
- [ ] Tipos explícitos onde necessário
- [ ] Testes passando

**Implementação:**
```typescript
// ANTES (any implícito):
function handleSubmit(data) { // data é any
  console.log(data.name);
}

// DEPOIS:
function handleSubmit(data: PatientFormData) {
  console.log(data.name); // type-safe
}

// Event handlers:
// ANTES:
const handleClick = (e) => { ... } // e é any

// DEPOIS:
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... }
```

**Testing:**
- Verificar autocomplete funcionando
- Testar type checking
- Regression testing

---

#### **TASK-020: Habilitar Strict Mode Completo** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** L (8-10h)
- **Assignee:** TBD
- **Dependências:** TASK-018, TASK-019 completas
- **Risco:** 🟡 Médio

**Descrição:**
Habilitar `strict: true` (habilita todas as flags strict).

**Flags Habilitadas por `strict: true`:**
- ✅ `strictNullChecks` (já feito)
- ✅ `noImplicitAny` (já feito)
- ⬜ `strictFunctionTypes`
- ⬜ `strictBindCallApply`
- ⬜ `strictPropertyInitialization`
- ⬜ `noImplicitThis`
- ⬜ `alwaysStrict`

**Estimativa de Novos Erros:** ~20-30

**Acceptance Criteria:**
- [ ] `strict: true` no tsconfig
- [ ] Todas as outras flags strict removidas (redundantes)
- [ ] Zero erros TypeScript
- [ ] 100% type safety
- [ ] Testes passando

**Implementação:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true, // ✅
    // Remover flags individuais:
    // "strictNullChecks": true, // redundante
    // "noImplicitAny": true, // redundante
    // etc.
  }
}
```

**Testing:**
- Testes completos
- Build em produção
- Verificar performance

---

## 🎯 FASE 3: ARQUITETURA (Semanas 5-6)

### SEMANA 5: Code Splitting & Performance

#### **TASK-021: Investigar Problema Vite Code Splitting** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** L (6-8h)
- **Assignee:** TBD (necessário conhecimento de Vite)
- **Dependências:** TASK-020 completa
- **Risco:** 🔴 Alto

**Descrição:**
Investigar e resolver problema de ordenação de chunks do Vite.

**Problema Atual:**
Comentário no `vite.config.ts:157`:
```typescript
// Code splitting DESABILITADO - Vite ordena chunks de forma inconsistente
manualChunks: undefined
```

**Investigação Necessária:**
1. Qual é o problema exato de ordenação?
2. Quais chunks estão sendo carregados na ordem errada?
3. Como React está sendo duplicado?
4. Soluções possíveis?

**Acceptance Criteria:**
- [ ] Problema root cause identificado
- [ ] Documentação do problema
- [ ] Possíveis soluções listadas
- [ ] Decisão sobre melhor approach

**Possíveis Soluções:**
A) Upgrade Vite para versão mais recente
B) Configurar `rollupOptions.output.manualChunks` diferente
C) Usar plugin de ordenação de chunks
D) Aceitar bundle único (trade-off)

**Pesquisa:**
- Vite GitHub issues relacionados
- Vite Discord/Reddit
- Documentação Vite sobre chunking
- Similar projects

**Output:**
Documento com:
- Problema detalhado
- Root cause
- 3+ soluções possíveis
- Recomendação
- Estimativa para implementação

---

#### **TASK-022: Implementar Code Splitting** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** XL (12-16h)
- **Assignee:** TBD
- **Dependências:** TASK-021 completa
- **Risco:** 🔴 Alto

**Descrição:**
Implementar solução de code splitting escolhida em TASK-021.

**Objetivo:**
- Reduzir bundle inicial em 30-50%
- Manter performance
- Evitar duplicação de React

**Acceptance Criteria:**
- [ ] Code splitting funcionando
- [ ] Bundle inicial < 300KB (gzipped)
- [ ] Chunks carregando na ordem correta
- [ ] React não duplicado
- [ ] Performance mantida ou melhorada
- [ ] Build size reduzido em 15%+

**Implementação Exemplo:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Estratégia de chunking
          if (id.includes('node_modules/react')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
  },
});
```

**Testing:**
- Build de produção
- Testar ordem de carregamento
- Lighthouse score
- Verificar no Network tab
- Testes E2E

**Rollback:**
Se não funcionar, voltar para bundle único.

---

#### **TASK-023: Otimizar Lazy Loading** 🟡 P2
- **Status:** ⬜ TODO
- **Estimativa:** M (4-6h)
- **Assignee:** TBD
- **Dependências:** TASK-022 completa
- **Risco:** 🟢 Baixo

**Descrição:**
Otimizar lazy loading de componentes.

**Melhorias:**
1. Prefetch de rotas prováveis
2. Preload de componentes críticos
3. Suspense boundaries melhores
4. Loading states mais rápidos

**Acceptance Criteria:**
- [ ] Prefetching implementado
- [ ] Preloading de componentes críticos
- [ ] Loading states suaves
- [ ] Perceived performance melhorada

**Implementação:**
```typescript
// Prefetch on hover
<Link
  to="/patients"
  onMouseEnter={() => {
    import('./pages/PatientListPage');
  }}
>
  Pacientes
</Link>

// Preload críticos
useEffect(() => {
  // Preload depois que app carregou
  import('./pages/AgendaPage');
  import('./pages/DashboardPage');
}, []);
```

**Testing:**
- Testar em 3G throttling
- Verificar cache funcionando
- Lighthouse score

---

#### **TASK-024: Configurar Sentry** 🟡 P2
- **Status:** ⬜ TODO
- **Estimativa:** M (3-4h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Configurar Sentry para error tracking em produção.

**Setup Necessário:**
1. Obter `SENTRY_AUTH_TOKEN`
2. Configurar projeto no Sentry
3. Testar upload de source maps
4. Configurar alertas

**Arquivos Afetados:**
- `vite.config.ts` (já tem plugin, falta token)
- `.env` (adicionar variáveis)
- Add Sentry init in `index.tsx`

**Acceptance Criteria:**
- [ ] Sentry configurado
- [ ] Source maps sendo uploaded
- [ ] Erros sendo capturados
- [ ] Alertas configurados
- [ ] Dashboard funcionando

**Implementação:**
```typescript
// index.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
  });
}
```

**Testing:**
- Forçar erro em produção
- Verificar no Sentry dashboard
- Testar alertas

---

### SEMANA 6: Integrações Completas

#### **TASK-025: Completar Integração WhatsApp** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** XL (12-16h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Completar e testar 100% da integração WhatsApp Web Client.

**Componentes:**
1. WhatsApp Web Client (whatsapp-web.js)
2. Webhook para receber mensagens
3. Templates de mensagens
4. Queue de envio
5. Retry logic

**Acceptance Criteria:**
- [ ] Autenticação QR code funcionando
- [ ] Envio de mensagens OK
- [ ] Recebimento de mensagens OK
- [ ] Templates funcionando
- [ ] Queue funcionando
- [ ] Retry logic testado
- [ ] Logs e monitoring
- [ ] Documentação completa

**Implementação:**
Seguir guia em `.archive_docs/WHATSAPP_BUSINESS_SETUP.md`

**Testing:**
- Enviar mensagem teste
- Receber resposta
- Testar falhas (telefone inválido, etc.)
- Testar volume (100+ mensagens)
- Testar reconexão

---

#### **TASK-026: Configurar Backup Multi-Cloud** 🟡 P2
- **Status:** ⬜ TODO
- **Estimativa:** L (8-10h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Configurar backup automático multi-cloud (AWS S3 + Google Cloud Storage).

**Service Existente:**
`services/backup/multiCloudBackupService.ts`

**Falta:**
1. Credenciais AWS
2. Credenciais Google Cloud
3. Cron job para backup diário
4. Testes de restore
5. Monitoring

**Acceptance Criteria:**
- [ ] AWS S3 configurado
- [ ] Google Cloud Storage configurado
- [ ] Backup diário automático
- [ ] Retention policy (30 dias)
- [ ] Restore testado
- [ ] Alertas configurados

**Implementação:**
```typescript
// .env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=dudufisio-backups

GOOGLE_CLOUD_PROJECT_ID=...
GOOGLE_CLOUD_BUCKET=dudufisio-backups
```

**Testing:**
- Backup manual
- Restore manual
- Testar falha de 1 provider
- Verificar redundância

---

#### **TASK-027: Completar Gamificação** 🟢 P3
- **Status:** ⬜ TODO
- **Estimativa:** XL (12-16h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Completar sistema de gamificação do portal do paciente.

**Features:**
1. Pontos por exercícios completados
2. Badges/conquistas
3. Leaderboard (opcional)
4. Streaks
5. Desafios semanais

**Acceptance Criteria:**
- [ ] Sistema de pontos funcionando
- [ ] Badges sendo atribuídos
- [ ] UI de gamificação completa
- [ ] Integração com exercícios
- [ ] Notificações de conquistas

**Implementação:**
Backend logic + UI components

**Testing:**
- Completar exercício → ganhar pontos
- Desbloquear badge
- Verificar streak
- Testar leaderboard

---

#### **TASK-028: Finalizar Sistema de Vouchers** 🟢 P3
- **Status:** ⬜ TODO
- **Estimativa:** L (8-10h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Finalizar sistema de vouchers integrado com Stripe.

**Features:**
1. Compra de vouchers (Stripe Payment)
2. Aplicar voucher em sessão
3. Histórico de vouchers
4. Vouchers promocionais
5. Expiração de vouchers

**Acceptance Criteria:**
- [ ] Compra via Stripe OK
- [ ] Aplicação de voucher OK
- [ ] Validação (expiração, uso único)
- [ ] Histórico funcionando
- [ ] Códigos promocionais OK

**Implementação:**
Integrar com `services/voucherService.ts` e Stripe

**Testing:**
- Comprar voucher
- Aplicar em sessão
- Testar voucher expirado
- Testar voucher já usado
- Testar código promocional

---

#### **TASK-029: Completar Portal do Paciente** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** XL (12-16h)
- **Assignee:** TBD
- **Dependências:** TASK-027, TASK-028
- **Risco:** 🟡 Médio

**Descrição:**
Finalizar todas as páginas e funcionalidades do portal do paciente.

**Páginas:**
1. ✅ PatientDashboardPage
2. ✅ MyAppointmentsPage
3. ✅ MyExercisesPage
4. ⬜ GamificationPage (TASK-027)
5. ⬜ VoucherStorePage (TASK-028)
6. ⬜ MyVouchersPage (TASK-028)
7. ⬜ DocumentsPage
8. ⬜ PatientProgressPage
9. ⬜ PatientPainDiaryPage

**Acceptance Criteria:**
- [ ] Todas as 9 páginas 100% funcionais
- [ ] Navegação suave
- [ ] Responsivo (mobile-first)
- [ ] Acessível (WCAG 2.1 AA)
- [ ] Integração completa com backend
- [ ] Testes E2E

**Testing:**
- Testar como paciente real
- Testar em mobile
- Testar fluxos completos
- Verificar permissões

---

## 🎯 FASE 4: TESTES & DOCUMENTAÇÃO (Semanas 7-8)

### SEMANA 7: Testes

#### **TASK-030: Criar Testes Unitários para Services** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** XXL (20-24h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟢 Baixo

**Descrição:**
Criar testes unitários para services críticos.

**Services Prioritários:**
1. `patientService.ts`
2. `appointmentService.ts`
3. `geminiService.ts`
4. `whatsappService.ts`
5. `authService.ts`
6. `voucherService.ts`
7. (+ 10 mais)

**Meta:** 100+ testes unitários

**Acceptance Criteria:**
- [ ] 100+ testes unitários
- [ ] Cobertura > 80% dos services
- [ ] Todos os testes passando
- [ ] Mocks apropriados (Supabase, APIs)

**Implementação:**
```typescript
// tests/unit/services/patientService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { patientService } from '@/services/patientService';

describe('patientService', () => {
  describe('getAll', () => {
    it('should return all patients', async () => {
      const patients = await patientService.getAll();
      expect(patients).toBeInstanceOf(Array);
    });
  });

  describe('create', () => {
    it('should create a patient', async () => {
      const data = { name: 'Test', cpf: '123.456.789-00', ... };
      const patient = await patientService.create(data);
      expect(patient.id).toBeDefined();
    });
  });

  // ... mais testes
});
```

**Testing:**
```bash
npm run test:unit
npm run test:unit:coverage
```

---

#### **TASK-031: Criar Testes E2E para Fluxos Principais** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** XL (16-20h)
- **Assignee:** TBD
- **Dependências:** Nenhuma
- **Risco:** 🟡 Médio

**Descrição:**
Criar testes E2E (Playwright) para fluxos principais.

**Fluxos Críticos:**
1. Login/Logout
2. Criar paciente
3. Agendar sessão
4. Criar SOAP note
5. Gerar relatório
6. Aplicar voucher
7. Portal do paciente
8. (+ 13 mais)

**Meta:** 20+ testes E2E

**Acceptance Criteria:**
- [ ] 20+ testes E2E
- [ ] Cobertura dos fluxos críticos
- [ ] Todos os testes passando
- [ ] CI/CD rodando testes

**Implementação:**
```typescript
// tests/e2e/patient-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Patient Management', () => {
  test('should create a new patient', async ({ page }) => {
    await page.goto('/patients');
    await page.click('text=Novo Paciente');

    await page.fill('input[name="name"]', 'João Silva');
    await page.fill('input[name="cpf"]', '123.456.789-00');
    // ... fill form

    await page.click('button:has-text("Salvar")');

    await expect(page.locator('text=João Silva')).toBeVisible();
  });
});
```

**Testing:**
```bash
npm run test:e2e
npm run test:e2e:headed # com UI
```

---

#### **TASK-032: Atingir 60% Cobertura de Testes** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** L (8-10h)
- **Assignee:** TBD
- **Dependências:** TASK-030, TASK-031
- **Risco:** 🟢 Baixo

**Descrição:**
Preencher gaps de cobertura até atingir 60%+.

**Áreas com Baixa Cobertura:**
- Hooks customizados
- Utility functions
- Components complexos
- Edge cases

**Acceptance Criteria:**
- [ ] 60%+ cobertura total
- [ ] 70%+ cobertura de services
- [ ] 50%+ cobertura de components
- [ ] 80%+ cobertura de utils

**Implementação:**
```bash
# Verificar cobertura:
npm run test:unit:coverage

# Identificar gaps:
# Ver relatório HTML em coverage/index.html

# Adicionar testes para áreas com baixa cobertura
```

**Testing:**
Monitorar métricas de cobertura continuamente.

---

#### **TASK-033: Configurar CI/CD com Testes** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** M (4-6h)
- **Assignee:** TBD
- **Dependências:** TASK-030, TASK-031, TASK-032
- **Risco:** 🟢 Baixo

**Descrição:**
Configurar GitHub Actions para rodar testes em cada PR.

**Pipeline:**
1. Lint
2. Type check
3. Unit tests
4. E2E tests (em paralelo)
5. Build
6. Deploy (se main)

**Acceptance Criteria:**
- [ ] Pipeline configurado
- [ ] Testes rodando em cada PR
- [ ] Status checks obrigatórios
- [ ] Deploy automático em main

**Implementação:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:e2e
```

**Testing:**
- Criar PR de teste
- Verificar que pipeline roda
- Testar falhas (lint, testes)

---

### SEMANA 8: Documentação & Deploy

#### **TASK-034: Atualizar Documentação** 🟡 P2
- **Status:** ⬜ TODO
- **Estimativa:** L (8-10h)
- **Assignee:** TBD
- **Dependências:** Todas as tarefas anteriores
- **Risco:** 🟢 Baixo

**Descrição:**
Atualizar toda documentação refletindo mudanças.

**Documentos a Atualizar:**
1. README.md
2. DEVELOPER_GUIDE.md
3. AI_CONTEXT.md
4. BUSINESS_RULES.md
5. API_DOCUMENTATION.md
6. CHANGELOG.md (criar)

**Acceptance Criteria:**
- [ ] Todos os docs atualizados
- [ ] Screenshots atualizados
- [ ] Versões corretas
- [ ] Links funcionando
- [ ] Exemplos de código atualizados

---

#### **TASK-035: Criar Guia de Migração** 🟡 P2
- **Status:** ⬜ TODO
- **Estimativa:** M (4-6h)
- **Assignee:** TBD
- **Dependências:** TASK-034
- **Risco:** 🟢 Baixo

**Descrição:**
Criar guia de migração da versão antiga para nova.

**Conteúdo:**
1. Breaking changes
2. Passo a passo de migração
3. Scripts de migração (se necessário)
4. Troubleshooting
5. Rollback instructions

**Acceptance Criteria:**
- [ ] Guia completo
- [ ] Testado em ambiente staging
- [ ] Aprovado por tech lead

---

#### **TASK-036: Deploy em Produção** 🔴 P0
- **Status:** ⬜ TODO
- **Estimativa:** L (variável)
- **Assignee:** DevOps + Tech Lead
- **Dependências:** TODAS as tarefas anteriores
- **Risco:** 🔴 Alto

**Descrição:**
Deploy final em produção após todos os testes.

**Checklist Pré-Deploy:**
- [ ] Todos os testes passando
- [ ] Code review completo
- [ ] Documentação atualizada
- [ ] Guia de migração pronto
- [ ] Backup de produção feito
- [ ] Rollback plan pronto
- [ ] Monitoring configurado
- [ ] Alertas configurados
- [ ] Team notificado

**Estratégia de Deploy:**
1. Deploy em staging
2. Smoke tests em staging
3. Aprovação de stakeholders
4. Deploy em produção (blue-green)
5. Monitoring 24h
6. Rollback se necessário

**Acceptance Criteria:**
- [ ] Deploy bem-sucedido
- [ ] Zero erros críticos em 24h
- [ ] Performance mantida
- [ ] Todas features funcionando

---

#### **TASK-037: Monitoring Pós-Deploy** 🟠 P1
- **Status:** ⬜ TODO
- **Estimativa:** Contínuo (1 semana)
- **Assignee:** Toda equipe
- **Dependências:** TASK-036
- **Risco:** 🟡 Médio

**Descrição:**
Monitorar aplicação por 1 semana pós-deploy.

**Métricas a Monitorar:**
- Erros (Sentry)
- Performance (Lighthouse)
- Usage (Analytics)
- Feedback de usuários
- Resource usage

**Acceptance Criteria:**
- [ ] Zero erros críticos
- [ ] Performance estável
- [ ] Feedback positivo de usuários
- [ ] Nenhum rollback necessário

**Actions:**
- Daily review de métricas
- Quick fixes se necessário
- Documentar learnings

---

## 📊 RESUMO DE TASKS

### Por Fase
- **Fase 1 (Fundação):** 12 tasks
- **Fase 2 (Qualidade):** 8 tasks
- **Fase 3 (Arquitetura):** 9 tasks
- **Fase 4 (Testes/Deploy):** 8 tasks

**Total:** 37 tasks principais

### Por Prioridade
- 🔴 **P0 (Crítico):** 12 tasks
- 🟠 **P1 (Alto):** 16 tasks
- 🟡 **P2 (Médio):** 7 tasks
- 🟢 **P3 (Baixo):** 2 tasks

### Por Estimativa
- **XS (< 1h):** 0 tasks
- **S (1-2h):** 5 tasks
- **M (2-4h):** 10 tasks
- **L (4-8h):** 12 tasks
- **XL (8-16h):** 7 tasks
- **XXL (16+ h):** 3 tasks

**Esforço Total:** ~320-400 person-hours (~8-10 weeks)

---

## ✅ DEFINITION OF DONE (para cada task)

Uma task está **COMPLETA** quando:
1. ✅ Código implementado
2. ✅ TypeScript sem erros
3. ✅ ESLint sem warnings novos
4. ✅ Testes passando (unit + E2E)
5. ✅ Code review aprovado (2+ approvals)
6. ✅ Documentação atualizada (se aplicável)
7. ✅ Build de produção OK
8. ✅ Testado em staging
9. ✅ Merged na branch main
10. ✅ Deploy verificado

---

**Última Atualização:** 2025-10-18
**Autor:** Claude AI
**Status:** ✅ Pronto para Execução

**Próximo Passo:** Ver [QUICK_WINS.md](./QUICK_WINS.md) para começar!
