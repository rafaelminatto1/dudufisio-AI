# ⚡ QUICK START - Configurar Autenticação (10 minutos)

## 🎯 Objetivo
Corrigir erro 401 ao criar agendamentos implementando autenticação real no Supabase.

---

## 📝 Passo 1: Criar Usuário no Supabase (2 min)

1. Abra: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/auth/users

2. Clique em **"Add user"** → **"Create new user"**

3. Preencha:
   - Email: `admin@dudufisio.com`
   - Password: `DuduFisio2024!`
   - ✅ Marque **"Auto Confirm User"**

4. Clique em **"Create user"**

5. **COPIE O UUID** que aparece na coluna "ID"
   - Exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

## 📝 Passo 2: Executar SQL (3 min)

1. Abra: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

2. Copie e cole este SQL (substitua `<AUTH_UUID>` pelo UUID do Passo 1):

```sql
-- Verificar se usuário foi criado no Auth
SELECT id, email FROM auth.users WHERE email = 'admin@dudufisio.com';

-- Criar registro na tabela users (SUBSTITUIR <AUTH_UUID>)
INSERT INTO public.users (
  id, auth_id, email, full_name, role, is_active, created_at, updated_at
) VALUES (
  uuid_generate_v4(),
  '<AUTH_UUID>'::uuid,  -- ⚠️ SUBSTITUIR PELO UUID DO PASSO 1
  'admin@dudufisio.com',
  'Admin Demo',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (auth_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verificar se foi criado
SELECT id, email, role FROM public.users WHERE email = 'admin@dudufisio.com';
```

3. Clique em **RUN** (ou F5)

4. Verifique que os SELECTs retornam dados ✅

---

## 📝 Passo 3: Testar Login (3 min)

```bash
# 1. Parar servidor (se rodando)
Ctrl+C

# 2. Reiniciar
npm run dev
```

No navegador:
1. Pressione `F12` para abrir Console
2. Vá em `Application` → `Storage` → `Clear site data`
3. Recarregue a página (`F5`)
4. Faça login:
   - Email: `admin@dudufisio.com`
   - Password: `DuduFisio2024!`

5. **Verifique no Console:**
   - ✅ Deve aparecer: `✅ Login via Supabase bem-sucedido`
   - ❌ NÃO deve aparecer: `Usando autenticação mock`

---

## 📝 Passo 4: Testar Agendamento (2 min)

1. Vá para página **Agenda**
2. Clique em um horário vazio
3. Preencha o formulário
4. Clique em **"Confirmar Agendamento"**

5. **Verifique no Console (F12):**
   - ✅ NÃO deve haver erro 401
   - ✅ Deve aparecer: `✅ Agendamento salvo com sucesso`

6. **Verifique no Supabase:**
   ```
   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
   ```
   
   Execute:
   ```sql
   SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5;
   ```
   
   O agendamento deve aparecer! ✅

---

## ✅ Pronto!

Se tudo funcionou, o erro 401 está corrigido! 🎉

---

## ❌ Se algo deu errado:

### Erro: "Invalid login credentials"
- Verifique se criou o usuário no Passo 1
- Senha correta: `DuduFisio2024!`
- Marque "Auto Confirm User" ✅

### Erro: Ainda dá 401 ao criar agendamento
Execute no SQL:
```sql
-- Ver se usuário está vinculado
SELECT * FROM public.users WHERE email = 'admin@dudufisio.com';

-- Deve retornar 1 registro
-- Se não retornar, execute o Passo 2 novamente
```

### Erro: "Session not found"
1. Limpar localStorage: F12 → Application → Local Storage → Clear All
2. Recarregar página
3. Fazer login novamente

---

## 📚 Documentação Completa

Se precisar de mais detalhes:
- **Guia Completo:** `INSTRUCOES_SETUP_AUTH.md`
- **Resumo Final:** `README_SETUP_AUTH_FINAL.md`
- **Script SQL Completo:** `supabase/setup_admin_auth.sql`

---

## 🔐 Credenciais

**Login Real:**
- Email: `admin@dudufisio.com`
- Password: `DuduFisio2024!`

---

**Tempo total:** ~10 minutos  
**Dificuldade:** ⭐⭐ (Fácil)

