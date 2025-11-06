# 🚀 COMO APLICAR AS MIGRATIONS NO SUPABASE

## ❌ Problema Encontrado
O comando `supabase migration up` falha porque o `.env.local` tem comentários que o CLI não consegue processar.

## ✅ SOLUÇÃO: Usar o Supabase Dashboard (Mais Fácil!)

### Passo a Passo:

#### 1. Acesse o Supabase Dashboard
```
URL: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
```

#### 2. Vá para SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Ou acesse direto: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

#### 3. Aplicar Migration 001 (Auth Setup)

1. Clique em **"+ New Query"**
2. Abra o arquivo: `supabase/migrations/20250117000001_auth_setup.sql`
3. **Copie TODO o conteúdo**
4. **Cole no SQL Editor**
5. Clique em **"Run"** (ou pressione Ctrl+Enter)
6. Aguarde a confirmação: "Success. No rows returned"

#### 4. Aplicar Migration 002 (Core Tables)

1. Clique em **"+ New Query"** novamente
2. Abra o arquivo: `supabase/migrations/20250117000002_core_tables.sql`
3. **Copie TODO o conteúdo**
4. **Cole no SQL Editor**
5. Clique em **"Run"**
6. Aguarde a confirmação

#### 5. Verificar se deu certo

Execute esta query para verificar as tabelas:

```sql
-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deve retornar:
-- appointments
-- patients
-- therapists
-- users
```

---

## 🔧 ALTERNATIVA: Consertar o .env.local (Se quiser usar CLI)

Se preferir usar o CLI, crie um arquivo `.env` limpo:

```bash
# Criar .env sem comentários
SUPABASE_PROJECT_ID=urfxniitfbbvsaskicfo
SUPABASE_DB_PASSWORD=cFfS1GEwkj2fOAE2

# Depois rode:
supabase migration up
```

Mas o Dashboard é mais fácil e visual! 👍

---

## ✅ CHECKLIST APÓS APLICAR

Após aplicar as migrations, verifique:

### No Supabase Dashboard:

#### 1. Tabelas Criadas
- [ ] Vá em **"Table Editor"**
- [ ] Deve ver: `users`, `therapists`, `patients`, `appointments`

#### 2. RLS Ativo
- [ ] Clique em cada tabela
- [ ] Verifique que "RLS enabled" está ✅
- [ ] Veja as policies criadas

#### 3. Functions Criadas
- [ ] Vá em **"Database" → "Functions"**
- [ ] Deve ver:
  - `handle_new_user`
  - `update_last_login`
  - `soft_delete_user`
  - `has_permission`
  - `check_appointment_conflict`
  - `get_therapist_availability`
  - `update_patient_activity`

#### 4. Triggers Criados
- [ ] Vá em **"Database" → "Triggers"**
- [ ] Deve ver triggers nas tabelas users, therapists, patients, appointments

---

## 🧪 TESTAR NO SQL EDITOR

Após aplicar, teste com estas queries:

### Teste 1: Criar um usuário de teste
```sql
-- Inserir usuário
INSERT INTO users (email, full_name, role, status)
VALUES ('teste@dudufisio.com', 'Usuário Teste', 'patient', 'active')
RETURNING *;

-- Ver o usuário criado
SELECT * FROM users WHERE email = 'teste@dudufisio.com';
```

### Teste 2: Verificar RLS
```sql
-- Esta query deve falhar se RLS estiver funcionando
-- (porque você não está autenticado)
SELECT * FROM users;
```

### Teste 3: Verificar Functions
```sql
-- Testar soft delete
SELECT soft_delete_user((SELECT id FROM users WHERE email = 'teste@dudufisio.com'));

-- Verificar se foi deletado (logicamente)
SELECT * FROM users WHERE email = 'teste@dudufisio.com';
-- deleted_at deve estar preenchido
```

---

## 🐛 TROUBLESHOOTING

### Erro: "relation already exists"
**Causa:** As tabelas já existem
**Solução:**
```sql
-- Remover tabelas antigas primeiro (CUIDADO!)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS therapists CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Depois rode as migrations novamente
```

### Erro: "permission denied"
**Causa:** Você não tem permissão de admin
**Solução:**
- Verifique se está logado com a conta certa
- Use o Dashboard ao invés do CLI

### Erro: "syntax error"
**Causa:** Copiou o SQL incorretamente
**Solução:**
- Copie TODO o conteúdo do arquivo
- Não pule nenhuma linha
- Cole direto no SQL Editor

### Migrations não aparecem no histórico
**Isso é normal!** Quando você aplica pelo Dashboard, elas não aparecem no histórico de migrations do CLI, mas estão funcionando perfeitamente no banco.

---

## 📝 DEPOIS DE APLICAR AS MIGRATIONS

### 1. Testar Registro de Usuário

No seu app React:
```typescript
// Tente registrar um usuário
const { register } = useSupabaseAuth();
await register({
  email: 'novo@teste.com',
  password: 'Senha@123',
  fullName: 'Novo Usuário'
});
```

### 2. Verificar no Supabase
- Vá em **"Authentication" → "Users"**
- Deve ver o novo usuário
- Vá em **"Table Editor" → "users"**
- Deve ver o perfil criado automaticamente pelo trigger!

### 3. Testar Login
```typescript
const { login } = useSupabaseAuth();
await login({
  email: 'novo@teste.com',
  password: 'Senha@123'
});
```

---

## 🎉 SUCESSO!

Se tudo funcionou:
- ✅ Migrations aplicadas
- ✅ Tabelas criadas
- ✅ RLS ativo
- ✅ Triggers funcionando
- ✅ Functions disponíveis

**Próximo passo:** Conectar as rotas de autenticação no seu app!

---

## 📞 PRECISA DE AJUDA?

Se algo não funcionar:
1. Tire um screenshot do erro
2. Copie a mensagem de erro completa
3. Me mostre e eu ajudo a resolver!

**Projeto:** dudufisio-AI
**Database:** PostgreSQL via Supabase
**Region:** South America (São Paulo)
**Project ID:** urfxniitfbbvsaskicfo
