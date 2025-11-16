# 🔐 SOLUÇÃO PARA PROBLEMA DE AUTENTICAÇÃO - SUPABASE

## ⚠️ PROBLEMA IDENTIFICADO

O sistema de gestão de insumos está **100% implementado**, mas não está funcionando devido a um problema de autenticação com o Supabase.

### **Erro:**
```
ERROR: {code: 42501} - Insufficient Privilege
ERROR: 401 - Unauthorized
```

### **Causa Raiz:**
O sistema está usando **autenticação mock** (`mock-admin-1`), mas o Supabase espera um **usuário real autenticado**. As políticas RLS (Row Level Security) verificam `auth.uid() IS NOT NULL`, mas o mock não está registrado no Supabase Auth.

---

## 🔧 SOLUÇÕES POSSÍVEIS

### **OPÇÃO 1: Desabilitar RLS (DESENVOLVIMENTO) ⚡ RÁPIDO**

Esta é a solução mais rápida para desenvolvimento e testes.

#### **Passo 1: Executar SQL no Supabase**

Acesse o SQL Editor do Supabase: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor

Cole e execute:

```sql
-- Desabilitar RLS para todas as tabelas de insumos
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplies DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE supply_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_supplies_used DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_type_supply_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE supply_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE auto_replenishment_rules DISABLE ROW LEVEL SECURITY;
```

#### **Passo 2: Testar Novamente**

Recarregue a página `/supplies` e tente cadastrar um novo insumo.

#### **⚠️ AVISO:**
Esta solução **NÃO é recomendada para produção**. Use apenas para desenvolvimento e testes.

---

### **OPÇÃO 2: Criar Usuário Real no Supabase Auth (RECOMENDADO) ✅**

Esta é a solução mais adequada para desenvolvimento e produção.

#### **Passo 1: Criar Usuário via Dashboard**

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/auth/users
2. Clique em **"Add user"**
3. Preencha:
   - **Email:** `admin@dudufisio.com`
   - **Password:** `admin123`
   - **Auto Confirm User:** ✅ (marcado)
4. Clique em **"Create user"**

#### **Passo 2: Fazer Login no Sistema**

1. Acesse: http://localhost:5176
2. Faça logout se estiver logado
3. Faça login com:
   - **Email:** `admin@dudufisio.com`
   - **Password:** `admin123`

#### **Passo 3: Testar Gestão de Insumos**

1. Acesse: http://localhost:5176/supplies
2. Tente cadastrar um novo insumo
3. ✅ Deve funcionar!

---

### **OPÇÃO 3: Usar Supabase Local (DESENVOLVIMENTO) 🏠**

Para desenvolvimento local com autenticação mock.

#### **Passo 1: Iniciar Supabase Local**

```bash
supabase start
```

#### **Passo 2: Configurar Variáveis de Ambiente**

Atualize `.env.local`:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<sua-chave-local>
```

#### **Passo 3: Reiniciar Servidor**

```bash
npm run dev
```

---

### **OPÇÃO 4: Ajustar Código para Bypass RLS (DESENVOLVIMENTO) 🔧**

Modificar o código para usar a service role key em desenvolvimento.

#### **Passo 1: Criar Cliente Admin**

Crie um arquivo `lib/supabase-admin.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

#### **Passo 2: Usar Cliente Admin no Serviço**

Modifique `services/suppliesService.js`:

```javascript
// Em vez de usar supabase, use supabaseAdmin
import { supabaseAdmin } from '../lib/supabase-admin';

// Use supabaseAdmin para operações de escrita
const { data, error } = await supabaseAdmin
  .from('supplies')
  .insert(supplyData);
```

---

## 📊 COMPARAÇÃO DAS SOLUÇÕES

| Solução | Velocidade | Segurança | Produção | Recomendação |
|---------|-----------|-----------|----------|--------------|
| **Opção 1: Desabilitar RLS** | ⚡⚡⚡ Muito Rápido | ❌ Baixa | ❌ Não | ⚠️ Apenas dev |
| **Opção 2: Usuário Real** | ⚡⚡ Rápido | ✅ Alta | ✅ Sim | ✅ **RECOMENDADO** |
| **Opção 3: Supabase Local** | ⚡ Médio | ✅ Alta | ❌ Não | ⚠️ Dev avançado |
| **Opção 4: Bypass RLS** | ⚡⚡ Rápido | ⚠️ Média | ❌ Não | ⚠️ Dev apenas |

---

## 🎯 RECOMENDAÇÃO FINAL

### **Para Desenvolvimento Rápido:**
✅ **Opção 1** - Desabilitar RLS temporariamente

### **Para Desenvolvimento Adequado:**
✅ **Opção 2** - Criar usuário real no Supabase Auth

### **Para Produção:**
✅ **Opção 2** - Usar autenticação real com RLS habilitado

---

## 📝 PRÓXIMOS PASSOS

1. Escolha uma das opções acima
2. Execute os passos indicados
3. Teste novamente o cadastro de insumos
4. Continue com os testes do guia `TESTE_GESTAO_INSUMOS.md`

---

## 🔗 LINKS ÚTEIS

- **Supabase Dashboard:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
- **SQL Editor:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
- **Auth Users:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/auth/users
- **Documentação RLS:** https://supabase.com/docs/guides/auth/row-level-security

---

**Status:** ⚠️ Aguardando escolha da solução  
**Criado em:** 19/01/2025  
**Última atualização:** 19/01/2025
