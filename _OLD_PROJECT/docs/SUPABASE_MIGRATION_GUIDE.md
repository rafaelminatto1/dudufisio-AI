# 🚀 Guia de Migração para Supabase Real

**Status**: Configuração inicial completa ✅  
**Próximo passo**: Aplicar migrations e popular dados

---

## 📋 PRÉ-REQUISITOS

### ✅ Já Configurado
- [x] Credenciais Supabase em `.env.local`
- [x] URL: `https://urfxniitfbbvsaskicfo.supabase.co`
- [x] Anon Key configurada
- [x] Service Role Key configurada

### ⏳ Pendente
- [ ] Migrations aplicadas no banco
- [ ] Usuários de teste criados
- [ ] Dados mock populados
- [ ] Modo mock desabilitado no código

---

## 🔧 PASSO 1: Validar Configuração

### 1.1 Verificar Variáveis de Ambiente

```bash
# No terminal, verificar se as variáveis estão sendo carregadas
npm run dev
```

**Console esperado**:
```
[config] supabase.config.loaded {
  environment: development, 
  hasValidCredentials: true,  // <- Deve ser TRUE
  url: https://urfxniitfbbvsaskicfo.supabase.co
}
```

### 1.2 Testar Conexão com Supabase

Criar arquivo de teste temporário:

```typescript
// test-supabase-connection.ts
import { supabase } from './lib/supabaseClient';

async function testConnection() {
  const { data, error } = await supabase.from('profiles').select('count');
  
  if (error) {
    console.error('❌ Erro na conexão:', error);
  } else {
    console.log('✅ Conexão Supabase OK:', data);
  }
}

testConnection();
```

---

## 🗄️ PASSO 2: Aplicar Migrations

### 2.1 Instalar Supabase CLI (se não tiver)

```bash
npm install -g supabase
```

### 2.2 Login no Supabase

```bash
supabase login
```

### 2.3 Linkar ao Projeto

```bash
supabase link --project-ref urfxniitfbbvsaskicfo
```

### 2.4 Verificar Migrations Disponíveis

```bash
cd supabase/migrations
ls -la
```

**Migrations esperadas**:
- `20240101000000_initial_schema.sql` - Schema base
- `20240102000000_exercise_system.sql` - Sistema de exercícios
- `20240103000000_crm_whatsapp.sql` - CRM e WhatsApp
- `20240104000000_ai_features.sql` - Features de IA
- ... (ver pasta `supabase/migrations/`)

### 2.5 Aplicar Migrations

```bash
# Voltar para raiz do projeto
cd ../..

# Aplicar todas as migrations
supabase db push

# OU aplicar migration específica
supabase migration up
```

**Resultado esperado**:
```
✅ Migrations aplicadas com sucesso
✅ Tabelas criadas: profiles, patients, appointments, exercises, etc.
```

---

## 👥 PASSO 3: Criar Usuários de Teste

### 3.1 Acessar Supabase Dashboard

URL: `https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo`

### 3.2 Ir para Authentication → Users

Clicar em "Add User" e criar os 4 perfis de teste:

**Admin**:
- Email: `admin@dudufisio.com`
- Password: `demo123456`
- Metadata: `{ "role": "Admin", "name": "Administrador" }`

**Fisioterapeuta**:
- Email: `therapist@dudufisio.com`
- Password: `demo123456`
- Metadata: `{ "role": "Therapist", "name": "Fisioterapeuta" }`

**Paciente**:
- Email: `patient@dudufisio.com`
- Password: `demo123456`
- Metadata: `{ "role": "Patient", "name": "Paciente" }`

**Educador Físico**:
- Email: `educator@dudufisio.com`
- Password: `demo123456`
- Metadata: `{ "role": "EducadorFisico", "name": "Educador Físico" }`

### 3.3 Executar SQL para Popular Profiles

```sql
-- Inserir profiles na tabela
INSERT INTO profiles (id, email, name, role, created_at)
SELECT 
  auth.uid,
  auth.email,
  auth.raw_user_meta_data->>'name',
  auth.raw_user_meta_data->>'role',
  now()
FROM auth.users;
```

---

## 📊 PASSO 4: Popular Dados Mock

### 4.1 Criar Script de Seed

Criar arquivo `supabase/seed.sql`:

```sql
-- ========================================
-- SEED DATA PARA DESENVOLVIMENTO
-- ========================================

-- 1. Pacientes (8 pacientes de teste)
INSERT INTO patients (id, name, email, phone, birth_date, created_at) VALUES
('patient-1', 'Ana Silva', 'ana.silva@example.com', '11987654321', '1985-03-15', now()),
('patient-2', 'Carlos Santos', 'carlos.santos@example.com', '11987654322', '1990-07-22', now()),
('patient-3', 'Maria Oliveira', 'maria.oliveira@example.com', '11987654323', '1978-11-10', now())
-- ... adicionar mais 5 pacientes

ON CONFLICT (id) DO NOTHING;

-- 2. Agendamentos (usar dados de appointmentService.ts)
-- 3. Exercícios (copiar de EXERCISES_LIBRARY)
-- 4. Notas SOAP (usar dados de soapNoteService.ts)
```

### 4.2 Executar Seed

```bash
supabase db reset --db-url postgres://postgres:[YOUR_PASSWORD]@db.urfxniitfbbvsaskicfo.supabase.co:5432/postgres
```

---

## 🔄 PASSO 5: Desabilitar Modo Mock

### 5.1 Modificar supabaseAuthService.ts

**Arquivo**: `services/auth/supabaseAuthService.ts`

**Linha ~29** (buscar por `mockLogin`):

```typescript
// ANTES:
if (!session) {
  return this.mockLogin(credentials);  // ← Comentar esta linha
}

// DEPOIS:
if (!session) {
  throw new Error('Credenciais inválidas');  // ← Forçar auth real
}
```

### 5.2 Remover Logs de Mock

Buscar e comentar/remover:
```typescript
console.log('🎭 Using mock authentication for development');
```

---

## 🧪 PASSO 6: Testes com Dados Reais

### 6.1 Limpar Cache

```typescript
// No console do navegador
debugHelpers.clearAllCache()
```

### 6.2 Testar Login Real

1. Fazer logout
2. Fazer login com `admin@dudufisio.com` / `demo123456`
3. Verificar console: NÃO deve mostrar "Using mock authentication"

**Console esperado**:
```
✅ Auth initialization completed successfully
✅ User logged in: admin@dudufisio.com
```

### 6.3 Validar Dados Reais

- [ ] Pacientes carregam do Supabase
- [ ] Agendamentos aparecem na Agenda
- [ ] Exercícios vêm do banco
- [ ] Sessões salvam corretamente

---

## ⚠️ TROUBLESHOOTING

### Erro: "Invalid JWT"
**Solução**: Verificar se ANON_KEY está correta em `.env.local`

### Erro: "Table does not exist"
**Solução**: Aplicar migrations com `supabase db push`

### Erro: "Row Level Security"
**Solução**: Verificar policies nas migrations

### Mock ainda aparece
**Solução**: 
1. Verificar `.env.local` carregado
2. Limpar cache: `npm run dev` (reiniciar)
3. Hard reload do navegador (Ctrl+Shift+R)

---

## 📊 CHECKLIST DE VALIDAÇÃO

### Configuração
- [x] `.env.local` criado
- [ ] Variáveis carregando no app
- [ ] Conexão com Supabase validada

### Migrations
- [ ] Supabase CLI instalado
- [ ] Projeto linkado
- [ ] Migrations aplicadas
- [ ] Tabelas criadas

### Autenticação
- [ ] Usuários de teste criados
- [ ] Login real funcionando
- [ ] Modo mock desabilitado
- [ ] Sessões persistindo

### Dados
- [ ] Seed data executado
- [ ] Pacientes carregando
- [ ] Exercícios disponíveis
- [ ] Agendamentos funcionando

---

## 🎯 PRÓXIMOS PASSOS APÓS MIGRAÇÃO

### Curto Prazo
1. Configurar Row Level Security (RLS) policies
2. Adicionar índices para otimização
3. Configurar backups automáticos
4. Implementar real-time subscriptions

### Médio Prazo
1. Integração com storage para arquivos
2. Edge Functions para lógica serverless
3. Webhooks para notificações
4. Analytics e monitoring

---

## 📞 SUPORTE

**Documentação Supabase**: https://supabase.com/docs

**Dashboard do Projeto**: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo

**Comandos Úteis**:
```bash
# Ver status do projeto
supabase status

# Ver logs
supabase functions logs

# Reset database (CUIDADO!)
supabase db reset

# Gerar types TypeScript
supabase gen types typescript --project-id urfxniitfbbvsaskicfo
```

---

**Data de criação**: 12/10/2025  
**Status**: Configuração pronta, aguardando execução das migrations  
**Risco**: BAIXO (sistema funciona com mock, migração é incremental)

