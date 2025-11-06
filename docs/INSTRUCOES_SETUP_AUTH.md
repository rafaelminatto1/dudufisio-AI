# 🔐 Instruções para Configurar Autenticação Real

## ⚠️ Execute estas etapas na ordem

### Passo 1: Criar Usuário no Supabase Auth

1. **Abra o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/auth/users
   ```

2. **Clique em "Add user" (canto superior direito)**

3. **Selecione "Create new user"**

4. **Preencha o formulário:**
   - **Email**: `admin@dudufisio.com`
   - **Password**: `DuduFisio2024!`
   - **Auto Confirm User**: ✅ **MARQUE ESTA OPÇÃO** (importante!)

5. **Clique em "Create user"**

6. **IMPORTANTE**: Anote o **UUID** que aparece na coluna "ID"
   - Exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - Você vai precisar dele no próximo passo!

---

### Passo 2: Executar Script SQL

1. **Abra o SQL Editor do Supabase:**
   ```
   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new
   ```

2. **Abra o arquivo:** `supabase/setup_admin_auth.sql`

3. **SUBSTITUA** `<AUTH_UUID>` pelo UUID que você anotou no Passo 1
   
   Procure esta linha no SQL:
   ```sql
   '<AUTH_UUID>'::uuid,  -- ⚠️ SUBSTITUIR AQUI
   ```
   
   Substitua por (exemplo):
   ```sql
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
   ```

4. **Execute o script completo** (clique em RUN ou F5)

5. **Verifique os resultados:**
   - Deve mostrar que o usuário foi criado com sucesso
   - Deve retornar dados em cada verificação

---

### Passo 3: Atualizar Variáveis de Ambiente (Opcional)

Se quiser, adicione as credenciais no `.env.local`:

```bash
# Credenciais de login demo
VITE_DEMO_USER_EMAIL=admin@dudufisio.com
VITE_DEMO_USER_PASSWORD=DuduFisio2024!
```

---

### Passo 4: Testar o Login

1. **Parar o servidor** (se estiver rodando):
   ```bash
   Ctrl+C
   ```

2. **Limpar cache do navegador:**
   - Pressione `F12` para abrir DevTools
   - Vá em "Application" → "Storage"
   - Clique em "Clear site data"

3. **Reiniciar o servidor:**
   ```bash
   npm run dev
   ```

4. **Acessar a aplicação:**
   ```
   http://localhost:5173
   ```

5. **Fazer login com:**
   - **Email**: `admin@dudufisio.com`
   - **Password**: `DuduFisio2024!`

6. **Verificar no console do navegador:**
   - Deve aparecer: `✅ Login real no Supabase bem-sucedido`
   - NÃO deve aparecer: `Usando autenticação mock`

---

### Passo 5: Testar Criação de Agendamento

1. **Navegar para a página de Agenda**

2. **Clicar em um horário vazio**

3. **Preencher o formulário de agendamento:**
   - Selecionar um paciente
   - Preencher os dados necessários

4. **Clicar em "Confirmar Agendamento"**

5. **Verificar no console (F12):**
   - ✅ **NÃO deve aparecer erro 401**
   - ✅ Deve aparecer: `✅ Agendamento salvo com sucesso`

6. **Verificar no Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
   ```
   
   Execute no SQL Editor:
   ```sql
   SELECT * FROM appointments 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
   
   Deve mostrar o agendamento criado!

---

## ✅ Verificações de Sucesso

Execute estas queries no Supabase SQL Editor para confirmar:

```sql
-- 1. Verificar usuário no Auth
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@dudufisio.com';

-- 2. Verificar vínculo na tabela users
SELECT id, auth_id, email, role, is_active 
FROM public.users 
WHERE email = 'admin@dudufisio.com';

-- 3. Verificar permissões (após login)
SELECT EXISTS (
  SELECT 1 FROM public.users
  WHERE auth_id = auth.uid()
  AND role IN ('admin', 'manager', 'therapist', 'receptionist')
  AND is_active = TRUE
) AS user_has_permission;
-- Deve retornar: true
```

---

## ❌ Troubleshooting

### Problema: Erro "JWT expired" ou "Invalid login credentials"

**Solução:**
1. Limpar localStorage do navegador (F12 → Application → Local Storage → Clear All)
2. Fazer logout completo
3. Tentar login novamente

### Problema: Ainda aparece erro 401 ao criar agendamento

**Verificar:**
1. Usuário está realmente logado no Supabase (não mock)
2. Tabela `users` tem o registro vinculado com `auth_id`
3. RLS policies estão corretas (executar queries de verificação)

**SQL para debug:**
```sql
-- Verificar se o usuário atual tem permissão
SELECT 
  auth.uid() AS current_user_auth_id,
  u.id AS user_id,
  u.email,
  u.role,
  u.is_active
FROM public.users u
WHERE u.auth_id = auth.uid();
```

### Problema: "Session not found"

**Solução:**
1. Recriar o usuário no Supabase Auth
2. Verificar se marcou "Auto Confirm User"
3. Executar o script SQL novamente

---

## 🔄 Rollback (Desfazer)

Se precisar reverter as mudanças:

```sql
-- Deletar therapist
DELETE FROM public.therapists 
WHERE user_id IN (
  SELECT id FROM public.users WHERE email = 'admin@dudufisio.com'
);

-- Deletar user
DELETE FROM public.users 
WHERE email = 'admin@dudufisio.com';

-- Deletar do Auth: fazer manualmente no Dashboard
-- Authentication → Users → admin@dudufisio.com → Delete User
```

---

## 📝 Resumo

✅ **O que fizemos:**
1. Criamos usuário real no Supabase Auth
2. Vinculamos com tabela `users` no banco
3. Configuramos role como `admin`
4. Mantivemos RLS habilitado (segurança)
5. Autenticação agora é real, não mock

✅ **Benefícios:**
- Segurança mantida com RLS
- Autenticação real no Supabase
- Funciona em dev e produção
- Todas as features dependentes de auth funcionam corretamente

---

## 📞 Suporte

Se tiver problemas, verifique:
1. Logs do console do navegador (F12)
2. Logs do servidor (terminal onde roda `npm run dev`)
3. SQL Editor do Supabase para queries de debug

