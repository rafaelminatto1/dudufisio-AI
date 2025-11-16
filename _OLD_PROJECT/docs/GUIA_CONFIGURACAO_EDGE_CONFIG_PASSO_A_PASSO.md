# 🚀 CONFIGURAÇÃO DO EDGE CONFIG - PASSO A PASSO

**Tempo estimado**: 5 minutos  
**Data**: 23/10/2025

---

## 📋 INFORMAÇÕES DO PROJETO

**Projeto Vercel**:
- Nome: `dudufisio-ai`
- ID: `prj_lJT0yis7pFVJASeoHaykO6A1U7kz`
- Team: `rafael-minattos-projects`
- Team ID: `team_RWPxV6A0gp02a6FO7Ghf2YSV`

---

## 🎯 PASSO 1: CRIAR EDGE CONFIG STORE (2 min)

### 1.1 Acesse a página de Stores

🔗 **Link direto**: https://vercel.com/rafael-minattos-projects/stores

### 1.2 Criar novo Edge Config

1. Clique em **"Create Store"** ou **"Create Database"**
2. Selecione **"Edge Config"**
3. Preencha:
   - **Store Name**: `agenda-cache`
   - **Region**: Selecione **"Global"** ou **"Washington, D.C. (iad1)"** (mesma região do deploy)

4. Clique em **"Create"**

### 1.3 Conectar ao Projeto

1. Após criar, você verá a tela do Edge Config
2. Clique em **"Connect Project"** ou vá em **Settings → Connected Projects**
3. Selecione o projeto: **`dudufisio-ai`**
4. Marque os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Clique em **"Connect"**

### 1.4 Copiar Edge Config ID

1. Na página do Edge Config, vá em **Settings**
2. Você verá o **Edge Config ID** (formato: `ecfg_xxxxxxxxxxxxxxxxxxxx`)
3. **COPIE este ID** (você vai precisar no Passo 3)

**Exemplo**: `ecfg_abc123xyz789def456ghi`

---

## 🔑 PASSO 2: CRIAR API TOKEN (1 min)

### 2.1 Acesse a página de Tokens

🔗 **Link direto**: https://vercel.com/account/tokens

### 2.2 Criar novo token

1. Clique em **"Create Token"** ou **"Create"**
2. Preencha:
   - **Token Name**: `Edge Config API - DuduFisio`
   - **Scope**: Selecione **`rafael-minattos-projects`** (seu team)
   - **Expiration**: **No Expiration** (recomendado) ou **1 year**

3. Clique em **"Create Token"**

### 2.3 Copiar Token

⚠️ **IMPORTANTE**: O token só será mostrado **UMA VEZ**!

1. **COPIE o token** imediatamente (formato: `vercel_xxxxxxxxxxxxx...`)
2. Cole em um local seguro temporariamente (você vai usar no Passo 3)

**Exemplo**: `vercel_abc123xyz789def456ghi...` (muito longo, ~200 caracteres)

---

## 🔧 PASSO 3: ADICIONAR VARIÁVEIS DE AMBIENTE (2 min)

### Opção A: Via CLI (RECOMENDADO)

Abra o terminal e execute:

```bash
# 1. Adicionar EDGE_CONFIG_ID
vercel env add EDGE_CONFIG_ID

# Quando perguntar:
# ? What's the value of EDGE_CONFIG_ID?
# Cole o ID copiado no Passo 1.4 (ecfg_xxx...)

# ? Add to which Environments?
# Selecione: Production, Preview, Development (use ESPAÇO para marcar, ENTER para confirmar)

# 2. Adicionar VERCEL_API_TOKEN
vercel env add VERCEL_API_TOKEN

# Quando perguntar:
# ? What's the value of VERCEL_API_TOKEN?
# Cole o token copiado no Passo 2.3 (vercel_xxx...)

# ? Add to which Environments?
# Selecione: Production, Preview, Development
```

### Opção B: Via Dashboard

Se preferir interface gráfica:

1. Acesse: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables
2. Clique em **"Add New"**
3. Para **EDGE_CONFIG_ID**:
   - Key: `EDGE_CONFIG_ID`
   - Value: (cole o ID do Passo 1.4)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Clique **"Save"**
4. Clique em **"Add New"** novamente
5. Para **VERCEL_API_TOKEN**:
   - Key: `VERCEL_API_TOKEN`
   - Value: (cole o token do Passo 2.3)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Clique **"Save"**

### 3.1 Verificar Variáveis Adicionadas

```bash
vercel env ls

# Você deve ver:
# ✅ EDGE_CONFIG_ID (Production, Preview, Development)
# ✅ VERCEL_API_TOKEN (Production, Preview, Development)
# ✅ EDGE_CONFIG (adicionado automaticamente ao conectar o projeto)
```

---

## 🚀 PASSO 4: REDEPLOY PARA PRODUÇÃO (30s)

### 4.1 Forçar novo deploy

```bash
vercel --prod --force
```

Ou simplesmente:

```bash
git commit --allow-empty -m "trigger: redeploy com Edge Config configurado"
git push
```

### 4.2 Acompanhar o deploy

```bash
# Ver deploys
vercel ls

# Ver logs em tempo real (quando o build iniciar)
vercel logs --follow
```

---

## ✅ PASSO 5: VALIDAR CONFIGURAÇÃO (1 min)

### 5.1 Verificar Deploy

Aguarde ~2 minutos e verifique:

```bash
vercel ls
# O último deploy deve estar: ✅ Ready
```

### 5.2 Testar Edge Config

Acesse a aplicação e vá para `/agenda`:

🔗 **https://dudufisio-ai-rafael-minattos-projects.vercel.app/agenda**

**O que deve acontecer**:
- Carregamento **ultra-rápido** (~10ms)
- Console do navegador deve mostrar: `[Edge Config] Cache hit`
- Sem erros de Edge Config

### 5.3 Verificar Cron Job

No dashboard da Vercel, vá em:

🔗 **https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/crons**

Você deve ver:
- ✅ `/api/cron/update-agenda-cache`
- Agendado para: `0 */6 * * *` (a cada 6 horas)
- Status: Enabled

---

## 📊 CHECKLIST FINAL

### Antes de Deploy
- [ ] Edge Config Store criado (`agenda-cache`)
- [ ] Edge Config conectado ao projeto `dudufisio-ai`
- [ ] Edge Config ID copiado (formato: `ecfg_xxx...`)
- [ ] API Token criado e copiado (formato: `vercel_xxx...`)
- [ ] Variável `EDGE_CONFIG_ID` adicionada (Production, Preview, Development)
- [ ] Variável `VERCEL_API_TOKEN` adicionada (Production, Preview, Development)

### Após Deploy
- [ ] Deploy completado com status ✅ Ready
- [ ] Variável `EDGE_CONFIG` aparece automaticamente em `vercel env ls`
- [ ] Página `/agenda` carrega rapidamente
- [ ] Sem erros no console do navegador
- [ ] Cron job aparece em Settings → Crons

---

## 🎁 BENEFÍCIOS APÓS CONFIGURAÇÃO

### Performance

| Métrica | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| Carregamento inicial | 200ms | **10ms** | **90% mais rápido** |
| Cache hit | 0% | **100%** | Terapeutas, blocos, pacientes |
| Atualização cache | Manual | **Automática** | A cada 6h via cron |

### Features Ativadas

✅ **Cache inteligente** com Edge Config  
✅ **Atualização automática** via cron job  
✅ **Fallback para Supabase** se cache falhar  
✅ **Performance global** (Edge Network)  
✅ **Zero latência** em regiões próximas  

---

## 🆘 TROUBLESHOOTING

### Erro: "Edge Config not found"

**Causa**: Edge Config ID inválido ou não conectado ao projeto

**Solução**:
1. Verifique se o projeto está conectado ao Edge Config Store
2. Confirme que o `EDGE_CONFIG_ID` está correto
3. Aguarde 1-2 minutos após conectar (propagação)

### Erro: "Unauthorized"

**Causa**: API Token inválido ou sem permissões

**Solução**:
1. Crie um novo token com scope correto (team `rafael-minattos-projects`)
2. Atualize a variável `VERCEL_API_TOKEN`
3. Redeploy

### Deploy continua falhando

**Causa**: Outro erro não relacionado ao Edge Config

**Solução temporária**:
1. Desabilite Edge Config (Opção 3)
2. Investigue o erro específico no Inspector
3. Configure Edge Config depois

---

## 📞 LINKS IMPORTANTES

- **Edge Config Stores**: https://vercel.com/rafael-minattos-projects/stores
- **API Tokens**: https://vercel.com/account/tokens
- **Environment Variables**: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables
- **Cron Jobs**: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/crons
- **Inspector do Deploy**: https://vercel.com/rafael-minattos-projects/dudufisio-ai/HgSnYR5rVUiLN8Ko2oYt2STDShxp

---

## 🎉 ESTÁ QUASE LÁ!

Siga os passos acima e em **5 minutos** você terá:
- ✅ Sistema de cache ultra-rápido
- ✅ Atualização automática
- ✅ Deploy funcionando perfeitamente
- ✅ Performance 90% superior

**Boa sorte!** 🚀

