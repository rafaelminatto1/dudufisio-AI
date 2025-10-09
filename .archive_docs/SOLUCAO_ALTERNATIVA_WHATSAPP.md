# 🔧 Solução Alternativa - WhatsApp Webhook

## ❌ **Problema Identificado:**
A Vercel não está reconhecendo as rotas da API corretamente. O webhook não está acessível.

## ✅ **Soluções Disponíveis:**

### **Opção 1: Usar ngrok (Recomendado para Teste)**

1. **Instalar ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Executar localmente:**
   ```bash
   npm run dev
   ```

3. **Em outro terminal, expor com ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Usar a URL do ngrok no Meta:**
   - Exemplo: `https://abc123.ngrok.io/api/whatsapp`

### **Opção 2: Deploy em Outro Serviço**

#### **A. Railway**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### **B. Render**
1. Conectar repositório GitHub
2. Deploy automático
3. URL: `https://seu-app.onrender.com/api/whatsapp`

#### **C. Netlify Functions**
```javascript
// netlify/functions/whatsapp.js
exports.handler = async (event, context) => {
  // Código do webhook aqui
}
```

### **Opção 3: Configurar Vercel Corretamente**

1. **Criar estrutura Next.js:**
   ```bash
   mkdir pages/api
   mv api/whatsapp.js pages/api/whatsapp.js
   ```

2. **Atualizar vercel.json:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/next"
       }
     ]
   }
   ```

## 🚀 **Solução Imediata - ngrok:**

### **Passo 1: Executar Localmente**
```bash
npm run dev
```

### **Passo 2: Expor com ngrok**
```bash
ngrok http 3000
```

### **Passo 3: Configurar no Meta**
- URL: `https://abc123.ngrok.io/api/whatsapp`
- Token: `mu/NQ2Z92+[g`

### **Passo 4: Testar**
```bash
curl "https://abc123.ngrok.io/api/whatsapp?hub.mode=subscribe&hub.challenge=TESTE123&hub.verify_token=mu/NQ2Z92+[g"
```

## 📋 **Próximos Passos:**

1. **Imediato**: Usar ngrok para testar
2. **Médio prazo**: Configurar deploy em Railway/Render
3. **Longo prazo**: Corrigir configuração da Vercel

## 🎯 **Recomendação:**
**Use o ngrok agora para testar o webhook e depois migre para um serviço mais estável como Railway.**

## 📞 **Comandos para Executar:**

```bash
# Terminal 1 - Rodar aplicação
npm run dev

# Terminal 2 - Expor com ngrok
ngrok http 3000

# Terminal 3 - Testar webhook
curl "https://URL_DO_NGROK.ngrok.io/api/whatsapp?hub.mode=subscribe&hub.challenge=TESTE123&hub.verify_token=mu/NQ2Z92+[g"
```
