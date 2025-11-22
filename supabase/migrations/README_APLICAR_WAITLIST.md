# 📋 Instruções para Aplicar Migração da Tabela Waitlist

## ✅ Status
- ✅ Migração criada: `20251118061128_create_waitlist_table.sql`
- ✅ Script manual criado: `APLICAR_WAITLIST_MANUAL.sql`

## 🚀 Como Aplicar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo)
2. Vá em **SQL Editor**
3. Abra o arquivo `supabase/migrations/APLICAR_WAITLIST_MANUAL.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 2: Via Supabase CLI (requer senha do banco)

```bash
# Se você tiver a senha do banco configurada
supabase db push
```

## 📊 O que a migração cria:

- ✅ Tabela `waitlist` com campos:
  - `id` (UUID, primary key)
  - `patient_id` (UUID, foreign key para patients)
  - `priority` (TEXT: 'Urgente', 'Alta', 'Normal')
  - `status` (TEXT: 'Ativo', 'Notificado', 'Preenchido', 'Expirado')
  - `added_at`, `notified_at`, `expires_at`
  - `created_at`, `updated_at`

- ✅ Índices para performance:
  - `idx_waitlist_patient_id`
  - `idx_waitlist_priority_status`
  - `idx_waitlist_status`
  - `idx_waitlist_expires_at`

- ✅ Trigger automático para `updated_at`

- ✅ RLS (Row Level Security) habilitado com políticas básicas

## 🔍 Verificar se foi aplicada:

Execute no SQL Editor:

```sql
SELECT 
    'Tabela waitlist criada com sucesso!' as status,
    COUNT(*) as total_registros
FROM public.waitlist;
```

Ou verifique se a tabela existe:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'waitlist';
```


