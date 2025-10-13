# 🧪 GUIA COMPLETO DE TESTES - DuduFisio-AI
## Estratégia, Padrões e Best Practices

---

## 📚 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Tipos de Testes](#tipos-de-testes)
3. [Como Executar](#como-executar)
4. [Como Criar Novos Testes](#como-criar-novos-testes)
5. [Padrões de Código](#padrões-de-código)
6. [Helpers e Fixtures](#helpers-e-fixtures)
7. [Mocks e Stubs](#mocks-e-stubs)
8. [Troubleshooting](#troubleshooting)
9. [CI/CD](#cicd)
10. [Métricas e Cobertura](#métricas-e-cobertura)

---

## 🎯 VISÃO GERAL

### Estratégia de Testes

O DuduFisio-AI usa uma estratégia de testes em 3 camadas:

```
┌─────────────────────────────────────────────┐
│  TESTES E2E (Playwright)                   │  ← Fluxos de usuário
│  • Testa interface completa                │
│  • Valida jornadas end-to-end              │
├─────────────────────────────────────────────┤
│  TESTES DE INTEGRAÇÃO                      │  ← Interação entre módulos
│  • Testa múltiplos serviços juntos        │
│  • Valida fluxos de dados                  │
├─────────────────────────────────────────────┤
│  TESTES UNITÁRIOS (Vitest)                 │  ← Lógica de negócio
│  • Testa serviços isoladamente             │
│  • Valida funções individuais              │
└─────────────────────────────────────────────┘
```

### Situação Atual

**Status:** 387 testes unitários implementados (85% de sucesso)

| Categoria | Arquivos | Testes | Taxa |
|-----------|----------|--------|------|
| Serviços Core | 5 | 159 | 84% |
| Serviços Clínicos | 5 | 116 | 100% |
| Serviços Integração | 5 | 112 | 71% |
| **TOTAL** | **15** | **387** | **85%** |

---

## 📦 TIPOS DE TESTES

### 1. Testes Unitários (Vitest)

**O que são:** Testam funções e serviços individuais isoladamente

**Quando usar:**
- ✅ Testar lógica de negócio
- ✅ Validar cálculos e transformações
- ✅ Testar condições de erro
- ✅ Verificar edge cases

**Exemplo:**
```typescript
describe('PatientService', () => {
  it('deve retornar lista de pacientes', async () => {
    const patients = await patientService.getAllPatients();
    expect(patients).toBeInstanceOf(Array);
  });
});
```

**Localização:** `tests/unit/`

### 2. Testes de Integração (Vitest)

**O que são:** Testam interação entre múltiplos serviços

**Quando usar:**
- ✅ Testar fluxos completos de dados
- ✅ Validar comunicação entre módulos
- ✅ Testar side effects

**Exemplo:**
```typescript
it('criar paciente deve atualizar dashboard', async () => {
  await patientService.create(newPatient);
  const stats = await dashboardService.getStats();
  expect(stats.totalPatients).toBeGreaterThan(0);
});
```

**Localização:** `tests/integration/`

### 3. Testes E2E (Playwright)

**O que são:** Testam a aplicação completa do ponto de vista do usuário

**Quando usar:**
- ✅ Testar fluxos críticos de usuário
- ✅ Validar UI e UX
- ✅ Testar navegação
- ✅ Smoke tests

**Exemplo:**
```typescript
test('usuário deve conseguir criar paciente', async ({ page }) => {
  await page.goto('/pacientes');
  await page.click('text=Novo Paciente');
  await page.fill('[name="name"]', 'João Silva');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Paciente criado')).toBeVisible();
});
```

**Localização:** `tests/e2e/`

---

## 🚀 COMO EXECUTAR

### Testes Unitários

```bash
# Todos os testes unitários
npm run test:unit

# Modo watch (re-executa ao salvar)
npm run test:unit:watch

# Interface visual
npm run test:unit:ui

# Com cobertura de código
npm run test:unit:coverage

# Teste específico
npm run test:unit -- tests/unit/services/patientService.test.ts

# Apenas testes que falharam
npm run test:unit -- --reporter=verbose --bail
```

### Testes E2E

```bash
# Todos os testes E2E
npm run test:e2e

# Interface do Playwright
npm run test:e2e:ui

# Com browser visível
npm run test:e2e:headed

# Teste específico
npm run test:e2e -- tests/e2e/auth.spec.ts

# Apenas em um browser
npm run test:e2e -- --project=chromium
```

### Verificações Completas

```bash
# Tudo (unitários + E2E + cobertura)
npm run test:all

# Verificações de código (lint + types + testes)
npm run check

# Corrigir problemas automaticamente
npm run check:fix
```

---

## 🆕 COMO CRIAR NOVOS TESTES

### Passo 1: Escolher o Tipo de Teste

**Teste Unitário?**
- Testar função ou serviço específico
→ Criar em `tests/unit/services/`

**Teste E2E?**
- Testar fluxo de usuário
→ Criar em `tests/e2e/`

### Passo 2: Copiar Template

```bash
# Para teste unitário
cp tests/unit/services/authService.test.ts tests/unit/services/meuServico.test.ts

# Para teste E2E
cp tests/e2e/auth.spec.ts tests/e2e/meuFluxo.spec.ts
```

### Passo 3: Adaptar o Código

**Template básico (unitário):**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as meuServico from '@/services/meuServico';
import { clearStorage } from './__helpers__/testFixtures';

// Mocks
vi.mock('@/services/mockDb', () => ({
  db: {
    getData: vi.fn(() => []),
  },
}));

describe('MeuServico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStorage();
  });

  describe('minhaFuncao', () => {
    it('deve retornar resultado esperado', async () => {
      const result = await meuServico.minhaFuncao();
      expect(result).toBeTruthy();
    });
  });
});
```

### Passo 4: Executar em Modo Watch

```bash
npm run test:unit:watch -- tests/unit/services/meuServico.test.ts
```

### Passo 5: Validar Cobertura

```bash
npm run test:unit:coverage -- tests/unit/services/meuServico.test.ts
```

---

## 📝 PADRÕES DE CÓDIGO

### Estrutura de Teste

```typescript
describe('NomeDoServico', () => {           // Nome do módulo
  beforeEach(() => {                        // Setup antes de cada teste
    vi.clearAllMocks();
    clearStorage();
  });

  afterEach(() => {                         // Cleanup após cada teste
    vi.restoreAllMocks();
  });

  describe('nomeDaFuncao', () => {          // Agrupa testes de uma função
    it('deve fazer X', async () => {        // Caso de teste específico
      // Arrange (preparar)
      const input = 'test';
      
      // Act (executar)
      const result = await service.funcao(input);
      
      // Assert (verificar)
      expect(result).toBe('expected');
    });

    it('deve falhar com Y', async () => {   // Caso de erro
      await expect(
        service.funcao(invalidInput)
      ).rejects.toThrow('Mensagem esperada');
    });
  });
});
```

### Nomenclatura

**✅ Bom:**
```typescript
it('deve retornar lista de pacientes')
it('deve criar paciente com dados válidos')
it('deve falhar com CPF duplicado')
it('deve emitir evento após salvamento')
```

**❌ Ruim:**
```typescript
it('test 1')
it('returns patients')
it('funciona')
```

### Assertions Comuns

```typescript
// Valores
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeFalsy()

// Arrays
expect(array).toBeInstanceOf(Array)
expect(array).toHaveLength(3)
expect(array).toContain(item)

// Objetos
expect(obj).toHaveProperty('key')
expect(obj).toMatchObject({ key: 'value' })

// Números
expect(num).toBeGreaterThan(0)
expect(num).toBeLessThan(100)
expect(num).toBeCloseTo(10.5, 2)

// Erros
await expect(promise).rejects.toThrow()
await expect(promise).rejects.toThrow('Mensagem')

// Mocks
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
expect(mockFn).toHaveBeenCalledTimes(1)
```

---

## 🛠️ HELPERS E FIXTURES

### Usar Fixtures Existentes

```typescript
import {
  createTestPatient,
  createTestAppointment,
  createTestUser,
  clearStorage,
} from './__helpers__/testFixtures';

// Criar um paciente de teste
const patient = createTestPatient();

// Com dados customizados
const pacienteInativo = createTestPatient({
  status: PatientStatus.Inactive,
  name: 'Paciente Específico',
});

// Criar múltiplos
const patients = createTestPatients(10);
```

### Helpers Disponíveis

**testFixtures.ts:**
- `createTestPatient(overrides?)` - Cria paciente
- `createTestPatients(count)` - Cria múltiplos pacientes
- `createTestAppointment(overrides?)` - Cria agendamento
- `createTestAppointments(count)` - Cria múltiplos agendamentos
- `createTestUser(role)` - Cria usuário com role específico
- `createTestTransaction(overrides?)` - Cria transação financeira
- `createTestExercise(overrides?)` - Cria exercício
- `clearStorage()` - Limpa localStorage e sessionStorage
- `mockDate(dateString)` - Mock de Date
- `restoreDate()` - Restaura Date real
- `waitFor(ms)` - Helper de espera
- `expectToHaveProperties(obj, props[])` - Verifica propriedades

**mockData.ts:**
- `mockPatientsList` - Array de pacientes mock
- `mockAppointmentsList` - Array de agendamentos mock
- `mockDb` - Instância de MockDatabase

---

## 🎭 MOCKS E STUBS

### Mock de Módulos

```typescript
// Mock completo de um módulo
vi.mock('@/services/myService', () => ({
  getData: vi.fn(() => []),
  saveData: vi.fn(),
}));

// Usar o mock
import * as myService from '@/services/myService';

it('deve chamar getData', async () => {
  await myService.getData();
  expect(myService.getData).toHaveBeenCalled();
});
```

### Mock de Funções

```typescript
// Mock de função específica
const mockFetch = vi.fn(() => Promise.resolve({ data: [] }));
global.fetch = mockFetch;

it('deve chamar API', async () => {
  await service.fetchData();
  expect(mockFetch).toHaveBeenCalled();
});
```

### Mock de localStorage/sessionStorage

```typescript
// Já implementado em testFixtures.ts
beforeEach(() => {
  clearStorage(); // Limpa antes de cada teste
});

it('deve salvar no localStorage', () => {
  localStorage.setItem('key', 'value');
  expect(localStorage.getItem('key')).toBe('value');
});
```

### Mock de Datas

```typescript
import { mockDate, restoreDate } from './__helpers__/testFixtures';

beforeEach(() => {
  mockDate('2025-01-15T10:00:00Z');
});

afterEach(() => {
  restoreDate();
});

it('deve usar data mockada', () => {
  const now = new Date();
  expect(now.toISOString()).toContain('2025-01-15');
});
```

---

## 🐛 TROUBLESHOOTING

### Problema: Testes não encontram módulos

**Erro:** `Cannot find module '@/services/...'`

**Solução:**
Verificar alias no `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

### Problema: Mocks não funcionam

**Erro:** Função real é chamada ao invés do mock

**Solução:** Mockar ANTES do import
```typescript
vi.mock('@/services/myService'); // PRIMEIRO
import * as myService from '@/services/myService'; // DEPOIS
```

### Problema: localStorage undefined

**Erro:** `localStorage is not defined`

**Solução:** Usar helper clearStorage() ou definir mock

### Problema: Testes lentos

**Solução 1:** Usar fake timers
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

**Solução 2:** Reduzir delays em serviços (apenas para testes)

### Problema: Testes instáveis (flaky)

**Causas comuns:**
- Dependência de tempo real
- Dados não isolados
- Race conditions

**Soluções:**
- Usar fake timers
- Limpar estado com beforeEach
- Adicionar waits explícitos

---

## 🎯 QUANDO USAR CADA TIPO DE TESTE

### Use Testes Unitários Para:

✅ Lógica de negócio (cálculos, validações)  
✅ Funções puras (sem side effects)  
✅ Transformações de dados  
✅ Validações de formulário  
✅ Utilitários e helpers  

### Use Testes de Integração Para:

✅ Fluxos entre múltiplos serviços  
✅ Persistência de dados  
✅ Event handlers  
✅ Webhooks e callbacks  

### Use Testes E2E Para:

✅ Fluxos críticos de usuário  
✅ Jornadas completas (login → ação → logout)  
✅ Interações complexas de UI  
✅ Smoke tests  

---

## 📊 MÉTRICAS E COBERTURA

### Metas de Cobertura

De acordo com `vitest.config.ts`:

```typescript
coverage: {
  statements: 80,  // 80% das declarações
  branches: 75,    // 75% das ramificações
  functions: 80,   // 80% das funções
  lines: 80,       // 80% das linhas
}
```

### Ver Cobertura

```bash
# Executar com cobertura
npm run test:unit:coverage

# Abrir relatório HTML
# coverage/index.html
```

### Interpretar Métricas

**Statements (Declarações):**
- Quantas linhas de código foram executadas
- Meta: 80%+

**Branches (Ramificações):**
- Quantos caminhos de if/else foram testados
- Meta: 75%+

**Functions (Funções):**
- Quantas funções foram chamadas
- Meta: 80%+

**Lines (Linhas):**
- Quantas linhas foram executadas (similar a statements)
- Meta: 80%+

---

## 🎓 BOAS PRÁTICAS

### DO ✅

1. **Teste comportamento, não implementação**
   ```typescript
   // ✅ Bom
   expect(user.isActive).toBe(true);
   
   // ❌ Ruim
   expect(service._internalState).toBe('active');
   ```

2. **Um conceito por teste**
   ```typescript
   // ✅ Bom
   it('deve retornar lista de pacientes', () => {});
   it('deve ordenar pacientes por data', () => {});
   
   // ❌ Ruim
   it('deve retornar lista ordenada de pacientes ativos', () => {});
   ```

3. **Usar fixtures para dados de teste**
   ```typescript
   // ✅ Bom
   const patient = createTestPatient();
   
   // ❌ Ruim
   const patient = { id: '1', name: 'Test', cpf: '123'... };
   ```

4. **Limpar estado entre testes**
   ```typescript
   // ✅ Bom
   beforeEach(() => {
     vi.clearAllMocks();
     clearStorage();
   });
   ```

5. **Nomear testes em português**
   ```typescript
   // ✅ Bom (conforme requisito do projeto)
   it('deve retornar erro para CPF inválido', () => {});
   ```

### NÃO FAÇA ❌

1. **Não teste código de terceiros**
   ```typescript
   // ❌ Ruim - React já é testado
   it('useState deve funcionar', () => {});
   ```

2. **Não use valores hardcoded sem motivo**
   ```typescript
   // ❌ Ruim
   expect(patients).toHaveLength(8);
   
   // ✅ Bom
   expect(patients).toBeInstanceOf(Array);
   expect(patients.length).toBeGreaterThan(0);
   ```

3. **Não teste implementação interna**
   ```typescript
   // ❌ Ruim
   expect(service._cache.size).toBe(3);
   
   // ✅ Bom
   expect(await service.getData()).toHaveLength(3);
   ```

4. **Não crie testes dependentes**
   ```typescript
   // ❌ Ruim - teste 2 depende do teste 1
   it('deve criar usuário', () => {
     user = createUser();
   });
   it('deve atualizar usuário criado', () => {
     updateUser(user); // Depende do teste anterior
   });
   ```

---

## 🔧 CONFIGURAÇÃO

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5175',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 🎯 CI/CD (Futuro - Semana 9)

### GitHub Actions (Planejado)

Quando implementado, os testes rodarão automaticamente em:
- ✅ Push para qualquer branch
- ✅ Pull Requests
- ✅ Merges para main

### Badges (Planejado)

README.md terá badges de:
- Testes passando/falhando
- Cobertura de código
- Status do build

---

## 📈 MONITORAMENTO

### Métricas a Acompanhar

1. **Taxa de Sucesso:** Deve estar >90%
2. **Cobertura:** Meta de 80%+
3. **Tempo de Execução:** Unitários <1min, E2E <10min
4. **Flaky Tests:** <2%

### Revisão Semanal

- Revisar testes que falharam
- Atualizar fixtures se necessário
- Adicionar testes para bugs encontrados
- Refatorar testes duplicados

---

## 🆘 AJUDA E RECURSOS

### Documentação Oficial

- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Testing Library:** https://testing-library.com/

### Documentação do Projeto

- `tests/unit/services/README.md` - Guia de testes unitários
- `testsprite_tests/LEIA_ME_PRIMEIRO.md` - Análise TestSprite
- `RELATORIO_CONSOLIDADO_FASE1_PARCIAL.md` - Progresso atual

### Comandos de Ajuda

```bash
# Ver lista de testes
npm run test:unit -- --list

# Ver testes com coverage
npm run test:unit:coverage

# Debug de teste específico
npm run test:unit:ui
```

---

## 🎊 PRÓXIMOS PASSOS

### Semana 4 (Atual)

- [ ] Corrigir 58 testes falhando
- [ ] Atingir 80% de cobertura
- [ ] Criar mais fixtures se necessário
- [ ] Documentar padrões adicionais

### Semanas 5-8 (Futuro)

- [ ] Implementar testes E2E com Playwright
- [ ] Cobrir fluxos críticos
- [ ] 85+ cenários de teste

### Semanas 9-12 (Futuro)

- [ ] CI/CD com GitHub Actions
- [ ] Testes de performance
- [ ] Avaliação de backend

---

**Guia Criado por:** Claude (Cursor AI)  
**Data:** 11 de Outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ Guia Completo de Testes

