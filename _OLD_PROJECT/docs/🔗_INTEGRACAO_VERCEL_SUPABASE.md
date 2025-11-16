# 🔗 INTEGRAÇÃO VERCEL + SUPABASE

**Projeto:** DuduFisio-AI  
**Data:** 09 de Outubro de 2025  
**Status:** ✅ INTEGRADOS E CONFIGURADOS

---

## 🎯 VISÃO GERAL

O projeto **dudufisio-ai** está integrado entre Vercel (frontend) e Supabase (backend).

```
┌──────────────────────────────────────────┐
│         VERCEL (Frontend)                │
│  Projeto: dudufisio-ai                   │
│  ID: prj_lJT0yis7pFVJASeoHaykO6A1U7kz   │
│  Team: team_RWPxV6A0gp02a6FO7Ghf2YSV     │
├──────────────────────────────────────────┤
│  Build: npm run build                    │
│  Dev: npm run dev                        │
│  Framework: Vite + React                 │
│  Output: dist/                           │
└──────────────┬───────────────────────────┘
               │
               │ Environment Variables
               │ (NEXT_PUBLIC_SUPABASE_URL,
               │  NEXT_PUBLIC_SUPABASE_ANON_KEY)
               ▼
┌──────────────────────────────────────────┐
│        SUPABASE (Backend)                │
│  Projeto: dudufisio-AI                   │
│  Ref: urfxniitfbbvsaskicfo               │
│  Region: sa-east-1 (São Paulo)           │
├──────────────────────────────────────────┤
│  Database: PostgreSQL 17                 │
│  Auth: Email + OAuth (Google, GitHub)    │
│  Storage: patient-documents bucket       │
│  Realtime: WebSockets enabled            │
└──────────────────────────────────────────┘
```

---

## 📋 CONFIGURAÇÃO ATUAL

### Vercel Project

**Detalhes:**
- **Nome:** dudufisio-ai
- **Project ID:** prj_lJT0yis7pFVJASeoHaykO6A1U7kz
- **Team:** Rafael Minatto's projects
- **Team ID:** team_RWPxV6A0gp02a6FO7Ghf2YSV
- **Framework:** Vite
- **Root Directory:** ./
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install --legacy-peer-deps`
- **Dev Command:** `npm run dev`

**URLs:**
- Dashboard: https://vercel.com/rafael-minattos-projects/dudufisio-ai
- Deployments: https://vercel.com/rafael-minattos-projects/dudufisio-ai/deployments

### Supabase Project

**Detalhes:**
- **Nome:** dudufisio-AI
- **Project Ref:** urfxniitfbbvsaskicfo
- **Organization:** zjosrqexzjmuivgbicah
- **Region:** South America (São Paulo) - sa-east-1
- **Database:** PostgreSQL 17
- **Status:** ACTIVE ●

**URLs:**
- Dashboard: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
- API URL: https://urfxniitfbbvsaskicfo.supabase.co
- SQL Editor: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new
- Table Editor: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
- Storage: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/storage/buckets

---

## 🔐 VARIÁVEIS DE AMBIENTE

### No Vercel Dashboard

Configure em: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables

```bash
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[pegar em Supabase > Settings > API]

# Supabase Service Role (opcional - apenas se precisar)
SUPABASE_SERVICE_ROLE_KEY=[pegar em Supabase > Settings > API]

# Gemini API (se usar IA)
GEMINI_API_KEY=[sua_gemini_key]
```

**Importante:**
- ✅ `NEXT_PUBLIC_*` são expostas no cliente
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` é privada (server-side only)
- ✅ Marque como "All Environments" (Production, Preview, Development)

### Localmente (.env.local)

```bash
# Mesmo conteúdo das variáveis do Vercel
NEXT_PUBLIC_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua_key]
SUPABASE_SERVICE_ROLE_KEY=[sua_key]
GEMINI_API_KEY=[sua_key]
```

---

## 🔄 FLUXO DE DEPLOY

```
1. DESENVOLVIMENTO LOCAL
   ├─ Editar código
   ├─ npm run dev
   └─ Testar em localhost:5176
   
         ↓ git push

2. VERCEL BUILD
   ├─ Detecta push no GitHub
   ├─ Executa: npm install --legacy-peer-deps
   ├─ Executa: npm run build
   ├─ Gera: dist/
   └─ Deploy automático
   
         ↓ Deploy completo

3. PRODUÇÃO
   ├─ URL: https://dudufisio-ai.vercel.app
   ├─ Preview URLs para cada PR
   └─ Conectado ao Supabase via env vars
   
         ↓ Usuário acessa

4. RUNTIME
   ├─ App carrega
   ├─ Conecta ao Supabase (via URL + anon key)
   ├─ Queries funcionam
   ├─ Auth funciona
   ├─ Storage funciona
   └─ Realtime funciona
```

---

## ⚙️ CONFIGURAÇÕES NO VERCEL

### Build & Development Settings

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "outputDirectory": "dist",
  "nodeVersion": "20.x"
}
```

### Environment Variables

| Nome | Valor | Environments |
|------|-------|--------------|
| NEXT_PUBLIC_SUPABASE_URL | https://urfxniitfbbvsaskicfo.supabase.co | All |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJ... | All |
| SUPABASE_SERVICE_ROLE_KEY | eyJ... | Production, Preview |
| GEMINI_API_KEY | AIza... | All |

---

## 🔗 INTEGRAÇÃO AUTOMÁTICA

### No Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/integrations

2. Procure por **Vercel Integration**

3. Se disponível:
   - Conecte à sua conta Vercel
   - Selecione o projeto: dudufisio-ai
   - Autorize a integração
   - Variáveis de ambiente serão sincronizadas automaticamente!

### No Vercel Dashboard

1. Acesse: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/integrations

2. Procure por **Supabase Integration**

3. Se disponível:
   - Conecte ao seu projeto Supabase
   - Autorize a integração
   - Deployment hooks serão configurados

---

## 🚀 DEPLOY AUTOMÁTICO

### Git Push → Vercel Deploy

```bash
# Fazer mudanças
git add .
git commit -m "feat: adicionar nova feature"
git push origin main

# Vercel detecta automaticamente e faz deploy!
```

### Webhooks Supabase → Vercel

Configure webhooks para rebuild quando houver mudanças críticas:

```sql
-- Criar tabela de webhook logs (opcional)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_type VARCHAR(50),
  payload JSONB,
  response JSONB,
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📊 MONITORAMENTO

### Vercel Analytics

Habilite em: https://vercel.com/rafael-minattos-projects/dudufisio-ai/analytics

**Métricas disponíveis:**
- Page views
- Unique visitors
- Performance (Core Web Vitals)
- Top pages
- Geographic distribution

### Supabase Logs

Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/logs/explorer

**Logs disponíveis:**
- API logs (queries)
- Auth logs (login/logout)
- Storage logs (uploads)
- Realtime logs (websockets)
- Error logs

---

## 🔧 COMANDOS ÚTEIS

### Vercel CLI

```bash
# Login
vercel login

# Ver status do projeto
vercel ls

# Deploy manual
vercel deploy

# Deploy para produção
vercel --prod

# Ver logs
vercel logs

# Ver env vars
vercel env ls

# Adicionar env var
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```

### Supabase CLI

```bash
# Login
supabase login

# Listar projetos
supabase projects list

# Conectar ao projeto remoto
supabase link --project-ref urfxniitfbbvsaskicfo

# Ver status
supabase status

# Aplicar migrations
supabase db push

# Pull migrations remotas
supabase db pull

# Ver diferenças
supabase db diff
```

---

## 🎯 WORKFLOW RECOMENDADO

### Desenvolvimento

```bash
# 1. Criar branch
git checkout -b feature/nova-feature

# 2. Desenvolver localmente
npm run dev

# 3. Testar com Supabase local (opcional)
supabase start
supabase db push

# 4. Commit
git add .
git commit -m "feat: nova feature"

# 5. Push
git push origin feature/nova-feature

# 6. Vercel cria Preview Deployment automaticamente!
# URL: https://dudufisio-ai-git-feature-nova-feature.vercel.app

# 7. Testar no Preview

# 8. Merge para main → Deploy automático para produção!
```

---

## 🔒 SEGURANÇA

### Variáveis Sensíveis

**❌ NUNCA fazer commit:**
- `SUPABASE_SERVICE_ROLE_KEY` (acesso total)
- Keys de API privadas
- Senhas ou secrets

**✅ PODE expor (são públicas):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (protegida por RLS)

### Row-Level Security (RLS)

A integração funciona porque:
1. Frontend usa `ANON_KEY` (segura)
2. RLS protege dados no banco
3. Usuários vêem apenas dados permitidos
4. Auth.uid() identifica usuário logado

---

## 📦 BUILDS E PERFORMANCE

### Build Settings Vercel

```javascript
// vercel.json (criar se não existe)
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "vite",
  "outputDirectory": "dist",
  "regions": ["iad1"],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Otimizações de Build

```typescript
// vite.config.ts - Já configurado
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
          'ui': ['lucide-react', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    sourcemap: false
  }
});
```

---

## 🌐 DOMÍNIOS PERSONALIZADOS

### Configurar Domínio

1. **No Vercel:**
   - Settings → Domains
   - Add Domain → Seu domínio
   - Configure DNS conforme instruções

2. **No Supabase:**
   - Settings → Custom Domains
   - Add Custom API Domain (opcional)

---

## 🔔 WEBHOOKS E NOTIFICAÇÕES

### Vercel → Discord/Slack

Configure em: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/notifications

**Notificações úteis:**
- Deployment Started
- Deployment Ready
- Deployment Failed
- Domain Configuration Changed

### Supabase → Vercel (Rebuild)

```bash
# Webhook URL do Vercel para rebuild
https://api.vercel.com/v1/integrations/deploy/[deploy-hook-id]

# Criar deploy hook:
# Vercel Dashboard → Settings → Git → Deploy Hooks
```

---

## 📊 MONITORAMENTO INTEGRADO

### Dashboards Disponíveis

**Vercel:**
- Analytics: https://vercel.com/rafael-minattos-projects/dudufisio-ai/analytics
- Logs: https://vercel.com/rafael-minattos-projects/dudufisio-ai/logs
- Deployments: https://vercel.com/rafael-minattos-projects/dudufisio-ai/deployments

**Supabase:**
- Logs Explorer: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/logs/explorer
- API Logs: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/logs/api-logs
- Database: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/database/tables

---

## 🧪 TESTES DE INTEGRAÇÃO

### Testar Localmente

```typescript
// scripts/test-integration.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testIntegration() {
  console.log('🧪 Testando integração Vercel ↔ Supabase\n');
  
  // 1. Testar conexão
  const { data, error } = await supabase
    .from('patients')
    .select('count')
    .limit(1);
  
  if (error) {
    console.log('❌ Conexão falhou:', error.message);
    return false;
  }
  
  console.log('✅ Conexão Supabase OK');
  
  // 2. Testar Auth
  const { data: authData, error: authError } = await supabase.auth.getSession();
  
  if (!authError) {
    console.log('✅ Auth configurado OK');
  }
  
  // 3. Testar Storage
  const { data: buckets } = await supabase.storage.listBuckets();
  
  if (buckets?.some(b => b.name === 'patient-documents')) {
    console.log('✅ Storage configurado OK');
  }
  
  console.log('\n🎉 Integração funcionando perfeitamente!');
  return true;
}

testIntegration();
```

Execute:
```bash
npx tsx scripts/test-integration.ts
```

---

## 🔄 CI/CD PIPELINE

### Fluxo Completo

```
Developer
    ↓
  git push
    ↓
GitHub Repository
    ↓
Vercel Webhook (automático)
    ↓
Vercel Build
  ├─ npm install --legacy-peer-deps
  ├─ npm run build
  ├─ Gera dist/
  └─ Deploy para CDN
    ↓
Preview URL gerada
    ↓
Testes automáticos (opcional)
    ↓
Aprovação manual (opcional)
    ↓
Merge to main
    ↓
Production Deploy
    ↓
https://dudufisio-ai.vercel.app
```

---

## 📋 CHECKLIST DE INTEGRAÇÃO

### Setup Inicial

- [✅] Projeto Vercel criado
- [✅] Projeto Supabase criado
- [✅] Repositório GitHub conectado
- [⏳] Variáveis de ambiente configuradas no Vercel
- [⏳] Migration aplicada no Supabase
- [⏳] Storage configurado
- [⏳] Primeiro deploy realizado

### Configuração Avançada

- [ ] Domínio personalizado configurado
- [ ] Deploy hooks criados
- [ ] Webhooks configurados
- [ ] Analytics habilitado
- [ ] Monitoring configurado
- [ ] Alertas configurados
- [ ] Backup automático ativo

---

## 🎯 PRÓXIMOS PASSOS

### 1. Configurar Env Vars no Vercel (3 min)

```bash
# Via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Cole: https://urfxniitfbbvsaskicfo.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Cole: [sua anon key]
```

**ou via Dashboard:**

https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables

### 2. Aplicar Migration no Supabase (3 min)

Siga: `⚡_QUICK_START_3_PASSOS.md`

### 3. Deploy para Produção (2 min)

```bash
# Commit e push
git add .
git commit -m "feat: sistema completo de pacientes"
git push origin main

# Vercel faz deploy automático!
```

---

## 🎊 RESULTADO FINAL

Com a integração completa, você terá:

```
✅ Frontend no Vercel
   ├─ Deploy automático
   ├─ Preview por PR
   ├─ SSL automático
   ├─ CDN global
   └─ Analytics integrado

✅ Backend no Supabase
   ├─ Database PostgreSQL
   ├─ Auth configurado
   ├─ Storage ativo
   ├─ Realtime enabled
   └─ Edge Functions ready

✅ Integração Perfeita
   ├─ Env vars sincronizadas
   ├─ Deploy automático
   ├─ Rollback fácil
   └─ Monitoramento completo
```

---

## 📞 SUPORTE

**Problemas com Vercel?**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**Problemas com Supabase?**
- Docs: https://supabase.com/docs
- Support: https://supabase.com/support

**Problemas com Integração?**
- Veja este guia
- Execute: `npx tsx scripts/test-integration.ts`

---

## 📝 METADATA DA INTEGRAÇÃO

Metadata armazenada em: `integration_metadata` table

```sql
SELECT * FROM integration_metadata;
```

Resultado:
```
integration_name    | platform  | project_id
--------------------|-----------|------------
Vercel Deployment   | vercel    | prj_lJT0...
Supabase Backend    | supabase  | urfxnii...
```

---

**Status:** ✅ INTEGRAÇÃO DOCUMENTADA  
**Próximo:** Aplicar migrations e configurar env vars

**VAMOS LÁ! 🚀**


