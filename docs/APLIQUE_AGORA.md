# 🚀 APLIQUE AS MIGRATIONS AGORA - GUIA RÁPIDO

## ⚡ MÉTODO MAIS RÁPIDO (5 minutos)

### 📋 PASSO 1: Acesse o Supabase Dashboard

```
🌐 Link direto para SQL Editor:
https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new
```

---

### 📋 PASSO 2: Aplicar Migration 001 (Auth Setup)

#### 2.1 Abrir o arquivo
No VSCode, abra: `supabase/migrations/20250117000001_auth_setup.sql`

#### 2.2 Copiar todo o conteúdo
- Selecione TUDO (Ctrl+A)
- Copie (Ctrl+C)

#### 2.3 Colar no Supabase
- Cole no SQL Editor (Ctrl+V)
- Clique em **RUN** (canto superior direito)
- Aguarde: "Success. No rows returned"

✅ **MIGRATION 001 APLICADA!**

---

### 📋 PASSO 3: Aplicar Migration 002 (Core Tables)

#### 3.1 Nova Query
- Clique em **"+ New Query"** no Supabase

#### 3.2 Abrir o arquivo
No VSCode, abra: `supabase/migrations/20250117000002_core_tables.sql`

#### 3.3 Copiar e Colar
- Selecione TUDO (Ctrl+A)
- Copie (Ctrl+C)
- Cole no SQL Editor (Ctrl+V)
- Clique em **RUN**

✅ **MIGRATION 002 APLICADA!**

---

### 📋 PASSO 4: Verificar se deu certo

Cole e rode esta query no SQL Editor:

```sql
-- Ver todas as tabelas criadas
SELECT
  table_name,
  (SELECT COUNT(*)
   FROM information_schema.columns
   WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Você deve ver:**
- ✅ `appointments` - ~25 colunas
- ✅ `patients` - ~20 colunas
- ✅ `therapists` - ~10 colunas
- ✅ `users` - ~25 colunas

---

### 📋 PASSO 5: Verificar RLS e Policies

```sql
-- Ver policies criadas
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Você deve ver várias policies para cada tabela!**

---

### 📋 PASSO 6: Verificar Functions

```sql
-- Ver functions criadas
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'handle_new_user',
  'update_last_login',
  'soft_delete_user',
  'has_permission',
  'check_appointment_conflict',
  'get_therapist_availability',
  'update_patient_activity',
  'update_updated_at_column'
)
ORDER BY routine_name;
```

**Você deve ver 8 functions!**

---

## 🎉 PARABÉNS! MIGRATIONS APLICADAS COM SUCESSO!

### ✅ O QUE VOCÊ TEM AGORA:

1. ✅ Tabela `users` completa com RLS
2. ✅ Tabela `therapists` para terapeutas
3. ✅ Tabela `patients` melhorada
4. ✅ Tabela `appointments` com detecção de conflitos
5. ✅ 8 Functions úteis
6. ✅ Triggers automáticos
7. ✅ Row Level Security ativo
8. ✅ Policies de segurança por role

---

## 🧪 TESTE RÁPIDO (Opcional)

### Criar um usuário de teste:

```sql
-- Inserir teste
INSERT INTO users (email, full_name, role, status, is_active)
VALUES ('teste@dudufisio.com', 'Usuário Teste', 'patient', 'active', true)
RETURNING id, email, full_name, role, created_at;
```

### Ver o usuário:

```sql
SELECT
  id,
  email,
  full_name,
  role,
  status,
  is_active,
  created_at
FROM users
WHERE email = 'teste@dudufisio.com';
```

### Limpar teste:

```sql
-- Remover usuário de teste
DELETE FROM users WHERE email = 'teste@dudufisio.com';
```

---

## 🔗 PRÓXIMO PASSO: CONECTAR AS ROTAS

Agora que as migrations estão aplicadas, você precisa:

### 1. Adicionar as rotas no AppRoutes.tsx

Crie um arquivo `AuthRoutes.tsx` ou adicione direto no `AppRoutes.tsx`:

```typescript
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Nas suas rotas:
<Routes>
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
  <Route path="/login" element={<LoginPage />} />
  {/* ... outras rotas */}
</Routes>
```

### 2. Atualizar LoginPage.tsx

Trocar os botões por Links:

```typescript
import { Link } from 'react-router-dom';

// Onde tem "Esqueci minha senha":
<Link to="/forgot-password" className="...">
  Esqueci minha senha
</Link>

// Onde tem "Criar conta":
<Link to="/register" className="...">
  Criar uma conta
</Link>
```

---

## 🎯 TESTANDO O FLUXO COMPLETO

### 1. Iniciar o app
```bash
npm run dev
```

### 2. Testar Registro
- Acesse: http://localhost:5176/register
- Preencha o formulário
- Clique em "Criar Conta"
- Verifique seu email para confirmação

### 3. Testar Login
- Acesse: http://localhost:5176/login
- Use as credenciais
- Deve funcionar!

### 4. Testar Recuperação
- Acesse: http://localhost:5176/forgot-password
- Digite seu email
- Verifique o email de recuperação

---

## 📊 CHECKLIST FINAL

- [ ] Migration 001 aplicada ✅
- [ ] Migration 002 aplicada ✅
- [ ] Tabelas verificadas ✅
- [ ] Functions verificadas ✅
- [ ] RLS ativo ✅
- [ ] Rotas adicionadas ⏳
- [ ] Links atualizados ⏳
- [ ] Fluxo testado ⏳

---

## 🆘 PROBLEMAS?

### Erro ao aplicar migration
- Tire screenshot do erro
- Copie a mensagem completa
- Me mostre que eu ajudo!

### Tabelas não aparecem
- Recarregue o Dashboard (F5)
- Vá em "Table Editor"
- Verifique a região do projeto

### RLS bloqueando tudo
- É normal! RLS está ativo
- As policies controlam o acesso
- Use autenticação para acessar

---

## 🎊 VOCÊ ESTÁ AQUI

```
✅ Plano criado
✅ Migrations criadas
✅ Páginas de auth criadas
✅ Migrations aplicadas ← VOCÊ ESTÁ AQUI
⏳ Rotas conectadas
⏳ Fluxo testado
⏳ Fase 2 iniciada
```

**Próxima missão:** Conectar as rotas e testar tudo funcionando!

---

**Seu projeto ID:** urfxniitfbbvsaskicfo
**Dashboard:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
**Região:** South America (São Paulo)
**Desenvolvido com:** React + TypeScript + Supabase + ❤️
