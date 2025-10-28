# 🚀 Guia de Aplicação Manual - Migration RLS

**Status:** Correções aplicadas, pronto para aplicar em produção  
**Data:** 28 de Outubro de 2025

## ✅ Correções Já Aplicadas

1. ✅ Removida API key hardcoded do Gemini  
2. ✅ Removido enum `MovementType` duplicado
3. ✅ Build local bem-sucedido
4. ✅ Migration RLS corrigida (roles em minúsculo)

## 📝 Como Aplicar a Migration RLS Manualmente

### Método 1: Via Supabase Dashboard SQL Editor (RECOMENDADO)

1. **Acessar SQL Editor:**
   ```
   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new
   ```

2. **Copiar o conteúdo da migration:**
   - Arquivo: `supabase/migrations/20251027000010_reenable_rls_production.sql`
   - Copiar TODO o conteúdo do arquivo

3. **Colar no SQL Editor e Executar:**
   - Click em "Run" ou pressione `Ctrl+Enter`
   - Aguardar confirmação de sucesso

4. **Verificar aplicação:**
   ```sql
   SELECT COUNT(*) as total_policies 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```
   **Resultado esperado:** 20+ políticas

### Método 2: Via CLI (se conseguir conectar)

```bash
npx supabase link --project-ref urfxniitfbbvsaskicfo
npx supabase db push --linked
```

## 🔍 Políticas RLS que Serão Criadas

A migration habilita RLS e cria políticas para 11 tabelas:

### Tabelas Afetadas:
1. ✅ `suppliers` - 2 políticas (view, manage)
2. ✅ `supplies` - 4 políticas (view, create, update, delete)
3. ✅ `stock_movements` - 3 políticas (view, create, delete)
4. ✅ `purchase_orders` - 3 políticas (view, create, update)
5. ✅ `purchase_order_items` - 2 políticas (view, create)
6. ✅ `supply_alerts` - 2 políticas (view, update)
7. ✅ `task_supplies_used` - 2 políticas (view, create)
8. ✅ `task_type_supply_templates` - 2 políticas (view, manage)
9. ✅ `supply_batches` - 2 políticas (view, manage)
10. ✅ `purchase_approvals` - 1 política (manage)
11. ✅ `auto_replenishment_rules` - 1 política (manage)

**Total:** ~24 políticas RLS

### Permissões por Role:

**Admin (`admin`):**
- ✅ Acesso completo a todas as tabelas
- ✅ Pode criar, ler, atualizar e deletar
- ✅ Pode aprovar pedidos de compra

**Therapist (`therapist`):**
- ✅ Pode ver insumos e fornecedores
- ✅ Pode registrar uso de insumos
- ✅ Pode criar pedidos de compra
- ❌ NÃO pode deletar fornecedores
- ❌ NÃO pode aprovar pedidos

**Patient (`patient`):**
- ❌ NÃO tem acesso ao módulo de insumos

## ⚠️ Validação Pós-Aplicação

Após aplicar a migration, executar:

```sql
-- 1. Contar políticas criadas
SELECT tablename, COUNT(*) as policies_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'suppliers', 'supplies', 'stock_movements', 
    'purchase_orders', 'purchase_order_items', 'supply_alerts',
    'task_supplies_used', 'task_type_supply_templates', 
    'supply_batches', 'purchase_approvals', 'auto_replenishment_rules'
  )
GROUP BY tablename
ORDER BY tablename;

-- 2. Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'suppliers', 'supplies', 'stock_movements', 
    'purchase_orders', 'purchase_order_items', 'supply_alerts',
    'task_supplies_used', 'task_type_supply_templates', 
    'supply_batches', 'purchase_approvals', 'auto_replenishment_rules'
  )
ORDER BY tablename;
```

**Resultado esperado:**
- Todas as tabelas devem ter `rowsecurity = true`
- Total de ~24 políticas distribuídas entre as 11 tabelas

## 🎯 Próximos Passos Após Aplicação

1. ✅ Marcar migration como aplicada
2. ✅ Fazer commit das correções de código
3. ✅ Fazer deploy no Vercel
4. ✅ Testar em produção com diferentes roles

---

**📌 IMPORTANTE:** Não esqueça de fazer backup do banco antes de aplicar!

**URL do backup:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/database/backups/scheduled
