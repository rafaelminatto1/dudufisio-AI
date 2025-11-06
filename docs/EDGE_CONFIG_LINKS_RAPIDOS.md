# ⚡ EDGE CONFIG - LINKS RÁPIDOS

**Tempo total**: 5 minutos

---

## 🎯 PASSO 1: CRIAR EDGE CONFIG (2 min)

### Link para criar:
🔗 **https://vercel.com/rafael-minattos-projects/stores**

**Ações**:
1. ✅ Clique em "Create Store"
2. ✅ Selecione "Edge Config"
3. ✅ Nome: `agenda-cache`
4. ✅ Region: Global ou iad1
5. ✅ Create

**Depois de criar**:
6. ✅ Settings → Connected Projects
7. ✅ Conecte ao projeto: `dudufisio-ai`
8. ✅ Marque: Production, Preview, Development
9. ✅ Connect

**Copiar ID**:
10. ✅ Settings → Edge Config ID (formato: `ecfg_xxx...`)
11. ✅ **COPIE E GUARDE**

---

## 🔑 PASSO 2: CRIAR TOKEN (1 min)

### Link para criar token:
🔗 **https://vercel.com/account/tokens**

**Ações**:
1. ✅ Clique "Create Token"
2. ✅ Nome: `Edge Config API - DuduFisio`
3. ✅ Scope: `rafael-minattos-projects`
4. ✅ Expiration: No Expiration
5. ✅ Create Token
6. ✅ **COPIE O TOKEN IMEDIATAMENTE** (só mostra 1 vez!)

---

## 🔧 PASSO 3: ADICIONAR VARIÁVEIS (2 min)

### Via CLI (RECOMENDADO):

Copie e cole estes comandos no terminal (um de cada vez):

```powershell
# Comando 1: Adicionar EDGE_CONFIG_ID
vercel env add EDGE_CONFIG_ID

# Quando pedir o valor, cole o ID copiado no Passo 1
# Quando pedir environments, selecione: Production, Preview, Development
```

```powershell
# Comando 2: Adicionar VERCEL_API_TOKEN
vercel env add VERCEL_API_TOKEN

# Quando pedir o valor, cole o token copiado no Passo 2
# Quando pedir environments, selecione: Production, Preview, Development
```

### Ou via Dashboard:

🔗 **https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables**

---

## 🚀 PASSO 4: REDEPLOY (30s)

```bash
# Opção 1: Deploy vazio
git commit --allow-empty -m "trigger: redeploy com Edge Config configurado"
git push

# Opção 2: Forçar redeploy
vercel --prod --force
```

---

## ✅ PASSO 5: VERIFICAR

```bash
# Ver status
vercel ls

# Deve mostrar: ✅ Ready (não ERROR)
```

---

## 📋 CHECKLIST RÁPIDO

```
[ ] Passo 1: Edge Config criado e conectado
[ ] Passo 2: API Token criado e copiado
[ ] Passo 3: Variáveis adicionadas (EDGE_CONFIG_ID, VERCEL_API_TOKEN)
[ ] Passo 4: Redeploy executado
[ ] Passo 5: Deploy está ✅ Ready
```

---

## 🎉 APÓS CONFIGURAR

**Performance esperada**:
- ⚡ 10ms de carregamento (era 200ms)
- 🔄 Cache atualizado automaticamente a cada 6h
- 🌍 Distribuído globalmente via Edge Network

**Como testar**:
1. Abra: https://dudufisio-ai-rafael-minattos-projects.vercel.app/agenda
2. Abra o console do navegador (F12)
3. Procure por: `[Edge Config] Cache hit` ou `[Edge Config] Loaded from cache`
4. Veja o tempo de resposta (<20ms)

---

**Tudo pronto!** 🚀

Se tiver dúvidas, consulte: `GUIA_CONFIGURACAO_EDGE_CONFIG_PASSO_A_PASSO.md`

