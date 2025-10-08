# 🏗️ DuduFisio AI - Arquitetura Visual

> Visualização simplificada da arquitetura completa do sistema

---

## 🎯 Visão Geral em Camadas

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                       │
│                         (Frontend - React 18)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐         │
│  │    Admin      │  │   Therapist   │  │    Patient    │         │
│  │   Dashboard   │  │   Dashboard   │  │    Portal     │         │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘         │
│          │                   │                   │                  │
│          └───────────────────┴───────────────────┘                  │
│                              │                                       │
│                    ┌─────────▼─────────┐                           │
│                    │   React Router    │                           │
│                    │   Auth Context    │                           │
│                    │   State Manager   │                           │
│                    └─────────┬─────────┘                           │
└──────────────────────────────┼─────────────────────────────────────┘
                               │
                               │ HTTP/REST + WebSocket
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│                      CAMADA DE SERVIÇOS                            │
│                        (Supabase BaaS)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │
│  │  Auth Service  │  │  Realtime Sub  │  │  Storage API   │      │
│  │  (JWT/OAuth)   │  │  (WebSocket)   │  │  (Files/Media) │      │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘      │
│           │                   │                   │                │
│           └───────────────────┴───────────────────┘                │
│                              │                                      │
│                    ┌─────────▼─────────┐                          │
│                    │   REST API Layer  │                          │
│                    │   + RLS Policies  │                          │
│                    └─────────┬─────────┘                          │
└──────────────────────────────┼─────────────────────────────────────┘
                               │
                               │ SQL Queries
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│                      CAMADA DE DADOS                               │
│                   (PostgreSQL + Extensions)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Tables     │  │   Functions  │  │   Triggers   │            │
│  │   + RLS      │  │   + Views    │  │   + Audit    │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
│         └──────────────────┴──────────────────┘                     │
│                           │                                         │
│              ┌────────────▼────────────┐                           │
│              │  Core Database Schema   │                           │
│              │  • 16+ Tables           │                           │
│              │  • 139 Foreign Keys     │                           │
│              │  • 50+ Indexes          │                           │
│              │  • 30+ Constraints      │                           │
│              └─────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados Simplificado

### Exemplo: Criar um Agendamento

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER ACTION                              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ UI: AgendaPage  │
                    │ onClick: criar  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────────────┐
                    │ Frontend Validation     │
                    │ • Data válida?          │
                    │ • Horário disponível?   │
                    └────────┬────────────────┘
                             │
                    ┌────────▼─────────────────┐
                    │ Supabase Client Call     │
                    │ .from('appointments')    │
                    │ .insert({...})           │
                    └────────┬─────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌────────────────────────────────────────────┐              │
│    │  1. Auth Check (JWT válido?)               │              │
│    └────────┬───────────────────────────────────┘              │
│             │ ✓ Valid                                           │
│    ┌────────▼───────────────────────────────────┐              │
│    │  2. RLS Policy Check                       │              │
│    │     • User pode criar appointment?         │              │
│    │     • Terapeuta da mesma clínica?          │              │
│    └────────┬───────────────────────────────────┘              │
│             │ ✓ Authorized                                      │
│    ┌────────▼───────────────────────────────────┐              │
│    │  3. Database Constraints                   │              │
│    │     • FK válidas? (patient, therapist)     │              │
│    │     • CHECK constraints? (status, date)    │              │
│    └────────┬───────────────────────────────────┘              │
│             │ ✓ Valid                                           │
│    ┌────────▼───────────────────────────────────┐              │
│    │  4. INSERT na tabela appointments          │              │
│    │     • Gera UUID                            │              │
│    │     • Preenche created_at                  │              │
│    └────────┬───────────────────────────────────┘              │
│             │                                                    │
│    ┌────────▼───────────────────────────────────┐              │
│    │  5. Trigger: Audit Trail                   │              │
│    │     • generic_audit_trigger()              │              │
│    │     • Registra em audit_trail              │              │
│    └────────┬───────────────────────────────────┘              │
│             │                                                    │
│    ┌────────▼───────────────────────────────────┐              │
│    │  6. Realtime Broadcast                     │              │
│    │     • Notifica subscribers (WebSocket)     │              │
│    │     • Atualiza agendas em tempo real       │              │
│    └────────┬───────────────────────────────────┘              │
│             │                                                    │
└─────────────┼────────────────────────────────────────────────────┘
              │
     ┌────────▼────────┐
     │ Return Success  │
     │ { id, data }    │
     └────────┬────────┘
              │
     ┌────────▼─────────────────┐
     │ Frontend Updates         │
     │ • Toast notification     │
     │ • Refresh calendar       │
     │ • Update state           │
     └──────────────────────────┘
```

---

## 🗄️ Modelo de Dados (Core Tables)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CORE ENTITIES                            │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │   unified_users  │
                    ├──────────────────┤
                    │ id (PK)          │
                    │ email            │
                    │ role             │◄─────────┐
                    │ clinic_id (FK)   │          │
                    └────────┬─────────┘          │
                             │                    │
                    ┌────────▼─────────┐          │
                    │     clinics      │          │
                    ├──────────────────┤          │
                    │ id (PK)          │          │
                    │ name             │          │
                    │ cnpj             │          │
                    └──────────────────┘          │
                                                  │
        ┌─────────────────────────────────────────┘
        │
        │ created_by
        │
┌───────▼──────────┐           ┌────────────────┐
│    patients      │           │  appointments  │
├──────────────────┤           ├────────────────┤
│ id (PK)          │◄──────────│ patient_id (FK)│
│ name             │   1:N     │ therapist_id   │◄──┐
│ email            │           │ scheduled_at   │   │
│ clinic_id (FK)   │           │ status         │   │
│ created_by (FK)  │           └────────┬───────┘   │
│ deleted_at       │                    │           │
└────────┬─────────┘                    │ 1:1       │
         │                              │           │
         │                    ┌─────────▼──────────┐│
         │                    │session_evolutions  ││
         │                    ├────────────────────┤│
         │                    │ id (PK)            ││
         │                    │ appointment_id (FK)││
         │                    │ document_id (FK)   ││
         │                    │ pain_level_before  ││
         │                    │ pain_level_after   ││
         │ 1:N                │ techniques_applied ││
         │                    └────────────────────┘│
         │                                          │
┌────────▼──────────────┐                          │
│ clinical_documents    │                          │
├───────────────────────┤                          │
│ id (PK)               │                          │
│ patient_id (FK)       │                          │
│ document_type         │                          │
│ content (JSONB)       │                          │
│ is_signed             │                          │
│ signature_data (JSONB)│                          │
│ created_by (FK)       │──────────────────────────┘
│ deleted_at            │
└───────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      EXERCISE SYSTEM                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌────────────────────┐
│    exercises     │         │ exercise_protocols │
├──────────────────┤         ├────────────────────┤
│ id (PK)          │◄────┐   │ id (PK)            │
│ name             │     │   │ name               │
│ category         │     │   │ pathology          │
│ muscle_groups[]  │     │   │ phase              │
│ difficulty_level │     │   └────────┬───────────┘
│ video_url        │     │            │
└──────────────────┘     │            │ N:M
                         │            │
                  ┌──────┴────────────▼───────────┐
                  │   protocol_exercises          │
                  ├───────────────────────────────┤
                  │ protocol_id (FK)              │
                  │ exercise_id (FK)              │
                  │ order_position                │
                  │ sets, repetitions             │
                  └───────────────────────────────┘
                                │
                                │ 1:N
                                │
              ┌─────────────────▼──────────────────┐
              │ patient_exercise_prescriptions     │
              ├────────────────────────────────────┤
              │ id (PK)                            │
              │ patient_id (FK)                    │
              │ therapist_id (FK)                  │
              │ exercise_id (FK)                   │
              │ protocol_id (FK)                   │
              │ status (active/completed)          │
              └────────┬───────────────────────────┘
                       │
                       │ 1:N
                       │
         ┌─────────────▼─────────────────┐
         │ patient_exercise_executions   │
         ├───────────────────────────────┤
         │ prescription_id (FK)          │
         │ execution_date                │
         │ sets_completed                │
         │ pain_level_before, _after     │
         │ perceived_exertion            │
         │ completed (boolean)           │
         └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AUDIT & COMPLIANCE                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌──────────────────────┐
│   audit_trail       │       │ access_denied_log    │
├─────────────────────┤       ├──────────────────────┤
│ id (PK)             │       │ id (PK)              │
│ table_name          │       │ user_id (FK)         │
│ record_id           │       │ attempted_table      │
│ action              │       │ attempted_action     │
│ performed_by (FK)   │       │ reason               │
│ old_values (JSONB)  │       │ ip_address           │
│ new_values (JSONB)  │       │ created_at           │
│ ip_address          │       └──────────────────────┘
│ performed_at        │
└─────────────────────┘       ┌──────────────────────┐
                              │ patient_consent_log  │
                              ├──────────────────────┤
                              │ id (PK)              │
                              │ patient_id (FK)      │
                              │ consent_type         │
                              │ granted (boolean)    │
                              │ consent_text         │
                              │ granted_at           │
                              │ revoked_at           │
                              └──────────────────────┘
```

---

## 🔐 Camadas de Segurança

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

Request → [Layer 1] → [Layer 2] → [Layer 3] → [Layer 4] → Database
          ─────────   ─────────   ─────────   ─────────
             │            │            │            │
             │            │            │            │
    ┌────────▼────────────▼────────────▼────────────▼────────┐
    │                                                         │
    │  1️⃣  AUTHENTICATION (JWT)                              │
    │     • Valida token JWT                                 │
    │     • Verifica expiração                               │
    │     • auth.uid() disponível                            │
    │                                                         │
    ├─────────────────────────────────────────────────────────┤
    │                                                         │
    │  2️⃣  ROW LEVEL SECURITY (RLS)                          │
    │     • Políticas por tabela                             │
    │     • Filtra automaticamente rows                      │
    │     • Considera role do usuário                        │
    │                                                         │
    │     Exemplo:                                           │
    │     CREATE POLICY "users_view_own_patients"           │
    │     ON patients FOR SELECT USING (                     │
    │       created_by = auth.uid() OR                       │
    │       clinic_id IN (...)                               │
    │     );                                                  │
    │                                                         │
    ├─────────────────────────────────────────────────────────┤
    │                                                         │
    │  3️⃣  CONSTRAINTS & VALIDATIONS                         │
    │     • CHECK constraints (valores válidos)              │
    │     • FOREIGN KEYS (integridade referencial)           │
    │     • NOT NULL (campos obrigatórios)                   │
    │     • UNIQUE (sem duplicatas)                          │
    │                                                         │
    │     Exemplo:                                           │
    │     CHECK (email ~* '^[A-Z0-9._%+-]+@...')            │
    │     CHECK (status IN ('active', 'inactive'))          │
    │                                                         │
    ├─────────────────────────────────────────────────────────┤
    │                                                         │
    │  4️⃣  TRIGGERS & AUDIT                                  │
    │     • Auditoria automática (todas operações)           │
    │     • Log de acessos negados                           │
    │     • Soft delete enforcement                          │
    │     • Versionamento de documentos                      │
    │                                                         │
    │     Exemplo:                                           │
    │     CREATE TRIGGER audit_patients_changes              │
    │     AFTER INSERT OR UPDATE OR DELETE ON patients       │
    │     FOR EACH ROW EXECUTE generic_audit_trigger();      │
    │                                                         │
    └─────────────────────────────────────────────────────────┘
```

---

## 📊 Performance: Estratégia de Índices

```
┌─────────────────────────────────────────────────────────────────┐
│                    INDEXING STRATEGY                            │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────┐
│  1. PRIMARY KEYS (B-Tree)            │
│     • Automático em todas as PKs     │
│     • Unique + Not Null              │
│     • Usado em JOINs                 │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  2. FOREIGN KEYS (B-Tree)            │
│     • Em todas as colunas _id        │
│     • Acelera JOINs                  │
│     • Usado em WHERE clauses         │
│                                       │
│  Ex: idx_appointments_patient_id     │
│      idx_appointments_therapist_id   │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  3. COMPOSITE INDEXES (B-Tree)       │
│     • Múltiplas colunas              │
│     • Para queries comuns            │
│     • Ordem importa!                 │
│                                       │
│  Ex: idx_appointments_therapist_date │
│      ON (therapist_id, scheduled_at) │
│                                       │
│  Query otimizada:                    │
│  SELECT * FROM appointments          │
│  WHERE therapist_id = '...'          │
│    AND scheduled_at BETWEEN ...      │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  4. PARTIAL INDEXES (B-Tree)         │
│     • Índice condicional             │
│     • Menor tamanho                  │
│     • Queries específicas            │
│                                       │
│  Ex: idx_patients_active             │
│      ON (id) WHERE deleted_at IS NULL│
│                                       │
│  Ex: idx_appointments_not_cancelled  │
│      WHERE status != 'cancelled'     │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  5. GIN INDEXES (JSONB)              │
│     • Para campos JSONB              │
│     • Busca em JSON                  │
│     • Arrays e full-text search      │
│                                       │
│  Ex: idx_clinical_docs_content_gin   │
│      ON clinical_documents           │
│      USING GIN(content)              │
│                                       │
│  Query otimizada:                    │
│  SELECT * FROM clinical_documents    │
│  WHERE content @> '{"key": "value"}' │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│  6. TEXT SEARCH (GIN)                │
│     • Full-text search em português  │
│     • Busca por nome, descrição      │
│                                       │
│  Ex: idx_patients_name_search        │
│      USING gin(                      │
│        to_tsvector('portuguese',name)│
│      )                               │
│                                       │
│  Query otimizada:                    │
│  SELECT * FROM patients              │
│  WHERE to_tsvector('portuguese',name)│
│    @@ to_tsquery('Silva & João')     │
└───────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida de um Documento Clínico

```
┌─────────────────────────────────────────────────────────────────┐
│             CLINICAL DOCUMENT LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────┘

  [CRIAÇÃO]
      │
      ↓
┌──────────────────┐
│  Status: draft   │
│  is_signed: false│
│  version: 1      │
└────────┬─────────┘
         │
         │ [EDIÇÃO]
         │ • Terapeuta edita conteúdo
         │ • Auto-save ativo
         │ • version incrementa
         │
         ↓
┌──────────────────┐
│  Status: draft   │
│  is_signed: false│
│  version: 2      │
└────────┬─────────┘
         │
         │ [VALIDAÇÃO]
         │ • CFM: campos obrigatórios ✓
         │ • COFFITO: diagnóstico ✓
         │ • LGPD: consentimento ✓
         │ • FHIR: estrutura ✓
         │
         ↓
┌──────────────────┐
│ Pronto para      │
│ assinatura       │
└────────┬─────────┘
         │
         │ [ASSINATURA DIGITAL]
         │ • Gera hash do documento
         │ • Timestamp
         │ • Certificado digital
         │ • is_signed = TRUE
         │
         ↓
┌──────────────────┐
│  Status: signed  │
│  is_signed: true │
│  signed_at: NOW  │
│  IMUTÁVEL ⚠️     │
└────────┬─────────┘
         │
         │ [ARMAZENAMENTO]
         │ • Disponível para consulta
         │ • Rastreado em audit_trail
         │ • Pode ser exportado (PDF)
         │
         ↓
┌──────────────────┐
│  Em uso ativo    │
│  (< 5 anos)      │
└────────┬─────────┘
         │
         │ [APÓS 5 ANOS]
         │ • Job noturno automático
         │ • Criptografa conteúdo
         │ • Move para archive
         │
         ↓
┌──────────────────────┐
│  Status: archived    │
│  Armazenamento frio  │
│  Retenção: 20 anos   │
└──────────┬───────────┘
           │
           │ [APÓS 20 ANOS]
           │ • Verificação legal
           │ • Possível anonimização
           │ • Ou exclusão definitiva
           │
           ↓
      [FIM DO CICLO]
```

---

## 🎯 Conclusão

Esta visualização representa a arquitetura completa do sistema DuduFisio AI após as melhorias implementadas em 08/10/2025.

### Principais Características:
- ✅ Arquitetura em camadas bem definida
- ✅ Segurança multi-camada (Auth + RLS + Constraints + Audit)
- ✅ Performance otimizada com índices estratégicos
- ✅ Integridade de dados garantida
- ✅ Compliance LGPD completo
- ✅ Ciclo de vida de documentos bem definido

---

*Última atualização: 08/10/2025*  
*Versão: 2.0.0*
