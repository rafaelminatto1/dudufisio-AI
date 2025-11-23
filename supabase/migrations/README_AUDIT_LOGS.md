# 📋 Como Aplicar a Migração de Audit Logs

## 🎯 Objetivo

Criar a tabela `audit_logs` no Supabase para conformidade com a LGPD e rastreamento de ações de usuários.

---

## 🚀 Método 1: Aplicar via SQL Editor (Recomendado)

### Passo a Passo:

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto: `urfxniitfbbvsaskicfo`

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Cole o SQL**
   - Abra o arquivo: `supabase/migrations/20251122_create_audit_logs.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor

4. **Execute a Migração**
   - Clique em **Run** ou pressione `Ctrl + Enter`
   - Aguarde a confirmação de sucesso

5. **Verifique a Criação**
   ```sql
   SELECT * FROM audit_logs LIMIT 1;
   ```

---

## 🛠️ Método 2: Aplicar via Supabase CLI (Avançado)

### Pré-requisitos:
```bash
npm install -g supabase
```

### Comandos:
```bash
# 1. Login no Supabase
supabase login

# 2. Link com o projeto
supabase link --project-ref urfxniitfbbvsaskicfo

# 3. Aplicar migração
supabase db push

# 4. Verificar status
supabase migration list
```

---

## ✅ Verificação Pós-Migração

### 1. Verificar Tabela
```sql
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;
```

### 2. Verificar Índices
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'audit_logs';
```

### 3. Verificar RLS (Row Level Security)
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'audit_logs';
```

### 4. Testar Endpoint de Auditoria
```bash
curl http://localhost:3000/api/audit \
  -H "Authorization: Bearer test-api-key-development-only"
```

**Resposta esperada**:
```json
{
  "success": true,
  "data": {
    "logs": [],
    "count": 0,
    "stats": {...},
    "lgpd_compliance": {
      "status": "active",
      "retention_period_days": 365,
      "anonymization_enabled": true
    }
  }
}
```

---

## 🔒 Políticas de Segurança (RLS)

A migração cria automaticamente as seguintes políticas:

### 1. **Users can view own audit logs**
- Usuários autenticados podem ver apenas seus próprios logs

### 2. **Service role can insert audit logs**
- Apenas o service role pode inserir novos logs

### 3. **Audit logs are immutable**
- Logs não podem ser atualizados

### 4. **Audit logs cannot be deleted**
- Logs não podem ser deletados manualmente

---

## 🧹 Limpeza Automática (LGPD)

### Função de Cleanup
A migração cria a função `cleanup_old_audit_logs()` que deleta logs com mais de 365 dias.

### Agendar Limpeza Automática

#### Via pg_cron (Requer extensão):
```sql
-- 1. Habilitar pg_cron no Supabase Dashboard
--    Database > Extensions > pg_cron (Enable)

-- 2. Agendar job diário às 2h da manhã
SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 2 * * *',
  'SELECT public.cleanup_old_audit_logs()'
);
```

#### Via Edge Function (Alternativa):
```typescript
// supabase/functions/cleanup-audit-logs/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { error } = await supabase.rpc('cleanup_old_audit_logs')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  })
})
```

#### Agendar via Vercel Cron:
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-audit-logs",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## 📊 Estrutura da Tabela

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único do log |
| `user_id` | UUID | Referência ao usuário |
| `user_email` | TEXT | Email do usuário |
| `action_type` | TEXT | Tipo de ação (create, update, delete, etc) |
| `entity_type` | TEXT | Tipo de entidade afetada |
| `entity_id` | UUID | ID da entidade afetada |
| `ip_address` | INET | Endereço IP da requisição |
| `user_agent` | TEXT | User agent do navegador |
| `changes` | JSONB | Mudanças realizadas (sanitizado) |
| `old_values` | JSONB | Valores antigos |
| `new_values` | JSONB | Valores novos |
| `metadata` | JSONB | Metadados adicionais |
| `created_at` | TIMESTAMPTZ | Data/hora de criação |

---

## 🔍 Exemplos de Queries

### Listar Logs de um Usuário
```sql
SELECT *
FROM audit_logs
WHERE user_id = 'uuid-do-usuario'
ORDER BY created_at DESC
LIMIT 50;
```

### Contar Ações por Tipo
```sql
SELECT
  action_type,
  COUNT(*) as total
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY action_type
ORDER BY total DESC;
```

### Ver Últimas Modificações em Pacientes
```sql
SELECT
  user_email,
  action_type,
  entity_id,
  created_at,
  changes
FROM audit_logs
WHERE entity_type = 'patient'
  AND action_type IN ('create', 'update', 'delete')
ORDER BY created_at DESC
LIMIT 20;
```

### Logs de Login
```sql
SELECT
  user_email,
  ip_address,
  created_at
FROM audit_logs
WHERE action_type = 'login'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## ⚠️ Troubleshooting

### Erro: "relation audit_logs does not exist"
- **Solução**: Aplique a migração usando um dos métodos acima

### Erro: "permission denied for table audit_logs"
- **Solução**: Verifique se as políticas RLS foram criadas corretamente

### Erro: "could not find function cleanup_old_audit_logs"
- **Solução**: Execute a parte da migração que cria a função

### Logs não aparecem no endpoint
- **Solução**:
  1. Verifique se a tabela foi criada
  2. Teste com query SQL direta
  3. Verifique logs do servidor para erros

---

## 📝 Notas Importantes

1. **LGPD**: Logs são mantidos por 365 dias por padrão
2. **Immutabilidade**: Logs não podem ser alterados ou deletados manualmente
3. **Performance**: Índices criados automaticamente para queries rápidas
4. **Privacidade**: Dados sensíveis são automaticamente sanitizados
5. **Segurança**: RLS habilitado para proteger dados

---

## 🎯 Próximos Passos

Após aplicar esta migração:

1. ✅ Testar endpoint `/api/audit`
2. ✅ Configurar limpeza automática
3. ✅ Implementar tracking de ações no frontend
4. ✅ Configurar alertas para ações suspeitas
5. ✅ Documentar políticas de retenção para conformidade

---

**Data de Criação**: 2025-11-22
**Versão**: 1.0.0
**Autor**: Claude Code + Rafael Minatto
