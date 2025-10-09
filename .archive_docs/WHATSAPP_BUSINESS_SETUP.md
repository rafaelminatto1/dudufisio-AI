# 📱 CONFIGURAÇÃO COMPLETA - WhatsApp Business API

## 🎯 **OPÇÕES DISPONÍVEIS**

### **Opção 1: WhatsApp Web Client (Desenvolvimento/Teste)**
- ✅ **Gratuito** e fácil de configurar
- ❌ Limitado para uso pessoal
- ❌ Não oficial para negócios

### **Opção 2: WhatsApp Business API (Produção)**
- ✅ **Oficial** para negócios
- ✅ **Escalável** e profissional
- ✅ **Webhooks** e analytics
- ⚠️ **Pago** após 1.000 conversas/mês

---

## 🔧 **OPÇÃO 1: WHATSAPP WEB CLIENT (Gratuito)**

### **Passo 1: Verificar Dependência**
```bash
# Verificar se está instalado
npm list whatsapp-web.js

# Se não estiver, instalar
npm install whatsapp-web.js
```

### **Passo 2: Configurar Variáveis**
No seu `.env.local`:
```env
# WhatsApp Web Client (Gratuito)
WHATSAPP_USE_WEB_CLIENT=true
WHATSAPP_SESSION_PATH=./wa-session
WHATSAPP_ENABLED=true
WHATSAPP_MAX_RETRIES=3
WHATSAPP_TIMEOUT=30000
WHATSAPP_RATE_LIMIT=100
```

### **Passo 3: Testar**
```bash
npm run dev
# Procurar no console por QR Code
# Escanear com WhatsApp pessoal
```

---

## 🏢 **OPÇÃO 2: WHATSAPP BUSINESS API (Profissional)**

### **📋 PRÉ-REQUISITOS**
- [ ] Empresa registrada (CNPJ)
- [ ] Domínio próprio
- [ ] Número de telefone empresarial
- [ ] Conta no Meta for Developers

---

### **PASSO 1: CRIAR CONTA NO META FOR DEVELOPERS**

#### **1.1 Acessar o Portal**
1. Vá para: https://developers.facebook.com/
2. Clique em **"Get Started"**
3. Faça login com sua conta Facebook empresarial

#### **1.2 Criar App**
1. Clique em **"Create App"**
2. Selecione **"Business"** como tipo
3. Preencha os dados:
   - **App Name**: `DuduFisio Communication`
   - **App Contact Email**: `seu_email@seudominio.com`
   - **Business Account**: Selecione sua empresa
4. Clique **"Create App"**

---

### **PASSO 2: CONFIGURAR WHATSAPP BUSINESS**

#### **2.1 Adicionar Produto WhatsApp**
1. No painel do app, clique **"Add Product"**
2. Encontre **"WhatsApp"** e clique **"Set up"**
3. Aceite os termos de uso

#### **2.2 Configurar Número de Telefone**
1. Vá para **WhatsApp** → **Getting Started**
2. Clique **"Add phone number"**
3. **Escolha uma opção**:

   **Opção A: Usar número existente**
   - Digite seu número empresarial
   - Receberá código via SMS
   - Digite o código de verificação

   **Opção B: Comprar número via Twilio**
   - Mais fácil e recomendado
   - Integração automática
   - Custo: ~R$ 5-10

#### **2.3 Configurar Webhook**
1. Vá para **WhatsApp** → **Configuration**
2. Em **Webhook**:
   - **Callback URL**: `https://seu-dominio.vercel.app/webhooks/whatsapp`
   - **Verify Token**: `seu_token_secreto_123`
   - **Webhook Fields**: Marque todas as opções
3. Clique **"Verify and Save"**

---

### **PASSO 3: OBTER CREDENCIAIS**

#### **3.1 Access Token**
1. Vá para **WhatsApp** → **API Setup**
2. Copie o **Temporary Access Token**
3. ⚠️ **Importante**: Este token expira em 24h

#### **3.2 Phone Number ID**
1. No mesmo local, copie o **Phone Number ID**
2. Formato: `1234567890123456`

#### **3.3 Webhook Verify Token**
1. Use o token que você criou no passo 2.3
2. Exemplo: `dudufisio_webhook_token_2024`

---

### **PASSO 4: CONFIGURAR VARIÁVEIS**

No seu `.env.local`:
```env
# WhatsApp Business API (Produção)
WHATSAPP_USE_WEB_CLIENT=false
WHATSAPP_BUSINESS_API_TOKEN=EAAxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=1234567890123456
WHATSAPP_WEBHOOK_VERIFY_TOKEN=dudufisio_webhook_token_2024
WHATSAPP_ENABLED=true
WHATSAPP_MAX_RETRIES=3
WHATSAPP_TIMEOUT=30000
WHATSAPP_RATE_LIMIT=100
```

---

### **PASSO 5: CONFIGURAR WEBHOOK NO SEU APP**

#### **5.1 Criar Rota Webhook**
Crie o arquivo: `pages/api/webhooks/whatsapp.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Verificação do webhook
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado com sucesso!');
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Token inválido');
    }
  } else if (req.method === 'POST') {
    // Processar mensagens recebidas
    const body = req.body;
    console.log('Mensagem recebida:', JSON.stringify(body, null, 2));
    
    // Aqui você processa as mensagens
    // Implementar lógica de resposta
    
    res.status(200).send('OK');
  }
}
```

#### **5.2 Testar Webhook**
1. Deploy seu app no Vercel
2. Use a URL do Vercel no webhook
3. Teste enviando uma mensagem para seu número

---

### **PASSO 6: GERAR ACCESS TOKEN PERMANENTE**

#### **6.1 Configurar App Review (Para Produção)**
1. Vá para **App Review** → **Permissions and Features**
2. Solicite permissões:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
3. Aguarde aprovação (pode demorar dias)

#### **6.2 Gerar Token Permanente**
1. Vá para **WhatsApp** → **API Setup**
2. Clique **"Generate Token"**
3. Selecione **"Never expire"**
4. Copie o token permanente

#### **6.3 Atualizar Variável**
```env
WHATSAPP_BUSINESS_API_TOKEN=EAAxxxxxxxxxxxxxx_permanente
```

---

## 💰 **CUSTOS DO WHATSAPP BUSINESS API**

### **Estrutura de Preços (Brasil)**
- **Primeiras 1.000 conversas/mês**: **GRATUITAS**
- **Após 1.000 conversas**:
  - **Mensagens de utilidade**: R$ 0,048 por conversa
  - **Mensagens de marketing**: R$ 0,374 por conversa
  - **Mensagens de autenticação**: R$ 0,189 por conversa

### **Exemplo de Custo Mensal**
- 5.000 conversas de utilidade = R$ 192/mês
- 1.000 conversas de marketing = R$ 374/mês
- **Total**: R$ 566/mês

---

## 🔄 **MIGRAÇÃO DE WEB CLIENT PARA BUSINESS API**

### **Quando Migrar?**
- ✅ Quando tiver mais de 100 pacientes
- ✅ Quando precisar de automação
- ✅ Quando quiser analytics profissionais
- ✅ Quando precisar de webhooks

### **Processo de Migração**
1. Configure Business API em paralelo
2. Teste com alguns pacientes
3. Migre gradualmente
4. Desative Web Client

---

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **Problema 1: Webhook não verifica**
**Solução**: Verifique se a URL está acessível e o token está correto

### **Problema 2: Access Token expira**
**Solução**: Configure token permanente ou renove automaticamente

### **Problema 3: Mensagens não chegam**
**Solução**: Verifique se o número está verificado e ativo

### **Problema 4: Limite de taxa**
**Solução**: Implemente rate limiting no seu código

---

## 📊 **COMPARAÇÃO: WEB CLIENT vs BUSINESS API**

| Aspecto | Web Client | Business API |
|---------|------------|--------------|
| **Custo** | Gratuito | Pago após 1k/mês |
| **Setup** | 5 minutos | 2-3 horas |
| **Escalabilidade** | Limitada | Ilimitada |
| **Webhooks** | Não | Sim |
| **Analytics** | Básico | Avançado |
| **Automação** | Limitada | Completa |
| **Uso Comercial** | Não oficial | Oficial |

---

## 🎯 **RECOMENDAÇÃO**

### **Para Começar (Desenvolvimento)**
- Use **WhatsApp Web Client**
- Configure em 5 minutos
- Teste todas as funcionalidades

### **Para Produção (Negócio Real)**
- Migre para **WhatsApp Business API**
- Configure webhooks
- Implemente analytics
- Monitore custos

---

## 📞 **SUPORTE**

### **Meta for Developers**
- Documentação: https://developers.facebook.com/docs/whatsapp
- Suporte: https://developers.facebook.com/support

### **Twilio WhatsApp**
- Documentação: https://www.twilio.com/docs/whatsapp
- Suporte: https://support.twilio.com/

---

**Próximo passo**: Escolha entre Web Client (rápido) ou Business API (profissional) e me avise qual opção prefere! 🚀
