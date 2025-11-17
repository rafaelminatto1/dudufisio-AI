# 🚨 Ações Urgentes Necessárias no Dashboard da Vercel

**Data:** 17 de Novembro de 2025

## ❌ Problema Crítico Identificado

No dashboard da Vercel, o deploy de produção está usando configurações do **projeto Vite antigo**:

### Production Overrides (Atual - INCORRETO)

- **Framework:** `Vite` ❌
- **Build Command:** `npx cross-env NODE_OPTIONS=--max_old_space_size=4096 npm run vercel-build` ❌
- **Output Directory:** `dist` ❌
- **Install Command:** `npm ci --no-audit --prefer-offline --force` ❌

### O Que Deveria Ser (Next.js)

- **Framework:** `Next.js` ✅
- **Build Command:** `npm run build` (ou vazio para detecção automática) ✅
- **Output Directory:** **VAZIO** (Next.js usa `.next` automaticamente) ✅
- **Install Command:** `npm install` (ou vazio) ✅

## ✅ Ações Necessárias no Dashboard

### Passo 1: Acessar Build and Deployment Settings

1. Acesse: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/build-and-deployment
2. Na seção **"Framework Settings"**, clique em **"Project Settings"** (não "Production Overrides")

### Passo 2: Configurar Framework

1. **Framework Preset:** Selecione **"Next.js"**
   - Se não aparecer, deixe vazio para detecção automática

### Passo 3: Configurar Build Settings

1. **Build Command:** 
   - Deixe vazio (Next.js detecta automaticamente)
   - OU configure: `npm run build`

2. **Output Directory:** 
   - ⚠️ **CRÍTICO:** Deixe **COMPLETAMENTE VAZIO**
   - ❌ NÃO coloque `dist`
   - ❌ NÃO coloque `.next`
   - ✅ Deixe vazio para Next.js usar `.next` automaticamente

3. **Install Command:**
   - Deixe vazio (usa `npm install` por padrão)
   - OU configure: `npm install`

4. **Development Command:**
   - Deixe vazio (usa `npm run dev` por padrão)
   - OU configure: `npm run dev`

### Passo 4: Salvar

1. Clique em **"Save"**
2. Aguarde a confirmação

### Passo 5: Forçar Novo Deploy

Após salvar, force um novo deploy:

**Opção A: Via Dashboard**
1. Vá em **Deployments**
2. Clique em **"Redeploy"** no último deploy com erro
3. Ou faça um novo push para `main`

**Opção B: Via CLI**
```bash
vercel --prod
```

## 📊 Status Atual vs Esperado

| Configuração | Atual (Vite) | Esperado (Next.js) | Status |
|-------------|--------------|-------------------|--------|
| Framework | Vite | Next.js | ❌ Precisa corrigir |
| Build Command | `npm run vercel-build` | `npm run build` | ❌ Precisa corrigir |
| Output Directory | `dist` | Vazio | ❌ Precisa corrigir |
| Root Directory | Vazio | Vazio | ✅ Correto |
| Node.js Version | 22.x | 22.x | ✅ Correto |

## ⚠️ Por Que Isso Está Acontecendo?

O deploy de produção atual (`dudufisio-i12tufksw`) foi feito quando o projeto ainda era Vite. Essas configurações ficaram como "Production Overrides" e estão sendo usadas para todos os novos deploys.

**Solução:** Atualizar as configurações do projeto para Next.js no dashboard.

---

**Status:** ❌ **NÃO RESOLVIDO** - Ação urgente necessária no dashboard da Vercel

