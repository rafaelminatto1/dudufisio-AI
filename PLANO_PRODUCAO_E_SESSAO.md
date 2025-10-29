# Plano: Correção de Persistência de Sessão + Preparação para Produção

## 🐛 Problema Crítico Identificado (Teste Playwright)

**Situação Atual:**
- Login funciona ✅
- Dashboard carrega com sidebar ✅
- **Ao recarregar página ou acessar URL direta → VOLTA PARA LOGIN** ❌
- Sessão NÃO persiste entre reloads ❌

**Causa Raiz:**
O Supabase já tem persistência automática de sessão, MAS o código está com timeout de 8 segundos que pode estar causando o fallback para modo sem sessão.

## 📋 Solução em 2 Fases

### FASE 1: Corrigir Persistência de Sessão (CRÍTICO)

#### Problema no código atual:
```typescript
// services/auth/supabaseAuthService.ts linha 52-57
const initTimeout = setTimeout(() => {
  secureLogger.warn('Auth initialization timeout, fallback ativado', {
    component: 'supabaseAuthService'
  });
  this.switchToFallbackAuth();
}, 8000); // Timeout muito agressivo
```

#### Arquivos a modificar:

1. **`services/auth/supabaseAuthService.ts`**
   - Remover ou aumentar significativamente o timeout de inicialização
   - Garantir que o Supabase possa completar a verificação de sessão
   - Adicionar logs para debugging
   - Melhorar tratamento de erros de sessão
   
2. **`lib/supabaseClient.ts`**
   - Verificar configuração de persistência
   - Garantir que `autoRefreshToken` está ativado
   - Verificar configuração de storage (localStorage)

3. **Teste de verificação:**
   - Login → Reload página → Deve manter login
   - Login → Fechar browser → Reabrir → Deve manter login (se opção "lembrar" ativa)
   - Login → Acessar URL direta → Deve manter login

### FASE 2: Preparação para Produção com Supabase Real

#### 2.1 Configuração do Banco de Dados Supabase

**Tabelas necessárias (schema real):**

```sql
-- 1. Profiles (estende users do Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Therapist', 'Patient', 'EducadorFisico')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  cpf TEXT UNIQUE,
  address JSONB,
  medical_history TEXT,
  emergency_contact JSONB,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  therapist_id UUID REFERENCES profiles(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Sessions (Evoluções)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID REFERENCES patients(id),
  therapist_id UUID REFERENCES profiles(id),
  date TIMESTAMPTZ DEFAULT NOW(),
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Exercises
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  body_part TEXT,
  instructions TEXT[],
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Exercise Protocols
CREATE TABLE exercise_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  therapist_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  frequency TEXT,
  duration TEXT,
  exercises JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_therapist ON appointments(therapist_id);
CREATE INDEX idx_appointments_date ON appointments(start_time);
CREATE INDEX idx_sessions_patient ON sessions(patient_id);
CREATE INDEX idx_patients_status ON patients(status);
```

#### 2.2 Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_protocols ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para Patients (Admin e Therapist podem ver todos)
CREATE POLICY "Therapists can view all patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('Admin', 'Therapist')
    )
  );

CREATE POLICY "Patients can view own data" ON patients
  FOR SELECT USING (user_id = auth.uid());

-- Adicionar mais políticas conforme necessário...
```

#### 2.3 Migrações e Seeds

**Arquivos a criar:**

1. **`supabase/migrations/001_initial_schema.sql`**
   - Schema completo das tabelas

2. **`supabase/migrations/002_rls_policies.sql`**
   - Políticas de segurança RLS

3. **`supabase/seeds/001_demo_data.sql`**
   - Dados de demonstração para testes

#### 2.4 Atualizar Variáveis de Ambiente

**Produção (`.env.production`):**
```env
# Supabase Production
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci....(key real)

# Desabilitar fallback em produção
VITE_FALLBACK_TO_MOCK=false

# Logs em produção
VITE_LOG_LEVEL=error

# Sentry para monitoramento
VITE_SENTRY_DSN=seu-sentry-dsn-aqui
VITE_APP_VERSION=1.0.0

# Outros serviços
VITE_GEMINI_API_KEY=sua-key-real
GROQ_API_KEY=sua-key-real
```

#### 2.5 Integração com Serviços Reais

**Arquivos a modificar:**

1. **`services/patientService.ts`**
   - Substituir mock por queries Supabase reais
   - Implementar CRUD completo

2. **`services/appointmentService.ts`**
   - Queries reais para agendamentos
   - Validação de conflitos

3. **`services/sessionService.ts`**
   - Salvar evoluções no Supabase
   - Histórico de sessões

4. **`services/exerciseService.ts`**
   - CRUD de exercícios reais
   - Upload de imagens/vídeos

#### 2.6 Deploy e Configurações

1. **Vercel (Frontend):**
   - Configurar variáveis de ambiente de produção
   - Setup de domínio customizado
   - Configurar redirects e rewrites

2. **Supabase (Backend):**
   - Executar migrações
   - Configurar Email Templates
   - Configurar Storage Buckets para uploads
   - Configurar Edge Functions se necessário

## 🎯 Ordem de Implementação

### Sprint 1: Correção Crítica (2-3 horas)
1. ✅ Corrigir persistência de sessão
2. ✅ Testar com Playwright
3. ✅ Validar que login persiste entre reloads

### Sprint 2: Preparação de Dados (4-6 horas)
1. ⏳ Criar schema completo no Supabase
2. ⏳ Implementar RLS policies
3. ⏳ Criar seeds com dados de demonstração
4. ⏳ Testar migrations

### Sprint 3: Integração de Serviços (6-8 horas)
1. ⏳ Migrar patientService para Supabase
2. ⏳ Migrar appointmentService para Supabase
3. ⏳ Migrar sessionService para Supabase
4. ⏳ Migrar exerciseService para Supabase
5. ⏳ Testar CRUD completo

### Sprint 4: Deploy (2-3 horas)
1. ⏳ Configurar variáveis de produção
2. ⏳ Deploy no Vercel
3. ⏳ Testes em produção
4. ⏳ Monitoramento com Sentry

## 📝 Checklist Final

### Antes do Deploy:
- [ ] Persistência de sessão funcionando
- [ ] Schema do banco completo e testado
- [ ] RLS policies implementadas e testadas
- [ ] Todos os serviços usando Supabase real
- [ ] Variáveis de ambiente de produção configuradas
- [ ] Testes E2E passando
- [ ] Logs de produção configurados
- [ ] Sentry configurado para erros
- [ ] Backup automático do Supabase ativo

### Pós-Deploy:
- [ ] Testar login em produção
- [ ] Testar CRUD de pacientes
- [ ] Testar criação de agendamentos
- [ ] Testar evoluções de sessão
- [ ] Verificar logs no Sentry
- [ ] Monitorar performance no Vercel
- [ ] Validar emails transacionais

## 🚀 Começar Implementação

Vou começar pela **Sprint 1** - Corrigir a persistência de sessão, que é CRÍTICO.

