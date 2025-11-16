# 🔐 Instruções para Ativar Autenticação Real

## ✅ Código Atualizado

O código foi modificado para usar autenticação real no Supabase para `admin@dudufisio.com`.

### Mudanças Aplicadas:

1. ✅ **services/auth/supabaseAuthService.ts** - Removido `admin@dudufisio.com` da lista de mock auth
2. ✅ **supabase/setup_auth_user.sql** - Script SQL criado com todos os comandos necessários

## 📋 Passos para Ativar (Execute Agora)

### PASSO 1: Criar Usuário no Supabase Auth Dashboard

1. Abra: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/auth/users
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha:
   ```
   Email: admin@dudufisio.com
   Password: demo123456
   Auto Confirm User: ✅ Marcar
   ```
4. Clique em **"Create user"**

### PASSO 2: Executar Script SQL

1. Abra: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql
2. Abra o arquivo `supabase/setup_auth_user.sql` neste projeto
3. **Copie TODO o conteúdo** do arquivo
4. **Cole no SQL Editor** do Supabase
5. Clique em **"Run"** ou pressione `Ctrl+Enter`

O script irá:
- ✅ Verificar se as tabelas existem
- ✅ Criar registro em `public.users` vinculado ao auth
- ✅ Criar registro em `public.therapists`  
- ✅ Verificar políticas RLS
- ✅ Mostrar resumo completo

### PASSO 3: Testar a Autenticação

1. **Pare o servidor** (Ctrl+C no terminal)
2. **Limpe o cache do browser:**
   - Pressione `Ctrl+Shift+Del`
   - Marque "Cookies e outros dados" e "Imagens e arquivos em cache"
   - Limpe "Última hora"
3. **Limpe o Local Storage:**
   - Abra DevTools (F12)
   - Application → Local Storage → http://localhost:5173
   - Clique com botão direito → Clear
4. **Reinicie o servidor:** `npm run dev`
5. **Abra a aplicação:** http://localhost:5173
6. **Login automático deve acontecer** com autenticação real!

### PASSO 4: Verificar no Console

Abra o DevTools Console (F12) e verifique os logs:

**Logs Esperados:**
```
🎯 [DEMO LOGIN] Iniciando login automático para: admin@dudufisio.com
Tentando login via Supabase
Login via Supabase bem-sucedido
✅ [DEMO LOGIN] Login bem-sucedido, redirecionando...
```

**NÃO deve aparecer:**
```
❌ Usando autenticação mock para credenciais demo
```

### PASSO 5: Testar Criação de Agendamento

1. Vá para **Agenda** (menu lateral)
2. Clique em qualquer **horário vazio** no calendário
3. Preencha o formulário:
   - **Paciente**: Selecione "RAFAEL MINATTO DE MARTINO"
   - **Tipo**: Sessão
   - **Duração**: 60 min
4. Clique em **"Confirmar Agendamento"**

**Resultado Esperado:**
- ✅ Agendamento salvo com sucesso
- ✅ Sem erro 401 no console
- ✅ Toast de sucesso aparece

**Verificar no Supabase:**
```sql
SELECT * FROM appointments 
ORDER BY created_at DESC 
LIMIT 1;
```

## 🔍 Troubleshooting

### Erro: "Failed to load resource: 401"

**Causa:** Usuário não foi criado corretamente no Supabase

**Solução:**
1. Verifique se o usuário existe no Auth:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'admin@dudufisio.com';
   ```
2. Verifique se está vinculado em public.users:
   ```sql
   SELECT * FROM public.users WHERE email = 'admin@dudufisio.com';
   ```
3. Se não existir, execute novamente o script `setup_auth_user.sql`

### Erro: "RLS policy violation"

**Causa:** Políticas RLS não estão configuradas

**Solução:**
```sql
-- Verificar políticas
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'appointments';

-- Se não houver policy "Staff can manage appointments", 
-- aplicar migration: supabase/migrations/20250117000002_core_tables.sql
```

### Ainda Usando Mock Auth?

**Sintoma:** Console mostra "Usando autenticação mock"

**Solução:**
1. Confirme que o código foi salvo
2. Reinicie o servidor completamente
3. Limpe cache do browser
4. Verifique se a senha está correta: `demo123456`

## 🎯 Verificação de Sucesso

Execute este comando no Supabase SQL Editor para verificar tudo:

```sql
-- Resumo da configuração
SELECT 
  'Auth User' as tipo,
  au.id::text,
  au.email,
  au.confirmed_at IS NOT NULL as confirmado
FROM auth.users au
WHERE au.email = 'admin@dudufisio.com'

UNION ALL

SELECT 
  'Public User' as tipo,
  u.id::text,
  u.email,
  u.is_active::text as confirmado
FROM public.users u
WHERE u.email = 'admin@dudufisio.com'

UNION ALL

SELECT 
  'Therapist' as tipo,
  t.id::text,
  t.email,
  t.is_active::text as confirmado
FROM public.therapists t
WHERE t.email = 'admin@dudufisio.com';
```

**Resultado Esperado:** 3 linhas (Auth User, Public User, Therapist)

## 📝 Notas Importantes

- ✅ RLS permanece **HABILITADO** (segurança mantida)
- ✅ Autenticação é **REAL** (não mock)
- ✅ Funciona em **desenvolvimento E produção**
- ⚠️ Outros usuários demo ainda usam mock (therapist@, patient@, educator@)
- ⚠️ Se precisar adicionar mais usuários reais, crie no Auth Dashboard

## 🚀 Próximos Passos

Após confirmar que funciona:

1. Adicione mais usuários de teste no Supabase se necessário
2. Configure variáveis de ambiente para produção
3. Remova usuários mock quando não forem mais necessários
4. Documente credenciais para outros desenvolvedores

## 📚 Arquivos Relacionados

- `supabase/setup_auth_user.sql` - Script SQL completo
- `services/auth/supabaseAuthService.ts` - Código de autenticação
- `pages/auth/LoginPage.tsx` - Página de login com auto-login
- `.env.local` - Configurações do Supabase (já configurado)

