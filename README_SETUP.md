# Guia de Configuração - DuduFisio-AI

## 🚀 Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase
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

#### Windows (PowerShell):
```powershell
.\scripts\run-migrations.ps1
```

#### Linux/Mac:
```bash
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

#### Ou manualmente:
```bash
supabase db push
```

### 3. Configurar Webhook do WhatsApp

1. Acesse o [Facebook Developers](https://developers.facebook.com/)
2. Vá para seu app do WhatsApp Business
3. Configure o webhook:
   - URL: `https://seu-dominio.com/api/webhooks/whatsapp`
   - Token de verificação: (crie um token seguro)
   - Eventos: `messages`, `message_status`

4. Adicione a URL do webhook nas configurações do WhatsApp Business API

### 4. Verificar Integrações

#### Testar WhatsApp:
```typescript
import { whatsappService } from '~/lib/services/integrations/whatsappService';

const result = await whatsappService.sendMessage({
  to: '+5511999999999',
  message: 'Teste de mensagem',
});
```

#### Testar Email:
```typescript
import { emailService } from '~/lib/services/integrations/emailService';

const result = await emailService.sendEmail({
  to: 'teste@example.com',
  subject: 'Teste',
  html: '<p>Teste de email</p>',
});
```

## 📋 Checklist de Configuração

- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Migrations executadas (`supabase db push`)
- [ ] Webhook do WhatsApp configurado
- [ ] Domínio verificado no Resend (se necessário)
- [ ] Testes de integração realizados

## 🔒 Segurança

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env.local` no Git!

O arquivo `.env.local.example` está no repositório como referência.

## 📚 Documentação Adicional

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Resend API Docs](https://resend.com/docs)
- [Supabase Docs](https://supabase.com/docs)

