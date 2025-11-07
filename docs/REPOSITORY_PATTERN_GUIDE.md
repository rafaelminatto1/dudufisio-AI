# 📚 Guia do Repository Pattern - DuduFisio-AI

Este guia explica como usar e criar repositories no projeto DuduFisio-AI.

---

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Como Usar Repositories](#como-usar-repositories)
4. [Como Criar um Novo Repository](#como-criar-um-novo-repository)
5. [Padrões e Best Practices](#padrões-e-best-practices)
6. [Exemplos Completos](#exemplos-completos)
7. [Migração de Código Existente](#migração-de-código-existente)

---

## Visão Geral

### O que é Repository Pattern?

O Repository Pattern separa a lógica de acesso a dados da lógica de negócio:

```
UI/Components → Service (Domain) → Repository → Supabase → Database
```

**Benefícios:**
- ✅ Código mais organizado e testável
- ✅ Fácil de mockar em testes
- ✅ Reutilização de queries comuns
- ✅ Type-safety total com Supabase types
- ✅ Separação clara de responsabilidades

---

## Estrutura do Projeto

```
services/
├── repositories/          # Acesso ao banco (queries)
│   ├── BaseRepository.ts
│   ├── AppointmentRepository.ts
│   ├── PatientRepository.ts
│   ├── UserRepository.ts
│   ├── SessionEvolutionRepository.ts
│   ├── ClinicalMaterialRepository.ts
│   └── ExerciseRepository.ts
│
├── domain/               # Lógica de negócio
│   ├── AppointmentService.ts
│   ├── PatientService.ts
│   └── ... (outros services)
│
└── types/                # Tipos compartilhados
    └── RepositoryTypes.ts

hooks/                    # React hooks
├── useCache.ts
├── useAppointments.ts
└── usePatients.ts

lib/
└── supabase/
    └── queryBuilder.ts   # Helpers para queries
```

---

## Como Usar Repositories

### 1. Importar o Repository

```typescript
import { appointmentRepository } from '@/services/repositories/AppointmentRepository';
import { patientRepository } from '@/services/repositories/PatientRepository';
```

### 2. Usar Métodos do Repository

#### Buscar todos

```typescript
const appointments = await appointmentRepository.findMany();
```

#### Buscar com filtros

```typescript
const appointments = await appointmentRepository.findMany({
  patientId: 'patient-123',
  status: ['scheduled', 'confirmed'],
  startDate: new Date('2025-01-01'),
});
```

#### Buscar por ID

```typescript
const appointment = await appointmentRepository.findById('apt-123');
```

#### Criar

```typescript
const newAppointment = await appointmentRepository.create({
  patient_id: 'patient-123',
  start_time: '2025-11-07T10:00:00Z',
  end_time: '2025-11-07T11:00:00Z',
  status: 'scheduled',
});
```

#### Atualizar

```typescript
const updated = await appointmentRepository.update('apt-123', {
  status: 'completed',
});
```

#### Deletar

```typescript
await appointmentRepository.delete('apt-123');
```

---

## Como Criar um Novo Repository

### Passo 1: Criar o arquivo

Crie `services/repositories/NomeRepository.ts`:

```typescript
import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions } from '../types/RepositoryTypes';

// 1. Definir tipos do Supabase
type NomeRow = Database['public']['Tables']['nome_tabela']['Row'];
type NomeInsert = Database['public']['Tables']['nome_tabela']['Insert'];
type NomeUpdate = Database['public']['Tables']['nome_tabela']['Update'];

// 2. Definir filtros específicos
export interface NomeFilters {
  status?: string | string[];
  // ... outros filtros
}

// 3. Criar classe do repository
export class NomeRepository extends BaseRepository<
  NomeRow,
  NomeInsert,
  NomeUpdate
> {
  protected tableName = 'nome_tabela'; // Nome da tabela no Supabase

  /**
   * Busca com filtros personalizados
   */
  async findMany(
    filters?: NomeFilters,
    options?: QueryOptions
  ): Promise<NomeRow[]> {
    let query = this.supabase.from(this.tableName).select('*');

    // Aplicar filtros
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    // Aplicar options (paginação, sort)
    query = this.applyOptions(query, options);

    // Ordenação padrão
    if (!options?.sort) {
      query = query.order('created_at', { ascending: false });
    }

    return this.executeQuery(() => query, 'findMany');
  }

  /**
   * Métodos específicos da entidade
   */
  async findByCustomField(value: string): Promise<NomeRow | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('custom_field', value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.handleError(error, 'findByCustomField');
    }

    return data;
  }
}

// 4. Exportar instância singleton
export const nomeRepository = new NomeRepository();
```

### Passo 2: Criar o Service (Domain)

Crie `services/domain/NomeService.ts`:

```typescript
import { nomeRepository, type NomeFilters } from '../repositories/NomeRepository';
import { withSupabaseQuery, withSupabaseMutation } from '@/lib/supabase/errorHandler';
import { eventService } from '../eventService';

export class NomeService {
  /**
   * Busca registros
   */
  async getAll(filters?: NomeFilters) {
    return withSupabaseQuery(
      async () => {
        return nomeRepository.findMany(filters);
      },
      {
        operation: 'getAll',
        fallbackMessage: 'Erro ao buscar registros',
      }
    );
  }

  /**
   * Cria ou atualiza
   */
  async save(data: any) {
    return withSupabaseMutation(
      async () => {
        // Validações de negócio
        this.validate(data);

        // Salvar
        let result;
        if (data.id) {
          result = await nomeRepository.update(data.id, data);
        } else {
          result = await nomeRepository.create(data);
        }

        // Emitir evento para cache
        eventService.emit('nome:changed');

        return result;
      },
      {
        operation: 'save',
        fallbackMessage: 'Erro ao salvar',
      }
    );
  }

  /**
   * Validações de negócio
   */
  private validate(data: any): void {
    if (!data.required_field) {
      throw new Error('Campo obrigatório');
    }
  }
}

// Exportar singleton
export const nomeService = new NomeService();
```

### Passo 3: Criar Hook (opcional)

Crie `hooks/useNome.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { nomeService } from '@/services/domain/NomeService';
import { eventService } from '@/services/eventService';
import { useCache } from './useCache';

export function useNome() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = 'nome:all';
  const { get, set, invalidate } = useCache(cacheKey);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Tentar cache primeiro
      const cached = get<any[]>();
      if (cached) {
        setData(cached);
        setIsLoading(false);
        return;
      }

      // Buscar do banco
      const result = await nomeService.getAll();
      
      // Salvar no cache
      set(result);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [get, set]);

  const refetch = useCallback(async () => {
    invalidate();
    await fetch();
  }, [fetch, invalidate]);

  useEffect(() => {
    fetch();

    // Listener para mudanças
    const handleChange = () => {
      refetch();
    };

    eventService.on('nome:changed', handleChange);

    return () => {
      eventService.off('nome:changed', handleChange);
    };
  }, [fetch, refetch]);

  return { data, isLoading, error, refetch };
}
```

---

## Padrões e Best Practices

### 1. Nomenclatura

```typescript
// Repository
PatientRepository → patientRepository (singleton)

// Service
PatientService → patientService (singleton)

// Hook
usePatients (plural)
usePatient (singular, quando recebe ID)
```

### 2. Filtros

```typescript
// Sempre opcional e com interface clara
export interface PatientFilters {
  status?: string | string[];  // Aceita único ou múltiplos
  search?: string;             // Busca textual
  startDate?: Date | string;   // Date range
  endDate?: Date | string;
}
```

### 3. Retornos

```typescript
// Repository retorna tipos do Supabase
async findById(id: string): Promise<PatientRow | null>

// Service retorna tipos da aplicação
async getPatientById(id: string): Promise<Patient | null>
```

### 4. Tratamento de Erros

```typescript
// Repository lança erro
if (error) {
  this.handleError(error, 'findById');
}

// Service envolve com withSupabaseQuery
return withSupabaseQuery(
  async () => {
    return repository.findById(id);
  },
  {
    operation: 'getPatientById',
    fallbackMessage: 'Erro ao buscar paciente',
  }
);
```

### 5. Eventos

```typescript
// Sempre emitir evento após mudança
await repository.create(data);
eventService.emit('patients:changed');

// Hook escuta evento
eventService.on('patients:changed', handleChange);
```

---

## Exemplos Completos

### Exemplo 1: Busca com Paginação

```typescript
import { appointmentRepository } from '@/services/repositories/AppointmentRepository';

// Buscar appointments com paginação
const appointments = await appointmentRepository.findMany(
  {
    status: ['scheduled', 'confirmed'],
    startDate: new Date('2025-11-01'),
  },
  {
    pagination: {
      page: 1,
      limit: 20,
    },
    sort: {
      field: 'start_time',
      direction: 'asc',
    },
  }
);
```

### Exemplo 2: Busca com Relações (JOIN)

```typescript
// Buscar appointments com dados de paciente e terapeuta
const appointmentsWithRelations = await appointmentRepository.findManyWithRelations({
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
});

// Resultado inclui patient e therapist
appointmentsWithRelations.forEach(apt => {
  console.log(apt.patient?.name);
  console.log(apt.therapist?.name);
});
```

### Exemplo 3: Validação de Negócio

```typescript
// No Service
async saveAppointment(data: Appointment) {
  // 1. Validar dados
  if (!data.patientId) {
    throw new Error('Paciente é obrigatório');
  }

  // 2. Validar horário
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  if (end <= start) {
    throw new Error('Horário inválido');
  }

  // 3. Verificar conflito
  const hasConflict = await appointmentRepository.hasConflict(
    data.therapistId,
    data.startTime,
    data.endTime
  );

  if (hasConflict) {
    throw new Error('Conflito de horário');
  }

  // 4. Salvar
  return appointmentRepository.create(data);
}
```

---

## Migração de Código Existente

### Antes (código antigo)

```typescript
// services/patientService.ts - ANTIGO
import { supabase } from '../lib/supabaseClient';

export async function getPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getPatientById(id: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
```

### Depois (novo padrão)

```typescript
// services/repositories/PatientRepository.ts - NOVO
export class PatientRepository extends BaseRepository {
  protected tableName = 'patients';
  // Métodos herdados: findAll, findById, create, update, delete
}

// services/domain/PatientService.ts - NOVO
export class PatientService {
  async getPatients() {
    return withSupabaseQuery(
      () => patientRepository.findMany(),
      { operation: 'getPatients', fallbackMessage: 'Erro ao buscar pacientes' }
    );
  }

  async getPatientById(id: string) {
    return withSupabaseQuery(
      () => patientRepository.findById(id),
      { operation: 'getPatientById', fallbackMessage: 'Erro ao buscar paciente' }
    );
  }
}

// No componente - USAR O SERVICE
import { patientService } from '@/services/domain/PatientService';

const patients = await patientService.getPatients();
const patient = await patientService.getPatientById('123');
```

---

## Checklist de Migração

Ao migrar um service existente:

- [ ] Identificar tabela(s) do Supabase
- [ ] Criar Repository com tipos do Supabase
- [ ] Implementar métodos específicos no Repository
- [ ] Criar Service com lógica de negócio
- [ ] Adicionar validações no Service
- [ ] Emitir eventos em operações de escrita
- [ ] Criar Hook se necessário
- [ ] Atualizar imports nos componentes
- [ ] Testar funcionalidade
- [ ] Remover código antigo

---

## Próximos Passos

### Módulos a Migrar (80+ services)

Após os 6 módulos principais (✅ concluídos), migrar:

1. **Analytics** - `analyticsService.ts`
2. **Reports** - `reportsService.ts`
3. **Notifications** - `notificationService.ts`
4. **Calendar** - `calendarService.ts`
5. **Gamification** - `gamificationService.ts`
6. ... (outros 75+ services)

**Estratégia:**
1. Priorizar services mais usados
2. Um módulo por vez
3. Testar após cada migração
4. Manter compatibilidade durante transição

---

## Suporte

Para dúvidas:
1. Consulte este guia
2. Veja exemplos nos repositories existentes
3. Leia `ADR_PRISMA_VS_SUPABASE.md` para contexto
4. Revise `BaseRepository.ts` para métodos disponíveis

---

## Referências

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript)
- [Repository Pattern - Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html)
- `services/repositories/` - Exemplos de implementação
- `ADR_PRISMA_VS_SUPABASE.md` - Decisão técnica

