# 🔧 Guia de Troubleshooting - DuduFisio-AI

Este documento contém soluções para os problemas mais comuns encontrados durante o desenvolvimento e uso do DuduFisio-AI.

---

## 📋 Índice

- [Problemas de Variáveis de Ambiente](#problemas-de-variáveis-de-ambiente)
- [Problemas de Inicialização](#problemas-de-inicialização)
- [Problemas de Cache](#problemas-de-cache)
- [Problemas de Build](#problemas-de-build)
- [Problemas de Conexão](#problemas-de-conexão)
- [Problemas Comuns do React](#problemas-comuns-do-react)

---

## 🔐 Problemas de Variáveis de Ambiente

### ❌ Erro: "VITE_SUPABASE_URL não está definida"

**Sintomas:**
- Tela branca ao acessar a aplicação
- Erro no console: `VITE_SUPABASE_URL não está definida`
- Mensagem: "Carregando DuduFisio-AI..." que nunca termina

**Causa:**
O arquivo `.env.local` não existe, está vazio ou as variáveis não foram carregadas pelo Vite.

**Solução Passo-a-Passo:**

1. **Verificar se o arquivo existe:**
   ```bash
   ls -la .env.local
   # ou no Windows:
   dir .env.local
   ```

2. **Se não existir, criar:**
   ```bash
   # Copiar o template
   cp .env.example .env.local
   
   # ou no Windows:
   copy .env.example .env.local
   ```

3. **Preencher as variáveis obrigatórias:**
   
   Abra `.env.local` e preencha:
   ```env
   VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Limpar cache do Vite:**
   ```bash
   # Deletar pasta de cache
   rm -rf node_modules/.vite
   
   # ou no Windows:
   rmdir /s /q node_modules\.vite
   ```

5. **Reiniciar o servidor:**
   ```bash
   # Parar o servidor (Ctrl+C)
   # Iniciar novamente
   npm run dev
   ```

6. **Validar configuração:**
   ```bash
   npm run check:env
   ```

---

### ❌ Erro: "VITE_SUPABASE_ANON_KEY não está definida"

**Sintomas:**
- Aplicação inicia mas falha ao conectar com Supabase
- Erro: `VITE_SUPABASE_ANON_KEY não está definida`

**Solução:**

1. **Obter a chave do Supabase:**
   - Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api
   - Copie a "anon/public" key

2. **Adicionar no .env.local:**
   ```env
   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

3. **Reiniciar o servidor**

---

### ⚠️ Variáveis não são carregadas após edição

**Sintomas:**
- Editei o `.env.local` mas as mudanças não aparecem
- Erro persiste mesmo com variáveis corretas

**Causa:**
O Vite não recarrega variáveis de ambiente automaticamente. É necessário reiniciar o servidor.

**Solução:**

1. **Parar o servidor:** `Ctrl+C`
2. **Limpar cache:** `rm -rf node_modules/.vite`
3. **Reiniciar:** `npm run dev`

**Dica:** Sempre reinicie o servidor após alterar variáveis de ambiente!

---

### 🔍 Como verificar se variáveis foram carregadas

**Método 1: No console do navegador**
```javascript
// Abra o DevTools (F12) e execute:
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

**Método 2: Script de validação**
```bash
npm run check:env
```

**Método 3: Verificar no código**
```typescript
// lib/supabase.ts já mostra logs em desenvolvimento
// Verifique o console ao iniciar a aplicação
```

---

### 🚨 Diferenças: Vite vs Next.js

**IMPORTANTE:** Este projeto usa **Vite**, não Next.js!

| Framework | Prefixo | Exemplo |
|-----------|---------|---------|
| **Vite** (este projeto) | `VITE_` | `VITE_SUPABASE_URL` |
| Next.js | `NEXT_PUBLIC_` | `NEXT_PUBLIC_SUPABASE_URL` |

**❌ NÃO use:**
```env
NEXT_PUBLIC_SUPABASE_URL=...  # ERRADO!
```

**✅ Use:**
```env
VITE_SUPABASE_URL=...  # CORRETO!
```

---

## 🚀 Problemas de Inicialização

### ❌ Erro: "Carregando DuduFisio-AI..." infinito

**Sintomas:**
- Tela branca com mensagem de loading
- Console mostra erros de variáveis de ambiente

**Solução:**

1. Execute o diagnóstico:
   ```bash
   npm run check:env
   ```

2. Siga as instruções do script

3. Se o problema persistir:
   ```bash
   # Limpar tudo e reinstalar
   rm -rf node_modules
   rm package-lock.json
   npm install
   npm run dev
   ```

---

### ❌ Erro: "Uncaught Error: React is not defined"

**Causa:**
Múltiplas instâncias do React ou cache corrompido.

**Solução:**

1. **Limpar cache:**
   ```bash
   rm -rf node_modules/.vite
   rm -rf node_modules/.cache
   ```

2. **Reinstalar dependências:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

---

## 💾 Problemas de Cache

### ❌ Mudanças não aparecem após edição

**Solução Rápida:**

```bash
# 1. Limpar cache do Vite
rm -rf node_modules/.vite

# 2. Hard refresh no navegador
# Chrome/Edge: Ctrl+Shift+R
# Firefox: Ctrl+F5

# 3. Se não resolver, limpar cache do navegador
# DevTools > Application > Clear storage
```

**Solução Completa:**

```bash
# Limpar todos os caches
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

# Rebuild
npm run build
npm run dev
```

---

## 🏗️ Problemas de Build

### ❌ Erro: "Cannot find module 'xxx'"

**Solução:**

```bash
# Reinstalar dependências
rm -rf node_modules
npm install

# Verificar se o módulo existe
npm list xxx
```

---

### ❌ Erro: "Unexpected token" ou "SyntaxError"

**Causa:**
Cache corrompido ou versão incompatível de Node.

**Solução:**

1. **Verificar versão do Node:**
   ```bash
   node --version
   # Deve ser >= 18.0.0
   ```

2. **Limpar e reinstalar:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

---

## 🌐 Problemas de Conexão

### ❌ Erro: "Failed to fetch" ou "Network error"

**Causa:**
Problema de conectividade com Supabase.

**Solução:**

1. **Verificar se o Supabase está online:**
   - Acesse: https://status.supabase.com

2. **Verificar URL no .env.local:**
   ```env
   VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
   ```

3. **Testar conectividade:**
   ```bash
   # Linux/Mac
   curl https://urfxniitfbbvsaskicfo.supabase.co
   
   # Windows
   curl https://urfxniitfbbvsaskicfo.supabase.co
   ```

4. **Verificar firewall/antivírus:**
   - Adicione exceção para localhost:5176
   - Desabilite temporariamente para testar

---

### ❌ Erro: "JWT expired" ou "Invalid JWT"

**Causa:**
Token de autenticação expirado ou inválido.

**Solução:**

1. **Limpar localStorage:**
   ```javascript
   // No console do navegador:
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Recarregar página:**
   ```
   Ctrl+Shift+R
   ```

3. **Fazer logout e login novamente**

---

## ⚛️ Problemas Comuns do React

### ❌ Erro: "Hooks can only be called inside function components"

**Causa:**
Hook sendo chamado fora de componente React.

**Solução:**

```typescript
// ❌ ERRADO
const data = useQuery(...) // Fora do componente

// ✅ CORRETO
function MyComponent() {
  const data = useQuery(...) // Dentro do componente
  return <div>...</div>
}
```

---

### ❌ Erro: "Cannot read property of undefined"

**Causa:**
Tentativa de acessar propriedade de objeto undefined.

**Solução:**

```typescript
// ❌ ERRADO
const name = user.name

// ✅ CORRETO
const name = user?.name ?? 'Sem nome'
```

---

## 🆘 Ainda com Problemas?

### Checklist de Diagnóstico Completo

Execute este checklist na ordem:

```bash
# 1. Verificar versões
node --version    # >= 18.0.0
npm --version     # >= 9.0.0

# 2. Verificar variáveis de ambiente
npm run check:env

# 3. Limpar caches
rm -rf node_modules/.vite
rm -rf dist

# 4. Reinstalar dependências
rm -rf node_modules
npm install

# 5. Validar TypeScript
npm run type-check

# 6. Iniciar servidor
npm run dev
```

---

### 📚 Recursos Úteis

- **Documentação Vite:** https://vitejs.dev/
- **Documentação Supabase:** https://supabase.com/docs
- **Documentação React:** https://react.dev/
- **Status Supabase:** https://status.supabase.com

---

### 🐛 Reportar Bug

Se o problema persistir:

1. Execute o diagnóstico completo
2. Copie os logs do console
3. Verifique se está na versão mais recente:
   ```bash
   git pull origin main
   npm install
   ```
4. Abra uma issue no GitHub com:
   - Descrição do problema
   - Passos para reproduzir
   - Logs do console
   - Screenshots (se aplicável)

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0

