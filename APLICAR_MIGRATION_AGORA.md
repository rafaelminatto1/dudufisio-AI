# 🚀 APLICAR MIGRATION - INSTRUÇÕES RÁPIDAS

## ✅ Migration Corrigida e Idempotente!

**Nota:** A migration foi corrigida para ser idempotente (pode executar múltiplas vezes sem erro). Se encontrou erro antes, execute novamente agora!

## Método Mais Simples (RECOMENDADO)

### 1. Acesse o Supabase Dashboard
- Vá para https://app.supabase.com
- Selecione seu projeto

### 2. Abra o SQL Editor
- Menu lateral → "SQL Editor"
- Clique em "New query"

### 3. Cole e Execute
- Abra: `supabase/migrations/20251013_body_map_system.sql`
- Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
- Cole no SQL Editor
- Clique em "Run" (ou Ctrl+Enter)

### 4. Aguarde
- A execução leva ~10-15 segundos
- Você verá "Success" quando terminar

**IMPORTANTE:** Se der erro de "already exists", a migration está parcialmente aplicada. Execute o SQL abaixo primeiro:

```sql
-- Limpar (se necessário)
DROP TABLE IF EXISTS body_map_sessions CASCADE;
DROP TABLE IF EXISTS body_map_pain_regions CASCADE;
DROP TABLE IF EXISTS body_map_analytics_cache CASCADE;
DROP TABLE IF EXISTS body_regions_reference CASCADE;
DROP FUNCTION IF EXISTS recalculate_body_map_analytics CASCADE;
DROP VIEW IF EXISTS v_body_map_recent_sessions CASCADE;

-- Depois execute a migration completa normalmente
```

### 5. Verifique
Execute este SQL para confirmar:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'body_map%'
ORDER BY table_name;
```

Deve retornar 4 tabelas:
- body_map_analytics_cache
- body_map_pain_regions
- body_map_sessions
- body_regions_reference

**PRONTO! Migration aplicada com sucesso!** ✅

Agora pode usar o sistema normalmente.

