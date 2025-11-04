# 📘 Runbook: Problemas de Cache em Deployments

**Última Atualização:** 4 de Novembro de 2025
**Severidade:** 🔴 CRÍTICA
**Tempo Estimado de Resolução:** 30-60 minutos

---

## 🎯 Visão Geral

Este runbook documenta procedimentos para diagnosticar e resolver problemas relacionados a cache do Vercel que impedem deployments de refletir código atualizado em produção.

**Problema Típico:** Deploy completa com sucesso (status READY) mas código antigo continua sendo servido aos usuários.

**Causa Raiz Comum:** Build cache do Vercel persiste entre deployments, reutilizando bundles antigos.

---

## 🚨 Sintomas de Problemas de Cache

### Sintomas Críticos (Ação Imediata)
- ✅ Deploy mostra status READY/SUCCESS
- ❌ Erros em produção que não existem no código local
- ❌ Funcionalidades corrigidas continuam quebradas em produção
- ❌ Bundle hash não muda após múltiplos deploys
- ❌ Código em produção difere do código no repositório

### Sintomas Secundários
- Console do browser mostra erros que não reproduzem localmente
- Usuários reportam bugs já corrigidos
- DevTools Network tab mostra bundles com hash antigo
- Vercel build logs mostram "Using cached build"

---

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar Status do Deployment

```bash
# Usando Vercel CLI
vercel list

# Verificar último deployment
vercel ls --limit 1
```

**Resultado Esperado:** Deployment mais recente deve estar READY.

**Se Falhar:** Problema não é cache, investigar build errors.

---

### Passo 2: Comparar Bundle Hash

#### 2.1. Extrair Hash Local (Após Build Local)

```bash
# Build local
npm run build

# Encontrar bundles gerados
ls -lah dist/assets/index-*.js
ls -lah dist/assets/*Page*.js
```

**Anote os hashes** (exemplo: `index-DFUcM4ht.js`)

#### 2.2. Extrair Hash de Produção

**Método A: Browser DevTools**
1. Abrir site em produção
2. Abrir DevTools (F12)
3. Ir para Network tab
4. Refresh (Ctrl+Shift+R para hard refresh)
5. Filtrar por "js"
6. Procurar arquivos `index-*.js` e `*Page*.js`
7. **Anotar os hashes**

**Método B: Usando curl**

```bash
# Baixar HTML da produção
curl https://moocafisio.com.br > prod.html

# Extrair bundles
grep -oP 'index-[a-zA-Z0-9]+\.js' prod.html
grep -oP 'DashboardPageV2-[a-zA-Z0-9]+\.js' prod.html
```

#### 2.3. Comparar Hashes

```bash
# Hash local
Local:  index-DFUcM4ht.js

# Hash produção
Prod:   index-3s1VuaRW.js

# Resultado: DIFERENTE = OK
# Resultado: IGUAL após deploy = 🚨 PROBLEMA DE CACHE
```

**Se Hashes Iguais:** Confirma problema de cache → Ir para Seção "Solução".

---

### Passo 3: Verificar Build Logs

```bash
# Ver logs do último deployment
vercel logs [deployment-url]

# Procurar por:
# - "Using cached build"
# - "Cache hit"
# - "Restoring from cache"
```

**Se Encontrar Mensagens de Cache:** Confirma cache sendo usado → Ir para Seção "Solução".

---

### Passo 4: Testar Funcionalidade em Produção

**Automatizado (Recomendado):**

```bash
# Usar script de validação
node scripts/validate-deployment.js
```

**Manual:**
1. Abrir site em produção
2. Abrir DevTools Console
3. Navegar para página afetada
4. Verificar erros no console
5. Testar funcionalidade quebrada

**Se Erro Reproduz em Produção mas Não Local:** Confirma problema de cache.

---

## 🛠️ Solução: Force Rebuild

### Solução Rápida (Recomendada)

**Tempo:** ~20-30 minutos

```bash
# 1. Criar empty commit para forçar rebuild
git commit --allow-empty -m "chore: force vercel rebuild without cache

Problema: Cache do Vercel servindo bundle antigo
Solução: Empty commit força rebuild completo
Refs: RUNBOOK_CACHE_DEPLOYMENT_ISSUES.md"

# 2. Push para trigger deploy
git push origin main

# 3. Aguardar build completar (~5-10 minutos)
# Monitorar em: https://vercel.com/dudufisio-ai/dudufisio-ai/deployments

# 4. Validar após deployment READY
node scripts/validate-deployment.js
```

---

### Solução Alternativa A: Vercel CLI Force Redeploy

```bash
# Redeploy forçado com Vercel CLI
vercel --force

# Aguardar build
vercel inspect [deployment-url]
```

---

### Solução Alternativa B: Vercel Dashboard

1. Ir para [Vercel Dashboard](https://vercel.com/dudufisio-ai/dudufisio-ai)
2. Selecionar deployment mais recente
3. Clicar "..." (três pontos)
4. Selecionar "Redeploy"
5. **IMPORTANTE:** Marcar checkbox "Use existing Build Cache" = **DESMARCADO**
6. Confirmar redeploy

---

### Solução Alternativa C: Clear Build Cache Manualmente

**⚠️ Requer permissões de admin no Vercel**

1. Vercel Dashboard → Project Settings
2. Ir para "Build & Development Settings"
3. Procurar "Build Cache"
4. Clicar "Clear Cache"
5. Fazer novo deploy:
   ```bash
   git commit --allow-empty -m "chore: rebuild after cache clear"
   git push origin main
   ```

---

## ✅ Validação da Solução

### Checklist Pós-Deploy

- [ ] Deployment status = READY
- [ ] Bundle hash mudou (comparar com hash antigo)
- [ ] Site acessível (HTTP 200)
- [ ] Endpoints críticos funcionando:
  - [ ] `/login`
  - [ ] `/dashboard`
  - [ ] `/agenda`
  - [ ] `/patients`
- [ ] Erro original não reproduz em produção
- [ ] Console do browser limpo (zero erros relacionados)
- [ ] Funcionalidade testada manualmente funciona

### Script de Validação Automatizada

```bash
# Executar script de validação completo
node scripts/validate-deployment.js

# Resultado esperado:
# ✅ VALIDAÇÃO PASSOU: 4/4 testes
```

---

## 📊 Casos de Uso Reais

### Caso 1: Hotfix de 3 Nov 2025 (ReferenceError)

**Sintomas:**
- Erro: "ReferenceError: format is not defined"
- Dashboard quebrado em 100% dos casos
- Deploy READY mas erro persistia

**Diagnóstico:**
- Bundle produção: `DashboardPageV2-B2JPofnT.js` (antigo)
- Bundle local: `DashboardPageV2-D0dmqkQv.js` (novo)
- Código local: ✅ Correto (função formatValue existia)

**Solução Aplicada:**
```bash
git commit --allow-empty -m "chore: force vercel rebuild without cache"
git push origin main
```

**Resultado:**
- Novo deployment: `dpl_334ztq7R9RmreAJVpmEUH9PRU488`
- Bundle hash mudou: `B2JPofnT` → `DFUcM4ht`
- Dashboard operacional: ✅
- Tempo total: 62 minutos

**Documentação:** [SESSAO_HOTFIX_03_NOV_2025.md](./SESSAO_HOTFIX_03_NOV_2025.md)

---

## ⚠️ Prevenção

### Checklist Pré-Deploy (Para Deploys Críticos)

**Antes do Deploy:**
- [ ] Testar build local: `npm run build`
- [ ] Verificar sem erros TypeScript: `npm run type-check`
- [ ] Testar preview local: `npm run preview`

**Durante o Deploy:**
- [ ] Monitorar build logs em real-time
- [ ] Verificar se cache está sendo usado excessivamente
- [ ] Aguardar status READY antes de validar

**Após o Deploy:**
- [ ] Executar `node scripts/validate-deployment.js`
- [ ] Verificar bundle hash mudou
- [ ] Testar funcionalidades críticas manualmente
- [ ] Monitorar Sentry por 10-15 minutos

### Monitoramento Contínuo

**Sentry:**
- Configurar alertas para erros críticos em produção
- Threshold: > 5 erros/minuto = alerta imediato

**Vercel:**
- Configurar notificações para build failures
- Revisar build logs semanalmente para patterns de cache

**CI/CD:**
- Integrar `scripts/validate-deployment.js` no pipeline
- Fail deploy se validação não passar

---

## 🆘 Quando Escalar

### Escalar para Time de Infra Se:

- ✅ Force rebuild não resolve após 2 tentativas
- ✅ Cache clear manual não funciona
- ✅ Bundle hash continua igual após empty commit
- ✅ Vercel Dashboard mostra comportamento inconsistente
- ✅ Problema afeta múltiplos projetos

### Escalar para Vercel Support Se:

- ✅ Problema persiste após todas soluções tentadas
- ✅ Cache clear não funciona via Dashboard
- ✅ Build logs mostram erros internos do Vercel
- ✅ Downtime > 2 horas

### Informações para Incluir ao Escalar:

```markdown
**Problema:** Cache serving old bundles after deployment
**Project:** moocafisio.com.br (dudufisio-ai)
**Deployment ID:** [ID do deployment]
**Commit SHA:** [SHA do commit]
**Bundle Hash (Expected):** index-XXXXX.js
**Bundle Hash (Actual):** index-YYYYY.js
**Tentativas de Solução:**
- [ ] Empty commit force rebuild
- [ ] Vercel CLI force redeploy
- [ ] Manual cache clear via Dashboard
**Build Logs:** [Anexar ou link]
**Tempo de Downtime:** [Minutos]
**Impacto:** [% usuários afetados]
```

---

## 📞 Contatos e Recursos

**Vercel Dashboard:**
https://vercel.com/dudufisio-ai/dudufisio-ai

**Repositório:**
https://github.com/rafaelminatto1/dudufisio-AI

**Documentação:**
- [SESSAO_HOTFIX_03_NOV_2025.md](./SESSAO_HOTFIX_03_NOV_2025.md) - Hotfix case study
- [HOTFIX_PRODUCTION_ERROR.md](./HOTFIX_PRODUCTION_ERROR.md) - Detailed hotfix documentation
- [scripts/validate-deployment.js](./scripts/validate-deployment.js) - Validation script

**Vercel Support:**
https://vercel.com/support

**Sentry:**
https://sentry.io/organizations/moocafisio

---

## 📝 Changelog do Runbook

### v1.0.0 - 4 Nov 2025
- Versão inicial criada após hotfix de 3 Nov 2025
- Documentação baseada em caso real de cache do Vercel
- Inclui scripts de validação automatizada
- Procedimentos testados e validados em produção

---

## 🔐 Comandos de Emergência (Quick Reference)

```bash
# Diagnóstico rápido
npm run build && ls -lah dist/assets/index-*.js
curl https://moocafisio.com.br | grep -oP 'index-[a-zA-Z0-9]+\.js'

# Solução rápida
git commit --allow-empty -m "chore: force rebuild"
git push origin main

# Validação rápida
node scripts/validate-deployment.js
```

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**
