# 📱 WhatsApp Business API - Próximos Passos

## ✅ O Que Já Foi Feito

1. **Token de acesso fornecido**: ✅ Já temos o token da Meta
2. **Infraestrutura pronta**: ✅ O projeto já tem integração completa com WhatsApp Business API
3. **Arquivos criados**:
   - `CONFIGURACAO_WHATSAPP_META.md` - Guia completo de configuração
   - `lib/ai-scheduling/integrations/whatsappConfigHelper.ts` - Helper de configuração
   - `components/whatsapp/WhatsAppConfigStatus.tsx` - Componente para testar a configuração

---

## 🎯 O QUE VOCÊ PRECISA FAZER AGORA

### **PASSO 1: Criar o arquivo .env.local**

Crie o arquivo `.env.local` na raiz do projeto com este conteúdo:

```env
# WhatsApp Business API
VITE_WHATSAPP_USE_WEB_CLIENT=false
VITE_WHATSAPP_ENABLED=true
VITE_WHATSAPP_BUSINESS_API_TOKEN=EAAjPUGyZBQPoBPifgnBbgl54ZBZCnV5wI8lMXSNkWn3ZAqEMz4GOjMg7ZCDZCMSZA8nh2S3DQdWBQDJ7A5SAqml8psmaOUZCUviZCpZARTCeMiL5QtRVJ1U5c9rI6TY7bq9gthnwpzecBCBR62FdovuHDdkZBMZA9Jh31LBUYVqTMIcabywcHfuiTwkWUB474l5LuRfAVA9jPZAtASZCXAyhZA1sGKFa90DlYadU1aTqbTiaJIq7ST5dmQdQbjLm7rPemCQ4MIZD
VITE_WHATSAPP_PHONE_NUMBER_ID=SEU_PHONE_NUMBER_ID_AQUI
VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN=dudufisio_webhook_verify_2024
VITE_WHATSAPP_NUMBER=+5511958749885

# Outras configurações necessárias
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
NODE_ENV=development
```

> **IMPORTANTE**: Você precisa obter o `PHONE_NUMBER_ID` no painel da Meta!

---

### **PASSO 2: Obter o Phone Number ID no Painel da Meta**

1. Acesse: https://developers.facebook.com/apps/
2. Faça login e selecione seu aplicativo WhatsApp
3. No menu lateral: **WhatsApp** → **API Setup**
4. Você verá:
   ```
   ✅ Access Token: [já temos]
   ⚠️ Phone Number ID: 123456789012345 [COPIE ESTE]
   📞 Test Phone Number: +5511958749885
   ```
5. Copie o **Phone Number ID** (é um número longo, tipo `123456789012345`)
6. Cole no `.env.local`:
   ```env
   VITE_WHATSAPP_PHONE_NUMBER_ID=123456789012345
   ```

---

### **PASSO 3: Iniciar o Aplicativo**

```bash
npm run dev
```

Aguarde o servidor iniciar e acesse: http://localhost:5173

---

### **PASSO 4: Testar a Configuração**

1. Após iniciar o app, acesse a página de configuração do WhatsApp
2. Você verá um painel de status mostrando:
   - ✅ Token configurado
   - ✅ Phone Number ID configurado
   - ✅ Webhook token configurado
3. Clique no botão **"Testar Conexão com API"**
4. Se tudo estiver correto, verá: ✅ "Conexão estabelecida com sucesso!"

---

### **PASSO 5: Configurar Webhook (Opcional mas Recomendado)**

Para receber mensagens dos pacientes, você precisa configurar o webhook:

#### **Opção A: Deploy no Vercel (Produção)**
```bash
git add .
git commit -m "feat: configurar WhatsApp Business API"
git push
```

Após o deploy, use a URL:
```
https://seu-app.vercel.app/api/webhooks/whatsapp
```

#### **Opção B: Teste Local com ngrok**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 5173

# Copiar URL: https://xxxx-xxx.ngrok.io/api/webhooks/whatsapp
```

#### **Configurar no Painel da Meta:**
1. Vá em: **WhatsApp** → **Configuration** → **Webhook**
2. Configure:
   - **Callback URL**: `https://seu-dominio/api/webhooks/whatsapp`
   - **Verify Token**: `dudufisio_webhook_verify_2024`
3. Clique em **"Verify and Save"**
4. Marque os campos:
   - ✅ `messages`
   - ✅ `message_status`

---

## 🚨 ATENÇÃO: Token Temporário

O token fornecido **expira em 24 horas**!

### **Para gerar token permanente:**

1. No painel da Meta: **WhatsApp** → **API Setup**
2. Clique em **"Generate New Token"**
3. Selecione:
   - **Expiration**: `Never Expire`
   - **Permissions**: Todas as permissões de WhatsApp
4. Copie o novo token
5. Atualize no `.env.local`:
   ```env
   VITE_WHATSAPP_BUSINESS_API_TOKEN=SEU_TOKEN_PERMANENTE
   ```

---

## 📊 Como Usar no Código

### **Exemplo 1: Enviar Confirmação de Agendamento**

```typescript
import { createWhatsAppBusinessIntegration } from '@/lib/ai-scheduling/integrations/whatsappConfigHelper';
import { BusinessIntelligenceSystem } from '@/lib/analytics/BusinessIntelligenceSystem';

// Inicializar
const biSystem = new BusinessIntelligenceSystem();
const whatsapp = createWhatsAppBusinessIntegration(biSystem);

// Enviar confirmação
await whatsapp.sendAppointmentConfirmation(appointment, patient);
```

### **Exemplo 2: Enviar Lembrete**

```typescript
// Enviar lembrete 24h antes
await whatsapp.sendAppointmentReminder(appointment, patient, 24);
```

### **Exemplo 3: Enviar Mensagem Personalizada**

```typescript
await whatsapp.sendCustomMessage(
  '+5511999999999',
  'Olá! Sua consulta foi reagendada para amanhã às 14h.',
  true // com botões interativos
);
```

---

## 🛠️ Componente de Status

Para visualizar o status da configuração na UI:

```tsx
import WhatsAppConfigStatus from '@/components/whatsapp/WhatsAppConfigStatus';

function SettingsPage() {
  return (
    <div>
      <h1>Configurações</h1>
      <WhatsAppConfigStatus />
    </div>
  );
}
```

---

## ❓ Problemas Comuns

### **1. "Phone Number ID not configured"**
**Solução**: Verifique se copiou o ID correto do painel da Meta

### **2. "Token expired"**
**Solução**: Gere um token permanente (veja instruções acima)

### **3. "Webhook verification failed"**
**Solução**: Verifique se o token no `.env.local` é igual ao configurado no painel da Meta

### **4. Variáveis de ambiente não carregam**
**Solução**: 
- Certifique-se de que o arquivo é `.env.local` (não `.env`)
- Reinicie o servidor: `npm run dev`
- Variáveis devem começar com `VITE_` para serem acessíveis no frontend

---

## 📚 Documentação Completa

Para detalhes completos, consulte:
- **CONFIGURACAO_WHATSAPP_META.md** - Guia completo passo a passo
- **WHATSAPP_BUSINESS_SETUP.md** - Documentação técnica completa
- **Documentação Meta**: https://developers.facebook.com/docs/whatsapp/

---

## 🎯 Checklist

- [ ] Criar arquivo `.env.local`
- [ ] Obter **Phone Number ID** no painel da Meta
- [ ] Colar o ID no `.env.local`
- [ ] Iniciar o app: `npm run dev`
- [ ] Testar conexão no componente de status
- [ ] Configurar webhook (opcional)
- [ ] Gerar token permanente
- [ ] Testar enviando uma mensagem

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique o console do navegador (F12) para erros
2. Verifique o terminal onde o `npm run dev` está rodando
3. Consulte o arquivo `CONFIGURACAO_WHATSAPP_META.md`
4. Me chame que eu ajudo! 😊

---

**Boa sorte com a configuração! 🚀**






