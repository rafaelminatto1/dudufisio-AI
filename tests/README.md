# Estrutura de Testes - DuduFisio-AI

Este documento explica a estrutura de testes do projeto e como executá-los corretamente.

## 📁 Estrutura de Testes

O projeto usa dois frameworks de teste diferentes para diferentes tipos de testes:

### 1. **Testes E2E (End-to-End)** - Playwright
- **Framework**: Playwright
- **Arquivos**: `*.spec.ts`
- **Localização**: `tests/**/*.spec.ts`
- **Propósito**: Testar fluxos completos da aplicação no navegador

### 2. **Testes de Unidade e Integração** - Vitest
- **Framework**: Vitest + React Testing Library
- **Arquivos**: `*.test.ts` e `*.test.tsx`
- **Localização**: `tests/**/*.test.{ts,tsx}`
- **Propósito**: Testar componentes, hooks e funções isoladamente

## 🚀 Como Executar os Testes

### Testes E2E (Playwright)

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar testes E2E com interface visual
npm run test:e2e:ui

# Executar testes E2E em modo headed (com navegador visível)
npm run test:e2e:headed

# Executar apenas testes E2E específicos
npm run test:e2e:complete

# Executar testes de responsividade
npm run test:responsive

# Executar testes de acessibilidade
npm run test:a11y

# Ver relatório HTML dos testes
npm run test:report
```

### Testes de Unidade (Vitest)

```bash
# Executar todos os testes de unidade
npm run test:unit

# Executar testes de unidade em modo watch
npm run test:unit:watch

# Executar testes de unidade com interface visual
npm run test:unit:ui

# Executar testes de unidade com cobertura
npm run test:unit:coverage
```

### Executar Todos os Testes

```bash
# Executar testes de unidade + E2E
npm run test:all

# Executar suite completa (E2E + responsividade + acessibilidade)
npm run test:full
```

## ⚙️ Configuração

### Playwright (`playwright.config.ts`)

- **Test Directory**: `./tests`
- **Test Pattern**: `*.spec.ts` (apenas testes E2E)
- **Base URL**: `http://localhost:5176`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeout**: 60 segundos por teste
- **Retries**: 1 retry em desenvolvimento, 2 em CI

### Vitest (`vitest.config.ts`)

- **Test Pattern**: `*.test.{ts,tsx}` (apenas testes de unidade)
- **Environment**: jsdom (para testes de componentes React)
- **Coverage**: v8 com metas de 80% de cobertura
- **Setup File**: `tests/setup.ts`

## 🔧 Variáveis de Ambiente

Certifique-se de ter um arquivo `.env.local` com as seguintes variáveis:

```env
# Supabase (opcional para desenvolvimento local)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Gemini AI (opcional)
VITE_GEMINI_API_KEY=sua_chave_aqui
```

## 📊 Relatórios

### Playwright
Após executar os testes E2E, você pode ver o relatório HTML:

```bash
npx playwright show-report
```

### Vitest Coverage
Após executar os testes com cobertura, os relatórios estarão em:

```
coverage/
├── index.html          # Relatório HTML interativo
├── lcov.info          # Formato LCOV
└── lcov-report/       # Relatório HTML detalhado
```

## 🐛 Troubleshooting

### Erro: "Cannot find package '@jest/globals'"
**Causa**: Playwright tentando executar testes de unidade (Vitest).

**Solução**: Certifique-se de usar `npm run test:e2e` para testes E2E e `npm run test:unit` para testes de unidade.

### Erro: "Cannot redefine property: Symbol($$jest-matchers-object)"
**Causa**: Conflito entre Jest/Vitest e Playwright.

**Solução**: Os arquivos de configuração foram atualizados para separar os frameworks. Execute `npm install` para garantir que as dependências estão atualizadas.

### Erro: "Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')"
**Causa**: Variáveis de ambiente não disponíveis no contexto do Playwright.

**Solução**: O arquivo `tests/playwright-setup.ts` foi criado para definir as variáveis de ambiente necessárias.

### Erro: "Cannot use({ defaultBrowserType }) in a describe group"
**Causa**: `test.use()` sendo chamado dentro de `test.describe()`.

**Solução**: O arquivo `tests/responsive/multi-device.spec.ts` foi refatorado para usar a abordagem correta do Playwright.

## 📝 Convenções de Nomenclatura

### Arquivos de Teste

- **E2E Tests**: `*.spec.ts` (ex: `auth.spec.ts`, `patient-management.spec.ts`)
- **Unit Tests**: `*.test.ts` ou `*.test.tsx` (ex: `Button.test.tsx`, `useAuth.test.ts`)

### Estrutura de Diretórios

```
tests/
├── e2e/                    # Testes E2E específicos
│   ├── auth/
│   ├── patients/
│   └── navigation/
├── unit/                   # Testes de unidade
│   ├── hooks/
│   ├── services/
│   └── components/
├── integration/            # Testes de integração
├── responsive/             # Testes de responsividade
├── accessibility/          # Testes de acessibilidade
├── security/               # Testes de segurança
└── performance/            # Testes de performance
```

## 🎯 Boas Práticas

1. **Separação de Responsabilidades**
   - Use Playwright para testes E2E (fluxos completos)
   - Use Vitest para testes de unidade (componentes, hooks, funções)

2. **Testes E2E**
   - Foque em fluxos críticos do usuário
   - Use `data-testid` para seletores estáveis
   - Evite testes frágeis (não dependa de classes CSS)

3. **Testes de Unidade**
   - Teste comportamentos, não implementações
   - Use mocks para dependências externas
   - Mantenha testes isolados e independentes

4. **Performance**
   - Execute testes E2E em paralelo quando possível
   - Use `test.only()` e `test.skip()` para desenvolvimento
   - Limpe estado entre testes

## 📚 Recursos

- [Documentação do Playwright](https://playwright.dev/)
- [Documentação do Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contribuindo

Ao adicionar novos testes:

1. Escolha o framework correto (Playwright ou Vitest)
2. Use a convenção de nomenclatura apropriada
3. Adicione testes para novos recursos
4. Mantenha a cobertura de testes acima de 80%
5. Execute `npm run test:all` antes de fazer commit

