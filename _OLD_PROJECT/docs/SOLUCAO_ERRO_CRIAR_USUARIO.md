# 🔧 Solução: Erro ao Criar Usuário no Supabase

## 🐛 Problema

Você está tentando criar um usuário no Dashboard do Supabase e recebe:
```
Failed to create user: Database error creating new user
```

## ✅ Solução Rápida

### Passo 1: Executar SQL de Correção

1. Acesse: https://app.supabase.com/project/urfxniitfbbvsaskicfo/sql
2. No SQL Editor, abra o arquivo **`CORRIGIR_CRIACAO_USUARIOS.sql`**
3. Copie todo o conteúdo
4. Cole no SQL Editor
5. Clique em **Run** (ou pressione `Ctrl+Enter`)

**Resultado esperado:** "Trigger criado com sucesso!"

### Passo 2: Tentar Criar Usuário Novamente

1. Volte para: https://app.supabase.com/project/urfxniitfbbvsaskicfo/auth/users
2. Clique em **Add User**
3. Preencha:
   - Email: `admin@dudufisio.com`
   - Password: `demo123456`
   - ✅ Marque **"Auto Confirm User?"**
4. Clique em **Create user**

**Agora deve funcionar!** ✅

### Passo 3: Criar os Demais Usuários

Repita o Passo 2 para criar:

- `therapist@dudufisio.com` - Senha: `demo123456`
- `patient@dudufisio.com` - Senha: `demo123456`
- `educator@dudufisio.com` - Senha: `demo123456`

**Importante:** Marque "Auto Confirm User?" em todos!

---

## 🎯 Alternativa: Criar Via API

Se ainda não funcionar, você pode criar via API usando o **service_role_key**:

### Usando cURL:

```bash
curl -X POST 'https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/admin/users' \
  -H "apikey: sua-service-role-key" \
  -H "Authorization: Bearer sua-service-role-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dudufisio.com",
    "password": "demo123456",
    "email_confirm": true,
    "user_metadata": {
      "name": "Administrador",
      "role": "Admin"
    }
  }'
```

### Usando o VSCode (Thunder Client ou similiar):

1. Método: `POST`
2. URL: `https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/admin/users`
3. Headers:
   - `apikey`: (use a service_role_key do .env.local)
   - `Authorization`: `Bearer {service_role_key}`
   - `Content-Type`: `application/json`
4. Body:
```json
{
  "email": "admin@dudufisio.com",
  "password": "demo123456",
  "email_confirm": true,
  "user_metadata": {
    "name": "Administrador",
    "role": "Admin"
  }
}
```

---

## 🔍 Causa do Problema

O erro acontece porque existe um **trigger** na tabela `auth.users` que tenta criar automaticamente um registro na tabela `users` (profiles). Esse trigger estava com problema, causando falha na criação do usuário.

A solução acima:
- Remove o trigger problemático
- Cria um trigger novo que **não falha** se houver erro
- Usa `ON CONFLICT DO NOTHING` para ignorar conflitos
- Tem tratamento de exceções

---

## ✅ Verificação

Após criar os usuários, execute no SQL Editor:

```sql
-- Ver usuários criados
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%@dudufisio.com'
ORDER BY created_at DESC;

-- Ver profiles (se existir tabela users)
SELECT * FROM users 
WHERE email LIKE '%@dudufisio.com';
```

**Deve mostrar os 4 usuários criados!**

---

## 🎉 Próximo Passo

Após criar os usuários com sucesso:

1. Execute os UPDATEs no SQL Editor para atualizar roles (ver `PROXIMOS_PASSOS.md`)
2. Atualize `.env.local` com `VITE_FALLBACK_TO_MOCK=false`
3. Teste o login

---

**Tempo estimado:** 5-10 minutos  
**🚀 Execute o SQL de correção e me avise se funcionou!**

