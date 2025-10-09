# 🚀 Guia de Migração - React 18 → React 19

**Projeto:** DuduFisio-AI
**Versão Atual:** React 18.2.0
**Versão Alvo:** React 19.x (quando estável)
**Data:** Outubro 2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Breaking Changes](#breaking-changes)
3. [Novas Features](#novas-features)
4. [Plano de Migração](#plano-de-migração)
5. [Checklist de Migração](#checklist-de-migração)
6. [Testes e Validação](#testes-e-validação)
7. [Rollback Strategy](#rollback-strategy)

---

## 🎯 Visão Geral

### Por que migrar?

- ✅ **Performance**: Compilador React automático (similar ao Svelte)
- ✅ **Server Components**: Redução drástica de bundle size
- ✅ **Actions**: Formulários e mutations simplificados
- ✅ **Document Metadata**: Meta tags sem dependências extras
- ✅ **Asset Loading**: Preloading automático e inteligente

### Quando migrar?

- ⏰ **Aguardar**: React 19 RC (Release Candidate)
- ✅ **Começar**: Após 1-2 meses de RC estável
- 🚀 **Produção**: Após 3-4 meses e adoção da comunidade

### Tempo Estimado

- **Preparação:** 1-2 semanas
- **Migração:** 2-3 semanas
- **Testes:** 1-2 semanas
- **Total:** ~1-2 meses

---

## 💥 Breaking Changes

### 1. **Renderização de `ref` como prop**

#### ❌ React 18
```tsx
function MyInput({ ref }) {
  return <input ref={ref} />;
}

// Warning: Function components cannot be given refs
```

#### ✅ React 19
```tsx
function MyInput({ ref }) {
  return <input ref={ref} />;
}

// Funciona! ref é uma prop normal agora
```

**Impacto no projeto:**
- ✅ Baixo - Já usamos forwardRef onde necessário
- Arquivos afetados: ~5 componentes em `/components/ui/`

**Ação:**
- Remover `forwardRef` onde não é mais necessário
- Simplificar componentes de input

---

### 2. **Hydration Errors como Erros**

#### ❌ React 18
```tsx
// Warnings no console (fácil de ignorar)
Warning: Text content did not match. Server: "foo" Client: "bar"
```

#### ✅ React 19
```tsx
// ERRO que quebra a aplicação
Error: Hydration failed because the server rendered HTML didn't match the client
```

**Impacto no projeto:**
- ⚠️ Médio - Temos SSR via Vite (preview mode)
- Áreas de risco: Timestamps, user-specific data

**Ação:**
- Auditar código com dados dinâmicos
- Usar `useEffect` para dados client-only
- Implementar `suppressHydrationWarning` onde apropriado

---

### 3. **Remoção de `defaultProps`**

#### ❌ React 19
```tsx
function Button({ size = 'medium' }) {
  return <button className={size}>Click</button>;
}

Button.defaultProps = {
  size: 'medium'  // ❌ Removido
};
```

#### ✅ React 19
```tsx
function Button({ size = 'medium' }) {
  return <button className={size}>Click</button>;
}

// Usar default parameters do ES6
```

**Impacto no projeto:**
- ✅ Baixo - Já usamos default parameters em 90% dos casos
- Arquivos afetados: ~10 componentes legacy

**Ação:**
- Buscar por `defaultProps` e substituir
- Script automatizado: `grep -r "defaultProps" --include="*.tsx"`

---

### 4. **Context API - `use()` hook**

#### ❌ React 18
```tsx
const theme = useContext(ThemeContext);
```

#### ✅ React 19 (opcional, mas recomendado)
```tsx
import { use } from 'react';

const theme = use(ThemeContext);
// Pode ser usado em condicionais!
```

**Impacto no projeto:**
- ✅ Baixo - Melhoria opcional
- Oportunidade: Simplificar contexts em `/contexts/`

**Ação:**
- Migrar gradualmente `useContext` → `use()`
- Aproveitar para simplificar lógica condicional

---

### 5. **Error Handling**

#### ✅ React 19 - Error Boundaries melhoradas
```tsx
function ErrorBoundary({ fallback, children }) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

// Agora suporta async errors!
```

**Impacto no projeto:**
- ✅ Positivo - Já temos OptimizedErrorBoundary
- Melhoria: Capturar erros async automaticamente

**Ação:**
- Atualizar ErrorBoundary para usar nova API
- Remover try/catch desnecessários

---

## 🆕 Novas Features

### 1. **React Server Components (RSC)**

```tsx
// app/dashboard/page.tsx
async function DashboardPage() {
  const data = await fetch('/api/stats'); // Server-side!

  return (
    <div>
      <h1>Dashboard</h1>
      <Stats data={data} />
    </div>
  );
}

export default DashboardPage;
```

**Benefícios:**
- 📦 **Bundle size:** -40% a -60%
- ⚡ **Performance:** Dados no servidor
- 🔒 **Segurança:** API keys no servidor

**Oportunidades no projeto:**
- `DashboardPage.tsx` → Server Component
- `PatientListPage.tsx` → Server Component
- `AdvancedReportsPage.tsx` → Server Component

**Requisitos:**
- Precisa de framework com suporte (Next.js 14+, Remix, Vite + plugin)
- Avaliar migração Vite → Next.js ou usar plugin experimental

---

### 2. **Actions (Form Actions)**

```tsx
async function createPatient(formData: FormData) {
  'use server'; // Server action!

  const patient = {
    name: formData.get('name'),
    email: formData.get('email'),
  };

  await db.patients.create(patient);
}

function PatientForm() {
  return (
    <form action={createPatient}>
      <input name="name" />
      <input name="email" />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Benefícios:**
- ✅ Sem `useState`, `useEffect`, `onSubmit`
- ✅ Progressive enhancement (funciona sem JS!)
- ✅ Loading/error states automáticos

**Oportunidades no projeto:**
- Todos os formulários em `/pages/`
- `PatientFormModal`, `AppointmentForm`, etc.

---

### 3. **Document Metadata**

```tsx
function PatientPage({ patient }) {
  return (
    <>
      <title>{patient.name} - FisioFlow</title>
      <meta name="description" content={`Prontuário de ${patient.name}`} />

      <div>
        <h1>{patient.name}</h1>
        {/* ... */}
      </div>
    </>
  );
}
```

**Benefícios:**
- ✅ Sem `react-helmet` ou bibliotecas extras
- ✅ Metadata por componente
- ✅ SEO melhorado

**Ação:**
- Remover `react-helmet` (se estiver usando)
- Adicionar metadata nativa nas páginas

---

### 4. **Asset Loading (Preload)**

```tsx
import { preload, preinit } from 'react-dom';

function MyComponent() {
  // Preload CSS
  preinit('/styles/dashboard.css', { as: 'style' });

  // Preload script
  preload('/analytics.js', { as: 'script' });

  return <div>Content</div>;
}
```

**Benefícios:**
- ✅ Preloading declarativo
- ✅ Evita waterfalls
- ✅ Performance melhorada

**Oportunidades:**
- Lazy loaded pages podem preload assets
- Charts e PDF libs podem ser preloaded

---

### 5. **`use()` Hook - Async Data**

```tsx
import { use } from 'react';

function PatientProfile({ patientPromise }) {
  const patient = use(patientPromise); // Suspende até resolver!

  return <div>{patient.name}</div>;
}

// Parent component
function Page() {
  const patientPromise = fetchPatient(id);

  return (
    <Suspense fallback={<Loading />}>
      <PatientProfile patientPromise={patientPromise} />
    </Suspense>
  );
}
```

**Benefícios:**
- ✅ Sem `useEffect` para fetch
- ✅ Suspense automático
- ✅ Parallel fetching fácil

**Oportunidades:**
- Todos os fetchs em `/services/`
- Dashboards com múltiplos requests

---

## 📅 Plano de Migração

### Fase 1: Preparação (1-2 semanas)

#### ✅ Semana 1: Auditoria
- [ ] Identificar `defaultProps` (grep + replace)
- [ ] Listar componentes com `forwardRef`
- [ ] Mapear hydration risks (timestamps, user data)
- [ ] Documentar dependencies incompatíveis

#### ✅ Semana 2: Atualização de Deps
- [ ] Atualizar `@types/react` para 19.x
- [ ] Atualizar `react-router-dom` para v7
- [ ] Verificar compatibilidade de bibliotecas:
  - `framer-motion`: compatível
  - `recharts`: verificar
  - `@radix-ui`: verificar
  - `react-hook-form`: compatível

---

### Fase 2: Migração Incremental (2-3 semanas)

#### ✅ Semana 3: Breaking Changes
- [ ] Substituir `defaultProps` por default parameters
- [ ] Simplificar componentes com `ref` prop
- [ ] Atualizar `useContext` → `use()` (opcional)
- [ ] Auditar hydration em SSR

#### ✅ Semana 4: Novas Features (Básico)
- [ ] Migrar 3-5 páginas para `use()` async
- [ ] Implementar metadata nativa (remover react-helmet)
- [ ] Testar error boundaries com async

#### ✅ Semana 5: Otimizações
- [ ] Adicionar `preload`/`preinit` em lazy routes
- [ ] Implementar 2-3 Server Components (se framework suportar)
- [ ] Converter 1-2 formulários para Actions

---

### Fase 3: Testes e Validação (1-2 semanas)

#### ✅ Semana 6: Testes
- [ ] Executar suite completa de testes
- [ ] Teste E2E em todas as features críticas
- [ ] Performance benchmarks (compare com React 18)
- [ ] Teste de carga e stress

#### ✅ Semana 7: QA
- [ ] Teste manual de todas as páginas
- [ ] Teste de edge cases e error handling
- [ ] Validação de SEO e metadata
- [ ] Cross-browser testing

---

## ✅ Checklist de Migração

### Pré-Migração

- [ ] Backup do código (git tag `pre-react-19`)
- [ ] Documentar versões atuais de todas as deps
- [ ] Criar branch `feat/react-19-migration`
- [ ] Comunicar equipe sobre a migração

### Durante Migração

- [ ] Atualizar `package.json` para React 19
- [ ] Executar `npm install`
- [ ] Corrigir erros de TypeScript
- [ ] Substituir `defaultProps`
- [ ] Simplificar `forwardRef`
- [ ] Auditar hydration
- [ ] Implementar novas features graduais
- [ ] Executar testes a cada mudança

### Pós-Migração

- [ ] Performance audit (Lighthouse)
- [ ] Bundle size comparison
- [ ] Deploy em staging
- [ ] Monitorar erros (Sentry/similar)
- [ ] Coletar feedback da equipe
- [ ] Deploy em produção (canary)
- [ ] Monitorar métricas por 1 semana

---

## 🧪 Testes e Validação

### Testes Automatizados

```bash
# 1. Type checking
npm run type-check

# 2. Linting
npm run lint

# 3. Unit tests
npm run test

# 4. E2E tests
npm run test:e2e

# 5. Performance tests
npm run test:performance
```

### Performance Benchmarks

| Métrica | React 18 | React 19 | Meta |
|---------|----------|----------|------|
| Bundle size (gzip) | ~450kb | ? | <350kb |
| First Load (3G) | ~2.5s | ? | <2s |
| Time to Interactive | ~3s | ? | <2.5s |
| Lighthouse Score | 85 | ? | >90 |

### Testes Manuais

- [ ] Login/Logout flow
- [ ] Criar/editar paciente
- [ ] Agendar consulta
- [ ] Gerar relatório
- [ ] Exportar PDF
- [ ] Upload de arquivos
- [ ] Notificações em tempo real
- [ ] Dashboards interativos

---

## 🔄 Rollback Strategy

### Se algo der errado:

#### Opção 1: Rollback Git
```bash
# Reverter para tag anterior
git checkout pre-react-19
git checkout -b hotfix/rollback-react-19

# Deploy
npm install
npm run build
vercel --prod
```

#### Opção 2: Feature Flag
```tsx
// lib/featureFlags.ts
export const USE_REACT_19_FEATURES = false;

// Usar condicionalmente
if (USE_REACT_19_FEATURES) {
  const data = use(promise);
} else {
  const [data, setData] = useState(null);
  useEffect(() => {
    promise.then(setData);
  }, []);
}
```

#### Opção 3: Canary Deployment
- Deploy React 19 para 10% dos usuários
- Monitorar erros e métricas
- Aumentar gradualmente (10% → 50% → 100%)
- Rollback se error rate > 1%

---

## 📚 Recursos

### Documentação Oficial
- [React 19 Blog](https://react.dev/blog)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Server Components Docs](https://react.dev/reference/react/use-server)

### Tools
- [React DevTools Beta](https://github.com/facebook/react/tree/main/packages/react-devtools)
- [React Compiler Playground](https://playground.react.dev/)

### Comunidade
- [React 19 Discussion](https://github.com/facebook/react/discussions)
- [React Working Group](https://github.com/reactwg/react-18)

---

## 🎯 Próximos Passos Imediatos

### 1. Monitorar React 19 Release
- [ ] Assinar newsletter do React
- [ ] Seguir [@reactjs](https://twitter.com/reactjs)
- [ ] Acompanhar changelog

### 2. Preparar Ambiente
- [ ] Criar branch `feat/react-19-prep`
- [ ] Atualizar deps não-relacionadas
- [ ] Limpar código legacy

### 3. POC em Branch Separada
- [ ] Criar `feat/react-19-poc`
- [ ] Testar Server Components
- [ ] Testar Actions em 1 formulário
- [ ] Medir impacto no bundle

---

## 📊 Análise de Impacto

### Alto Impacto (Positivo)
- ✅ Bundle size redução (~40%)
- ✅ Performance rendering (+20-30%)
- ✅ DX melhorado (menos boilerplate)

### Médio Impacto
- ⚠️ Curva de aprendizado (Server Components)
- ⚠️ Refactoring de formulários (Actions)
- ⚠️ Possíveis bugs em deps externas

### Baixo Impacto
- ✅ Breaking changes mínimos
- ✅ Migração gradual possível
- ✅ Rollback fácil

---

## 🏆 Success Criteria

A migração será considerada bem-sucedida quando:

1. ✅ **Zero breaking bugs em produção**
2. ✅ **Bundle size reduzido em ≥30%**
3. ✅ **Lighthouse score ≥90**
4. ✅ **Todos os testes passando**
5. ✅ **Error rate < 0.1%**
6. ✅ **Feedback positivo da equipe**

---

## 📝 Notas Importantes

### ⚠️ Não migrar se:
- React 19 ainda está em beta/alpha
- Dependências críticas incompatíveis
- Projeto em fase crítica de negócio
- Equipe sem bandwidth para testes

### ✅ Migrar quando:
- React 19 RC estável (>1 mês)
- Deps atualizadas e compatíveis
- Janela de deploy sem pressão
- Equipe treinada nas novas features

---

**🎉 Este guia será atualizado conforme React 19 evolui!**

---

*Última atualização: Outubro 2025*
*Responsável: Equipe de Desenvolvimento*
*Versão: 1.0*
