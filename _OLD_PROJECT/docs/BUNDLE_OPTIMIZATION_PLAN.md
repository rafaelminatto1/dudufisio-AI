# 📦 Bundle Optimization Plan - DuduFisio AI

**Data**: 11 de Janeiro de 2025
**Status**: 🔄 Em Progresso

---

## 📊 Status Atual do Bundle

### Build Metrics (Último Build)
```
Total Bundle: 8.89MB / 12.00MB (74.1%)
Chunks: 66
Build Time: 1min 15s
```

### ⚠️ Chunks Problemáticos

| Chunk | Tamanho | Crítico | Descrição |
|-------|---------|---------|-----------|
| **vendor-pdf** | 1.16MB | ❌ | Ecossistema PDF (jspdf, @react-pdf, pdfkit, etc.) |
| **comp-common** | 1.06MB | ❌ | Componentes não categorizados |
| **index** | 864KB | ⚠️ | Entry point principal |
| **vendor-misc** | 643KB | ⚠️ | Vendors não categorizados |

---

## ✅ O Que Já Está Otimizado

### 1. Lazy Loading ✅
- **MainDashboard**: Todas as 60+ páginas usando `createLazyComponent`
- **PatientPortalDashboard**: Todas as páginas lazy
- **PartnerPortalDashboard**: Todas as páginas lazy

### 2. Code Splitting no vite.config.ts ✅
- React core separado (vendor-react-core)
- UI frameworks separados (radix, framer-motion)
- Features pesadas separadas (charts, editor, pdf, ai)
- Vendors específicos categorizados (50+ categorias)

### 3. Dynamic Imports para Libraries Pesadas ✅
- **PDF**: `lib/heavyLibrariesLazy.ts` com hooks lazy
- **Firebase**: Dynamic imports implementados
- **html2canvas**: Dynamic imports implementados

---

## 🎯 Plano de Ação (Prioridade 1)

### Fase 1: Subdividir comp-common (1.06MB → < 500KB)

#### Adicionar ao vite.config.ts:

```typescript
// Após linha 556 (dentro do bloco if (normalizedId.includes('/components/')))

// Componentes de Agenda
if (normalizedId.includes('/components/agenda/')) {
  return 'comp-agenda';
}

// Componentes de Patients
if (normalizedId.includes('/components/patients/') ||
    normalizedId.includes('/components/patient/')) {
  return 'comp-patients';
}

// Componentes de Exercises
if (normalizedId.includes('/components/exercises/') ||
    normalizedId.includes('/components/exercise/')) {
  return 'comp-exercises';
}

// Componentes de Alerts/Notifications
if (normalizedId.includes('/components/alerts/') ||
    normalizedId.includes('/components/notifications/')) {
  return 'comp-alerts';
}

// Componentes de Layout
if (normalizedId.includes('/components/layout/')) {
  return 'comp-layout';
}

// Componentes de Offline
if (normalizedId.includes('/components/offline/')) {
  return 'comp-offline';
}

// Componentes de Settings
if (normalizedId.includes('/components/settings/')) {
  return 'comp-settings';
}
```

**Impact Esperado**: comp-common reduzido para ~400-500KB

---

### Fase 2: Categorizar vendor-misc (643KB → < 300KB)

#### Adicionar ao vite.config.ts (após linha 603):

```typescript
// Bibliotecas de data/time
if (normalizedId.includes('node_modules/dayjs/')) {
  return 'vendor-datetime';
}

// Bibliotecas de markdown
if (normalizedId.includes('node_modules/marked/') ||
    normalizedId.includes('node_modules/remark/')) {
  return 'vendor-markdown';
}

// Bibliotecas de color
if (normalizedId.includes('node_modules/color/') ||
    normalizedId.includes('node_modules/tinycolor2/')) {
  return 'vendor-color';
}

// Bibliotecas de animation (não framer-motion)
if (normalizedId.includes('node_modules/animejs/') ||
    normalizedId.includes('node_modules/gsap/')) {
  return 'vendor-animation';
}
```

**Impact Esperado**: vendor-misc reduzido para ~250-300KB

---

## 📈 Targets Pós-Otimização

| Métrica | Atual | Target | Melhoria |
|---------|-------|--------|----------|
| **Total Bundle** | 8.89MB | 7.50MB | -15% |
| **comp-common** | 1.06MB | 0.50MB | -53% |
| **vendor-misc** | 643KB | 300KB | -53% |
| **Largest Chunk** | 1.16MB | 1.16MB | 0% |

**Total Economia Esperada**: ~1.39MB (~15% do bundle)

---

## 🛠️ Próximos Passos

1. [ ] Implementar Fase 1 (subdividir comp-common)
2. [ ] Implementar Fase 2 (categorizar vendor-misc)
3. [ ] Rodar build e validar
4. [ ] Atualizar documentação
5. [ ] Deploy para staging

---

**Última Atualização**: 11 de Janeiro de 2025
**Gerado com ❤️ usando Claude Code**
