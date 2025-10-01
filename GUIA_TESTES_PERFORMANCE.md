# 🧪 GUIA DE TESTES DE PERFORMANCE

## 📋 Visão Geral

Este guia documenta os testes automatizados de performance implementados usando Playwright e Context7.

---

## 🚀 TESTES IMPLEMENTADOS

### **1. Performance Monitoring Tests** (`performance-monitoring.spec.ts`)

**O que testa:**
- ✅ Dashboard de performance carrega corretamente
- ✅ Métricas de Core Web Vitals são exibidas
- ✅ Estatísticas de cache funcionam
- ✅ Pausar/iniciar monitoramento
- ✅ Resetar métricas
- ✅ Exportar relatórios
- ✅ Lista de componentes lentos
- ✅ Recomendações automáticas
- ✅ Coleta de métricas de navegação
- ✅ LCP < 2.5s
- ✅ Tempo de carregamento < 3s

**Cenários:**
```typescript
✅ Performance Monitoring System
  ├─ deve carregar o dashboard de performance
  ├─ deve exibir métricas de Core Web Vitals
  ├─ deve exibir estatísticas de cache
  ├─ deve permitir pausar e iniciar monitoramento
  ├─ deve permitir resetar métricas
  ├─ deve permitir exportar relatório
  ├─ deve exibir lista de componentes lentos
  └─ deve exibir recomendações baseadas nas métricas

✅ Performance Metrics Collection
  ├─ deve coletar métricas de navegação
  └─ deve registrar performance de componentes

✅ Performance Optimization Validation
  ├─ deve carregar página em menos de 3 segundos
  ├─ deve ter LCP menor que 2.5s
  └─ deve ter menos de 50 re-renders por página
```

---

### **2. Service Worker Tests** (`service-worker.spec.ts`)

**O que testa:**
- ✅ Service Worker registra corretamente
- ✅ Service Worker está ativo
- ✅ Scope correto configurado
- ✅ Indicador offline aparece
- ✅ Mensagem de reconexão
- ✅ Página offline carrega
- ✅ Assets são cacheados
- ✅ Cache First funciona
- ✅ Limpeza de cache
- ✅ Detecção de atualizações
- ✅ Prompt de atualização
- ✅ Segunda visita mais rápida
- ✅ Cache hit rate alto

**Cenários:**
```typescript
✅ Service Worker Registration
  ├─ deve registrar o service worker
  ├─ deve ter service worker ativo
  └─ deve ter o scope correto

✅ Offline Functionality
  ├─ deve exibir indicador quando ficar offline
  ├─ deve exibir mensagem quando voltar online
  └─ deve carregar página offline quando não há conexão

✅ Cache Strategy
  ├─ deve cachear assets estáticos
  ├─ deve usar cache first para assets
  └─ deve limpar cache antigo

✅ Service Worker Update
  ├─ deve detectar atualizações do service worker
  └─ deve exibir prompt de atualização quando disponível

✅ Performance com Service Worker
  ├─ segunda visita deve ser mais rápida
  └─ deve ter cache hit rate alto após várias navegações
```

---

### **3. Component Optimization Tests** (`component-optimization.spec.ts`)

**O que testa:**
- ✅ DashboardPage usa cache otimizado
- ✅ PatientListPage tem debounce
- ✅ Sidebar está memoizada
- ✅ AppointmentCard memoizado
- ✅ Lazy loading de páginas
- ✅ Componentes pesados sob demanda
- ✅ Virtualização de listas
- ✅ Otimização de re-renders
- ✅ Bundle < 500KB
- ✅ Code splitting efetivo
- ✅ Loading states otimizados

**Cenários:**
```typescript
✅ Component Memoization
  ├─ DashboardPage deve usar cache otimizado
  ├─ PatientListPage deve ter busca com debounce
  ├─ Sidebar deve estar memoizada
  └─ AppointmentCard deve ter cálculos memoizados

✅ Lazy Loading
  ├─ deve fazer lazy loading de páginas
  └─ componentes pesados devem carregar sob demanda

✅ Virtual Scrolling
  └─ lista de pacientes deve suportar virtualização

✅ Re-render Optimization
  ├─ deve ter menos de 10 re-renders em navegação simples
  └─ mudança de estado deve causar re-render mínimo

✅ Bundle Size
  ├─ bundle inicial deve ser menor que 500KB
  └─ deve ter code splitting efetivo

✅ Loading States
  ├─ deve exibir loader otimizado durante carregamento
  └─ skeleton screens devem aparecer quando apropriado
```

---

## 🎯 EXECUTAR TESTES

### **Pré-requisitos:**
```bash
# Instalar dependências (se ainda não fez)
npm install
```

### **Comandos:**

#### **1. Executar TODOS os testes de performance:**
```bash
npm run test:performance
```

#### **2. Executar teste específico:**
```bash
# Performance Monitoring
npx playwright test tests/performance/performance-monitoring.spec.ts

# Service Worker
npx playwright test tests/performance/service-worker.spec.ts

# Component Optimization
npx playwright test tests/performance/component-optimization.spec.ts
```

#### **3. Executar em modo debug:**
```bash
npx playwright test --debug --config=playwright.config.performance.ts
```

#### **4. Executar em navegador específico:**
```bash
# Chrome
npx playwright test --project=chromium-performance

# Firefox
npx playwright test --project=firefox-performance

# Mobile
npx playwright test --project=mobile-performance

# Rede lenta
npx playwright test --project=slow-network
```

#### **5. Ver relatório:**
```bash
npm run test:performance:report
```

---

## 📊 MÉTRICAS VALIDADAS

### **Core Web Vitals:**
```
✅ LCP (Largest Contentful Paint)  → < 2.5s
✅ FID (First Input Delay)          → < 100ms
✅ CLS (Cumulative Layout Shift)    → < 0.1
✅ TTFB (Time to First Byte)        → < 800ms
```

### **Performance:**
```
✅ Tempo de Carregamento            → < 3s
✅ Tempo de Reload                  → < 2s
✅ Re-renders por Navegação         → < 50
```

### **Cache:**
```
✅ Service Worker                   → Registrado
✅ Assets Cacheados                 → > 0
✅ Cache Hit Rate                   → > 50%
✅ Segunda Visita                   → Mais rápida
```

### **Bundle:**
```
✅ Bundle Inicial                   → < 500KB
✅ Code Splitting                   → > 5 chunks
✅ Lazy Loading                     → Ativo
```

---

## 🔍 INTERPRETANDO RESULTADOS

### **✅ Sucesso:**
```
✓ [chromium-performance] › performance-monitoring.spec.ts:10:3 › Performance Monitoring System › deve carregar o dashboard de performance
  ⚡ Tempo de carregamento: 1247ms
  📊 LCP: 1823ms
  🎯 Cache Hit Rate: 85%
```

### **❌ Falha:**
```
✗ [chromium-performance] › performance-monitoring.spec.ts:50:3 › Performance Optimization Validation › deve ter LCP menor que 2.5s
  Expected: < 2500
  Received: 3124
```

### **⚠️ Avisos:**
```
⚠ [firefox-performance] › service-worker.spec.ts:15:3 › Service Worker Registration › deve registrar o service worker
  ℹ️  Service Worker pode não estar disponível em Firefox em algumas configurações
```

---

## 🐛 TROUBLESHOOTING

### **1. Testes não encontram Service Worker:**
```bash
# Verificar se está em produção ou localhost
# Service Workers só funcionam em HTTPS ou localhost

# Solução: Executar em modo dev
npm run dev
```

### **2. Timeout nos testes:**
```bash
# Aumentar timeout
npx playwright test --timeout=90000
```

### **3. Service Worker não registra:**
```bash
# Limpar cache do navegador
# No teste, adicione:
await page.evaluate(() => {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
});
```

### **4. Testes falhando em CI:**
```bash
# Configurar CI para aguardar server
# No playwright.config.performance.ts, aumentar timeout:
webServer: {
  timeout: 180 * 1000
}
```

---

## 📈 RELATÓRIOS

### **HTML Report:**
Após executar os testes, abra:
```
playwright-report/performance/index.html
```

### **JSON Report:**
```json
{
  "tests": [
    {
      "title": "deve carregar o dashboard de performance",
      "status": "passed",
      "duration": 1247
    }
  ]
}
```

### **Screenshots:**
Falhas automaticamente geram screenshots em:
```
playwright-report/performance/screenshots/
```

### **Videos:**
Videos de testes falhados em:
```
playwright-report/performance/videos/
```

---

## 🎯 METAS DE PERFORMANCE

### **Curto Prazo (Esta Semana):**
- ✅ Todos os testes passando
- ✅ LCP < 2.5s
- ✅ Service Worker ativo
- ✅ Cache funcionando

### **Médio Prazo (Próximas 2 Semanas):**
- ⏳ 100% dos testes passando em todos os navegadores
- ⏳ Cache Hit Rate > 80%
- ⏳ Bundle < 400KB
- ⏳ Tempo de reload < 1s

### **Longo Prazo (Próximo Mês):**
- ⏳ LCP < 2s
- ⏳ Cache Hit Rate > 90%
- ⏳ Bundle < 300KB
- ⏳ Score 100 no Lighthouse

---

## 📚 RECURSOS ADICIONAIS

### **Documentação:**
- [Playwright Docs](https://playwright.dev)
- [Web Vitals](https://web.dev/vitals/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### **Ferramentas:**
- Chrome DevTools > Lighthouse
- Chrome DevTools > Performance
- Chrome DevTools > Application > Service Workers
- Chrome DevTools > Application > Cache Storage

---

## ✨ PRÓXIMOS PASSOS

1. **Executar testes:**
   ```bash
   npm run test:performance
   ```

2. **Ver relatório:**
   ```bash
   npm run test:performance:report
   ```

3. **Analisar resultados e otimizar conforme necessário**

4. **Adicionar testes em CI/CD**

---

*Documento gerado em ${new Date().toLocaleString('pt-BR')}*
*Versão: 1.0.0*
