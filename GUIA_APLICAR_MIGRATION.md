# 🚀 Guia: Aplicar Migration do Sistema de Evolução

## Migration: `assessment_compliance_log`

Esta migration cria o sistema de registro de conformidade de medições obrigatórias (Nível C).

---

## 📋 Opção 1: Aplicar Manualmente no Supabase Dashboard (Recomendado)

### Passo 1: Acessar o SQL Editor
1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql
2. Faça login com sua conta Supabase

### Passo 2: Copiar o SQL
1. Abra o arquivo: `supabase/migrations/20250125_assessment_compliance_log.sql`
2. Copie todo o conteúdo (Ctrl+A, Ctrl+C)

### Passo 3: Executar no SQL Editor
1. No SQL Editor do Supabase, clique em "New Query"
2. Cole o SQL copiado
3. Clique em "Run" ou pressione Ctrl+Enter
4. Aguarde a execução (deve levar alguns segundos)

### Passo 4: Verificar
Execute este SQL para verificar se a tabela foi criada:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'assessment_compliance_log';
```

Se retornar `assessment_compliance_log`, a migration foi aplicada com sucesso! ✅

---

## 📋 Opção 2: Usar Supabase CLI (Alternativa)

### Pré-requisitos
- Docker Desktop instalado e rodando
- Supabase CLI instalado

### Passos

```bash
# 1. Verificar status do Supabase
supabase status

# 2. Se não estiver rodando, iniciar
supabase start

# 3. Aplicar a migration
supabase db push

# 4. Verificar
supabase db diff
```

---

## 📋 Opção 3: Usar PostgreSQL Client Direto

### Conectar ao Banco

```bash
# Usando psql
psql -h db.urfxniitfbbvsaskicfo.supabase.co \
     -U postgres \
     -d postgres \
     -p 5432
```

Senha: `cFfS1GEwkj2fOAE2` (do .env.local)

### Executar a Migration

```sql
-- Copiar e colar todo o conteúdo de:
-- supabase/migrations/20250125_assessment_compliance_log.sql
```

---

## ✅ Verificação Pós-Migration

### 1. Verificar Tabela Criada

```sql
\d assessment_compliance_log
```

### 2. Verificar Funções

```sql
-- Função de cálculo de conformidade
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'calculate_patient_compliance_rate';

-- Função de relatório
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'get_compliance_report';
```

### 3. Verificar View

```sql
-- View de resumo
SELECT table_name 
FROM information_schema.views 
WHERE table_name = 'v_assessment_compliance_summary';
```

### 4. Verificar Índices

```sql
-- Índices criados
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'assessment_compliance_log';
```

---

## 🧪 Testar o Sistema

### Teste 1: Inserir Registro de Conformidade

```sql
-- Exemplo de inserção
INSERT INTO assessment_compliance_log (
  patient_id,
  session_id,
  test_name,
  test_type,
  was_measured,
  measured_value,
  timing,
  session_number,
  recorded_by,
  notes
) VALUES (
  'seu-patient-id',
  'seu-session-id',
  'Amplitude do Joelho',
  'amplitude',
  true,
  '{"flexion": 120, "extension": 0}'::jsonb,
  'during',
  5,
  'seu-user-id',
  'Medição realizada com goniômetro'
);
```

### Teste 2: Calcular Taxa de Conformidade

```sql
-- Calcular taxa para um paciente
SELECT * FROM calculate_patient_compliance_rate(
  'seu-patient-id'::uuid,
  '2025-01-01'::timestamptz,
  '2025-01-31'::timestamptz
);
```

### Teste 3: Gerar Relatório

```sql
-- Relatório de conformidade
SELECT * FROM get_compliance_report(
  '2025-01-01'::timestamptz,
  '2025-01-31'::timestamptz,
  'amplitude'
);
```

### Teste 4: Visualizar Resumo

```sql
-- Ver resumo consolidado
SELECT * FROM v_assessment_compliance_summary
WHERE patient_id = 'seu-patient-id';
```

---

## 🔧 Troubleshooting

### Erro: "relation already exists"
A tabela já existe. Para recriar:

```sql
DROP TABLE IF EXISTS assessment_compliance_log CASCADE;
-- Depois execute a migration novamente
```

### Erro: "permission denied"
Verifique se você está usando a conta correta no Supabase Dashboard.

### Erro: "function does not exist"
As funções não foram criadas. Execute novamente a parte de funções da migration.

---

## 📊 O Que Esta Migration Cria

### Tabela
- `assessment_compliance_log` - Registro de conformidade

### Funções
- `calculate_patient_compliance_rate()` - Calcula taxa de conformidade
- `get_compliance_report()` - Gera relatório de conformidade
- `update_compliance_stats()` - Atualiza estatísticas (trigger)

### Views
- `v_assessment_compliance_summary` - Resumo consolidado

### Índices
- 5 índices para otimização de queries

### Triggers
- `trigger_update_compliance_stats` - Atualiza estatísticas automaticamente

---

## 🎯 Próximos Passos

Após aplicar a migration:

1. ✅ Testar o sistema de alertas (Nível A, B, C)
2. ✅ Verificar registro de conformidade
3. ✅ Gerar relatórios de conformidade
4. ✅ Testar gráficos de evolução
5. ✅ Testar geração de relatórios médicos

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Consulte a documentação: https://supabase.com/docs
3. Entre em contato com o suporte

---

**Migration criada em:** 2025-01-25  
**Status:** ✅ Pronta para aplicação  
**Tempo estimado:** 2-5 minutos

