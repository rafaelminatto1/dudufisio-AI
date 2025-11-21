# 🔑 Como Obter Todas as Credenciais

## 1. 📊 Supabase (Obrigatório)

### Passo a Passo:

1. **Acesse o Dashboard do Supabase**
   - URL: https://app.supabase.com/
   - Faça login na sua conta

2. **Selecione seu Projeto**
   - Se não tiver um projeto, crie um novo

3. **Vá para Settings → API**
   - No menu lateral, clique em **Settings** (⚙️)
   - Clique em **API** no submenu

4. **Copie as Credenciais**

   **Project URL:**
   ```
   https://xxxxx.supabase.co
   ```
   - Copie a URL completa
   - Use como: `NEXT_PUBLIC_SUPABASE_URL`

   **Project API keys:**
   
   **Anon / public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - Esta é a chave pública (pode ser exposta)
   - Use como: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **service_role / secret key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - ⚠️ **MANTENHA SECRETO!** Esta chave tem acesso total
   - Use como: `SUPABASE_SERVICE_ROLE_KEY`
   - Clique em "Reveal" para ver a chave completa

### 📸 Visual Guide:
```
Supabase Dashboard
├── Settings ⚙️
    └── API
        ├── Project URL: https://xxx.supabase.co
        └── Project API keys
            ├── anon public: eyJhbGc...
            └── service_role secret: eyJhbGc... (Reveal)
```

---

## 2. 📱 WhatsApp Business API

### Você já tem as credenciais! ✅

Use estas informações:

```env
WHATSAPP_PROVIDER=whatsapp_business
WHATSAPP_API_KEY=EAAjPUGyZBQPoBP6VPXKdgqOPBzvmuxzQkaq1gzxl6ALoGtVTC3kI1keAWMm60AA3gt8JCl1KvlENDULm7buBSFLvqnRC6GTBU601Ba3IceXBo7XR6kLIu6fqFHDfko3TTRLwQeajNrcCfmYvMHQGdRwRD0TAQcGvm0fZAFs2kNkamkerJn2IxLljKsRsyOkgZDZD
WHATSAPP_PHONE_NUMBER_ID=779431901927431
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
WHATSAPP_FROM_NUMBER=+551158749885
```

### Gerar Token para Webhook:

Para `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, gere um token seguro:

**Opção 1: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opção 2: PowerShell**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Opção 3: Online**
- https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" ou "Fort Knox Passwords"

---

## 3. 📧 Resend (Email)

### Você já tem a API key! ✅

```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg
EMAIL_FROM=noreply@dudufisio.com
```

### Verificar Domínio (Opcional):

1. Acesse https://resend.com/domains
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções
4. Após verificação, atualize `EMAIL_FROM` com seu domínio

---

## 4. 🔐 CRON_SECRET

Gere um token seguro para proteger os cron jobs:

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Online:**
- https://randomkeygen.com/

---

## 5. 🚀 NEXT_PUBLIC_APP_URL

Para desenvolvimento local:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Para produção (quando fizer deploy):
```env
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

---

## 📋 Checklist Rápido

- [ ] ✅ Supabase URL copiada
- [ ] ✅ Supabase Anon Key copiada
- [ ] ✅ Supabase Service Role Key copiada (secret!)
- [ ] ✅ WhatsApp API Key (já tem)
- [ ] ✅ WhatsApp Phone Number ID (já tem)
- [ ] ✅ WhatsApp Webhook Token gerado
- [ ] ✅ Resend API Key (já tem)
- [ ] ✅ CRON_SECRET gerado
- [ ] ✅ App URL configurado

---

## 🛠️ Script Automático

Use o script PowerShell para gerar automaticamente:

```powershell
.\scripts\generate-env-local.ps1
```

O script vai perguntar cada valor e gerar o arquivo `.env.local` automaticamente!

---

## ⚠️ Importante

1. **Nunca commite `.env.local`** - Já está no `.gitignore`
2. **Mantenha as chaves secretas seguras**
3. **Use diferentes credenciais para dev/prod**
4. **Reinicie o servidor** após criar/editar `.env.local`

---

## 🆘 Precisa de Ajuda?

- **Supabase**: https://supabase.com/docs
- **WhatsApp Business**: https://developers.facebook.com/docs/whatsapp
- **Resend**: https://resend.com/docs

