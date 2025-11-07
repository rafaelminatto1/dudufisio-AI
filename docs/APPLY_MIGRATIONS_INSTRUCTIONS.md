# 📋 Instruções para Aplicar Migrations - JSONB → Junction Tables

**Data:** 06 de Novembro de 2025  
**Projeto:** dudufisio-AI (ID: urfxniitfbbvsaskicfo)  
**Região:** South America (São Paulo)

---

## ⚠️ IMPORTANTE - Ler Antes de Começar

- ✅ **Backup:** Certifique-se de ter um backup recente do banco de dados
- ⚠️ **Ordem:** As migrations DEVEM ser aplicadas na ordem especificada
- 🚫 **NÃO aplicar** a migration 3 (cleanup) até validação completa (48h+)
- 📊 **Validar:** Executar queries de validação após cada migration

---

## 🔧 Método 1: Via Supabase Dashboard (RECOMENDADO)

### Passo 1: Acessar SQL Editor

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
2. Menu lateral → **SQL Editor**
3. Clique em **New query**

### Passo 2: Aplicar Migration 1 - Criar Junction Tables

1. **Abrir arquivo:** `supabase/migrations/2025-11-06_create_exercise_junction_tables.sql`
2. **Copiar todo o conteúdo** do arquivo
3. **Colar** no SQL Editor do Supabase
4. **Executar** (botão "Run" ou Ctrl+Enter)
5. **Verificar output:**
   - Deve mostrar "Success" ou "Query executed successfully"
   - Verificar se não há erros

### Passo 3: Aplicar Migration 2 - Backfill de Dados

1. **Abrir arquivo:** `supabase/migrations/2025-11-06_backfill_exercise_junctions.sql`
2. **Copiar todo o conteúdo** do arquivo
3. **Colar** no SQL Editor
4. **Executar**
5. **IMPORTANTE - Verificar NOTICES:**
   - Procure por mensagens de `NOTICE` no output
   - Deve mostrar contagens PRE-MIGRATION e POST-MIGRATION
   - Anote os números para validação

**Exemplo de output esperado:**
```
NOTICE: ==============================================
NOTICE: PRE-MIGRATION COUNT
NOTICE: ==============================================
NOTICE: Protocols with exercises: X
NOTICE: Prescriptions with exercises: Y
NOTICE: Evolutions with prescribed exercises: Z
...
NOTICE: POST-MIGRATION COUNT
NOTICE: Protocol exercises migrated: A rows from B protocols
NOTICE: Prescription exercises migrated: C rows from D prescriptions
NOTICE: Evolution exercises migrated: E rows from F evolutions
```

### Passo 4: Executar Queries de Validação

1. **Abrir arquivo:** `validation-queries.sql`
2. **Copiar seções específicas** (ou todo o arquivo)
3. **Colar** no SQL Editor
4. **Executar**
5. **Analisar resultados:**
   - Todas as contagens devem bater
   - Todos os testes devem mostrar ✅ PASS
   - Status final deve ser: "✅ ALL TESTS PASSED"

### Passo 5: NÃO Aplicar Migration 3 (Cleanup) Ainda

⚠️ **AGUARDAR 48 HORAS** de validação antes de aplicar:
- `supabase/migrations/2025-11-06_remove_exercise_jsonb_fields.sql`

Esta migration é **DESTRUTIVA e IRREVERSÍVEL**.

---

## 🔧 Método 2: Via Supabase CLI (Alternativo)

Se conseguir resolver a conexão do CLI, use:

```bash
# 1. Verificar conexão
supabase db push --dry-run

# 2. Aplicar migrations
supabase db push

# 3. Executar validações
supabase db execute -f validation-queries.sql
```

---

## ✅ Checklist de Aplicação

### Migration 1 - Create Tables
- [ ] Arquivo copiado e colado no SQL Editor
- [ ] Migration executada sem erros
- [ ] Tables criadas: `protocol_exercises`, `prescription_exercises`, `evolution_prescribed_exercises`
- [ ] Índices criados (verificar com query de validação)
- [ ] RLS policies criadas (verificar com query de validação)

### Migration 2 - Backfill
- [ ] Arquivo copiado e colado no SQL Editor
- [ ] Migration executada sem erros
- [ ] NOTICES de contagem verificados
- [ ] Contagens PRE vs POST anotadas
- [ ] Dados migrados conforme esperado

### Validação
- [ ] Arquivo `validation-queries.sql` executado
- [ ] Teste 1: Contagens JSONB vs Junction ✅
- [ ] Teste 2: Integridade referencial ✅
- [ ] Teste 3: Positions válidas ✅
- [ ] Teste 4: Índices verificados ✅
- [ ] Teste 5: RLS policies verificadas ✅
- [ ] Status final: "✅ ALL TESTS PASSED"

---

## 📊 Próximos Passos Após Aplicação

1. **Gerar novos tipos TypeScript:**
   ```bash
   supabase gen types typescript --project-id urfxniitfbbvsaskicfo > types/supabase.ts
   ```

2. **Criar relatório de validação:**
   - Documentar em `docs/MIGRATION_VALIDATION_REPORT.md`
   - Incluir todas as contagens e resultados
   - Adicionar timestamp de quando foi aplicado

3. **Testar funcionalidades:**
   - Testar CRUD de protocolos
   - Testar CRUD de prescrições
   - Testar criação de evoluções com exercícios

4. **Monitorar por 48 horas:**
   - Verificar logs de erro
   - Verificar performance de queries
   - Validar fluxos completos na UI

5. **Após 48h de validação:**
   - Se tudo estiver OK: Aplicar migration 3 (cleanup)
   - Se houver problemas: Executar rollback

---

## 🚨 Rollback Plan

Se algo der errado:

### Opção 1: Limpar Junction Tables (Dados JSONB ainda existem)
```sql
-- Limpar as junction tables
TRUNCATE TABLE protocol_exercises CASCADE;
TRUNCATE TABLE prescription_exercises CASCADE;
TRUNCATE TABLE evolution_prescribed_exercises CASCADE;

-- Os dados JSONB originais ainda estão intactos!
```

### Opção 2: Reverter Código TypeScript
- Fazer checkout da branch anterior
- Deploy da versão anterior do código
- Investigar e corrigir problema
- Re-aplicar migrations após correção

---

## 📞 Contatos e Suporte

- **Dashboard Supabase:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
- **Documentação:** `docs/MIGRATION_JSONB_TO_JUNCTION_TABLES_TEST_GUIDE.md`
- **Guia de Implementação:** `docs/MIGRATION_JSONB_IMPLEMENTATION_COMPLETE.md`

---

## ✅ Status da Aplicação

- [ ] **Migration 1** - Não aplicada
- [ ] **Migration 2** - Não aplicada  
- [ ] **Validação** - Não executada
- [ ] **Migration 3** - NÃO APLICAR AINDA

**Data de aplicação:** _____________  
**Aplicado por:** _____________  
**Resultado:** _____________

---

**Nota:** Este documento deve ser atualizado conforme as migrations forem aplicadas.

