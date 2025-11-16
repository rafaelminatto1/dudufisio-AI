# Testes Unitários - Serviços

## Estrutura de Testes

Este diretório contém testes unitários para todos os serviços do DuduFisio-AI.

### Organização

```
tests/unit/services/
├── __helpers__/
│   ├── testFixtures.ts    # Fixtures e factories de teste
│   └── mockData.ts         # Dados mockados e MockDatabase
├── patientService.test.ts
├── appointmentService.test.ts
├── exerciseService.test.ts
├── financialService.test.ts
├── authService.test.ts
└── README.md (este arquivo)
```

## Executando Testes

### Todos os testes unitários
```bash
npm run test:unit
```

### Modo watch (re-executa ao salvar)
```bash
npm run test:unit:watch
```

### Interface visual
```bash
npm run test:unit:ui
```

### Com cobertura de código
```bash
npm run test:unit:coverage
```

### Teste específico
```bash
npm run test:unit -- tests/unit/services/patientService.test.ts
```

## Helpers de Teste

### testFixtures.ts

Fornece funções factory para criar dados de teste padronizados:

```typescript
import { createTestPatient, createTestAppointment, createTestUser } from './__helpers__/testFixtures';

// Criar um paciente de teste
const patient = createTestPatient();

// Com overrides
const paciente Com dados = createTestPatient({
  name: 'Nome Personalizado',
  status: PatientStatus.Inactive
});

// Criar múltiplos
const patients = createTestPatients(10);
```

**Funções disponíveis:**
- `createTestPatient(overrides?)` - Cria um paciente
- `createTestPatients(count)` - Cria múltiplos pacientes
- `createTestAppointment(overrides?)` - Cria um agendamento
- `createTestAppointments(count)` - Cria múltiplos agendamentos
- `createTestUser(role)` - Cria um usuário com role específico
- `createTestTransaction(overrides?)` - Cria transação financeira
- `createTestExercise(overrides?)` - Cria exercício
- `clearStorage()` - Limpa localStorage e sessionStorage
- `mockDate(dateString)` - Mock de Date para testes temporais
- `restoreDate()` - Restaura Date real
- `waitFor(ms)` - Helper para esperar delays
- `expectToHaveProperties(obj, props[])` - Verifica propriedades

### mockData.ts

Fornece listas de dados mockados e uma classe MockDatabase:

```typescript
import { mockPatientsList, mockAppointmentsList, mockDb } from './__helpers__/mockData';

// Usar dados mockados
const patients = mockPatientsList;

// Usar MockDatabase
mockDb.getPatients();
mockDb.addPatient(patient);
mockDb.reset(); // Restaurar estado inicial
```

## Padrões de Teste

### Estrutura Básica

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as service from '@/services/myService';
import { createTestData, clearStorage } from './__helpers__/testFixtures';

// Mocks
vi.mock('@/services/mockDb', () => ({
  db: {
    getData: vi.fn(() => []),
  },
}));

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getData', () => {
    it('deve retornar lista de dados', async () => {
      const data = await service.getData();
      expect(data).toBeInstanceOf(Array);
    });
  });
});
```

### Testes Assíncronos

```typescript
it('deve processar dados async', async () => {
  const result = await service.processData();
  expect(result).toBeTruthy();
});
```

### Testes com Mocks

```typescript
it('deve chamar API externa', async () => {
  const mockFetch = vi.fn(() => Promise.resolve({ data: [] }));
  global.fetch = mockFetch;
  
  await service.fetchData();
  
  expect(mockFetch).toHaveBeenCalled();
});
```

### Testes de Erro

```typescript
it('deve lançar erro para dados inválidos', async () => {
  await expect(service.create(invalidData)).rejects.toThrow('Erro esperado');
});
```

## Status dos Testes

### ✅ Implementados (Semana 1 - Fase 1)

1. **patientService.test.ts** - 31 testes
   - ✅ getAllPatients (3 testes)
   - ✅ getRecentPatients (2 testes)
   - ✅ searchPatients (6 testes)
   - ⚠️ quickAddPatient (5 testes) - Alguns falhando (função não existe no serviço)
   - ✅ getPatientById (2 testes)
   - ⚠️ createPatient (4 testes) - Função não existe
   - ⚠️ updatePatient (3 testes) - Mock incompleto
   - ⚠️ deletePatient (2 testes) - Função não existe
   - ✅ validateCPF (2 testes)
   - ✅ Performance (2 testes)
   - **Status:** 17/31 passando (55%)

2. **appointmentService.test.ts** - 30+ testes
   - Todos os fluxos principais de agendamentos
   - Detecção de conflitos
   - Gerenciamento de séries recorrentes
   - Lista de espera e alertas

3. **exerciseService.test.ts** - 40+ testes
   - Propriedades e validações
   - Categorias e filtros
   - Busca e protocolo
   - Mídia e segurança

4. **financialService.test.ts** - 35+ testes
   - Transações e despesas
   - Resumo financeiro
   - Vouchers
   - Persistência no localStorage

5. **authService.test.ts** - 40+ testes
   - Login/Logout
   - Gerenciamento de sessão
   - Roles de usuário
   - Segurança

**Total:** ~175 testes criados na Semana 1

### 📋 Próximos (Semana 2)

- soapNoteService.test.ts
- evaluationService.test.ts
- bodyMapService.test.ts
- treatmentService.test.ts
- protocolService.test.ts

## Cobertura de Código

Meta: **80%+** de cobertura

Para verificar:
```bash
npm run test:unit:coverage
```

O relatório HTML estará disponível em: `coverage/index.html`

## Troubleshooting

### Testes não encontrando módulos

Certifique-se de que os aliases do TypeScript estão configurados:
```typescript
// vitest.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

### Mocks não funcionando

Certifique-se de mockar ANTES do import:
```typescript
vi.mock('@/services/myService');
import * as myService from '@/services/myService';
```

### localStorage/sessionStorage undefined

Use os mocks fornecidos em testFixtures ou defina:
```typescript
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
```

### Testes lentos

Use `vi.useFakeTimers()` para acelerar delays:
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

## Contribuindo

Ao adicionar novos testes:

1. Use fixtures existentes quando possível
2. Siga a estrutura de describe/it consistente
3. Inclua testes de edge cases
4. Adicione testes de performance quando relevante
5. Documente comportamentos complexos
6. Execute `npm run test:unit` antes de commit

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

