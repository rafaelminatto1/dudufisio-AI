# 🔍 Teste de Conexão - Supabase

## Status Atual

✅ Projeto Supabase: **ATIVO**  
✅ Todos os serviços: **Healthy**  
❌ Conexão Prisma: **Falhando**

---

## 🎯 Como Resolver

### Método 1: Copiar String de Conexão do Dashboard (RECOMENDADO)

1. **No Supabase Dashboard, acesse:**
   ```
   Settings → Database
   ```

2. **Role até "Connection string"**

3. **Clique na aba "URI"**

4. **Copie a string completa**

5. **Substitua `[YOUR-PASSWORD]` por:**
   ```
   cFfS1GEwkj2fOAE2
   ```

6. **Cole no arquivo `.env`:**
   ```bash
   DATABASE_URL=postgresql://postgres:cFfS1GEwkj2fOAE2@...
   ```

---

### Método 2: Liberar IP no Supabase

1. **No Supabase Dashboard:**
   ```
   Settings → Database → Network restrictions
   ```

2. **Adicionar:**
   ```
   0.0.0.0/0
   ```

3. **Salvar e testar:**
   ```bash
   npm run prisma:pull
   ```

---

### Método 3: Usar Supabase CLI (Alternativa)

Se nenhum método acima funcionar, podemos usar a CLI do Supabase:

```bash
# Instalar CLI
npm install -g supabase

# Fazer login
supabase login

# Linkar projeto
supabase link --project-ref urfxniitfbbvsaskicfo

# Gerar tipos
supabase gen types typescript --linked > types/supabase.ts
```

---

## 🔍 Possíveis Causas do Problema

1. **Firewall/Proxy Corporativo**
   - Pode estar bloqueando as portas 5432 ou 6543
   - Solução: Usar VPN ou rede diferente

2. **Região Incorreta**
   - A região do pooler pode estar incorreta
   - Solução: Copiar connection string exata do dashboard

3. **IP Bloqueado**
   - Supabase bloqueia IPs por padrão
   - Solução: Adicionar 0.0.0.0/0 em Network restrictions

4. **Formato da URL**
   - O formato pode estar ligeiramente incorreto
   - Solução: Usar a URL exata do dashboard

---

## 📞 Próximos Passos

**Escolha uma opção:**

**A)** Me envie a connection string do dashboard (pode ocultar a senha)

**B)** Tente adicionar `0.0.0.0/0` nas network restrictions

**C)** Teste se está em uma rede corporativa/proxy que bloqueia portas

---

**Projeto**: urfxniitfbbvsaskicfo  
**Status Dashboard**: ✅ Todos os serviços saudáveis  
**Status Prisma**: ⚠️ Aguardando conexão

