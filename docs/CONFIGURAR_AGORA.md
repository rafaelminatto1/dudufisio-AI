# ⚡ CONFIGURAR EDGE CONFIG - AGORA!

## 🚀 INSTRUÇÕES ULTRA-RÁPIDAS (5 min)

---

### ✅ PASSO 1: Criar Edge Config

1. Abra: **https://vercel.com/rafael-minattos-projects/stores**
2. Create Store → Edge Config
3. Nome: `agenda-cache`
4. Create
5. Connect Project → selecione `dudufisio-ai` → marque todos os ambientes → Connect
6. **COPIE o Edge Config ID** (Settings → vai aparecer algo como `ecfg_abc123...`)

---

### ✅ PASSO 2: Criar Token

1. Abra: **https://vercel.com/account/tokens**
2. Create Token
3. Nome: `Edge Config API`
4. Scope: `rafael-minattos-projects`
5. Expiration: No Expiration
6. Create
7. **COPIE O TOKEN IMEDIATAMENTE** (só mostra 1 vez!)

---

### ✅ PASSO 3: Adicionar no Terminal

**APÓS COPIAR OS DOIS VALORES**, volte aqui e execute:

```bash
# Você vai colar os valores quando pedir
vercel env add EDGE_CONFIG_ID
# Cole o ID (ecfg_...)
# Selecione: Production, Preview, Development

vercel env add VERCEL_API_TOKEN
# Cole o token (vercel_...)
# Selecione: Production, Preview, Development
```

---

### ✅ PASSO 4: Redeploy

```bash
git commit --allow-empty -m "trigger: redeploy com Edge Config"
git push
```

---

### ✅ PASSO 5: Verificar (aguarde ~2 min)

```bash
vercel ls
# Deve mostrar ✅ Ready
```

---

## 🎯 VALORES QUE VOCÊ VAI PRECISAR

Ao fazer os passos acima, anote aqui:

```
EDGE_CONFIG_ID=_______________________________________________
(vai ser algo como: ecfg_abc123xyz789...)

VERCEL_API_TOKEN=______________________________________________
(vai ser algo como: vercel_abc123xyz789... - MUITO LONGO ~200 chars)
```

---

**Vá agora!** Após adicionar os valores, o sistema vai funcionar automaticamente! ✨

