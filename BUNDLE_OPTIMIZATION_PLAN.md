# 📦 Plano de Otimização de Bundle - Fase 2

**Data:** 4 de Novembro de 2025
**Status:** 🟡 Em Progresso
**Objetivo:** Reduzir vendor-misc de 792KB para < 400KB

---

## 🔍 Análise Atual (Baseline)

### Métricas Atuais
```
Total Bundles: 26
Vendor Bundles: 11
Page Bundles: 0 ⚠️ (code splitting não funcionando)
Tamanho Total: 6.49 MB
```

### Bundles Problemáticos

#### 🔴 CRÍTICO: vendor-misc (792KB)
**Tamanho:** 792.06 KB (11.9% do total)
**Budget:** 400 KB
**Excesso:** 392 KB (98% acima do budget)

**Conteúdo Provável:**
- Bibliotecas diversas não categorizadas
- Possíveis duplicações
- Dependências não tree-shaked corretamente

---

#### 🔴 CRÍTICO: Main Bundle (index) (1.01 MB)
**Tamanho:** 1.01 MB
**Budget:** 200 KB
**Excesso:** 837 KB (419% acima do budget)

**Problema:** Bundle principal muito grande, indica que code splitting não está funcionando adequadamente.

---

#### ⚠️ WARNING: Code Splitting Não Funcional
**Problema:** Nenhum page bundle identificado.

**Bundles Encontrados:**
- `comp-common-CGZJUt_B.js` - 1.6 MB
- `comp-dashboard-B6WBRMcy.js` - 36 KB
- `comp-features-BQktpx9g.js` - 48 KB
- `comp-ui-BNiBLvdN.js` - 95 KB
- `feature-ai-C1iPy19T.js` - 2.8 KB
- `feature-capture-BILt7_IL.js` - 198 KB
- `feature-charts-J2vJoRSQ.js` - 300 KB
- `feature-editor-Kt_B-CdG.js` - 379 KB
- `feature-pdf-DysNpOxN.js` - 333 KB
- `page-business-CACIReoA.js` - 76 KB
- `page-clinical-CE_Pp6-6.js` - 71 KB
- `page-dashboard-BcqISCs5.js` - 158 KB
- `page-other-DK8kCSb6.js` - 637 KB
- `page-settings-XCCWE9kd.js` - 51 KB

**Nota:** O sistema de naming está funcionando, mas o script de análise não os reconhece como "page bundles" pois procura por "Page" com maiúsculo.

---

## 🎯 Objetivos de Otimização

### Metas Fase 2

| Bundle | Atual | Target | Redução Necessária |
|--------|-------|--------|--------------------|
| vendor-misc | 792 KB | < 400 KB | -392 KB (49%) |
| Main (index) | 1.01 MB | < 200 KB | -837 KB (82%) |
| comp-common | 1.6 MB | < 500 KB | -1.1 MB (69%) |
| feature-charts | 300 KB | < 200 KB | -100 KB (33%) |
| feature-editor | 379 KB | < 250 KB | -129 KB (34%) |
| feature-pdf | 333 KB | < 250 KB | -83 KB (25%) |
| page-other | 637 KB | < 300 KB | -337 KB (53%) |
| **Total** | **6.49 MB** | **< 4 MB** | **-2.49 MB (38%)** |

---

## 🛠️ Estratégias de Otimização

### Estratégia 1: Otimizar vendor-misc (Prioridade ALTA)

#### 1.1. Identificar Conteúdo
```bash
# Analisar vendor-misc no stats.html
npm run build:analyze

# Procurar por vendor-misc no visualizador
```

#### 1.2. Split Manual em vite.config.ts
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Atual (preservar)
          'vendor-react-core': ['react', 'react-dom', 'react/jsx-runtime'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            // ... outros Radix
          ],
          'vendor-ui-framer': ['framer-motion'],
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'vendor-date': ['date-fns'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react', 'react-icons'],
          'vendor-notifications': ['sonner', 'react-toastify'],

          // NOVO: Split vendor-misc
          'vendor-charts': ['recharts'],
          'vendor-ai': ['@google/generative-ai', '@anthropic-ai/sdk'],
          'vendor-table': ['@tanstack/react-table', '@tanstack/react-virtual'],
          'vendor-editor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-link',
            // ... outros Tiptap
          ],
          'vendor-pdf': ['jspdf', 'jspdf-autotable', 'html2pdf.js'],
          'vendor-stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'vendor-analytics': [
            '@vercel/analytics',
            '@vercel/speed-insights',
            '@sentry/react'
          ],
        }
      }
    }
  }
});
```

**Resultado Esperado:**
- vendor-misc reduzido de 792KB para < 100KB
- Novos bundles criados (charts, ai, table, editor, pdf, stripe, analytics)
- Cada novo bundle < 200KB

---

### Estratégia 2: Reduzir Main Bundle (Prioridade ALTA)

#### 2.1. Problema
Main bundle está com 1.01MB porque está incluindo código que deveria estar em chunks separados.

#### 2.2. Solução: Configurar Thresholds
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // ... (splits acima)
        },
        // NOVO: Configurar thresholds
        experimentalMinChunkSize: 20000, // 20KB mínimo
        chunkSizeWarningLimit: 500, // Warning para chunks > 500KB
      }
    },
    // NOVO: Configurações de chunking
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true, // Split CSS por chunk
  }
});
```

**Resultado Esperado:**
- Main bundle reduzido para < 200KB
- Melhor distribuição de código entre chunks

---

### Estratégia 3: Otimizar comp-common (1.6MB)

#### 3.1. Problema
comp-common está gigante (1.6MB) porque contém muitos componentes compartilhados.

#### 3.2. Solução: Split por Categoria
```typescript
manualChunks(id) {
  // Vendor splits (já existentes)
  if (id.includes('node_modules')) {
    // ... (lógica vendor)
  }

  // NOVO: Component splits
  if (id.includes('src/components')) {
    // UI Components
    if (id.includes('components/ui/')) {
      return 'comp-ui';
    }
    // Dashboard Components
    if (id.includes('components/dashboard/')) {
      return 'comp-dashboard';
    }
    // Agenda Components
    if (id.includes('components/agenda/')) {
      return 'comp-agenda';
    }
    // Shared Components
    return 'comp-common';
  }

  // Feature splits
  if (id.includes('src/services')) {
    if (id.includes('services/ai')) {
      return 'feature-ai';
    }
    if (id.includes('services/charts') || id.includes('services/dashboard')) {
      return 'feature-charts';
    }
    if (id.includes('services/editor')) {
      return 'feature-editor';
    }
    if (id.includes('services/pdf')) {
      return 'feature-pdf';
    }
    if (id.includes('services/capture')) {
      return 'feature-capture';
    }
  }

  // Page splits
  if (id.includes('src/pages')) {
    if (id.includes('pages/dashboard') || id.includes('pages/Dashboard')) {
      return 'page-dashboard';
    }
    if (id.includes('pages/agenda') || id.includes('pages/Agenda')) {
      return 'page-business';
    }
    if (id.includes('pages/patient') || id.includes('pages/treatment')) {
      return 'page-clinical';
    }
    if (id.includes('pages/settings') || id.includes('pages/profile')) {
      return 'page-settings';
    }
    return 'page-other';
  }
}
```

**Resultado Esperado:**
- comp-common reduzido para < 500KB
- Componentes distribuídos em chunks apropriados

---

### Estratégia 4: Lazy Loading Agressivo

#### 4.1. Charts sob Demanda
```typescript
// Antes:
import { BarChart, LineChart, PieChart } from 'recharts';

// Depois:
const BarChart = lazy(() => import('recharts').then(m => ({ default: m.BarChart })));
const LineChart = lazy(() => import('recharts').then(m => ({ default: m.LineChart })));
```

#### 4.2. Editor sob Demanda
```typescript
// Antes:
import { Editor } from '@tiptap/react';

// Depois:
const Editor = lazy(() => import('./components/editor/Editor'));
```

#### 4.3. PDF Generation sob Demanda
```typescript
// Antes:
import { generatePDF } from './services/pdf';

// Depois:
const generatePDF = async () => {
  const { generatePDF } = await import('./services/pdf');
  return generatePDF();
};
```

---

### Estratégia 5: Tree-Shaking Agressivo

#### 5.1. date-fns
```typescript
// Antes:
import * as dateFns from 'date-fns';

// Depois:
import { format, parseISO, addDays } from 'date-fns';
```

#### 5.2. lodash
```typescript
// Antes:
import _ from 'lodash';

// Depois:
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

#### 5.3. Radix UI
```typescript
// Verificar se todos os imports são diretos:
// ✅ BOM
import { Dialog } from '@radix-ui/react-dialog';

// ❌ RUIM
import { Dialog } from '@radix-ui/react';
```

---

## 📅 Plano de Implementação

### Fase 2.1: Análise e Split de vendor-misc (2h)
- [x] Executar `npm run build:analyze`
- [ ] Identificar componentes do vendor-misc
- [ ] Criar splits específicos no vite.config.ts
- [ ] Build e validar tamanhos
- [ ] Commit: "chore: split vendor-misc into categorized bundles"

### Fase 2.2: Reduzir Main Bundle (1h)
- [ ] Configurar thresholds de chunking
- [ ] Ajustar manualChunks para melhor distribuição
- [ ] Build e validar < 200KB
- [ ] Commit: "perf: reduce main bundle to < 200KB"

### Fase 2.3: Otimizar comp-common (2h)
- [ ] Implementar manualChunks por categoria
- [ ] Mover componentes para chunks apropriados
- [ ] Build e validar < 500KB
- [ ] Commit: "perf: split comp-common by category"

### Fase 2.4: Lazy Loading (1.5h)
- [ ] Implementar lazy loading para charts
- [ ] Implementar lazy loading para editor
- [ ] Implementar lazy loading para PDF
- [ ] Adicionar Suspense boundaries
- [ ] Commit: "perf: implement aggressive lazy loading"

### Fase 2.5: Tree-Shaking (1h)
- [ ] Revisar imports de date-fns
- [ ] Revisar imports de lodash (se usado)
- [ ] Verificar imports de Radix UI
- [ ] Build e validar redução
- [ ] Commit: "perf: improve tree-shaking with direct imports"

### Fase 2.6: Validação Final (30min)
- [ ] Executar `npm run bundle:analyze:size`
- [ ] Verificar todos os targets atingidos
- [ ] Validar performance em produção
- [ ] Documentar resultados

**Tempo Total Estimado:** 8 horas

---

## 📊 Métricas de Sucesso

### Targets Finais

| Métrica | Antes | Target | Status |
|---------|-------|--------|--------|
| vendor-misc | 792 KB | < 400 KB | 🟡 Pendente |
| Main Bundle | 1.01 MB | < 200 KB | 🟡 Pendente |
| comp-common | 1.6 MB | < 500 KB | 🟡 Pendente |
| Total Size | 6.49 MB | < 4 MB | 🟡 Pendente |
| Num Bundles | 26 | ~35-40 | 🟡 Pendente |

### KPIs de Performance

- **FCP (First Contentful Paint):** < 1.5s
- **LCP (Largest Contentful Paint):** < 2.5s
- **TTI (Time to Interactive):** < 3.5s
- **Bundle Load Time:** < 2s (3G)

---

## 🔧 Scripts e Ferramentas

```bash
# Análise de bundle
npm run bundle:analyze:size

# Build com análise visual
npm run build:analyze

# Validar após otimizações
npm run build && npm run bundle:analyze:size

# Performance test
npm run perf:local
```

---

## 📚 Referências

**Documentação:**
- [Vite Manual Chunks](https://vitejs.dev/guide/build.html#chunking-strategy)
- [Rollup Output Options](https://rollupjs.org/configuration-options/#output-manualchunks)
- [React Lazy Loading](https://react.dev/reference/react/lazy)

**Ferramentas:**
- [Rollup Visualizer](https://www.npmjs.com/package/rollup-plugin-visualizer)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**
