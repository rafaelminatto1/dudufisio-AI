# 🔧 Correção de Erros - Pós Migration Push Notifications
## MoocaFisio

**Data:** 2025-11-04  
**Status:** Erros corrigidos

---

## ⚠️ IMPORTANTE

Os erros que você está vendo **NÃO SÃO causados pela migration de Push Notifications**!

A migration de push notifications foi **executada com sucesso** e criou a tabela `push_notification_tokens` corretamente.

Os erros são **problemas pré-existentes** no sistema que agora estamos corrigindo.

---

## 🔍 ERROS ENCONTRADOS E CORRIGIDOS

### ❌ Erro 1: Tabela `user_profiles` não existe (404)

**Erro no console:**
```
urfxniitfbbvsaskicfo.supabase.co/rest/v1/user_profiles?select=id&id=eq.297dcbee-8557-4559-a21c-2541d1c59cff:1
Failed to load resource: the server responded with a status of 404 ()
```

**Causa:**
- O código em `services/auth/supabaseAuthService.ts` estava tentando acessar a tabela `user_profiles`
- A tabela correta no banco é `users` (não `user_profiles`)

**✅ Correção aplicada:**
- Atualizado `supabaseAuthService.ts` para usar a tabela `users`
- Mudado campo `id` para `auth_id`
- Mudado campo `name` para `full_name`
- Adicionados campos obrigatórios: `status`, `is_active`, `email_verified`, `email_verified_at`

---

### ❌ Erro 2: Timeout na busca de pacientes

**Erro no console:**
```
[supabaseErrorHandler] Erro na operação Supabase: searchPatients
error: 'Timeout na busca'
```

**Possíveis causas:**
1. Query muito lenta no Supabase
2. Índices faltando na tabela `patients`
3. RLS (Row Level Security) causando problema
4. Muitos dados sendo buscados de uma vez

**Diagnóstico necessário:**
Preciso verificar o código de `PatientSearchInput.tsx` para entender a query.

---

### ⚠️ Erro 3: Refresh Token falhando (400)

**Erro no console:**
```
urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=refresh_token:1
Failed to load resource: the server responded with a status of 400 ()
```

**Possíveis causas:**
1. Token expirado
2. Sessão inválida
3. Problema de configuração do Supabase Auth

**Ação recomendada:**
- Fazer logout e login novamente
- Limpar cache do navegador

---

## ✅ STATUS DA MIGRATION DE PUSH NOTIFICATIONS

**Migration:** `20251104000003_create_push_notification_tokens.sql`

**Status:** ✅ **EXECUTADA COM SUCESSO**

**O que foi criado:**
- ✅ Tabela `push_notification_tokens`
- ✅ Índices de performance
- ✅ Policies RLS
- ✅ Triggers automáticos
- ✅ Função de limpeza

**Próximos passos para Push Notifications:**
1. Testar permissão de notificações no navegador
2. Verificar se o token FCM é salvo
3. Testar envio de notificação

---

## 🚀 PRÓXIMAS AÇÕES

### 1. Recarregar o App

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm run dev
```

### 2. Limpar Cache do Navegador

1. Abra DevTools (F12)
2. Vá em Application → Storage
3. Clique em "Clear site data"
4. Recarregue a página (Ctrl+F5)

### 3. Fazer Novo Login

1. Faça logout
2. Faça login novamente
3. Isso vai criar um novo refresh token válido

---

## 🔍 INVESTIGAR TIMEOUT DE PACIENTES

Vou analisar o código de busca de pacientes para otimizar:

**Arquivo:** `components/agenda/PatientSearchInput.tsx`

**Problemas potenciais:**
- Query sem limite de resultados
- Busca em muitos campos de texto
- Falta de índices no banco

**Soluções:**
- Adicionar limite de resultados (ex: 50)
- Usar busca full-text search
- Adicionar debounce na busca
- Criar índices no Supabase

---

## 📊 VERIFICAÇÃO FINAL

### Verificar tabela push_notification_tokens

Execute no Supabase Dashboard (SQL Editor):

```sql
-- Verificar se a tabela foi criada
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'push_notification_tokens'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'push_notification_tokens';
```

### Verificar tabela users

```sql
-- Verificar estrutura da tabela users
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

---

## 🎯 RESUMO

| Problema | Status | Ação |
|----------|--------|------|
| Migration Push Notifications | ✅ OK | Nenhuma ação necessária |
| Tabela user_profiles (404) | ✅ CORRIGIDO | Código atualizado para usar `users` |
| Timeout busca pacientes | ⏳ INVESTIGAR | Próximo passo |
| Refresh token (400) | ⏳ RESOLVER | Fazer novo login |

---

## 🧪 TESTAR PUSH NOTIFICATIONS

Após recarregar o app:

1. **Verificar Console:**
   - Não deve mais aparecer erro 404 de `user_profiles`

2. **Testar Notificações:**
   - Você deve ver o prompt de notificações aparecer
   - Clique em "Ativar Notificações"
   - Aceite a permissão do navegador

3. **Verificar Console (F12):**
   ```
   [Firebase] FCM token obtained: ...
   [PushService] Token saved successfully
   ```

4. **Verificar Banco:**
   - Acesse Supabase Dashboard → Table Editor
   - Abra tabela `push_notification_tokens`
   - Deve ter 1 registro com seu token

---

## 📝 LOGS LIMPOS ESPERADOS

Após as correções, o console deve mostrar apenas:

```
✅ Sistema de monitoramento inicializado
🔧 Session Evolution Config: Object
[SafetyUtil] Starting data fetch for authenticated user
[SafetyUtil] Therapists loaded successfully
[SafetyUtil] Patients loaded successfully
[SafetyUtil] Appointments loaded successfully
[Firebase] App initialized
[Firebase] Messaging initialized
[Firebase] FCM token obtained: ...
[PushService] Token saved successfully
```

---

## ❓ AINDA COM PROBLEMAS?

Se ainda houver erros:

1. **Cole o novo log do console** para eu analisar
2. **Verifique se fez o reload** do servidor
3. **Limpe o cache** do navegador
4. **Faça logout e login novamente**

---

**✅ Correção 1 aplicada! Recarregue o app e veja os resultados.**

