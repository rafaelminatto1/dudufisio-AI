# 💻 Comandos Úteis - DuduFisio-AI

## 🚀 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Desenvolvimento "limpo" (limpa cache)
npm run dev:clean

# Pular verificação de ambiente
npm run dev:skip-check
```

---

## 🧪 Testes

### Testes Unitários
```bash
# Rodar todos
npm run test:unit

# Watch mode (re-executa ao salvar)
npm run test:unit:watch

# Interface gráfica
npm run test:unit:ui

# Com coverage
npm run test:unit:coverage

# Abrir coverage report
start coverage/index.html  # Windows
open coverage/index.html   # Mac/Linux
```

### Testes E2E
```bash
# Rodar todos (servidor deve estar rodando)
npm run test:e2e

# Interface gráfica (debug mode)
npm run test:e2e:ui

# Em modo headed (ver navegador)
npm run test:e2e:headed

# Teste específico
npx playwright test tests/e2e/errorHandling.spec.ts

# Com trace para debug
npx playwright test --trace on
```

### Suite Completa
```bash
# Rodar TUDO (unit + lint + typecheck)
node scripts/run-all-tests.cjs

# Ou individualmente
npm run test:all
```

---

## 🔍 Qualidade de Código

```bash
# Linting
npm run lint              # Verificar
npm run lint:fix          # Corrigir automaticamente

# Type Check
npm run type-check        # Verificar tipos

# Check completo
npm run check             # Lint + TypeCheck + Test
npm run check:fix         # Lint fix + TypeCheck
```

---

## 📊 Monitoramento

### Dashboard de Saúde
```bash
# Abrir sistema
npm run dev

# Navegar para:
http://localhost:5173/system-health
```

### Métricas via Console
```javascript
// No DevTools Console:

// Importar módulo de métricas
const metrics = await import('/lib/monitoring/errorMetrics.ts');

// Ver saúde do sistema
console.table(metrics.getSystemHealthMetrics());

// Ver stats de operação
console.table(metrics.getOperationStats('getPatients'));

// Exportar métricas
const data = metrics.exportMetrics();
console.log(data);

// Limpar métricas antigas
metrics.cleanupOldMetrics(7); // Mantém últimos 7 dias

// Limpar tudo
metrics.clearAllMetrics();
```

---

## 🏗️ Build e Deploy

```bash
# Build para produção
npm run build

# Build rápido (sem análise)
npm run build:fast

# Analisar bundle size
npm run build:analyze

# Preview do build
npm run start

# Deploy para Vercel
npm run vercel:deploy
```

---

## 🔧 Utilitários

### Matar Servidores
```bash
# Matar todos os servidores Node
npm run kill:servers

# Matar apenas Node
npm run kill:node
```

### Verificar Dependências
```bash
# Verificar outdated
npm run deps:check

# Atualizar
npm run deps:update

# Audit de segurança
npm run security
npm audit
```

### Service Worker
```bash
# Limpar cache do SW
# DevTools > Application > Service Workers > Unregister
```

---

## 📈 Performance

```bash
# Lighthouse local
npm run perf:local

# Lighthouse produção
npm run perf:prod

# Teste mobile
npm run test:mobile
```

---

## 🐛 Debug

### Testes Falhando

```bash
# 1. Limpar tudo
rm -rf node_modules
npm install

# 2. Reinstalar Playwright
npx playwright install --with-deps

# 3. Rodar novamente
npm run test:all
```

### Build Falhando

```bash
# 1. Limpar dist
rm -rf dist

# 2. Type check
npm run type-check

# 3. Build novamente
npm run build
```

### Erro de Import

```bash
# Verificar tsconfig paths
cat tsconfig.json

# Verificar vite config
cat vite.config.ts

# Restart TS server (no editor)
# VSCode: Cmd+Shift+P > TypeScript: Restart TS Server
```

---

## 📦 Gestão de Pacotes

```bash
# Adicionar dependência
npm install nome-do-pacote

# Adicionar dev dependency
npm install -D nome-do-pacote

# Remover
npm uninstall nome-do-pacote

# Atualizar específico
npm update nome-do-pacote

# Verificar vulnerabilidades
npm audit
npm audit fix
```

---

## 🎯 Atalhos por Tarefa

### Desenvolver Nova Feature
```bash
1. npm run dev
2. Criar componente/service
3. npm run test:unit:watch
4. Criar testes
5. npm run lint:fix
6. npm run type-check
7. git commit
```

### Corrigir Bug
```bash
1. Reproduzir bug
2. Criar teste que falha
3. Corrigir código
4. Verificar teste passa
5. npm run test:all
6. git commit
```

### Deploy em Produção
```bash
1. npm run test:all
2. npm run build
3. npm audit
4. git push
5. Configurar VITE_SENTRY_DSN
6. npm run vercel:deploy
7. Monitorar Sentry
```

### Investigar Erro em Produção
```bash
1. Abrir Sentry dashboard
2. Ver stack trace
3. Ver session replay
4. Reproduzir localmente
5. Criar teste
6. Corrigir
7. Deploy fix
```

---

## 🔐 Variáveis de Ambiente

```bash
# Desenvolvimento (.env.local)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=...

# Produção (Vercel)
VITE_SENTRY_DSN=...
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
```

---

## 📱 Atalhos do Sistema

### Dashboard de Saúde
- **URL**: `/system-health`
- **Refresh**: Botão "Atualizar"
- **Export**: Botão "Exportar"
- **Clear**: Botão "Limpar Métricas"

### DevTools Úteis
```javascript
// Console do navegador

// Ver métricas
__METRICS__ // (se disponível)

// Forçar erro para teste
throw new Error('Teste de erro');

// Ver localStorage
console.log(localStorage);

// Limpar localStorage
localStorage.clear();
```

---

## 🎓 Aprendizado

### Padrões Implementados

1. **Service**: Usar `withSupabaseQuery/Mutation`
2. **Component**: `LoadingState` → `ErrorState` → `EmptyState` → `Data`
3. **Form**: `try/catch` com `handleError`
4. **Hook**: `useSupabaseQuery` para queries

### Onde Procurar

- **Exemplos de código**: TRATAMENTO_DE_ERROS_IMPLEMENTADO.md
- **Como testar**: COMO_EXECUTAR_TESTES.md
- **Como usar**: GUIA_COMPLETO_MELHORIAS.md
- **Troubleshooting**: TESTES_E_MONITORAMENTO.md

---

## ✅ Quick Commands

```bash
# Começar a trabalhar
npm run dev

# Antes de commit
npm run check

# Rodar todos os testes
node scripts/run-all-tests.cjs

# Ver saúde do sistema
# Navegar: localhost:5173/system-health

# Deploy
npm run vercel:deploy
```

---

**Última Atualização**: 29 de Outubro de 2025  
**Mantenedor**: Sistema DuduFisio-AI

