# 🔧 Edge Config - Limitação do MCP Vercel

**Data**: 23/10/2025  
**Status**: ⚠️ Edge Config requer configuração manual via dashboard

---

## ⚠️ LIMITAÇÃO IDENTIFICADA

O **MCP da Vercel** não possui ferramentas para:
- ❌ Criar Edge Config
- ❌ Gerenciar Edge Config items
- ❌ Conectar Edge Config a projetos

### Funções Disponíveis no MCP Vercel
```
✅ list_teams
✅ list_projects  
✅ get_project
✅ list_deployments
✅ get_deployment
✅ deploy_to_vercel
❌ create_edge_config (NÃO EXISTE)
❌ update_edge_config (NÃO EXISTE)
```

---

## 📊 INFORMAÇÕES DO PROJETO (via MCP)

**Projeto Vercel**:
- **ID**: `prj_lJT0yis7pFVJASeoHaykO6A1U7kz`
- **Nome**: `dudufisio-ai`
- **Team ID**: `team_RWPxV6A0gp02a6FO7Ghf2YSV`
- **Team**: Rafael Minatto's projects
- **Framework**: Vite
- **Node Version**: 22.x
- **Production URL**: `dudufisio-ai-rafael-minattos-projects.vercel.app`

**Último Deploy**:
- **ID**: `dpl_4JWafxGTw3DDbys2Y1F4KuFKB6uX`
- **Status**: `BUILDING` (em andamento)
- **Target**: Production

---

## ✅ SOLUÇÃO: Configuração Manual

### OPÇÃO 1: Via Dashboard Web (5 minutos)

#### 1. Criar Edge Config
🔗 https://vercel.com/rafael-minattos-projects/stores

1. Clique em **"Create Database"** ou **"Create Store"**
2. Selecione **"Edge Config"**
3. **Name**: `agenda-cache`
4. Clique em **"Create"**

#### 2. Conectar ao Projeto

1. No Edge Config criado, clique em **"Connect to Project"**
2. Selecione: **`dudufisio-ai`**
3. Ambientes: ✅ Production, ✅ Preview, ✅ Development
4. Clique em **"Connect"**

✅ Variável `EDGE_CONFIG` criada automaticamente!

#### 3. Copiar Edge Config ID

Na página do Edge Config, você verá:
```
Edge Config ID: ecfg_xxxxxxxxxxxxxxxxxxxxxx
```

Copie este ID!

#### 4. Criar Token da API

🔗 https://vercel.com/account/tokens

1. **Create Token**
2. **Name**: `edge-config-api-token`
3. **Scope**: Apenas projeto `dudufisio-ai`
4. **Expiration**: No Expiration (ou 1 year)
5. **Create**
6. **⚠️ COPIE O TOKEN IMEDIATAMENTE!**

#### 5. Adicionar Variáveis de Ambiente

Use a CLI para adicionar as variáveis que você copiou:

```bash
# Edge Config ID
vercel env add EDGE_CONFIG_ID

# Quando solicitado:
# ? What's the value of EDGE_CONFIG_ID? ecfg_xxxxxxxxxxxxxx
# ? Add EDGE_CONFIG_ID to which Environments? Production, Preview, Development
```

```bash
# Vercel API Token
vercel env add VERCEL_API_TOKEN

# Quando solicitado:
# ? What's the value of VERCEL_API_TOKEN? (cole o token)
# ? Add VERCEL_API_TOKEN to which Environments? Production, Preview, Development
```

---

### OPÇÃO 2: Via Dashboard Web (Variáveis de Ambiente)

Se preferir adicionar as variáveis via dashboard:

🔗 https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables

1. Clique em **"Add New"**
2. **Key**: `EDGE_CONFIG_ID`
3. **Value**: `ecfg_xxxxxxxxxxxxxx`
4. **Environments**: Production, Preview, Development
5. Clique em **"Save"**

Repita para `VERCEL_API_TOKEN`.

---

## 🧪 VERIFICAÇÃO

### 1. Listar Variáveis de Ambiente

```bash
vercel env ls
```

Procure por:
```
✅ EDGE_CONFIG (criado automaticamente ao conectar Edge Config)
✅ EDGE_CONFIG_ID (você adicionou manualmente)
✅ VERCEL_API_TOKEN (você adicionou manualmente)
```

### 2. Testar Cron Job (Após Deploy)

```bash
# Ver último deployment
vercel ls

# Ver logs
vercel logs --follow
```

Ou testar manualmente:
```bash
curl -X GET https://dudufisio-ai-rafael-minattos-projects.vercel.app/api/cron/update-agenda-cache \
  -H "Authorization: Bearer $(vercel env ls | grep CRON_SECRET | awk '{print $2}')"
```

---

## 📋 CHECKLIST

- [ ] Acessar https://vercel.com/rafael-minattos-projects/stores
- [ ] Criar Edge Config "agenda-cache"
- [ ] Conectar ao projeto "dudufisio-ai"
- [ ] Copiar Edge Config ID (ecfg_...)
- [ ] Criar token API em https://vercel.com/account/tokens
- [ ] Adicionar EDGE_CONFIG_ID via CLI ou dashboard
- [ ] Adicionar VERCEL_API_TOKEN via CLI ou dashboard
- [ ] Verificar com `vercel env ls`
- [ ] Aguardar deploy finalizar
- [ ] Testar cron job

---

## 💡 ALTERNATIVA: Funciona Sem Edge Config

Se você não configurar o Edge Config **AGORA**, o sistema continua funcionando normalmente!

O código em `lib/edge-config/agendaCache.ts` tem fallback automático:

```typescript
export async function getCachedTherapists(): Promise<Therapist[]> {
  const cached = await getAgendaCacheData();
  return cached?.therapists || []; // Retorna vazio se não tiver cache
}
```

No código que usa:
```typescript
const cachedTherapists = await getCachedTherapists();

if (cachedTherapists.length > 0) {
  // Usa cache ⚡ 10ms
  setTherapists(cachedTherapists);
} else {
  // Busca do Supabase 🔄 200ms (ainda rápido!)
  const { data } = await supabase.from('therapists').select('*');
  setTherapists(data || []);
}
```

**Performance**:
- Com Edge Config: ~10ms ⚡⚡⚡
- Sem Edge Config: ~200ms ⚡ (ainda bom!)

---

## 🎯 CONCLUSÃO

O Edge Config é uma **otimização de performance**, não um bloqueio. 

Você pode:
1. **Configurar agora** (5 minutos) → Ganho de 90% performance
2. **Configurar depois** → Sistema funciona normalmente
3. **Não configurar** → Usa Supabase direto (200ms)

**Recomendação**: Configure quando tiver tempo, mas não é urgente!

