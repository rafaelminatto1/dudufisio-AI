# 📋 Guia Completo: Como Configurar o `.env.local`

## 🎯 O que é o `.env.local`?

O arquivo `.env.local` contém todas as variáveis de ambiente necessárias para o sistema funcionar. Ele **NÃO deve ser commitado no Git** (já está no `.gitignore`).

## 📝 Como Criar o Arquivo

### Passo 1: Criar o arquivo

Na raiz do projeto, crie um arquivo chamado `.env.local`:

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType File
```

**Linux/Mac:**
```bash
touch .env.local
```

**Ou manualmente:**
- Crie um novo arquivo na raiz do projeto
- Nome: `.env.local` (com o ponto no início)
- Sem extensão

### Passo 2: Obter as Credenciais

## 🔑 Credenciais Necessárias

### 1. Supabase (Obrigatório)

#### Como obter:

1. Acesse [Supabase Dashboard](https://app.supabase.com/)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie os valores:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

**Onde encontrar:**
- **URL**: Na seção "Project URL"
- **Anon Key**: Na seção "Project API keys" → `anon` `public`
- **Service Role Key**: Na seção "Project API keys" → `service_role` `secret` ⚠️ **MANTENHA SECRETO!**

### 2. WhatsApp Business API (Já configurado)

Você já forneceu as credenciais, então use:

```env
# WhatsApp Business API
WHATSAPP_PROVIDER=whatsapp_business
WHATSAPP_API_KEY=EAAjPUGyZBQPoBP6VPXKdgqOPBzvmuxzQkaq1gzxl6ALoGtVTC3kI1keAWMm60AA3gt8JCl1KvlENDULm7buBSFLvqnRC6GTBU601Ba3IceXBo7XR6kLIu6fqFHDfko3TTRLwQeajNrcCfmYvMHQGdRwRD0TAQcGvm0fZAFs2kNkamkerJn2IxLljKsRsyOkgZDZD
WHATSAPP_PHONE_NUMBER_ID=779431901927431
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
WHATSAPP_FROM_NUMBER=+551158749885
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_token_seguro_aqui
```

**Nota**: Crie um token seguro para `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (ex: use um gerador de senha)

### 3. Resend Email (Já configurado)

Você já forneceu a API key:

```env
# Email (Resend)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg
EMAIL_FROM=noreply@dudufisio.com
```

**Nota**: Você precisará verificar um domínio no Resend para usar um email personalizado. Por enquanto, pode usar o domínio padrão do Resend.

### 4. Outras Variáveis

```env
# Cron Jobs (para lembretes automáticos)
CRON_SECRET=seu_secret_key_aqui

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Para gerar `CRON_SECRET`**:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou use um gerador online: https://randomkeygen.com/
```

## 📄 Arquivo Completo `.env.local`

Cole este conteúdo no seu arquivo `.env.local` e substitua os valores:

```env
# ============================================
# SUPABASE (OBRIGATÓRIO)
# ============================================
# Obtenha em: https://app.supabase.com → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# ============================================
# WHATSAPP BUSINESS API
# ============================================
WHATSAPP_PROVIDER=whatsapp_business
WHATSAPP_API_KEY=EAAjPUGyZBQPoBP6VPXKdgqOPBzvmuxzQkaq1gzxl6ALoGtVTC3kI1keAWMm60AA3gt8JCl1KvlENDULm7buBSFLvqnRC6GTBU601Ba3IceXBo7XR6kLIu6fqFHDfko3TTRLwQeajNrcCfmYvMHQGdRwRD0TAQcGvm0fZAFs2kNkamkerJn2IxLljKsRsyOkgZDZD
WHATSAPP_PHONE_NUMBER_ID=779431901927431
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
WHATSAPP_FROM_NUMBER=+551158749885
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_token_seguro_aqui

# ============================================
# EMAIL (RESEND)
# ============================================
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg
EMAIL_FROM=noreply@dudufisio.com

# ============================================
# CRON JOBS
# ============================================
# Gere um token seguro para proteger os cron jobs
CRON_SECRET=seu_secret_key_aqui

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# OPCIONAL: STRIPE (se usar pagamentos online)
# ============================================
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🔍 Como Verificar se Está Funcionando

### 1. Verificar Supabase

No terminal, execute:

```bash
npm run dev
```

Se não houver erros de conexão, está funcionando!

### 2. Verificar Variáveis no Código

Crie um arquivo temporário `test-env.ts`:

```typescript
// test-env.ts
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('WhatsApp Provider:', process.env.WHATSAPP_PROVIDER);
console.log('Email Provider:', process.env.EMAIL_PROVIDER);
```

**⚠️ IMPORTANTE**: Variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente. Use apenas para valores públicos.

## 🚨 Problemas Comuns

### "Variável não encontrada"

- ✅ Verifique se o arquivo se chama exatamente `.env.local` (com ponto)
- ✅ Verifique se está na raiz do projeto
- ✅ Reinicie o servidor de desenvolvimento (`npm run dev`)

### "Erro de conexão Supabase"

- ✅ Verifique se copiou a URL completa (com `https://`)
- ✅ Verifique se as keys estão corretas (sem espaços extras)
- ✅ Verifique se o projeto Supabase está ativo

### "WhatsApp não funciona"

- ✅ Verifique se o token ainda é válido (tokens expiram)
- ✅ Verifique se o `WHATSAPP_PHONE_NUMBER_ID` está correto
- ✅ Verifique se o webhook está configurado no Facebook Developers

## 📚 Recursos

- [Supabase Docs - Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Next.js Docs - Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Resend Docs](https://resend.com/docs)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)

## ✅ Checklist

- [ ] Arquivo `.env.local` criado na raiz do projeto
- [ ] Credenciais do Supabase configuradas
- [ ] Credenciais do WhatsApp configuradas
- [ ] Credenciais do Resend configuradas
- [ ] `CRON_SECRET` gerado e configurado
- [ ] `WHATSAPP_WEBHOOK_VERIFY_TOKEN` gerado
- [ ] Servidor reiniciado após criar o arquivo
- [ ] Testado conexão com Supabase

---

**⚠️ LEMBRE-SE**: Nunca commite o arquivo `.env.local` no Git! Ele já está no `.gitignore`.

