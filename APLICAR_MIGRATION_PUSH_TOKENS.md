# ⚠️ APLICAR MIGRATION - Push Notification Tokens

## Opção 1: Via Supabase Dashboard (Mais Fácil)

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor/sql

2. Clique em **"+ New query"**

3. Cole o conteúdo do arquivo:
   `supabase/migrations/20251104000003_create_push_notification_tokens.sql`

4. Clique em **"Run"** (ou pressione `Ctrl+Enter`)

5. Verifique se apareceu "Success" no canto inferior direito

---

## Opção 2: Via Supabase CLI

```bash
# 1. Fazer login no Supabase
supabase login

# 2. Linkar ao projeto
supabase link --project-ref urfxniitfbbvsaskicfo

# 3. Aplicar a migration
supabase db push

# Ou aplicar migration específica:
supabase migration up
```

---

## Verificar se foi aplicada

Execute no SQL Editor:

```sql
-- Verificar se a tabela foi criada
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'push_notification_tokens';

-- Verificar colunas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'push_notification_tokens'
ORDER BY ordinal_position;

-- Verificar indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'push_notification_tokens';

-- Verificar políticas RLS
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'push_notification_tokens';
```

---

## ✅ Após aplicar

Quando terminar, me avise com: "migration aplicada" para eu continuar com a validação completa.
