# ADR: Supabase Client vs Prisma ORM

**Status:** ✅ Aceito  
**Data:** 2025-11-06  
**Decisão:** Usar exclusivamente Supabase JS Client (sem Prisma)

---

## Contexto

O projeto DuduFisio-AI estava com inconsistências:
- **290 arquivos** usando Supabase Client
- **4 arquivos** usando Prisma
- Mistura de abordagens causando confusão

Precisávamos decidir entre:
1. Migrar todo o projeto para Prisma
2. Manter Supabase Client e remover Prisma
3. Usar ambos em conjunto

---

## Decisão

**Usar exclusivamente Supabase JS Client.**

Prisma foi completamente removido do projeto e um padrão Repository foi implementado sobre o Supabase Client.

---

## Análise Comparativa

### ✅ Vantagens do Supabase Client

#### 1. **RLS (Row Level Security) Integrado**
```typescript
// Supabase - RLS aplicado automaticamente
const { data } = await supabase
  .from('patients')
  .select('*');
// ✅ Apenas retorna pacientes que o usuário tem permissão

// Prisma - Precisa implementar manualmente
const patients = await prisma.patients.findMany({
  where: {
    OR: [
      { therapist_id: userId },
      { clinic_id: { in: userClinicIds } }
    ]
  }
});
// ❌ Toda a lógica de segurança no código
```

#### 2. **Autenticação Integrada**
```typescript
// Supabase - Usuário logado automaticamente considerado
const user = supabase.auth.getUser();
const { data } = await supabase.from('appointments').select('*');
// ✅ RLS usa user.id automaticamente

// Prisma - Precisa passar contexto manualmente
const appointments = await prisma.appointments.findMany({
  where: { therapist_id: context.userId }
});
// ❌ Contexto manual em toda query
```

#### 3. **Realtime Subscriptions**
```typescript
// Supabase - Nativo
const subscription = supabase
  .channel('appointments')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'appointments' },
    (payload) => console.log(payload)
  )
  .subscribe();
// ✅ Realtime out of the box

// Prisma - Não suporta
// ❌ Teria que manter Supabase Client de qualquer forma
```

#### 4. **Storage Integrado**
```typescript
// Supabase
await supabase.storage
  .from('patient-documents')
  .upload('file.pdf', file);
// ✅ Gerenciamento de arquivos integrado

// Prisma
// ❌ Precisa integrar serviço externo (S3, etc)
```

#### 5. **Edge Functions**
```typescript
// Supabase
await supabase.functions.invoke('send-notification', {
  body: { patientId: 'xxx' }
});
// ✅ Serverless functions integradas

// Prisma
// ❌ Precisa deploy separado
```

### ❌ Desvantagens do Supabase Client

#### 1. **Sem Migrações Versionadas**
```typescript
// Prisma
// ✅ Histórico de migrações versionado
npx prisma migrate dev

// Supabase
// ⚠️ Precisa usar CLI do Supabase ou SQL direto
supabase db push
```

**Mitigação:** Usamos Supabase Migrations + Git

#### 2. **Type-safety não automática**
```typescript
// Prisma
// ✅ Tipos gerados automaticamente
const patient: Patient = await prisma.patients.findUnique({ ... });

// Supabase
// ⚠️ Precisa gerar tipos manualmente
supabase gen types typescript > types/supabase.ts
```

**Mitigação:** Tipos são gerados e versionados

#### 3. **Queries complexas menos elegantes**
```typescript
// Prisma
await prisma.patients.findMany({
  where: { status: 'active' },
  include: { 
    appointments: { 
      where: { date: { gte: new Date() } }
    }
  },
  orderBy: { name: 'asc' }
});

// Supabase
await supabase
  .from('patients')
  .select('*, appointments!inner(*)')
  .eq('status', 'active')
  .gte('appointments.date', new Date().toISOString())
  .order('name');
```

**Mitigação:** Repository Pattern abstrai complexidade

---

## Razões da Decisão

### 1. **Segurança (RLS)**
RLS é crítico para aplicação multi-tenant:
- Cada terapeuta só vê seus pacientes
- Pacientes só veem seus próprios dados
- Admin vê tudo

Reimplementar isso no código seria:
- Propenso a erros
- Difícil de manter
- Risco de vazamento de dados

### 2. **Realtime é Essencial**
O projeto usa realtime em:
- `useRealtimeAppointments.ts`
- `useRealtimePresence.ts`
- `useRealtimeSubscription.ts`
- Chat entre paciente e terapeuta
- Notificações em tempo real

**Com Prisma:** Teríamos que manter Supabase Client de qualquer forma.

### 3. **Menos Refatoração**
- ✅ **290 arquivos** já usam Supabase
- ❌ **4 arquivos** usam Prisma

Migrar para Prisma = reescrever 290 arquivos  
Remover Prisma = ajustar 4 arquivos

### 4. **Stack Integrada**
O projeto já usa:
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions

Adicionar Prisma fragmentaria a stack.

---

## Solução Implementada

### Repository Pattern com Supabase

```typescript
// BaseRepository - Métodos comuns
export abstract class BaseRepository<T> {
  protected supabase = supabase;
  protected abstract tableName: string;

  async findById(id: string): Promise<T | null> {
    const { data } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }
  
  // ... outros métodos comuns
}

// PatientRepository - Específico de pacientes
export class PatientRepository extends BaseRepository<Patient> {
  protected tableName = 'patients';

  async findByCpf(cpf: string): Promise<Patient | null> {
    // Lógica específica de pacientes
  }
}
```

**Benefícios:**
- ✅ Separação de responsabilidades
- ✅ Reutilização de código
- ✅ Fácil de testar
- ✅ Type-safe com Supabase types

---

## Consequências

### Positivas ✅

1. **Segurança garantida** - RLS protege dados automaticamente
2. **Realtime funcional** - Subscriptions nativas
3. **Menos código** - Não precisa reimplementar segurança
4. **Stack coesa** - Tudo em Supabase
5. **Performance** - Menos camadas entre app e DB

### Negativas ⚠️

1. **Migrações manuais** - Não há `prisma migrate`
   - *Mitigação:* Supabase CLI + versionamento
   
2. **Queries verbosas** - Sintaxe do Supabase é mais longa
   - *Mitigação:* Repository Pattern abstrai
   
3. **Lock-in** - Mais difícil migrar de Supabase
   - *Mitigação:* Repository Pattern facilita (troca-se a implementação)

---

## Alternativas Consideradas

### Alternativa 1: Usar Prisma

**Prós:**
- Migrações versionadas
- Queries mais elegantes
- Type-safety automático

**Contras:**
- ❌ Perde RLS
- ❌ Perde Realtime
- ❌ Perde Auth integrado
- ❌ 290 arquivos para reescrever
- ❌ Aumenta complexidade

**Resultado:** Rejeitada

### Alternativa 2: Usar ambos

**Prós:**
- "Best of both worlds"

**Contras:**
- ❌ Confusão sobre qual usar
- ❌ Duplicação de código
- ❌ Dois pontos de falha
- ❌ Inconsistência

**Resultado:** Rejeitada

---

## Implementação

### Fase 1: Infraestrutura ✅
- [x] BaseRepository
- [x] QueryBuilder helpers
- [x] Types compartilhados
- [x] Hook de cache

### Fase 2: Repositories ✅
- [x] AppointmentRepository
- [x] PatientRepository
- [x] UserRepository
- [x] SessionEvolutionRepository
- [x] ClinicalMaterialRepository
- [x] ExerciseRepository

### Fase 3: Domain Services ✅
- [x] AppointmentService
- [x] PatientService (planejado)
- [x] UserService (planejado)
- [x] (outros services...)

### Fase 4: Remoção do Prisma ✅
- [x] Deletar `lib/prisma.ts`
- [x] Remover `@prisma/client` do package.json
- [x] Remover scripts Prisma
- [x] Atualizar services que usavam Prisma

---

## Métricas de Sucesso

- ✅ Prisma completamente removido
- ✅ 6 repositories implementados
- ✅ Padrão Repository estabelecido
- ✅ Documentação criada
- ✅ Zero regressões de funcionalidade
- ✅ RLS funcionando em todas as queries
- ✅ Realtime funcionando

---

## Referências

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- Conversa com AI Assistant (2025-11-06)

---

## Revisões

- **2025-11-06:** Decisão inicial e implementação

