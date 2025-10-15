# 🔧 Configuração de Variáveis de Ambiente na Vercel

**Projeto:** dudufisio-ai
**Dashboard:** https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables

---

## 📋 Variáveis Necessárias

### 1. Supabase (Obrigatório)

```bash
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA
```

**⚠️ IMPORTANTE:** 
- Não adicionar `VITE_SUPABASE_SERVICE_ROLE_KEY` no frontend (apenas backend)
- Keys começam com `VITE_` para serem expostas no bundle do Vite

### 2. Gemini AI (Opcional)

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Como obter:** https://makersuite.google.com/app/apikey

### 3. Sentry (Opcional - Monitoramento)

```bash
VITE_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token
```

**Como obter:** https://sentry.io/settings/

---

## 📖 Como Configurar (Passo a Passo)

### Via Vercel Dashboard (Recomendado)

1. **Acessar Settings:**
   - https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables

2. **Adicionar Variável:**
   - Clicar em "Add New"
   - Nome: `VITE_SUPABASE_URL`
   - Value: `https://urfxniitfbbvsaskicfo.supabase.co`
   - Environment: Marcar `Production`, `Preview`, `Development`
   - Clicar em "Save"

3. **Repetir para cada variável:**
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` (se tiver)

4. **Redeploy:**
   - Ir para Deployments
   - Selecionar o último deploy
   - Clicar em "Redeploy"
   - Ou fazer novo push no GitHub

---

### Via Vercel CLI

```bash
# Instalar Vercel CLI (se necessário)
npm i -g vercel

# Autenticar
vercel login

# Adicionar variáveis
vercel env add VITE_SUPABASE_URL production
# Cole o valor quando solicitado: https://urfxniitfbbvsaskicfo.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Cole a key quando solicitado

# Listar variáveis configuradas
vercel env ls

# Redeploy
vercel --prod
```

---

## ✅ Validação

Após configurar e redeploy:

1. **Verificar no build log:**
   - As variáveis devem aparecer como "Using environment variables"

2. **Testar em produção:**
   ```bash
   # No console do navegador (F12)
   console.log(import.meta.env.VITE_SUPABASE_URL)
   # Deve mostrar a URL, não undefined
   ```

3. **Verificar funcionalidades:**
   - Login deve funcionar
   - Dados do Supabase devem carregar
   - CRM deve conectar

---

## 🔒 Segurança

### ✅ Boas Práticas

- ✅ Usar `VITE_` prefix para variáveis públicas
- ✅ Nunca expor SERVICE_ROLE_KEY no frontend
- ✅ Usar anon key (já tem RLS configurado)
- ✅ Não commitar .env.local
- ✅ Rotacionar keys periodicamente

### ❌ Não Fazer

- ❌ Não adicionar secrets diretamente no código
- ❌ Não expor service_role_key no frontend
- ❌ Não compartilhar keys publicamente
- ❌ Não usar mesmas keys em dev/prod (idealmente)

---

## 📝 Template .env.local

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA

# Gemini AI (Optional)
# VITE_GEMINI_API_KEY=your_key_here

# Sentry (Optional)
# VITE_SENTRY_DSN=your_dsn_here
```

---

## 🎯 Próximos Passos

Após configurar env vars:

1. ✅ Fazer redeploy na Vercel
2. ✅ Aguardar build completar
3. ✅ Testar site em produção
4. ✅ Verificar console do navegador
5. ✅ Validar conexão Supabase funcionando

---

**Última atualização:** $(date)

