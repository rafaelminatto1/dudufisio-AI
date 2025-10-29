# ⚡ EXECUTAR MIGRATIONS AGORA - Guia Rápido

**Status:** ✅ Todas as migrations estão prontas!  
**Tempo estimado:** 10-15 minutos

---

## 🎯 O Que Você Precisa Fazer

### 1️⃣ Acessar o SQL Editor do Supabase

1. Abra: https://app.supabase.com
2. Faça login
3. Selecione o projeto: **urfxniitfbbvsaskicfo**
4. No menu lateral, clique em **SQL Editor**
5. Clique em **New Query**

---

### 2️⃣ Executar Migration 001 (Schema)

1. **Copie todo o conteúdo** do arquivo: `supabase/migrations/001_initial_schema.sql`
2. Cole no SQL Editor
3. Clique em **Run** (ou pressione `Ctrl+Enter`)
4. Aguarde a mensagem: "Success. No rows returned"

**✅ Resultado esperado:**
- 7 tabelas criadas
- 5 tipos ENUM criados
- 30+ índices criados
- 7 triggers criados

---

### 3️⃣ Executar Migration 002 (RLS)

1. Clique em **New Query** novamente
2. **Copie todo o conteúdo** do arquivo: `supabase/migrations/002_rls_policies.sql`
3. Cole no SQL Editor
4. Clique em **Run**
5. Aguarde: "Success. No rows returned"

**✅ Resultado esperado:**
- RLS habilitado em 7 tabelas
- 30+ políticas de segurança criadas
- 3 funções auxiliares criadas
- 1 trigger para criar profiles automaticamente

---

### 4️⃣ Criar Usuários no Dashboard

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Clique em **Add User** (ou **Invite User**)

**Criar 4 usuários:**

#### Usuário 1 - Admin
- Email: `admin@dudufisio.com`
- Password: `demo123456`
- ✅ Marque "Email Confirm"
- Clique **Create User**

#### Usuário 2 - Fisioterapeuta
- Email: `therapist@dudufisio.com`
- Password: `demo123456`
- ✅ Marque "Email Confirm"
- Clique **Create User**

#### Usuário 3 - Paciente
- Email: `patient@dudufisio.com`
- Password: `demo123456`
- ✅ Marque "Email Confirm"
- Clique **Create User**

#### Usuário 4 - Educador Físico
- Email: `educator@dudufisio.com`
- Password: `demo123456`
- ✅ Marque "Email Confirm"
- Clique **Create User**

---

### 5️⃣ Atualizar Roles dos Usuários

Volte ao **SQL Editor** e execute:

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

Clique em **Run**

**✅ Resultado esperado:**
- 4 rows updated

---

### 6️⃣ Carregar Dados de Demonstração

1. Clique em **New Query**
2. **Copie todo o conteúdo** do arquivo: `supabase/seeds/001_demo_data.sql`
3. Cole no SQL Editor
4. Clique em **Run**
5. Aguarde: "Success. No rows returned"

**✅ Resultado esperado:**
- 10 pacientes criados
- 5 exercícios criados
- 3 views criadas

---

### 7️⃣ Verificar Instalação

Execute no SQL Editor:

```sql
-- Verificar usuários
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

-- Verificar RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;
```

**✅ Resultado esperado:**
- 4 usuários
- 10 pacientes (7 Active, 1 Inactive, 2 Discharged)
- 5 exercícios
- 7 tabelas com RLS habilitado

---

### 8️⃣ Atualizar `.env.local`

Edite o arquivo `.env.local` na raiz do projeto:

```env
# IMPORTANTE: Desabilitar fallback mock
VITE_FALLBACK_TO_MOCK=false

# Logs
VITE_LOG_LEVEL=error
```

**⚠️ Fazer isso é CRÍTICO para que a sessão persista!**

---

### 9️⃣ Testar Login

1. Pare o servidor se estiver rodando (Ctrl+C)
2. Inicie novamente: `npm run dev`
3. Acesse: http://localhost:5176/login
4. Faça login com: `admin@dudufisio.com` / `demo123456`
5. **Teste CRÍTICO:** Pressione F5 (recarregar página)
6. **✅ Deve permanecer logado!**

---

## 🎉 Checklist Final

- [ ] Migration 001 executada com sucesso
- [ ] Migration 002 executada com sucesso
- [ ] 4 usuários criados no Dashboard
- [ ] Roles atualizados via UPDATE
- [ ] Seed 001 executado (10 pacientes, 5 exercícios)
- [ ] `.env.local` atualizado com `VITE_FALLBACK_TO_MOCK=false`
- [ ] Login testado com `admin@dudufisio.com`
- [ ] **Reload da página mantém sessão ✅**

---

## 🐛 Se Algo Der Errado

### Erro: "relation already exists"
- Alguém tabela já existe, ignore e continue
- Ou delete e refaça a migration

### Erro: "permission denied"
- Verifique se está logado no Supabase
- Verifique se selecionou o projeto correto

### Usuário não consegue login
- Verifique se criou em Authentication → Users
- Verifique se email está confirmado

### Sessão não persiste
- Verifique `VITE_FALLBACK_TO_MOCK=false` no `.env.local`
- Reinicie o servidor (`npm run dev`)
- Limpe cache do browser (Ctrl+Shift+Delete)

---

## 📞 Próximo Passo

Após completar este checklist, **avise-me aqui no chat** que vou:
1. Migrar os services para usar Supabase real
2. Testar com Playwright
3. Preparar deploy em produção

**Tempo total:** 15-20 minutos  
**Vamos lá! 🚀**

