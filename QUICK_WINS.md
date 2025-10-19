# ⚡ QUICK WINS - Primeiras 48 Horas

**Data:** 2025-10-18
**Objetivo:** Reduzir 40-50% dos erros em 2 dias
**Status:** ⬜ PRONTO PARA COMEÇAR

---

## 🎯 OBJETIVO

Resolver problemas **simples** e de **alto impacto** nas primeiras 48 horas para:
- ✅ Reduzir erros TypeScript de 89 → ~45 (50%)
- ✅ Reduzir warnings ESLint de 100+ → ~30 (70%)
- ✅ Build mais rápido (5-10%)
- ✅ Código mais limpo
- ✅ Moral da equipe ↑↑↑

---

## 📋 SPRINT 0: DIA 1 - MANHÃ (4h)

### ⚡ QW-01: Remover Console.log (1h) 🟢 FÁCIL
**Impacto:** 🟢 Médio | **Risco:** 🟢 Baixo | **Prioridade:** P1

**O que fazer:**
Remover 20+ `console.log` statements.

**Arquivos:** ~20 arquivos
- `components/AiAssistant.tsx`
- `components/AppointmentFormModal.tsx`
- E mais 18

**Como fazer:**
```bash
# 1. Find all console.log:
grep -r "console.log" --include="*.tsx" --include="*.ts" | wc -l

# 2. Opção A - Remover manualmente:
# Abrir cada arquivo e remover console.log

# 3. Opção B - Usar sed (cuidado!):
# NÃO fazer isso sem revisar!
```

**Verificar:**
```bash
npm run lint | grep "no-console"
# Deve retornar 0 results
```

**Estimativa:** ⏱️ 1h
**Ganho:** -20 warnings ESLint

---

### ⚡ QW-02: Remover Imports Não Usados (2h) 🟢 FÁCIL
**Impacto:** 🟡 Alto | **Risco:** 🟢 Baixo | **Prioridade:** P1

**O que fazer:**
Remover 30+ imports não usados.

**Exemplos:**
```typescript
// ANTES:
import { Users, Calendar, Settings, Home } from 'lucide-react';
// Só usa Users

// DEPOIS:
import { Users } from 'lucide-react';
```

**Como fazer:**
```bash
# 1. Auto-fix o que for seguro:
npm run lint:fix

# 2. Verificar mudanças:
git diff

# 3. Testar:
npm run dev

# 4. Commit se OK:
git add .
git commit -m "chore: remove unused imports"
```

**Verificar:**
```bash
npm run lint | grep "no-unused"
# Redução significativa
```

**Estimativa:** ⏱️ 2h (muitos arquivos)
**Ganho:** -30 warnings ESLint

---

### ⚡ QW-03: Adicionar Export geminiService (1h) 🟢 FÁCIL
**Impacto:** 🔴 Crítico | **Risco:** 🟢 Baixo | **Prioridade:** P0

**O que fazer:**
Adicionar export `geminiService` que está faltando.

**Arquivo:** `services/geminiService.ts`

**Como fazer:**
```typescript
// services/geminiService.ts
// NO FINAL DO ARQUIVO, adicionar:

export const geminiService = {
  generateEvolution,
  generateHEP,
  generateReport,
  analyzeRisk,
  generateClinicalSuggestions,
  // ... outros métodos existentes
};
```

**Arquivos que usam:** 4 arquivos
- `components/ai-tools/tool-modals/GenerateEvolutionModal.tsx`
- `components/ai-tools/tool-modals/GenerateHEPModal.tsx`
- `components/ai-tools/tool-modals/GenerateReportModal.tsx`
- `components/ai-tools/tool-modals/RiskAnalysisModal.tsx`

**Verificar:**
```bash
npm run type-check | grep "geminiService"
# Deve retornar 0 errors
```

**Estimativa:** ⏱️ 1h
**Ganho:** -4 erros TypeScript

---

## 📋 SPRINT 0: DIA 1 - TARDE (4h)

### ⚡ QW-04: Adicionar Imports de Ícones (2h) 🟢 FÁCIL
**Impacto:** 🔴 Alto | **Risco:** 🟢 Baixo | **Prioridade:** P0

**O que fazer:**
Adicionar imports de ícones faltando do `lucide-react`.

**Ícones faltando:**
- `Clock` (10 usos)
- `XCircle` (3 usos)
- `Badge` (6 usos)
- `AlertCircle` (2 usos)
- `Mail` (2 usos)
- `Phone` (2 usos)
- `Activity` (3 usos)

**Como fazer:**
```typescript
// NO TOPO de cada arquivo afetado, adicionar:
import { Clock } from 'lucide-react';
// ou
import { Clock, XCircle, Activity } from 'lucide-react';
```

**Arquivos afetados:** ~15 arquivos
1. `components/assignments/AssignmentCard.tsx` - Clock, XCircle
2. `components/assignments/AssignExerciseModal.tsx` - Badge (6x)
3. `components/atendimento/SurgeryManager.tsx` - Clock
4. `components/patients/PatientListModern.tsx` - AlertCircle, Mail, Phone
5. `components/patient/EvolutionReport.tsx` - Activity
6. `components/protocols/ProtocolPreview.tsx` - Activity

**Verificar:**
```bash
npm run type-check | grep "Cannot find name"
# Deve reduzir significativamente
```

**Estimativa:** ⏱️ 2h
**Ganho:** -20+ erros TypeScript

---

### ⚡ QW-05: Corrigir Patient Types Básicos (2h) 🟡 MÉDIO
**Impacto:** 🔴 Crítico | **Risco:** 🟡 Médio | **Prioridade:** P0

**O que fazer:**
Adicionar propriedades faltando em `Patient` interface.

**Arquivo:** `types.ts`

**Propriedades a adicionar:**
```typescript
// types.ts - interface Patient
export interface Patient {
  // ... existing properties ...

  // === Clínico - Patologia Principal ===
  /**
   * Patologia principal do paciente
   */
  main_pathology?: string;

  /**
   * Região do corpo afetada pela patologia principal
   */
  main_pathology_region?: string;

  // ... rest of properties ...
}
```

**Arquivos afetados:**
- `components/body-map/BodyMapManager.tsx` (10 usos)

**Verificar:**
```bash
npm run type-check | grep "main_pathology"
# Deve retornar 0 errors
```

**Estimativa:** ⏱️ 2h
**Ganho:** -10 erros TypeScript

---

## 📋 SPRINT 0: DIA 2 (8h)

### ⚡ QW-06: Corrigir Surgery.recoveryTimeDays (1h) 🟢 FÁCIL
**Impacto:** 🟡 Médio | **Risco:** 🟢 Baixo | **Prioridade:** P0

**O que fazer:**
Renomear `surgery.recoveryTime` para `surgery.recoveryTimeDays`.

**Arquivo:** `components/atendimento/SurgeryManager.tsx`

**Como fazer:**
```typescript
// Find & Replace in file:
// recoveryTime → recoveryTimeDays

// OU manualmente trocar nos 7 lugares:
// ANTES:
const recovery = surgery.recoveryTime;

// DEPOIS:
const recovery = surgery.recoveryTimeDays;
```

**Verificar:**
```bash
npm run type-check | grep "recoveryTime"
# Deve retornar 0 errors
```

**Estimativa:** ⏱️ 1h
**Ganho:** -7 erros TypeScript

---

### ⚡ QW-07: Corrigir PatientGoal.achievedAt (1h) 🟢 FÁCIL
**Impacto:** 🟡 Médio | **Risco:** 🟢 Baixo | **Prioridade:** P0

**O que fazer:**
Usar `achievedAt` ao invés de `completedAt` (que não existe).

**Arquivo:** `components/atendimento/PatientGoalsManager.tsx`

**Como fazer:**
```typescript
// Trocar nos 2 lugares:
// ANTES:
const completionDate = goal.completedAt;
if (goal.status === 'completed' && goal.completedAt) { ... }

// DEPOIS:
const completionDate = goal.achievedAt;
if (goal.status === 'completed' && goal.achievedAt) { ... }
```

**Verificar:**
```bash
npm run type-check | grep "completedAt"
# Deve retornar 0 errors (neste componente)
```

**Estimativa:** ⏱️ 1h
**Ganho:** -2 erros TypeScript

---

### ⚡ QW-08: Corrigir AppointmentStatus Enum (2h) 🟡 MÉDIO
**Impacto:** 🟡 Médio | **Risco:** 🟡 Médio | **Prioridade:** P1

**O que fazer:**
Usar enum ao invés de string literal para `AppointmentStatus`.

**Arquivos:**
- `components/agenda/NotificationCenter.tsx` (2 lugares)
- `components/agenda/QuickAddPatientDialog.tsx` (1 lugar)

**Como fazer:**
```typescript
// ANTES:
if (appointment.status === "scheduled") { ... }

// DEPOIS:
if (appointment.status === AppointmentStatus.Scheduled) { ... }
```

**Verificar:**
```bash
npm run type-check | grep "AppointmentStatus"
# Deve retornar 0 errors
```

**Estimativa:** ⏱️ 2h
**Ganho:** -3 erros TypeScript

---

### ⚡ QW-09: Adicionar InventoryAlertType Properties (1h) 🟢 FÁCIL
**Impacto:** 🟡 Médio | **Risco:** 🟢 Baixo | **Prioridade:** P1

**O que fazer:**
Adicionar propriedades faltando no enum `InventoryAlertType`.

**Arquivo:** `types.ts` ou criar `types/inventoryTypes.ts`

**Como fazer:**
```typescript
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

**Verificar:**
```bash
npm run type-check | grep "InventoryAlertType"
# Deve retornar 0 errors
```

**Estimativa:** ⏱️ 1h
**Ganho:** -5 erros TypeScript

---

### ⚡ QW-10: Criar Types Faltando (3h) 🟡 MÉDIO
**Impacto:** 🟡 Médio | **Risco:** 🟢 Baixo | **Prioridade:** P1

**O que fazer:**
Criar arquivos de types faltando.

**Arquivos a criar:**

**1. `types/predictiveAnalyticsTypes.ts`:**
```typescript
export interface OutcomeScenario {
  id: string;
  scenario: string;
  probability: number; // 0-100
  outcome: 'positive' | 'neutral' | 'negative';
  factors: string[];
  recommendations: string[];
}
```

**2. `types/populationHealthTypes.ts`:**
```typescript
export interface HealthTrend {
  id: string;
  metric: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  value: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'stable';
  data: Array<{
    date: string;
    value: number;
  }>;
}
```

**Verificar:**
```bash
npm run type-check | grep "OutcomeScenario\|HealthTrend"
# Deve retornar 0 errors
```

**Estimativa:** ⏱️ 3h
**Ganho:** -2 erros TypeScript + types bem definidos

---

## 📊 RESUMO DO SPRINT 0 (2 DIAS)

### Tarefas
| QW | Tarefa | Tempo | Ganho |
|----|--------|-------|-------|
| QW-01 | Remover console.log | 1h | -20 warnings |
| QW-02 | Remover imports não usados | 2h | -30 warnings |
| QW-03 | Export geminiService | 1h | -4 erros TS |
| QW-04 | Imports de ícones | 2h | -20 erros TS |
| QW-05 | Patient types | 2h | -10 erros TS |
| QW-06 | Surgery.recoveryTimeDays | 1h | -7 erros TS |
| QW-07 | PatientGoal.achievedAt | 1h | -2 erros TS |
| QW-08 | AppointmentStatus enum | 2h | -3 erros TS |
| QW-09 | InventoryAlertType | 1h | -5 erros TS |
| QW-10 | Criar types faltando | 3h | -2 erros TS |
| **TOTAL** | **10 tarefas** | **16h** | **-103 issues** |

### Impacto Esperado

#### Antes (Baseline)
- ❌ **89 erros TypeScript**
- ❌ **100+ warnings ESLint**
- ❌ **11 imports Next.js**
- 🟡 Build médio

#### Depois (Pós Quick Wins)
- ✅ **~36 erros TypeScript** (-53 erros, -60%)
- ✅ **~50 warnings ESLint** (-50 warnings, -50%)
- ❌ **11 imports Next.js** (ainda pendente)
- 🟢 Build mais rápido (5-10%)

### Moral da Equipe
- 😕 **Antes:** Muitos erros, desmotivação
- 😊 **Depois:** Progresso visível, motivação ↑

---

## ✅ CHECKLIST RÁPIDO

### Pré-Requisitos
- [ ] Git repo atualizado
- [ ] Branch nova criada: `git checkout -b quick-wins/sprint-0`
- [ ] Node modules atualizados: `npm install`
- [ ] Baseline capturado:
  ```bash
  npm run type-check > baseline-type-errors.txt
  npm run lint > baseline-lint.txt
  ```

### Durante Execução
- [ ] Commits pequenos (1 QW = 1 commit)
- [ ] Testar após cada QW: `npm run dev`
- [ ] Type-check contínuo: `npm run type-check`
- [ ] Lint contínuo: `npm run lint`

### Pós-Execução
- [ ] Comparar antes/depois:
  ```bash
  npm run type-check > after-type-errors.txt
  diff baseline-type-errors.txt after-type-errors.txt
  ```
- [ ] Build de produção: `npm run build`
- [ ] Testes E2E: `npm run test:e2e`
- [ ] Create PR com título: "chore: Quick Wins - Sprint 0"
- [ ] Request reviews (2+)
- [ ] Merge quando aprovado
- [ ] Celebrar! 🎉

---

## 🚀 COMO COMEÇAR AGORA

### Opção A: Fazer Tudo em Sequência
```bash
# 1. Setup
git checkout -b quick-wins/sprint-0
npm run type-check > baseline-type-errors.txt
npm run lint > baseline-lint.txt

# 2. Executar QW-01 a QW-10 em ordem
# (seguir instruções acima)

# 3. Finalizar
npm run type-check > after-type-errors.txt
npm run build
git push origin quick-wins/sprint-0
# Create PR
```

### Opção B: Dividir em 2 Pessoas
**Pessoa 1 - DIA 1:**
- QW-01: Console.log (1h)
- QW-02: Imports (2h)
- QW-03: geminiService (1h)

**Pessoa 2 - DIA 1:**
- QW-04: Ícones (2h)
- QW-05: Patient types (2h)

**Pessoa 1 - DIA 2:**
- QW-06: Surgery (1h)
- QW-07: PatientGoal (1h)
- QW-08: AppointmentStatus (2h)

**Pessoa 2 - DIA 2:**
- QW-09: InventoryAlertType (1h)
- QW-10: Types faltando (3h)

**Total por pessoa:** 8h/dia × 2 pessoas = 2 dias

### Opção C: Automatizar o Possível
```bash
# Automatizar QW-02 (imports):
npm run lint:fix

# Automatizar QW-01 (console.log) - CUIDADO!
# Não recomendado sem revisão manual
```

---

## 🎯 PRÓXIMOS PASSOS (Depois do Sprint 0)

1. ✅ **Comemorar!** Quick Wins completos
2. 📊 **Revisar métricas:**
   - Quantos erros restam?
   - Qual a nova baseline?
3. 📋 **Começar Fase 1 do Roadmap:**
   - Ver [TASKS.md](./TASKS.md) - TASK-001 a TASK-012
   - Foco: Remover imports Next.js
4. 🔄 **Continuar momentum:**
   - 1 task por dia
   - Commits frequentes
   - Reviews rápidos

---

## 💡 DICAS PRO

### Performance
- Use VSCode com TypeScript Server ativo
- Use ESLint extension para ver warnings em real-time
- Use Git GUI para commits mais fáceis

### Qualidade
- Sempre rodar `npm run type-check` antes de commit
- Sempre rodar `npm run lint` antes de commit
- Sempre testar `npm run dev` depois de mudanças
- Nunca commitar código quebrado

### Produtividade
- Use Regex find/replace quando aplicável
- Use multi-cursor do VSCode
- Use snippets para imports comuns
- Use Git stash para pausar work-in-progress

### Colaboração
- Comunicar progresso no Slack/Teams
- Pedir ajuda se travar > 30min
- Compartilhar learnings no final do dia
- Pair programming para tasks difíceis

---

## 🏆 CRITÉRIOS DE SUCESSO

Sprint 0 é **SUCESSO** se:
- [x] Todos os 10 QWs completados
- [x] Redução de 50%+ nos erros TypeScript
- [x] Redução de 50%+ nos warnings ESLint
- [x] Build de produção OK
- [x] Testes E2E passando
- [x] PR merged
- [x] Time feliz! 😊

---

**Última Atualização:** 2025-10-18
**Autor:** Claude AI
**Status:** ✅ Pronto para Começar

**🚀 COMECE AGORA! O código não vai se limpar sozinho! 😄**
