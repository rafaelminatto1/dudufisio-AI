# 🧪 Como Executar Testes - DuduFisio-AI

## 🚀 Quick Start

```bash
# 1. Instalar dependências (se ainda não instalou)
npm install

# 2. Rodar TODOS os testes
node scripts/run-all-tests.js

# Ou individualmente:
npm run test:unit:coverage    # Testes unitários
npm run test:e2e             # Testes E2E
npm run lint                 # Linting
npm run type-check           # Type check
```

---

## 📦 Testes Unitários (Vitest)

### Comandos Disponíveis

```bash
# Rodar todos os testes
npm run test:unit

# Watch mode (re-executa ao salvar)
npm run test:unit:watch

# Com interface gráfica
npm run test:unit:ui

# Com coverage report
npm run test:unit:coverage
```

### Estrutura de Testes

```
tests/
├── components/
│   └── ui/
│       ├── LoadingState.test.tsx
│       ├── ErrorState.test.tsx
│       └── EmptyState.test.tsx
├── lib/
│   ├── middleware/
│   │   └── errorHandler.test.ts
│   └── supabase/
│       └── errorHandler.test.ts
├── hooks/
│   └── useSupabaseQuery.test.ts
└── setup.ts
```

### Exemplo de Teste

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '@/components/ui/LoadingState';

describe('LoadingState', () => {
  it('deve renderizar mensagem', () => {
    render(<LoadingState message="Carregando..." />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });
});
```

### Ver Coverage Report

```bash
npm run test:unit:coverage

# Abrir report HTML
open coverage/index.html  # Mac/Linux
start coverage/index.html # Windows
```

---

## 🎭 Testes E2E (Playwright)

### Comandos Disponíveis

```bash
# Rodar todos os testes E2E
npm run test:e2e

# Com interface gráfica (debug mode)
npm run test:e2e:ui

# Em modo headed (ver navegador)
npm run test:e2e:headed

# Rodar teste específico
npx playwright test tests/e2e/errorHandling.spec.ts
```

### Pré-requisitos

```bash
# 1. Instalar browsers (primeira vez)
npx playwright install --with-deps

# 2. Iniciar servidor de desenvolvimento (em outro terminal)
npm run dev

# 3. Rodar testes
npm run test:e2e
```

### Estrutura de Testes E2E

```
tests/e2e/
└── errorHandling.spec.ts       # Testes de tratamento de erro
```

### Cenários Testados

1. **Estados de Loading**
   - Loading aparece durante carregamento
   - Loading desaparece após dados carregarem

2. **Estados de Erro**
   - ErrorState aparece em falha de rede
   - Botão "Tentar novamente" funciona
   - Mensagens amigáveis exibidas

3. **Estados Vazios**
   - EmptyState quando não há dados
   - Botão de ação leva ao formulário

4. **Formulários**
   - Validação funciona
   - Erros são exibidos
   - Salvamento com sucesso

5. **Retry Automático**
   - Retry acontece automaticamente
   - Sucesso após algumas tentativas

6. **Acessibilidade**
   - Atributos ARIA corretos
   - Foco gerenciado corretamente
   - Navegação por teclado

### Debug de Testes E2E

```bash
# Modo debug interativo
npm run test:e2e:ui

# Ver trace de teste falhado
npx playwright show-trace trace.zip

# Rodar teste específico em debug
npx playwright test --debug tests/e2e/errorHandling.spec.ts
```

---

## 🔍 Linting e Type Check

### ESLint

```bash
# Verificar
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

### TypeScript

```bash
# Verificar tipos
npm run type-check
```

### Check Completo

```bash
# Lint + Type Check + Tests
npm run check
```

---

## 📊 Interpretar Resultados

### Coverage Report

```
---------|---------|----------|---------|---------|-------------------
File     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------|---------|----------|---------|---------|-------------------
All files|   82.5  |    75.3  |   80.1  |   83.2  |
 ...     |   ...   |    ...   |   ...   |   ...   | 45-47,89-91
---------|---------|----------|---------|---------|-------------------
```

**O que significa:**
- **% Stmts**: Porcentagem de statements executados
- **% Branch**: Porcentagem de branches (if/else) testados
- **% Funcs**: Porcentagem de funções testadas
- **% Lines**: Porcentagem de linhas executadas
- **Uncovered Line #s**: Linhas não cobertas

**Meta:** > 80% em todas as categorias

### E2E Test Results

```
Running 15 tests using 3 workers

✓ [chromium] › errorHandling.spec.ts:8:5 › deve mostrar loading (2s)
✓ [chromium] › errorHandling.spec.ts:20:5 › deve mostrar erro (1s)
✓ [chromium] › errorHandling.spec.ts:35:5 › deve permitir retry (3s)
...

15 passed (45s)
```

**O que verificar:**
- Todos os testes passaram?
- Tempo de execução aceitável? (<60s)
- Sem erros de timeout?

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: Testes E2E falhando

**Checklist:**
- [ ] Servidor está rodando? (`npm run dev`)
- [ ] Porta 5173 está livre?
- [ ] Browsers instalados? (`npx playwright install`)
- [ ] .env.local configurado corretamente?

### Problema: Coverage muito baixo

**Solução:**
- Adicionar mais testes
- Testar casos de erro
- Testar branches (if/else)
- Remover código morto

### Problema: Testes lentos

**Solução:**
```bash
# Rodar em paralelo
npm run test:unit -- --pool=threads --poolOptions.threads.singleThread=false

# Rodar apenas testes modificados
npm run test:unit:watch
```

---

## ✅ Checklist Antes de Commit

```bash
# 1. Rodar testes
✓ npm run test:unit
✓ npm run lint
✓ npm run type-check

# 2. Verificar mudanças
✓ git status
✓ git diff

# 3. Commit
✓ git add .
✓ git commit -m "feat: adicionar testes e monitoramento"

# 4. Push
✓ git push
```

---

## 🎯 Metas de Qualidade

### Atuais
- ✅ Coverage > 80%
- ✅ Todos os testes E2E passando
- ✅ Zero erros de lint
- ✅ Zero erros de tipo
- ✅ Acessibilidade WCAG AA

### Futuras
- ⏳ Coverage > 90%
- ⏳ Performance tests
- ⏳ Visual regression tests
- ⏳ Load testing
- ⏳ Security testing

---

## 📚 Recursos

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Última Atualização**: 29 de Outubro de 2025

