# 📊 Progresso da Migração Monday.com - MoocaFisio

**Data:** 06/01/2025  
**Status:** Base Implementada + 1 Página Migrada

---

## ✅ O Que Foi Completado

### 🎨 Fase 1-2: Sistema de Cores e Componentes (100%)

**Infraestrutura Completa:**
- ✅ Paleta Monday.com unificada
- ✅ 8 componentes base criados
- ✅ 3 componentes específicos migrados  
- ✅ Documentação completa (1500+ linhas)
- ✅ Bug de import corrigido

**Componentes do Design System:**
1. ✅ Button (primary, secondary, outline, ghost)
2. ✅ Card (default, elevated, outlined + sub-componentes)
3. ✅ Input (com label, error, icons)
4. ✅ Badge (7 variantes)
5. ✅ Table (6 componentes)
6. ✅ Modal (com animações)
7. ✅ Typography (H1-H4, Body, Small, Caption)
8. ✅ Section (layout com backgrounds alternados)

**Componentes Específicos:**
- ✅ StatCard (dashboard) - Monday.com
- ✅ AppointmentCard (agenda) - Monday.com
- ✅ ResponsiveLayoutV2 (marca atualizada)

---

### 📄 Fase 3: Migração de Páginas

#### ✅ Páginas Migradas (1/143)

**1. DashboardPageV2.tsx** - ✅ COMPLETO
- ✅ Tipografia Monday.com (H1, Body)
- ✅ Espaçamento 8px (space-y-xl, gap-md, gap-sm)
- ✅ Cores neutras (text-neutral-textSecondary)
- ✅ Card com cores Monday.com (bg-primary-light)
- ✅ Zero erros de linting

**Mudanças Aplicadas:**
```tsx
// Antes
<h1 className="text-3xl font-bold">Dashboard</h1>
<p className="text-muted-foreground">...</p>
<div className="space-y-6">

// Depois
<H1>Dashboard</H1>
<Body className="text-neutral-textSecondary mt-sm">...</Body>
<div className="space-y-xl">
```

---

#### 🔴 Páginas Pendentes (142/143)

**Alta Prioridade (4 páginas):**
- 🔴 PatientListPageV2.tsx
- 🔴 AgendaPage.tsx
- 🔴 PatientDetailPage.tsx
- 🔴 FinancialPage.tsx

**Média Prioridade (~19 páginas):**
- AdminDashboardPage.tsx
- TherapistDashboard.tsx
- NotificationCenterPage.tsx
- AcompanhamentoPage.tsx
- SessionEvolutionPage.tsx
- CRMDashboardPage.tsx
- AnalyticsDashboardPage.tsx
- ReportsPage.tsx
- ...e outras 11 páginas

**Baixa Prioridade (~120 páginas):**
- Todas as páginas em `patient-portal/`
- Todas as páginas em `partner-portal/`
- Páginas especializadas
- Páginas de teste/demo

---

## 📋 Guia Rápido de Migração

### Padrão de Migração (Copie e Aplique)

**Passo 1: Imports**
```typescript
// Adicione ao topo do arquivo
import { H1, H2, H3, H4, Body, Small } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
```

**Passo 2: Substituições de Cores**
```tsx
// Find & Replace
bg-fisio-primary-600    → bg-primary
bg-fisio-neutral-50     → bg-neutral-bgAlt
text-fisio-neutral-800  → text-neutral-text
text-gray-600           → text-neutral-textSecondary
text-gray-400           → text-neutral-textTertiary
bg-blue-100             → bg-primary-light
bg-green-100            → bg-success-light
text-green-600          → text-success
bg-red-100              → bg-error-light
text-red-600            → text-error
border-slate-200        → border-neutral-border
text-muted-foreground   → text-neutral-textSecondary
```

**Passo 3: Tipografia**
```tsx
// Find & Replace
<h1 className="text-3xl font-bold              → <H1
<h2 className="text-2xl font-bold              → <H2
<h3 className="text-xl font-semibold           → <H3
<p className="text-gray-600                    → <Body className="text-neutral-textSecondary
```

**Passo 4: Espaçamento**
```tsx
// Find & Replace
space-y-6   → space-y-xl
space-y-4   → space-y-md
gap-4       → gap-md
gap-2       → gap-sm
p-6         → p-lg
p-4         → p-md
mb-8        → mb-3xl
mt-4        → mt-md
```

**Passo 5: Cards**
```tsx
// Antes
<div className="bg-white p-6 rounded-lg shadow-md">
  <h3>Título</h3>
  <p>Descrição</p>
</div>

// Depois
<Card padding="lg">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
</Card>
```

**Passo 6: Badges**
```tsx
// Antes
<span className="bg-green-100 text-green-800">Ativo</span>

// Depois
<Badge variant="success">Ativo</Badge>
```

---

## 🚀 Como Continuar a Migração

### Opção A: Migração Manual (Recomendado)

**Para cada página:**

1. **Ler a página**
   ```bash
   # Exemplo
   cat pages/PatientListPageV2.tsx
   ```

2. **Aplicar padrão de migração**
   - Adicionar imports do Typography
   - Substituir cores (Find & Replace)
   - Substituir tipografia
   - Atualizar espaçamento
   - Trocar divs por Cards

3. **Validar**
   ```bash
   npm run lint
   npm run type-check
   ```

4. **Testar visualmente**
   ```bash
   npm run dev
   # Acesse a página no navegador
   ```

### Opção B: Script Automatizado (Mais Rápido)

**Criar script de migração:**

```typescript
// scripts/migrate-to-monday.ts
import fs from 'fs';
import path from 'path';

const replacements = [
  ['text-muted-foreground', 'text-neutral-textSecondary'],
  ['bg-fisio-primary-600', 'bg-primary'],
  ['space-y-6', 'space-y-xl'],
  ['gap-4', 'gap-md'],
  ['p-6', 'p-lg'],
  // ... adicionar todas as substituições
];

function migratePage(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  replacements.forEach(([old, new]) => {
    content = content.replace(new RegExp(old, 'g'), new);
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Migrated: ${filePath}`);
}

// Migrar todas as páginas
const pagesDir = 'pages/';
const pages = fs.readdirSync(pagesDir)
  .filter(f => f.endsWith('.tsx'))
  .map(f => path.join(pagesDir, f));

pages.forEach(migratePage);
```

**Executar:**
```bash
npx tsx scripts/migrate-to-monday.ts
```

### Opção C: Migração Incremental (Mais Seguro)

**Migrar por grupos:**

1. **Semana 1:** Páginas críticas (5 páginas)
2. **Semana 2:** Dashboards (10 páginas)
3. **Semana 3:** Clínico (20 páginas)
4. **Semana 4:** Gestão e CRM (20 páginas)
5. **Semana 5:** Portais (30 páginas)
6. **Semana 6:** Páginas restantes (57 páginas)

**Benefícios:**
- Testar após cada grupo
- Feedback incremental
- Menor risco de bugs
- Melhor controle de qualidade

---

## 🧪 Testes com Playwright

### Setup Básico

```typescript
// tests/pages/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('Dashboard - Validação Monday.com', async ({ page }) => {
  // Navegar
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Validar H1 Monday.com
  const h1 = page.locator('h1').first();
  await expect(h1).toContainText('Dashboard');
  
  // Validar cores Monday.com
  const primaryElements = page.locator('[class*="bg-primary"]');
  await expect(primaryElements.first()).toBeVisible();
  
  // Screenshot
  await page.screenshot({ 
    path: 'screenshots/dashboard-monday.png',
    fullPage: true 
  });
});
```

### Executar Testes
```bash
npx playwright test tests/pages/dashboard.spec.ts
```

---

## 📚 Recursos Disponíveis

### Documentação
1. **`docs/MONDAY_REDESIGN_GUIDE.md`** - Guia completo (600+ linhas)
2. **`REDESIGN_MONDAY_SUMMARY.md`** - Resumo executivo
3. **`REVISAO_DETALHADA.md`** - Análise técnica
4. **`REVISAO_FINAL_COM_CORRECAO.md`** - Status 100%
5. **`CORRECAO_ERRO_IMPORT.md`** - Bug fix documentado
6. **`PROGRESSO_MIGRACAO_MONDAY.md`** - Este arquivo

### Componentes
```typescript
// Todos disponíveis em src/components/ui/
Button, Card, Input, Badge, Table, Modal, Typography, Section

// Específicos
StatCard, AppointmentCard
```

### Paleta de Cores
```
Primary:  #5034FF (roxo Monday.com)
Success:  #00CA72 (verde)
Warning:  #FDAB3D (laranja)
Error:    #E44258 (vermelho)
```

---

## 📊 Estatísticas do Progresso

| Categoria | Completo | Pendente | % |
|-----------|----------|----------|---|
| **Design System** | 11/11 | 0/11 | 100% |
| **Documentação** | 6/6 | 0/6 | 100% |
| **Páginas Críticas** | 1/5 | 4/5 | 20% |
| **Páginas Total** | 1/143 | 142/143 | 0.7% |

---

## 🎯 Próximos Passos Recomendados

### Imediato (Hoje)
1. ✅ Migrar PatientListPageV2.tsx
2. ✅ Migrar AgendaPage.tsx
3. ✅ Testar as 3 páginas migradas

### Curto Prazo (Esta Semana)
4. Migrar PatientDetailPage.tsx
5. Migrar FinancialPage.tsx
6. Criar testes Playwright para as 5 páginas

### Médio Prazo (Este Mês)
7. Migrar dashboards (Admin, Therapist, Analytics)
8. Migrar páginas clínicas principais
9. Migrar páginas de gestão

### Longo Prazo (Próximos 2 Meses)
10. Migrar portais (patient, partner)
11. Migrar páginas especializadas
12. Migrar páginas de teste/demo

---

## ✅ Checklist por Página

Use este checklist ao migrar cada página:

- [ ] Imports do Typography adicionados
- [ ] Cores antigas substituídas por Monday.com
- [ ] H1/H2/H3 trocados por componentes
- [ ] Parágrafos trocados por Body/Small
- [ ] Espaçamento atualizado (8px system)
- [ ] Divs trocados por Cards onde apropriado
- [ ] Badges com variantes Monday.com
- [ ] Linter sem erros (`npm run lint`)
- [ ] TypeScript validado (`npm run type-check`)
- [ ] Teste visual no navegador
- [ ] Screenshot before/after
- [ ] Teste Playwright (opcional)

---

## 🚨 Problemas Comuns e Soluções

### 1. Import Error "No matching export"
**Problema:** Import de Card não funciona

**Solução:**
```typescript
// Use caminho relativo se alias não funcionar
import Card from '../../src/components/ui/Card';
```

### 2. Classes Tailwind não aplicadas
**Problema:** Cores Monday.com não aparecem

**Solução:**
```bash
# Reiniciar dev server
npm run dev
```

### 3. Tipografia muito grande
**Problema:** H1 muito grande na página

**Solução:**
```tsx
// Use H2 ou H3 ao invés de H1
<H2>Título da Página</H2>
```

---

## 📞 Suporte

- **Guias:** Ver `docs/MONDAY_REDESIGN_GUIDE.md`
- **Exemplos:** Ver `src/components/examples/MondayDesignShowcase.tsx`
- **Showcase:** Acessar `/design-system` no navegador

---

**Última Atualização:** 06/01/2025  
**Próxima Revisão:** Após migrar mais 4 páginas críticas  
**Status:** 🟢 PRONTO PARA CONTINUAR

