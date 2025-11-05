# 🚀 Plano de Otimização de Performance

**Data**: 05 de Novembro de 2025
**Bundle Atual**: 8.49MB (70.7% do limite de 12MB)
**Objetivo**: Reduzir para < 5MB (50%)

---

## 📊 Análise Atual

### Chunks Críticos (> 500KB)
1. ❌ **vendor-misc-r6LNXS4b.js** - 1.90MB
2. ❌ **comp-common-B23tam9u.js** - 1.30MB
3. ❌ **index-CC_NJHNQ.js** - 1.07MB
4. ❌ **page-other-DvaJsdoP.js** - 651.71KB

### Chunks Grandes (> 300KB)
5. ⚠️ **feature-editor-DlZtTyFc.js** - 378.54KB
6. ⚠️ **feature-pdf-LhxA5UC7.js** - 333.70KB

### Total
- **Total JS**: 8.13MB
- **Total CSS**: 182KB
- **47 chunks** JavaScript
- **Média por chunk**: 177KB

---

## 🎯 Estratégia de Otimização

### Fase 1: Code Splitting Agressivo (Redução esperada: 40%)

#### 1.1 Lazy Load de Páginas
```typescript
// Todas as páginas devem usar lazy loading
const AgendaPage = lazy(() => import('./pages/AgendaPage'));
const PatientPage = lazy(() => import('./pages/PatientPage'));
// etc...
```

**Impacto estimado**: -1.5MB

#### 1.2 Dynamic Imports para Features
```typescript
// Editor de texto rico (378KB)
const RichTextEditor = lazy(() => import('./components/RichTextEditor'));

// Gerador de PDF (333KB)
const PDFGenerator = lazy(() => import('./components/PDFGenerator'));

// Charts (299KB)
const Charts = lazy(() => import('./components/Charts'));
```

**Impacto estimado**: -1.0MB

#### 1.3 Vendor Splitting
```javascript
// vite.config.ts
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-ui': ['@radix-ui/*', 'framer-motion'],
  'vendor-forms': ['react-hook-form', 'zod'],
  'vendor-data': ['@tanstack/react-query', 'axios'],
  'vendor-charts': ['recharts', 'd3'],
  'vendor-editor': ['@tiptap/*'],
  'vendor-pdf': ['jspdf', 'html2canvas']
}
```

**Impacto estimado**: -800KB (melhor caching)

### Fase 2: Tree Shaking & Dead Code Elimination (Redução esperada: 15%)

#### 2.1 Remover Imports Não Usados
```bash
# Usar ferramenta de análise
npx depcheck
npx unimported
```

#### 2.2 Otimizar Icon Imports
```typescript
// ❌ ANTES
import * as Icons from 'lucide-react';

// ✅ DEPOIS
import { Bell, Calendar, User } from 'lucide-react';
```

**Impacto estimado**: -500KB

#### 2.3 Remover Polyfills Desnecessários
**Impacto estimado**: -200KB

### Fase 3: Asset Optimization (Redução esperada: 20%)

#### 3.1 Comprimir Imagens
```bash
# Usar imagemin ou squoosh
- Converter para WebP
- Lazy load de imagens
- Responsive images
```

#### 3.2 Otimizar Fonts
```css
/* Apenas font weights usados */
@font-face {
  font-family: 'Inter';
  font-weight: 400 600; /* Apenas regular e semibold */
  font-display: swap;
}
```

#### 3.3 CSS Optimization
- Remove unused CSS com PurgeCSS
- Minify CSS
- Critical CSS inline

**Impacto estimado**: -300KB

### Fase 4: PWA & Caching (Performance geral)

#### 4.1 Service Worker Avançado
```javascript
// Estratégias de cache
- Network First: API calls
- Cache First: Assets estáticos
- Stale While Revalidate: Images
```

#### 4.2 Pre-caching de Rotas Críticas
```javascript
precacheAndRoute([
  '/dashboard',
  '/agenda',
  '/patients'
]);
```

#### 4.3 Offline Support
**Impacto**: Melhor UX, não reduz bundle

---

## 📅 Cronograma de Implementação

### Dia 1 (4-6 horas)
- ✅ Análise de bundle
- 🔄 Implementar lazy loading de páginas
- 🔄 Dynamic imports para features pesadas
- 🔄 Vendor splitting otimizado

### Dia 2 (3-4 horas)
- Tree shaking agressivo
- Remover código morto
- Otimizar imports de ícones
- Revisar dependências

### Dia 3 (3-4 horas)
- Comprimir e otimizar imagens
- Otimizar fonts
- CSS optimization
- Minification agressiva

### Dia 4 (2-3 horas)
- Implementar PWA completo
- Service Worker avançado
- Pre-caching
- Offline support

### Dia 5 (2 horas)
- Testes de performance
- Lighthouse audit
- Ajustes finais
- Documentação

**Total**: 14-19 horas

---

## 🎯 Metas de Performance

### Bundle Size
- ❌ Atual: **8.49MB**
- ✅ Meta: **< 5MB** (-40%)
- 🎉 Ideal: **< 3MB** (-65%)

### Lighthouse Score
- ⚠️ Atual: ~70-80
- ✅ Meta: **> 90**
- 🎉 Ideal: **> 95**

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Load Times
- **First Load**: < 3s (3G)
- **Subsequent Loads**: < 1s (cache)
- **Time to Interactive**: < 5s

---

## 🛠️ Ferramentas de Análise

### Bundle Analysis
```bash
npm run build:analyze
```

### Lighthouse
```bash
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

### Bundle Buddy
```bash
npx bundle-buddy
```

### Webpack Bundle Analyzer (se usar)
```bash
npm install --save-dev webpack-bundle-analyzer
```

---

## 📊 Métricas de Sucesso

### Before & After
```
┌─────────────────┬──────────┬──────────┬──────────┐
│ Métrica         │ Antes    │ Depois   │ Melhoria │
├─────────────────┼──────────┼──────────┼──────────┤
│ Bundle Size     │ 8.49MB   │ < 5MB    │ -40%     │
│ Largest Chunk   │ 1.90MB   │ < 500KB  │ -74%     │
│ Avg Chunk       │ 177KB    │ < 100KB  │ -43%     │
│ Load Time (3G)  │ ~8s      │ < 3s     │ -63%     │
│ Lighthouse      │ 75       │ > 90     │ +20%     │
└─────────────────┴──────────┴──────────┴──────────┘
```

### KPIs
- ✅ Todos os chunks < 500KB
- ✅ Lighthouse Performance > 90
- ✅ Core Web Vitals "Good"
- ✅ PWA completo e offline ready

---

## 🚀 Implementação Imediata

### Arquivos a Modificar
1. `vite.config.ts` - Vendor splitting
2. `AppRoutes.tsx` - Lazy loading
3. `package.json` - Scripts de análise
4. `public/sw.js` - Service Worker
5. Components pesados - Dynamic imports

### Comandos Úteis
```bash
# Análise de bundle
npm run build:analyze

# Build com stats
npm run build -- --mode analyze

# Test performance
npm run lighthouse

# Check unused deps
npx depcheck
```

---

## 📝 Checklist de Implementação

### Code Splitting
- [ ] Lazy load todas as páginas
- [ ] Dynamic import para Editor
- [ ] Dynamic import para PDF Generator
- [ ] Dynamic import para Charts
- [ ] Vendor splitting otimizado

### Tree Shaking
- [ ] Remover imports não usados
- [ ] Otimizar icon imports
- [ ] Remover polyfills desnecessários
- [ ] Analisar com depcheck

### Assets
- [ ] Comprimir imagens (WebP)
- [ ] Otimizar fonts
- [ ] Minify CSS
- [ ] Lazy load images

### PWA
- [ ] Service Worker avançado
- [ ] Pre-caching
- [ ] Offline support
- [ ] Install prompt

### Testing
- [ ] Lighthouse audit
- [ ] Bundle analysis
- [ ] Load time tests
- [ ] Real device testing

---

## 🎉 Resultado Final Esperado

```
ANTES:
┌────────────────────────────┐
│ Bundle: 8.49MB             │
│ Chunks: 47                 │
│ Largest: 1.90MB            │
│ Load Time: ~8s (3G)        │
│ Lighthouse: 75             │
└────────────────────────────┘

DEPOIS:
┌────────────────────────────┐
│ Bundle: < 5MB   (-40%) ✅  │
│ Chunks: 60+     (split) ✅ │
│ Largest: < 500KB (-74%) ✅ │
│ Load Time: < 3s  (-63%) ✅ │
│ Lighthouse: > 90 (+20%) ✅ │
└────────────────────────────┘
```

**ROI**: Melhor UX, SEO, conversão e retention

---

**Próximo Passo**: Começar implementação do Dia 1
