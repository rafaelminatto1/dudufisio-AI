# 🚀 Resumo Rápido: Como Obter o `.env.local`

## ⚡ Método Rápido (3 Passos)

### 1️⃣ Criar o Arquivo

**PowerShell:**
```powershell
New-Item -Path .env.local -ItemType File
```

**Ou manualmente:**
- Crie um arquivo chamado `.env.local` na raiz do projeto

### 2️⃣ Obter Credenciais do Supabase

1. Acesse: https://app.supabase.com/
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3️⃣ Preencher o Arquivo

Cole este template no `.env.local` e substitua os valores do Supabase:

```env
# SUPABASE (OBRIGATÓRIO - Obtenha em app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# WHATSAPP (Já configurado)
WHATSAPP_PROVIDER=whatsapp_business
WHATSAPP_API_KEY=EAAjPUGyZBQPoBP6VPXKdgqOPBzvmuxzQkaq1gzxl6ALoGtVTC3kI1keAWMm60AA3gt8JCl1KvlENDULm7buBSFLvqnRC6GTBU601Ba3IceXBo7XR6kLIu6fqFHDfko3TTRLwQeajNrcCfmYvMHQGdRwRD0TAQcGvm0fZAFs2kNkamkerJn2IxLljKsRsyOkgZDZD
WHATSAPP_PHONE_NUMBER_ID=779431901927431
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
WHATSAPP_FROM_NUMBER=+551158749885
WHATSAPP_WEBHOOK_VERIFY_TOKEN=gerar_token_seguro_aqui

# EMAIL (Já configurado)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg
EMAIL_FROM=noreply@dudufisio.com

# CRON
CRON_SECRET=gerar_secret_aqui

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 🔑 Gerar Tokens

**WHATSAPP_WEBHOOK_VERIFY_TOKEN e CRON_SECRET:**

```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Ou use: https://randomkeygen.com/

## 📚 Documentação Completa

- `GUIA_ENV_LOCAL.md` - Guia completo passo a passo
- `COMO_OBTER_CREDENCIAIS.md` - Como obter cada credencial
- `scripts/generate-env-local.ps1` - Script automático

## ✅ Após Criar

1. Reinicie o servidor: `npm run dev`
2. Teste a conexão com Supabase
3. Verifique se não há erros no console

---

**⚠️ LEMBRE-SE**: Nunca commite `.env.local` no Git!

