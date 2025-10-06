# 🔧 Plano de Correção dos Tipos TypeScript - Supabase Schema

**Data:** Janeiro 2025  
**Status:** 🚨 **ANÁLISE CRÍTICA CONCLUÍDA**  
**Problemas Identificados:** 200+ erros de tipos  

---

## 📊 Análise dos Problemas Principais

### 1. 🚨 **Incompatibilidade Schema vs Tipos Customizados**

**Problema:** Os tipos customizados não correspondem ao schema real do Supabase.

**Exemplos:**
- **Patient:** Schema usa `name`, tipos customizados usam `full_name`
- **Users:** Schema não tem `phone`, `specialization`, `professional_id`
- **BodyPoint:** Schema usa `created_at`, tipos usam `createdAt`

### 2. 🚨 **Mapeamento de Campos Incorreto**

**Tabela `patients`:**
```typescript
// ❌ Schema Real (database-generated.ts)
{
  name: string,           // Nome simples
  phone: string | null,   // Telefone opcional
  email: string | null,   // Email opcional
  birth_date: string | null, // Data opcional
  created_at: string | null,
  updated_at: string | null,
  created_by: string | null,
  user_id: string | null
}

// ❌ Tipos Customizados (patient.ts)
{
  full_name: string,      // Nome completo obrigatório
  phone: string,          // Telefone obrigatório
  email?: string | null,  // Email opcional
  birth_date: string,     // Data obrigatória
  created_at: string,     // Campos obrigatórios
  updated_at: string,
  created_by: string,
  // + muitos campos que não existem no schema
}
```

**Tabela `users`:**
```typescript
// ❌ Schema Real
{
  email: string,
  full_name: string | null,
  role: string | null,
  is_active: boolean | null,
  permissions: Json | null,
  profile_settings: Json | null,
  created_at: string | null,
  updated_at: string | null,
  last_login_at: string | null
}

// ❌ Tipos Customizados esperam
{
  phone: string,           // ❌ Não existe no schema
  specialization: string,  // ❌ Não existe no schema
  professional_id: string, // ❌ Não existe no schema
  active: boolean,         // ❌ É is_active no schema
}
```

---

## 🎯 Plano de Correção

### Fase 1: Regeneração e Mapeamento de Tipos

#### ✅ 1.1 Usar Tipos Gerados pelo Supabase
```bash
# Já executado
npx supabase gen types typescript --local > types/database-generated.ts
```

#### 🔄 1.2 Criar Mapeadores de Tipos
```typescript
// types/mappers.ts
import { Database } from './database-generated';

// Mapear tipos do Supabase para tipos da aplicação
export type SupabasePatient = Database['public']['Tables']['patients']['Row'];
export type SupabaseUser = Database['public']['Tables']['users']['Row'];

// Converter para tipos da aplicação
export function mapSupabasePatientToPatient(supabasePatient: SupabasePatient): Patient {
  return {
    id: supabasePatient.id,
    name: supabasePatient.name,
    phone: supabasePatient.phone || '',
    email: supabasePatient.email || null,
    birthDate: supabasePatient.birth_date || '',
    createdAt: supabasePatient.created_at || '',
    updatedAt: supabasePatient.updated_at || '',
    createdBy: supabasePatient.created_by || '',
    userId: supabasePatient.user_id || null,
  };
}
```

### Fase 2: Correção dos Services

#### 🔄 2.1 Atualizar PatientService
```typescript
// services/patientService.ts
import { supabase } from '@/lib/supabase';
import { mapSupabasePatientToPatient } from '@/types/mappers';

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*');
    
  if (error) throw error;
  
  return data.map(mapSupabasePatientToPatient);
}
```

#### 🔄 2.2 Atualizar AuthService
```typescript
// services/auth/authService.ts
import { supabase } from '@/lib/supabase';

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;
  
  // Buscar dados do usuário na tabela users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (userError || !userData) return null;
  
  // Mapear campos corretos
  return {
    id: userData.id,
    email: userData.email,
    fullName: userData.full_name,
    role: userData.role,
    isActive: userData.is_active,
    // ❌ Remover campos que não existem
    // phone: userData.phone,           // Não existe
    // specialization: userData.specialization, // Não existe
    // professionalId: userData.professional_id, // Não existe
  };
}
```

### Fase 3: Correção dos Tipos Customizados

#### 🔄 3.1 Atualizar types/patient.ts
```typescript
// types/patient.ts
export interface Patient {
  id: string;
  name: string;                    // ✅ Corrigido de full_name
  phone: string | null;            // ✅ Corrigido para nullable
  email: string | null;            // ✅ Corrigido para nullable
  birthDate: string | null;        // ✅ Corrigido para nullable
  userId: string | null;           // ✅ Corrigido de user_id
  createdAt: string | null;        // ✅ Corrigido para nullable
  updatedAt: string | null;        // ✅ Corrigido para nullable
  createdBy: string | null;        // ✅ Corrigido para nullable
  
  // ❌ Remover campos que não existem no schema
  // address?: string | null;
  // profession?: string | null;
  // marital_status?: MaritalStatusType | null;
  // emergency_contact_name?: string | null;
  // emergency_contact_phone?: string | null;
  // photo_url?: string | null;
  // general_notes?: string | null;
  // active: boolean;
}
```

#### 🔄 3.2 Atualizar types/user.ts
```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  fullName: string | null;         // ✅ Corrigido de full_name
  role: string | null;
  isActive: boolean | null;        // ✅ Corrigido de active
  permissions: Json | null;
  profileSettings: Json | null;    // ✅ Corrigido de profile_settings
  createdAt: string | null;        // ✅ Corrigido para nullable
  updatedAt: string | null;        // ✅ Corrigido para nullable
  lastLoginAt: string | null;      // ✅ Corrigido de last_login_at
  
  // ❌ Remover campos que não existem no schema
  // phone: string;
  // specialization: string;
  // professionalId: string;
  // active: boolean;
}
```

### Fase 4: Correção dos Enums e Tipos Específicos

#### 🔄 4.1 Corrigir AuditAction e ResourceType
```typescript
// types/audit.ts
export type AuditAction = 
  | "CREATE_PATIENT"
  | "UPDATE_PATIENT" 
  | "DELETE_PATIENT"
  | "CREATE_APPOINTMENT"
  | "UPDATE_APPOINTMENT"
  | "DELETE_APPOINTMENT"
  | "CREATE_TRANSACTION"      // ✅ Adicionar
  | "UPDATE_TRANSACTION"      // ✅ Adicionar
  | "DELETE_TRANSACTION"      // ✅ Adicionar
  | "BACKUP_CREATED"          // ✅ Adicionar
  | "BACKUP_FAILED"           // ✅ Adicionar
  | "BACKUP_RESTORED"         // ✅ Adicionar
  | "BACKUP_RESTORE_FAILED"   // ✅ Adicionar
  | "BACKUP_CONFIG_UPDATE"    // ✅ Adicionar
  | "BACKUP_ALERT_CREATED"    // ✅ Adicionar
  | "BACKUP_ALERT_RESOLVED"   // ✅ Adicionar
  | "SUBSCRIBE_PUSH_NOTIFICATIONS" // ✅ Adicionar
  | "SEND_TEMPLATED_NOTIFICATION"; // ✅ Adicionar

export type ResourceType =
  | "patient"
  | "appointment"
  | "user"
  | "transaction"
  | "backup"                   // ✅ Adicionar
  | "backup-config"            // ✅ Adicionar
  | "backup-alert"             // ✅ Adicionar
  | "notification";            // ✅ Adicionar
```

#### 🔄 4.2 Corrigir ItemStatus
```typescript
// types/inventory.ts
export enum ItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',    // ✅ Adicionar
  DISCONTINUED = 'discontinued',    // ✅ Adicionar
  PENDING = 'pending'
}
```

### Fase 5: Correção dos Services Específicos

#### 🔄 5.1 Corrigir BodyMapService
```typescript
// services/bodyMapService.ts
// Usar campos corretos do schema
const { data, error } = await supabase
  .from('body_points')
  .select('*')
  .eq('patient_id', patientId)      // ✅ Corrigido de patientId
  .eq('body_side', side)            // ✅ Corrigido de bodySide
  .order('created_at', { ascending: false }); // ✅ Corrigido de createdAt
```

#### 🔄 5.2 Corrigir ExerciseService
```typescript
// services/exerciseService.ts
// Mapear campos nullable corretamente
const exercises = data.map(exercise => ({
  id: exercise.id,
  name: exercise.name,
  description: exercise.description || '', // ✅ Tratar null
  category: exercise.category,
  // ... outros campos
}));
```

---

## 🚀 Implementação Prioritária

### ✅ **Prioridade 1 - Crítico (Implementar Primeiro)**
1. **Mapeadores de Tipos** - Criar funções de conversão
2. **PatientService** - Corrigir campos e tipos
3. **AuthService** - Remover campos inexistentes
4. **AuditAction/ResourceType** - Adicionar enums faltantes

### ✅ **Prioridade 2 - Alto**
1. **BodyMapService** - Corrigir campos snake_case
2. **ExerciseService** - Tratar campos nullable
3. **NotificationService** - Corrigir tipos de notificação
4. **SuppliesService** - Mapear campos corretamente

### ✅ **Prioridade 3 - Médio**
1. **TaskSupplyService** - Corrigir tipos de movimento
2. **InventoryService** - Adicionar enums faltantes
3. **SessionService** - Corrigir campos de sessão
4. **AnalyticsService** - Corrigir tabelas inexistentes

---

## 📋 Checklist de Implementação

### Fase 1: Preparação
- [x] Gerar tipos do Supabase
- [ ] Criar mapeadores de tipos
- [ ] Documentar diferenças schema vs tipos

### Fase 2: Correções Críticas
- [ ] Corrigir PatientService
- [ ] Corrigir AuthService  
- [ ] Corrigir tipos Patient e User
- [ ] Adicionar enums faltantes

### Fase 3: Correções de Services
- [ ] Corrigir BodyMapService
- [ ] Corrigir ExerciseService
- [ ] Corrigir NotificationService
- [ ] Corrigir SuppliesService

### Fase 4: Validação
- [ ] Executar type-check
- [ ] Testar funcionalidades críticas
- [ ] Validar build de produção

---

## 🎯 Resultado Esperado

Após a implementação:
- ✅ **0 erros de TypeScript** relacionados ao schema
- ✅ **Tipos alinhados** com o banco de dados real
- ✅ **Services funcionais** com dados corretos
- ✅ **Build limpo** sem warnings de tipos
- ✅ **Manutenibilidade** melhorada com tipos corretos

---

**📅 Data de Início:** Janeiro 2025  
**👨‍💻 Responsável:** AI Assistant com Context7  
**🎯 Meta:** Resolver 200+ erros de tipos TypeScript
