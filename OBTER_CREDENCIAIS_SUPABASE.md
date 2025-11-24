# 🔑 Como Obter Credenciais do Supabase (Passo a Passo)

## 📍 Onde Encontrar

### 1. Acesse o Dashboard
👉 https://app.supabase.com/

### 2. Selecione seu Projeto
- Se não tiver, crie um novo projeto

### 3. Vá para Settings → API
- Menu lateral esquerdo → ⚙️ **Settings**
- Clique em **API**

### 4. Copie as 3 Credenciais

#### ✅ Project URL
```
https://xxxxx.supabase.co
```
→ Use como: `NEXT_PUBLIC_SUPABASE_URL`

#### ✅ anon / public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2...
```
→ Use como: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### ✅ service_role / secret key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY...
```
⚠️ Clique em **"Reveal"** para ver a chave completa
→ Use como: `SUPABASE_SERVICE_ROLE_KEY`

## 📋 Template Completo para `.env.local`

Cole no seu arquivo `.env.local`:

```env
# SUPABASE (Substitua pelos seus valores)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# WHATSAPP (Já configurado)
WHATSAPP_PROVIDER=whatsapp_business
WHATSAPP_API_KEY=EAAjPUGyZBQPoBP6VPXKdgqOPBzvmuxzQkaq1gzxl6ALoGtVTC3kI1keAWMm60AA3gt8JCl1KvlENDULm7buBSFLvqnRC6GTBU601Ba3IceXBo7XR6kLIu6fqFHDfko3TTRLwQeajNrcCfmYvMHQGdRwRD0TAQcGvm0fZAFs2kNkamkerJn2IxLljKsRsyOkgZDZD
WHATSAPP_PHONE_NUMBER_ID=779431901927431
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
WHATSAPP_FROM_NUMBER=+551158749885
WHATSAPP_WEBHOOK_VERIFY_TOKEN=gerar_token_seguro

# EMAIL (Já configurado)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg
EMAIL_FROM=noreply@dudufisio.com

# CRON
CRON_SECRET=gerar_secret_seguro

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔐 Gerar Tokens Seguros

**WHATSAPP_WEBHOOK_VERIFY_TOKEN e CRON_SECRET:**

```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Ou use: https://randomkeygen.com/

## ✅ Verificar se Funcionou

1. Abra o arquivo `.env.local`
2. Preencha as 3 credenciais do Supabase
3. Gere os tokens (webhook e cron)
4. Salve o arquivo
5. Reinicie: `npm run dev`

Se não houver erros de conexão, está funcionando! ✅

---

**📚 Mais detalhes**: Veja `GUIA_ENV_LOCAL.md` e `COMO_OBTER_CREDENCIAIS.md`

