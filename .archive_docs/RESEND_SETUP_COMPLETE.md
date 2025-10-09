# 📧 CONFIGURAÇÃO COMPLETA DO RESEND - Guia Passo a Passo

## 🎯 **OBJETIVO**
Configurar o Resend para enviar emails profissionais com seu domínio próprio através da integração com Vercel.

---

## 📋 **PRÉ-REQUISITOS**
- [ ] Conta no Vercel
- [ ] Domínio próprio (ex: seudominio.com)
- [ ] Acesso ao painel de DNS do domínio
- [ ] Projeto Vercel já deployado

---

## 🔧 **PASSO 1: CRIAR CONTA NO RESEND**

### **1.1 Acessar o Site**
1. Vá para: https://resend.com/
2. Clique em **"Sign up"**

### **1.2 Escolher Método de Cadastro**
**Opção A: Com GitHub (Recomendado)**
1. Clique em **"Sign up with GitHub"**
2. Autorize o acesso
3. Complete o perfil

**Opção B: Com Email**
1. Digite seu email
2. Crie uma senha
3. Confirme o email

### **1.3 Completar Perfil**
- **Name**: DuduFisio
- **Company**: DuduFisio Clínica
- **Use case**: Healthcare/Medical

---

## 🔗 **PASSO 2: CONECTAR COM VERCEL**

### **2.1 Acessar Integrações**
1. No dashboard do Resend, vá em **Settings**
2. Clique em **Integrations**

### **2.2 Conectar Vercel**
1. Encontre **"Vercel"** na lista
2. Clique em **"Connect"**
3. Autorize a conexão
4. Selecione seu projeto Vercel
5. Clique **"Connect"**

### **2.3 Verificar Conexão**
- ✅ Status: **Connected**
- ✅ Projeto: DuduFisio (ou nome do seu projeto)

---

## 🌐 **PASSO 3: CONFIGURAR DOMÍNIO**

### **3.1 Adicionar Domínio**
1. No Resend, vá em **Domains**
2. Clique em **"Add Domain"**
3. Digite seu domínio: `seudominio.com` (sem www)
4. Clique **"Add"**

### **3.2 Configurar DNS**
O Resend mostrará as configurações DNS necessárias. Você precisa adicionar no seu provedor de domínio:

#### **Registro 1: TXT (Verificação)**
```
Tipo: TXT
Nome: @
Valor: resend._domainkey.seudominio.com
TTL: 3600 (ou padrão)
```

#### **Registro 2: CNAME (Envio)**
```
Tipo: CNAME
Nome: resend.seudominio.com
Valor: resend.com
TTL: 3600 (ou padrão)
```

### **3.3 Onde Configurar DNS**
**Provedores comuns:**
- **GoDaddy**: Painel → Domínios → Gerenciar DNS
- **Registro.br**: Área do cliente → DNS
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Cloudflare**: DNS → Records

### **3.4 Verificar Configuração**
1. Volte ao Resend
2. Clique **"Verify"**
3. Aguarde propagação (5-30 minutos)
4. Status deve ficar **"Verified"** ✅

---

## 🔑 **PASSO 4: OBTER API KEY**

### **4.1 Criar API Key**
1. No Resend, vá em **API Keys**
2. Clique em **"Create API Key"**

### **4.2 Configurar API Key**
- **Name**: `DuduFisio Production`
- **Environment**: `Production`
- **Permissions**: `Full Access`
- Clique **"Create"**

### **4.3 Copiar API Key**
- **IMPORTANTE**: Copie a chave imediatamente
- Formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- ⚠️ **Esta chave só aparece uma vez!**

---

## ⚙️ **PASSO 5: CONFIGURAR VARIÁVEIS DE AMBIENTE**

### **5.1 No Vercel (Produção)**
1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=DuduFisio
EMAIL_ENABLED=true
```

### **5.2 No Local (.env.local)**
```env
# ===== RESEND EMAIL =====
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=DuduFisio
EMAIL_ENABLED=true
EMAIL_MAX_RETRIES=3
EMAIL_TIMEOUT=30000
EMAIL_RATE_LIMIT=100
```

---

## 🧪 **PASSO 6: TESTAR CONFIGURAÇÃO**

### **6.1 Teste no Dashboard Resend**
1. Vá em **Emails** → **Send**
2. Preencha:
   - **From**: `noreply@seudominio.com`
   - **To**: `seu_email@gmail.com`
   - **Subject**: `Teste DuduFisio`
   - **Content**: `Teste de email profissional!`
3. Clique **"Send"**
4. Verifique se chegou na sua caixa de entrada

### **6.2 Teste via API**
```bash
curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "noreply@seudominio.com",
       "to": ["seu_email@gmail.com"],
       "subject": "Teste API DuduFisio",
       "html": "<h1>Teste via API!</h1><p>Email enviado com sucesso!</p>"
     }'
```

---

## 📊 **PASSO 7: VERIFICAR ANALYTICS**

### **7.1 Dashboard Resend**
- **Emails sent**: Quantidade enviada
- **Deliverability**: Taxa de entrega
- **Opens**: Taxa de abertura
- **Clicks**: Taxa de cliques

### **7.2 Logs de Email**
- **Status**: Sent, Delivered, Opened
- **Timestamps**: Quando foi enviado/aberto
- **Error logs**: Se houver problemas

---

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **Problema 1: Domínio não verifica**
**Solução**: 
- Verifique se os registros DNS estão corretos
- Aguarde até 24h para propagação completa
- Use ferramentas como `dig` para verificar

### **Problema 2: Emails vão para spam**
**Solução**:
- Configure SPF, DKIM e DMARC
- Use conteúdo profissional
- Evite palavras de spam

### **Problema 3: API Key não funciona**
**Solução**:
- Verifique se copiou corretamente
- Confirme se está no ambiente correto
- Teste com curl primeiro

### **Problema 4: Limite de emails**
**Solução**:
- Plano gratuito: 100k emails/mês
- Upgrade para planos pagos se necessário

---

## 💰 **CUSTOS DO RESEND**

### **Plano Gratuito**
- ✅ **100.000 emails/mês** grátis
- ✅ **3 domínios** verificados
- ✅ **Analytics** básicos
- ✅ **API** completa

### **Planos Pagos**
- **Pro**: $20/mês (1M emails)
- **Business**: $80/mês (5M emails)

---

## 🎯 **CONFIGURAÇÃO FINAL RECOMENDADA**

### **Variáveis de Ambiente Completas**
```env
# ===== WHATSAPP WEB CLIENT (Gratuito) =====
WHATSAPP_USE_WEB_CLIENT=true
WHATSAPP_SESSION_PATH=./wa-session
WHATSAPP_ENABLED=true

# ===== RESEND EMAIL (Gratuito até 100k/mês) =====
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=DuduFisio
EMAIL_ENABLED=true

# ===== CONFIGURAÇÕES GERAIS =====
COMMUNICATION_RETRY_ATTEMPTS=3
COMMUNICATION_RATE_LIMIT_GLOBAL=10000
COMMUNICATION_ENABLE_ANALYTICS=true
```

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

- [ ] Conta criada no Resend
- [ ] Vercel conectado
- [ ] Domínio adicionado
- [ ] DNS configurado
- [ ] Domínio verificado
- [ ] API Key criada
- [ ] Variáveis configuradas
- [ ] Teste de email funcionando
- [ ] Analytics visíveis

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Execute os passos acima**
2. **Teste o envio de email**
3. **Me avise quando estiver pronto**
4. **Eu implemento as mudanças no código**
5. **Testamos tudo funcionando**

---

**Agora é só seguir o passo a passo! Qualquer dúvida, me pergunte!** 🎯
