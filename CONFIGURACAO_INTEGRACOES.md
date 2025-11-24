# Configuração de Integrações - DuduFisio-AI

## ✅ Credenciais Configuradas

### WhatsApp Business API
- **Provider**: `whatsapp_business`
- **Token**: Configurado
- **Phone Number ID**: `779431901927431`
- **Business Account ID**: `806225345331804`
- **Número**: `+55 11 5874 9885`

### Resend (Email)
- **Provider**: `resend`
- **API Key**: `re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg`

## 📝 Passos para Configuração

### 1. Criar arquivo `.env.local`

Crie o arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Supabase (substitua pelos seus valores)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Business API
WHATSAPP_PROVIDER=whatsapp_business
WHATSAPP_API_KEY=EAAjPUGyZBQPoBP6VPXKdgqOPBzvmuxzQkaq1gzxl6ALoGtVTC3kI1keAWMm60AA3gt8JCl1KvlENDULm7buBSFLvqnRC6GTBU601Ba3IceXBo7XR6kLIu6fqFHDfko3TTRLwQeajNrcCfmYvMHQGdRwRD0TAQcGvm0fZAFs2kNkamkerJn2IxLljKsRsyOkgZDZD
WHATSAPP_PHONE_NUMBER_ID=779431901927431
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
WHATSAPP_FROM_NUMBER=+551158749885

# Email (Resend)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg
EMAIL_FROM=noreply@dudufisio.com

# Cron Jobs
CRON_SECRET=your_secret_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Executar Migrations

Após sincronizar as migrations locais com o remoto:

```bash
# Sincronizar migrations
supabase db pull

# Aplicar novas migrations
supabase db push
```

Ou use o script PowerShell:
```powershell
.\scripts\run-migrations.ps1
```

### 3. Configurar Webhook do WhatsApp

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Vá para seu app do WhatsApp Business
3. Configure o webhook:
   - **URL**: `https://seu-dominio.com/api/webhooks/whatsapp`
   - **Token de verificação**: (crie um token seguro)
   - **Eventos**: 
     - `messages` - Receber mensagens
     - `message_status` - Status de entrega

4. Adicione a URL nas configurações do WhatsApp Business API

### 4. Verificar Domínio no Resend

1. Acesse [Resend Dashboard](https://resend.com/domains)
2. Adicione e verifique seu domínio
3. Configure o DNS conforme instruções
4. Atualize `EMAIL_FROM` no `.env.local` com o domínio verificado

## 🧪 Testar Integrações

### Testar WhatsApp

Crie um arquivo de teste `test-whatsapp.ts`:

```typescript
import { whatsappService } from './src/lib/services/integrations/whatsappService';

async function test() {
  const result = await whatsappService.sendMessage({
    to: '+5511999999999', // Substitua por um número de teste
    message: 'Teste de mensagem do DuduFisio-AI',
  });
  
  console.log('Resultado:', result);
}

test();
```

### Testar Email

Crie um arquivo de teste `test-email.ts`:

```typescript
import { emailService } from './src/lib/services/integrations/emailService';

async function test() {
  const result = await emailService.sendEmail({
    to: 'seu-email@example.com',
    subject: 'Teste de Email',
    html: '<h1>Teste</h1><p>Este é um teste do sistema DuduFisio-AI</p>',
  });
  
  console.log('Resultado:', result);
}

test();
```

## 📋 Checklist

- [ ] Arquivo `.env.local` criado com todas as variáveis
- [ ] Migrations sincronizadas (`supabase db pull`)
- [ ] Migrations aplicadas (`supabase db push`)
- [ ] Webhook do WhatsApp configurado
- [ ] Domínio verificado no Resend
- [ ] Testes de integração realizados

## 🔒 Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite o arquivo `.env.local` no Git
- Mantenha as credenciais seguras
- Use variáveis de ambiente em produção (Vercel, etc.)

## 📚 Documentação

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Resend API](https://resend.com/docs)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

