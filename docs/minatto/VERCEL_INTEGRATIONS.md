# Integrações Vercel - Setup Completo

## 🎯 **Visão Geral**

Este guia detalha como configurar integrações do Vercel Marketplace para o projeto DuduFisio-AI, incluindo Redis, banco de dados e outras ferramentas essenciais.

---

## 🔴 **Redis via Upstash (Recomendado)**

### **Passo 1: Instalar via Dashboard Vercel**

1. **Acesse seu projeto na Vercel:**
   - Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecione o projeto `dudufisio-ai`

2. **Navegue até Integrations:**
   - Clique na aba **"Integrations"** no projeto
   - Ou acesse **"Marketplace"** no menu lateral

3. **Procure por Upstash Redis:**
   - Digite "upstash" na busca
   - Clique em **"Upstash Redis"**
   - Clique em **"Add Integration"**

4. **Configure a integração:**
   - Selecione seu time/projeto
   - Escolha o plano (Free tier disponível)
   - Clique em **"Install"**

### **Passo 2: Configuração Automática**

Após instalação, a Vercel automaticamente:
- ✅ Cria um banco Redis na Upstash
- ✅ Adiciona variáveis de ambiente ao projeto
- ✅ Configura as credenciais de conexão

### **Passo 3: Verificar Variáveis de Ambiente**

1. **No dashboard do projeto:**
   - Vá em **Settings** → **Environment Variables**
   - Verifique se foram criadas:
     ```
     UPSTASH_REDIS_REST_URL
     UPSTASH_REDIS_REST_TOKEN
     KV_REST_API_URL (alias)
     KV_REST_API_TOKEN (alias)
     ```

2. **Para desenvolvimento local:**
   ```bash
   vercel env pull .env.local
   ```

### **Passo 4: Atualizar Código**

**Arquivo: `.env.local` (após pull)**
```env
# Redis será configurado automaticamente
REDIS_URL=<valor_do_upstash>
REDIS_TOKEN=<token_do_upstash>
```

**Arquivo: `lib/communication/core/MessageBus.ts`**
```typescript
// Atualizar configuração do Redis
const messageBus = new MessageBus({
  redisUrl: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL,
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  defaultRetryAttempts: 3,
  defaultRetryDelay: 1000,
  rateLimitGlobal: 10000
});
```

---

## 🗄️ **Banco de Dados - PlanetScale MySQL**

### **Integração Recomendada para Dados Relacionais**

1. **Instalar PlanetScale:**
   - Dashboard Vercel → Marketplace
   - Procure "PlanetScale"
   - Clique em **"Add Integration"**

2. **Configuração:**
   - Escolha região (preferencialmente São Paulo)
   - Selecione plano (Hobby é gratuito)
   - Conecte ao projeto `dudufisio-ai`

3. **Variáveis geradas:**
   ```env
   DATABASE_URL=mysql://username:password@host/database
   PLANETSCALE_DB_HOST=
   PLANETSCALE_DB_USERNAME=
   PLANETSCALE_DB_PASSWORD=
   ```

4. **Alternativa para manter Supabase:**
   - Use PlanetScale apenas para cache/sessões
   - Mantenha Supabase para dados principais

---

## 📊 **Analytics - Vercel Analytics + Web Vitals**

### **Configuração Nativa da Vercel**

1. **Ativar no Dashboard:**
   - Projeto → Settings → Analytics
   - Ative **"Vercel Analytics"**
   - Ative **"Web Vitals"**

2. **Instalar no código:**
   ```bash
   npm install @vercel/analytics @vercel/speed-insights
   ```

3. **Configurar no app:**
   ```typescript
   // app/layout.tsx ou pages/_app.tsx
   import { Analytics } from '@vercel/analytics/react';
   import { SpeedInsights } from '@vercel/speed-insights/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

---

## 🔍 **Monitoramento - Sentry**

### **Integração de Error Tracking**

1. **Instalar via Marketplace:**
   - Procure "Sentry" no marketplace
   - Clique em **"Add Integration"**

2. **Configuração automática:**
   - Sentry criará projeto automaticamente
   - Variáveis serão adicionadas:
     ```env
     SENTRY_DSN=https://...
     SENTRY_ORG=
     SENTRY_PROJECT=
     ```

3. **Configurar no código:**
   ```bash
   npm install @sentry/nextjs
   ```

   ```javascript
   // sentry.client.config.ts
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

---

## 📧 **Email - Resend**

### **Provider de Email Moderno**

1. **Instalar Resend:**
   - Marketplace → "Resend"
   - **"Add Integration"**

2. **Configuração:**
   - Domínio será verificado automaticamente
   - API key será adicionada:
     ```env
     RESEND_API_KEY=re_...
     ```

3. **Usar no sistema de comunicação:**
   ```typescript
   // lib/communication/channels/EmailChannel.ts
   import { Resend } from 'resend';

   const resend = new Resend(process.env.RESEND_API_KEY);

   async send(message: Message): Promise<DeliveryResult> {
     const data = await resend.emails.send({
       from: 'FisioFlow <noreply@fisioflow.com>',
       to: message.recipients[0].channels.email,
       subject: message.content.subject,
       html: message.content.body,
     });

     return {
       success: true,
       messageId: data.id,
       channel: 'email',
       deliveredAt: new Date(),
       cost: 0.001,
       metadata: data
     };
   }
   ```

---

## 🔐 **Autenticação - Clerk**

### **Sistema de Auth Completo**

1. **Instalar Clerk:**
   - Marketplace → "Clerk"
   - **"Add Integration"**

2. **Configuração automática:**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

3. **Integrar no app:**
   ```bash
   npm install @clerk/nextjs
   ```

---

## 📂 **Storage - Vercel Blob**

### **Storage Nativo da Vercel**

1. **Ativar no projeto:**
   - Settings → Storage
   - Enable **"Vercel Blob"**

2. **Usar no código:**
   ```typescript
   import { put, del, list } from '@vercel/blob';

   // Upload de arquivo
   const blob = await put('avatar.png', file, {
     access: 'public',
   });

   // Listar arquivos
   const { blobs } = await list();
   ```

---

## 🤖 **AI - Vercel AI SDK**

### **Integração com Modelos de IA**

1. **Já configurado com Gemini:**
   - Manter configuração atual
   - Adicionar outros providers se necessário

2. **Instalar providers adicionais:**
   ```bash
   npm install ai @ai-sdk/openai @ai-sdk/anthropic
   ```

---

## ⚡ **Edge Config - Configuração Global**

### **Variáveis Globais Distribuídas**

1. **Criar Edge Config:**
   - Dashboard → Storage → Edge Config
   - **"Create Edge Config Store"**

2. **Usar para feature flags:**
   ```typescript
   import { get } from '@vercel/edge-config';

   export async function GET() {
     const communicationEnabled = await get('communication_enabled');
     return Response.json({ enabled: communicationEnabled });
   }
   ```

---

## 📱 **Push Notifications - Web Push**

### **Configurar VAPID via Vercel**

1. **Gerar chaves no Edge Config:**
   - Store name: `push-config`
   - Adicionar keys:
     ```json
     {
       "vapid_public_key": "BF...",
       "vapid_private_key": "K...",
       "fcm_server_key": "AAAAx..."
     }
     ```

2. **Usar no sistema:**
   ```typescript
   import { get } from '@vercel/edge-config';

   const vapidPublicKey = await get('vapid_public_key');
   const vapidPrivateKey = await get('vapid_private_key');
   ```

---

## 🔧 **Configuração via CLI (Alternativa)**

### **Instalar Integrações via Command Line**

```bash
# Redis (Upstash)
vercel install upstash

# PlanetScale
vercel install planetscale

# Sentry
vercel install sentry

# Resend
vercel install resend

# Clerk
vercel install clerk
```

---

## 🌍 **Variáveis de Ambiente Consolidadas**

### **Arquivo .env.local Final**

```env
# Existing configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GOOGLE_AI_API_KEY=AIza...

# ===== VERCEL INTEGRATIONS =====

# Upstash Redis (Auto-configured)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=AX...

# PlanetScale MySQL (Optional)
DATABASE_URL=mysql://username:password@host/database
PLANETSCALE_DB_HOST=aws.connect.psdb.cloud
PLANETSCALE_DB_USERNAME=username
PLANETSCALE_DB_PASSWORD=password

# Sentry Monitoring
SENTRY_DSN=https://key@sentry.io/project
SENTRY_ORG=your-org
SENTRY_PROJECT=dudufisio-ai

# Resend Email
RESEND_API_KEY=re_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Vercel Analytics (Auto-configured)
VERCEL_ANALYTICS_ID=analytics_id

# Edge Config (Auto-configured)
EDGE_CONFIG=https://edge-config.vercel.com/...

# ===== COMMUNICATION SYSTEM =====

# Use Redis from Upstash
REDIS_URL=${UPSTASH_REDIS_REST_URL}
REDIS_TOKEN=${UPSTASH_REDIS_REST_TOKEN}

# WhatsApp Business API
WHATSAPP_BUSINESS_API_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=phone_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=verify_token
WHATSAPP_USE_WEB_CLIENT=false

# Twilio SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=auth_token
TWILIO_PHONE_NUMBER=+5511999999999

# Email via Resend (replaces SMTP)
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@fisioflow.com
EMAIL_FROM_NAME=FisioFlow

# Push Notifications (from Edge Config)
VAPID_PUBLIC_KEY=from_edge_config
VAPID_PRIVATE_KEY=from_edge_config
FCM_SERVER_KEY=from_edge_config

# System Configuration
COMMUNICATION_DEFAULT_TIMEZONE=America/Sao_Paulo
COMMUNICATION_DEFAULT_LANGUAGE=pt-BR
COMMUNICATION_ENABLE_ANALYTICS=true
COMMUNICATION_ENABLE_WEBHOOKS=true
```

---

## 🚀 **Deploy e Configuração Automática**

### **Script de Deploy com Integrações**

```bash
#!/bin/bash
# deploy-with-integrations.sh

echo "🚀 Deploying DuduFisio-AI with Vercel Integrations..."

# Pull environment variables
vercel env pull .env.local

# Install dependencies
npm install

# Build project
npm run build

# Deploy to Vercel
vercel --prod

# Install integrations if not already installed
vercel install upstash
vercel install sentry
vercel install resend

echo "✅ Deploy completed with integrations!"
echo "📊 Check dashboard: https://vercel.com/dashboard"
echo "🔍 Monitor errors: https://sentry.io"
echo "📧 Email analytics: https://resend.com/dashboard"
```

---

## 📋 **Checklist de Configuração**

### **Redis (Upstash)**
- [ ] Integração instalada via Vercel Marketplace
- [ ] Variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` disponíveis
- [ ] MessageBus configurado para usar Upstash
- [ ] Teste de conexão funcionando

### **Email (Resend)**
- [ ] Integração Resend instalada
- [ ] Domínio verificado (se usando domínio customizado)
- [ ] EmailChannel configurado para usar Resend API
- [ ] Template de email testado

### **Monitoramento (Sentry)**
- [ ] Integração Sentry instalada
- [ ] Error tracking configurado no código
- [ ] Source maps enviados para Sentry
- [ ] Alertas configurados

### **Analytics (Vercel)**
- [ ] Vercel Analytics ativado
- [ ] Web Vitals configurado
- [ ] Componentes `<Analytics />` e `<SpeedInsights />` adicionados

### **Storage (Vercel Blob)**
- [ ] Vercel Blob ativado
- [ ] Upload de arquivos testado
- [ ] Integração com sistema de templates (se necessário)

---

## 🔧 **Comandos Úteis**

```bash
# Ver todas as integrações instaladas
vercel integrations list

# Sincronizar variáveis de ambiente
vercel env pull .env.local

# Deploy com preview
vercel

# Deploy para produção
vercel --prod

# Ver logs em tempo real
vercel logs --follow

# Verificar status das integrações
vercel status

# Remover integração
vercel integrations remove <integration-name>
```

---

## 🆘 **Troubleshooting**

### **Redis não conecta**
1. Verificar se variáveis estão corretas: `echo $UPSTASH_REDIS_REST_URL`
2. Testar conexão manual via Upstash Console
3. Verificar firewall/VPN que pode bloquear conexões

### **Email não envia via Resend**
1. Verificar se domínio está verificado
2. Checar se API key tem permissões corretas
3. Validar formato do email recipient

### **Sentry não recebe erros**
1. Verificar se DSN está correto
2. Confirmar se Sentry.init() está sendo chamado
3. Testar com erro manual: `Sentry.captureException(new Error('Test'))`

### **Analytics não aparecem**
1. Aguardar até 24h para primeiros dados
2. Verificar se componentes Analytics estão no layout principal
3. Confirmar se projeto tem tráfego suficiente

---

## 🎯 **Próximos Passos**

1. **Configurar todas as integrações recomendadas**
2. **Testar cada funcionalidade individualmente**
3. **Monitorar dashboards por 24-48h**
4. **Ajustar alertas e limites conforme necessário**
5. **Documentar métricas importantes para acompanhamento**

---

**📅 Criado:** Janeiro 2025
**🏥 Projeto:** DuduFisio-AI
**⚡ Powered by:** Vercel Marketplace Integrations