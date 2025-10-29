# 🚀 Guia de Setup do Supabase para Produção

Este guia explica como configurar o banco de dados Supabase com dados reais para produção.

## 📋 Pré-requisitos

- Conta no Supabase ([app.supabase.com](https://app.supabase.com))
- Projeto criado no Supabase
- URL e API Keys do projeto

## 🎯 Passo a Passo

### 1. Acessar o SQL Editor do Supabase

1. Faça login no [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto: `urfxniitfbbvsaskicfo`
3. No menu lateral, clique em **SQL Editor**

### 2. Executar Migrations

#### Migration 001: Schema Inicial

1. No SQL Editor, clique em **New Query**
2. Copie todo o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Cole no editor
4. Clique em **Run** (ou pressione `Ctrl+Enter`)
5. Aguarde a confirmação de sucesso

**✅ O que esta migration faz:**
- Cria tabelas: `profiles`, `patients`, `appointments`, `sessions`, `exercises`, `exercise_protocols`, `financial_transactions`
- Cria tipos ENUM
- Cria índices para performance
- Cria triggers para `updated_at` automático

#### Migration 002: Row Level Security (RLS)

1. No SQL Editor, clique em **New Query**
2. Copie todo o conteúdo de `supabase/migrations/002_rls_policies.sql`
3. Cole no editor
4. Clique em **Run**
5. Aguarde a confirmação de sucesso

**✅ O que esta migration faz:**
- Habilita RLS em todas as tabelas
- Cria políticas de segurança
- Cria funções auxiliares (`is_admin()`, `is_staff()`, etc)
- Cria trigger para criar profile automaticamente ao registrar usuário

### 3. Criar Usuários de Demonstração

#### Método 1: Via Dashboard (Recomendado)

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Clique em **Add User** ou **Invite User**
3. Crie os seguintes usuários:

**Usuário 1 - Admin:**
- Email: `admin@dudufisio.com`
- Password: `demo123456`
- Email Confirm: ✅ Marcar como confirmado

**Usuário 2 - Fisioterapeuta:**
- Email: `therapist@dudufisio.com`
- Password: `demo123456`
- Email Confirm: ✅ Marcar como confirmado

**Usuário 3 - Paciente:**
- Email: `patient@dudufisio.com`
- Password: `demo123456`
- Email Confirm: ✅ Marcar como confirmado

**Usuário 4 - Educador Físico:**
- Email: `educator@dudufisio.com`
- Password: `demo123456`
- Email Confirm: ✅ Marcar como confirmado

#### Método 2: Via API (Alternativo)

```javascript
// Usar o service_role_key (ATENÇÃO: Apenas backend seguro!)
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// Criar usuários
await supabaseAdmin.auth.admin.createUser({
  email: 'admin@dudufisio.com',
  password: 'demo123456',
  email_confirm: true,
  user_metadata: {
    name: 'Administrador',
    role: 'Admin'
  }
});
```

### 4. Atualizar Roles dos Usuários

Após criar os usuários, execute no SQL Editor:

```sql
-- Atualizar role do Admin
UPDATE profiles 
SET role = 'Admin', 
    name = 'Administrador', 
    specialty = 'Gestão' 
WHERE email = 'admin@dudufisio.com';

-- Atualizar role do Fisioterapeuta
UPDATE profiles 
SET role = 'Therapist', 
    name = 'Dr. Carlos Silva', 
    specialty = 'Fisioterapia Ortopédica',
    registration_number = 'CREFITO-3/123456'
WHERE email = 'therapist@dudufisio.com';

-- Atualizar role do Paciente
UPDATE profiles 
SET role = 'Patient', 
    name = 'Maria Santos'
WHERE email = 'patient@dudufisio.com';

-- Atualizar role do Educador Físico
UPDATE profiles 
SET role = 'EducadorFisico', 
    name = 'João Educador', 
    specialty = 'Educação Física',
    registration_number = 'CREF-123456'
WHERE email = 'educator@dudufisio.com';
```

### 5. Carregar Dados de Demonstração

1. No SQL Editor, clique em **New Query**
2. Copie todo o conteúdo de `supabase/seeds/001_demo_data.sql`
3. Cole no editor
4. Clique em **Run**
5. Aguarde a confirmação de sucesso

**✅ O que este seed faz:**
- Cria 10 pacientes de demonstração
- Cria 5 exercícios terapêuticos
- Cria views úteis para consultas

### 6. Verificar Instalação

Execute no SQL Editor para verificar:

```sql
-- Verificar usuários criados
SELECT id, email, role, name 
FROM profiles 
ORDER BY role, name;

-- Verificar pacientes
SELECT COUNT(*) as total_pacientes, status
FROM patients
GROUP BY status;

-- Verificar exercícios
SELECT COUNT(*) as total_exercicios 
FROM exercises;

-- Verificar RLS está ativo
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
```

**Resultado esperado:**
- 4 usuários em `profiles`
- 10 pacientes em `patients`
- 5 exercícios em `exercises`
- 7 tabelas com RLS habilitado

## 🔒 Segurança

### Storage Buckets (Opcional)

Se for usar upload de imagens/vídeos:

1. Vá em **Storage** no dashboard
2. Crie buckets:
   - `avatars` (público) - para fotos de perfil
   - `exercises` (privado) - para vídeos de exercícios
   - `documents` (privado) - para documentos de pacientes

3. Configure políticas de acesso:

```sql
-- Bucket de avatars (público para leitura)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Bucket de exercises (apenas staff)
CREATE POLICY "Staff can access exercises"
ON storage.objects FOR ALL
USING (
  bucket_id = 'exercises' 
  AND is_staff()
);
```

## 🔧 Configuração da Aplicação

### 1. Atualizar `.env.local`

```env
# Supabase - Produção
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key-aqui

# Desabilitar fallback para mock em produção
VITE_FALLBACK_TO_MOCK=false

# Logs em produção
VITE_LOG_LEVEL=error
```

### 2. Testar Login

1. Inicie a aplicação: `npm run dev`
2. Acesse: `http://localhost:5176/login`
3. Faça login com: `admin@dudufisio.com` / `demo123456`
4. Deve entrar no dashboard
5. **Recarregue a página (F5)** - Deve continuar logado ✅

## 🎉 Checklist Final

- [ ] Migration 001 executada com sucesso
- [ ] Migration 002 executada com sucesso
- [ ] 4 usuários criados (admin, therapist, patient, educator)
- [ ] Roles atualizados via UPDATE
- [ ] Seed 001 executado (10 pacientes, 5 exercícios)
- [ ] RLS verificado (7 tabelas com rowsecurity = true)
- [ ] `.env.local` atualizado com VITE_FALLBACK_TO_MOCK=false
- [ ] Login testado e funciona
- [ ] Reload da página mantém sessão ✅

## 🐛 Troubleshooting

### Problema: Usuário não consegue fazer login

**Solução:**
1. Verifique se o usuário foi criado em **Authentication** → **Users**
2. Verifique se o email foi confirmado
3. Verifique se existe um profile para o usuário:
```sql
SELECT * FROM profiles WHERE email = 'usuario@email.com';
```

### Problema: "Row Level Security policy violation"

**Solução:**
1. Verifique se o RLS está habilitado:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'sua_tabela';
```

2. Verifique se o role do usuário está correto:
```sql
SELECT id, email, role FROM profiles WHERE email = 'usuario@email.com';
```

### Problema: Sessão não persiste após reload

**Solução:**
1. Verifique se `VITE_FALLBACK_TO_MOCK=false` no `.env.local`
2. Limpe o cache do browser (Ctrl+Shift+Delete)
3. Verifique o console do browser para erros
4. Verifique se o Supabase client está configurado com `persistSession: true`

## 📚 Próximos Passos

Após configurar o banco:

1. **Migrar Services** - Atualizar `patientService.ts`, `appointmentService.ts`, etc para usar Supabase
2. **Testar CRUD** - Criar, ler, atualizar, deletar pacientes
3. **Deploy** - Fazer deploy no Vercel com variáveis de produção
4. **Monitoramento** - Configurar Sentry para erros em produção

## 🆘 Suporte

- **Documentação Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord:** [discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues:** Abra uma issue no repositório

