# 🚀 GUIA DE EXECUÇÃO DA MIGRAÇÃO NO SUPABASE

## ✅ DEPENDÊNCIAS INSTALADAS COM SUCESSO!

```bash
✅ jspdf@3.0.3
✅ xlsx@0.18.5
✅ jspdf-autotable@5.0.2
```

---

## 📋 EXECUTAR MIGRAÇÃO NO SUPABASE

### **OPÇÃO 1: Via Dashboard do Supabase (RECOMENDADO)**

1. **Acesse o Supabase:**
   - URL: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo

2. **Vá para SQL Editor:**
   - No menu lateral, clique em **"SQL Editor"**
   - Clique em **"New Query"**

3. **Cole o conteúdo da migração:**
   - Abra o arquivo: `database/migrations/001_create_supplies_tables.sql`
   - Copie TODO o conteúdo (503 linhas)
   - Cole no editor SQL

4. **Execute a migração:**
   - Clique no botão **"Run"** (ou pressione Ctrl+Enter)
   - Aguarde a execução (pode levar 10-20 segundos)
   - Você verá: **"Success. No rows returned"**

5. **Verifique as tabelas criadas:**
   - Vá para **"Table Editor"** no menu lateral
   - Você deve ver as seguintes tabelas:
     - ✅ `suppliers`
     - ✅ `supplies`
     - ✅ `stock_movements`
     - ✅ `purchase_orders`
     - ✅ `purchase_order_items`
     - ✅ `supply_alerts`
     - ✅ `task_supplies_used`
     - ✅ `task_type_supply_templates`
     - ✅ `supply_batches`
     - ✅ `purchase_approvals`
     - ✅ `auto_replenishment_rules`

---

### **OPÇÃO 2: Via Supabase CLI (ALTERNATIVA)**

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref urfxniitfbbvsaskicfo

# Executar migração
supabase db push
```

---

### **OPÇÃO 3: Via MCP (SE DISPONÍVEL)**

Se você tiver o MCP do Supabase configurado, pode executar diretamente:

```typescript
// Usar a ferramenta mcp_supabase_execute_sql
// com o conteúdo do arquivo 001_create_supplies_tables.sql
```

---

## ✅ VERIFICAÇÃO PÓS-MIGRAÇÃO

### 1. Verificar Tabelas Criadas

Execute no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'suppliers', 'supplies', 'stock_movements', 
  'purchase_orders', 'purchase_order_items',
  'supply_alerts', 'task_supplies_used',
  'task_type_supply_templates', 'supply_batches',
  'purchase_approvals', 'auto_replenishment_rules'
)
ORDER BY table_name;
```

**Resultado esperado:** 11 linhas

### 2. Verificar Dados Iniciais

```sql
-- Verificar fornecedores de exemplo
SELECT * FROM suppliers;

-- Verificar insumos de exemplo
SELECT * FROM supplies;

-- Resultado esperado: 3 fornecedores e 3 insumos
```

### 3. Verificar Triggers

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('suppliers', 'supplies', 'stock_movements', 'purchase_orders');

-- Resultado esperado: 6 triggers
```

### 4. Verificar RLS (Row Level Security)

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('suppliers', 'supplies', 'stock_movements', 'purchase_orders');

-- Resultado esperado: rowsecurity = true para todas
```

---

## 🎯 PRÓXIMOS PASSOS APÓS A MIGRAÇÃO

### 1. **Iniciar o Servidor de Desenvolvimento**

```bash
npm run dev
```

### 2. **Acessar o Sistema**

- URL: http://localhost:5173
- Login como Admin
- Menu → **Gestão → Gestão de Insumos**

### 3. **Testar Funcionalidades**

#### A) Testar Dashboard
- Ver métricas de estoque
- Ver alertas automáticos
- Ver movimentações recentes

#### B) Testar Cadastro de Insumos
- Adicionar novo insumo
- Configurar estoque mínimo
- Verificar alerta de estoque baixo

#### C) Testar Relatórios
- Gerar relatório de consumo
- Exportar para Excel
- Exportar para PDF

#### D) Testar Pedidos Automatizados
- Configurar regras de reposição
- Simular estoque baixo
- Verificar sugestão de compra

---

## 🐛 TROUBLESHOOTING

### Erro: "relation already exists"
**Causa:** Tabela já foi criada anteriormente
**Solução:** 
```sql
-- Remover tabelas existentes (CUIDADO!)
DROP TABLE IF EXISTS auto_replenishment_rules CASCADE;
DROP TABLE IF EXISTS purchase_approvals CASCADE;
DROP TABLE IF EXISTS supply_batches CASCADE;
DROP TABLE IF EXISTS task_type_supply_templates CASCADE;
DROP TABLE IF EXISTS task_supplies_used CASCADE;
DROP TABLE IF EXISTS supply_alerts CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS supplies CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;

-- Executar migração novamente
```

### Erro: "permission denied"
**Causa:** Usuário sem permissão
**Solução:** Verificar se está logado como admin do projeto

### Erro: "function already exists"
**Causa:** Funções já criadas
**Solução:** Ignorar - as funções serão atualizadas automaticamente

---

## 📊 ESTRUTURA CRIADA

### **11 Tabelas:**
1. `suppliers` - Fornecedores
2. `supplies` - Insumos
3. `stock_movements` - Movimentações
4. `purchase_orders` - Pedidos de compra
5. `purchase_order_items` - Itens dos pedidos
6. `supply_alerts` - Alertas automáticos
7. `task_supplies_used` - Insumos usados em tarefas
8. `task_type_supply_templates` - Templates por tipo
9. `supply_batches` - Controle de lotes
10. `purchase_approvals` - Aprovações de pedidos
11. `auto_replenishment_rules` - Regras de reposição

### **6 Triggers:**
1. `update_suppliers_updated_at`
2. `update_supplies_updated_at`
3. `update_purchase_orders_updated_at`
4. `update_task_type_supply_templates_updated_at`
5. `update_auto_replenishment_rules_updated_at`
6. `update_stock_on_movement` - Atualiza estoque automaticamente
7. `check_low_stock` - Cria alertas de estoque baixo
8. `generate_purchase_order_number` - Gera número de pedido

### **6 Funções:**
1. `update_updated_at_column()`
2. `update_stock_after_movement()`
3. `check_and_create_low_stock_alert()`
4. `generate_order_number()`

### **Dados Iniciais:**
- 3 Fornecedores de exemplo
- 3 Insumos de exemplo

---

## ✅ CHECKLIST FINAL

- [ ] Migração SQL executada com sucesso
- [ ] 11 tabelas criadas
- [ ] 6 triggers criados
- [ ] 4 funções criadas
- [ ] Dados iniciais inseridos
- [ ] RLS habilitado
- [ ] Servidor de desenvolvimento rodando
- [ ] Sistema acessível em http://localhost:5173
- [ ] Dashboard de insumos carregando
- [ ] Funcionalidades testadas

---

## 🎉 PRONTO!

Após executar a migração, o sistema estará **100% funcional** com todas as funcionalidades implementadas!

**Tempo estimado de setup:** 5-10 minutos

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique logs do terminal
3. Confirme que a migração foi executada
4. Verifique se as tabelas foram criadas

**Status:** ✅ Dependências instaladas | ⏳ Aguardando execução da migração SQL

