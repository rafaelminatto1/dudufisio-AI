# 🔧 Resolver Erro de Roles - Guia Passo a Passo

## 🐛 Erro que Você Está Recebendo

```
ERROR: 22P02: invalid input value for enum user_role: "Admin"
```

## 🔍 Diagnóstico

O enum `user_role` **não existe** ou **tem valores diferentes** do esperado.

## ✅ Solução em 3 Passos

### Passo 1: Verificar Estrutura Atual (2 minutos)

1. No Supabase Dashboard → **SQL Editor**
2. Execute o arquivo **`VERIFICAR_ENUMS.sql`**
3. Anote os resultados

**O que você vai ver:**
- Nomes dos enums que existem
- Valores que cada enum aceita
- Tipo de dado da coluna `role` na tabela `users`

### Passo 2: Aplicar Correção

Execute no SQL Editor o arquivo **`CORRIGIR_ROLES_COMPLETO.sql`**

Este arquivo:
- ✅ Detecta automaticamente o tipo correto
- ✅ Atualiza usando a sintaxe correta
- ✅ Não dá erro mesmo se os tipos forem diferentes

### Passo 3: Verificar

Execute este SQL para ver os usuários atualizados:

```sql
SELECT email, name, role, created_at
FROM users
WHERE email LIKE '%@dudufisio.com'
ORDER BY email;
```

---

## 🎯 Opções de Estrutura Possíveis

Sua tabela `users` pode ter uma destas estruturas:

### Opção A: Coluna `role` é TEXT
```sql
-- Usar valores lowercase
UPDATE users SET role = 'admin' WHERE email = 'admin@dudufisio.com';
```

### Opção B: Coluna `role` é ENUM com valores diferentes
```sql
-- Verificar valores válidos primeiro
SELECT unnest(enum_range(NULL::user_role));
```

### Opção C: Coluna `role` é JSONB
```sql
-- Usar formato JSON
UPDATE users SET role = '"admin"'::jsonb WHERE email = 'admin@dudufisio.com';
```

---

## 💡 Solução Mais Simples

**Se você só quer que o sistema funcione:**

1. Execute no SQL Editor:

```sql
-- Sempre funciona, independente do tipo
UPDATE users 
SET 
  name = CASE 
    WHEN email = 'admin@dudufisio.com' THEN 'Administrador'
    WHEN email = 'therapist@dudufisio.com' THEN 'Dr. Carlos Silva'
    WHEN email = 'patient@dudufisio.com' THEN 'Maria Santos'
    WHEN email = 'educator@dudufisio.com' THEN 'João Educador'
  END,
  role = CASE 
    WHEN email = 'admin@dudufisio.com' THEN 'admin'
    WHEN email = 'therapist@dudufisio.com' THEN 'therapist'
    WHEN email = 'patient@dudufisio.com' THEN 'patient'
    WHEN email = 'educator@dudufisio.com' THEN 'educadorfisico'
  END
WHERE email IN (
  'admin@dudufisio.com',
  'therapist@dudufisio.com', 
  'patient@dudufisio.com',
  'educator@dudufisio.com'
);
```

2. Execute para ver resultado:

```sql
SELECT email, name, role FROM users WHERE email LIKE '%@dudufisio.com';
```

---

## 🎉 Depois de Resolver

Após atualizar os roles com sucesso:

1. ✅ Atualize `.env.local` com `VITE_FALLBACK_TO_MOCK=false`
2. ✅ Reinicie o servidor: `npm run dev`
3. ✅ Teste login: `admin@dudufisio.com` / `demo123456`
4. ✅ **Teste CRÍTICO:** Recarregue a página (F5)

---

## 📞 Próximo Passo

Depois de resolver, **me avise no chat** e vou:
1. Verificar se a sessão persiste
2. Migrar os services para Supabase real
3. Preparar deploy em produção

**Tempo estimado:** 5-10 minutos  
**🚀 Execute os SQLs e me avise o resultado!**

