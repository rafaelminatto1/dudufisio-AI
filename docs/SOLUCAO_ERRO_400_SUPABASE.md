# 🔧 SOLUÇÃO PARA ERRO 400 NO SUPABASE

## ⚠️ PROBLEMA IDENTIFICADO

O console está mostrando múltiplos erros 400 (Bad Request) ao tentar buscar dados da tabela `users`:

```
GET https://urfxniitfbbvsaskicfo.supabase.co/rest/v1/users?select=id&auth_id=eq.mock-admin-1 400 (Bad Request)
```

### **Causas Raiz:**

1. **Múltiplas instâncias do cliente Supabase**: O código está criando múltiplas instâncias do cliente Supabase, causando o aviso:
   ```
   Multiple GoTrueClient instances detected in the same browser context
   ```

2. **Mock Auth com ID inválido**: O sistema está usando autenticação mock com IDs como `mock-admin-1`, mas tentando buscar na tabela `users` do Supabase usando `auth_id=eq.mock-admin-1`. O problema é que:
   - `auth_id` é um campo UUID no banco de dados
   - `mock-admin-1` não é um UUID válido
   - A query está falhando com erro 400

3. **Instâncias duplicadas do cliente**: Existem múltiplos arquivos criando instâncias do Supabase:
   - `lib/supabase.ts` (linha 80)
   - `lib/supabaseClient.ts` (linha 38)
   - `lib/supabase.js` (linha 22)
   - `services/database/supabaseAgendaService.ts` (linha 18-20)

---

## 🔧 SOLUÇÕES

### **SOLUÇÃO 1: Consolidação do Cliente Supabase (RECOMENDADO) ✅**

Consolidar todas as instâncias do Supabase em um único arquivo singleton.

#### **Passo 1: Escolher um arquivo principal**

Recomendo usar `lib/supabaseClient.ts` como arquivo principal.

#### **Passo 2: Atualizar todas as importações**

Substituir todas as importações de `lib/supabase.ts`, `lib/supabase.js` e `services/database/supabaseAgendaService.ts` para importar de `lib/supabaseClient.ts`.

#### **Passo 3: Remover arquivos duplicados**

Após consolidar, deletar os arquivos duplicados:
- `lib/supabase.ts`
- `lib/supabase.js`

---

### **SOLUÇÃO 2: Corrigir Autenticação Mock (IMEDIATO) ⚡**

O problema imediato é que o sistema está tentando buscar no Supabase com um ID mock inválido. Vamos corrigir isso:

#### **Opção A: Desabilitar queries ao Supabase em modo mock**

Modificar o código para não fazer queries ao Supabase quando estiver usando autenticação mock.

#### **Opção B: Criar usuários mock válidos no Supabase**

Criar usuários reais no Supabase Auth para os usuários de demonstração.

---

### **SOLUÇÃO 3: Desabilitar RLS Temporariamente (DESENVOLVIMENTO) 🚀**

Para desenvolvimento, você pode desabilitar RLS na tabela `users`:

```sql
-- Execute no SQL Editor do Supabase
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

⚠️ **AVISO**: Esta solução é apenas para desenvolvimento. Nunca desabilite RLS em produção!

---

## 📋 PLANO DE AÇÃO RECOMENDADO

### **Passo 1: Correção Imediata (5 minutos)**

1. Desabilitar RLS na tabela `users` (SQL acima)
2. Recarregar a aplicação
3. Verificar se os erros 400 desaparecem

### **Passo 2: Consolidação do Cliente (15 minutos)**

1. Escolher `lib/supabaseClient.ts` como arquivo principal
2. Atualizar todas as importações
3. Remover arquivos duplicados
4. Testar a aplicação

### **Passo 3: Corrigir Autenticação Mock (10 minutos)**

1. Modificar `services/auth/supabaseAuthService.ts` para não fazer queries ao Supabase quando em modo mock
2. Ou criar usuários reais no Supabase Auth

---

## 🔍 VERIFICAÇÃO

Após aplicar as soluções, o console deve mostrar:

✅ Sem erros 400
✅ Sem aviso de múltiplas instâncias do GoTrueClient
✅ Aplicação funcionando normalmente

---

## 📝 NOTAS ADICIONAIS

- O erro 400 está acontecendo porque o Supabase está recebendo uma query malformada
- O problema é que `mock-admin-1` não é um UUID válido para o campo `auth_id`
- A tabela `users` espera um UUID no campo `auth_id`, mas está recebendo uma string simples
- Em produção, você deve usar autenticação real do Supabase, não mock

---

## 🆘 SE NADA FUNCIONAR

Se após aplicar todas as soluções o problema persistir:

1. Verifique se as migrações do Supabase foram aplicadas corretamente
2. Verifique se a tabela `users` existe e tem a estrutura correta
3. Verifique os logs do Supabase Dashboard para mais detalhes
4. Considere limpar o cache do navegador e localStorage

