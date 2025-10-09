# ⚡ Início Rápido - WhatsApp Business API

## 🚀 **Configure em 5 Passos (15 minutos)**

---

### **PASSO 1: Configurar Webhook (5 min)** ✅

**Opção A: webhook.site (RECOMENDADO para teste)**
1. Acesse: https://webhook.site
2. Copie a URL única (ex: `https://webhook.site/abc123...`)
3. Acesse Meta Developer: https://developers.facebook.com/apps/2479744142426362
4. Vá em **Configuração** > **Webhook**
5. Configure:
   - **URL:** Cole a URL do webhook.site
   - **Token:** `mu/NQ2Z92+[g`
   - **Campos:** Marque `messages`
6. Clique em **"Verificar e salvar"**
7. ✅ Deve aparecer "Webhook verificado com sucesso"

**Opção B: localtunnel (para desenvolvimento)**
```bash
# Terminal 1
npm run dev

# Terminal 2
lt --port 5175 --subdomain dudufisio-webhook

# Use: https://dudufisio-webhook.loca.lt/api/whatsapp
```

---

### **PASSO 2: Testar Mensagem (2 min)** 📱

1. Abra o WhatsApp no seu celular
2. Envie uma mensagem para: **+55 11 5874 9885**
3. Digite: **"oi"**
4. ✅ Deve aparecer no webhook.site

---

### **PASSO 3: Aplicar Migração (3 min)** 💾

```bash
# Opção 1: Via CLI
supabase db push

# Opção 2: Via Dashboard
# 1. Acesse: https://supabase.com/dashboard
# 2. Vá em SQL Editor
# 3. Cole o conteúdo de: supabase/migrations/20251008_whatsapp_automations.sql
# 4. Execute
```

**Verificar se funcionou:**
```sql
SELECT * FROM whatsapp_automations;
SELECT * FROM whatsapp_messages;
SELECT * FROM whatsapp_templates;
```

---

### **PASSO 4: Configurar Variáveis (3 min)** ⚙️

**No painel da Vercel:**
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `dudufisio-ai`
3. Vá em **Settings** > **Environment Variables**
4. Adicione:

```env
WHATSAPP_WEBHOOK_VERIFY_TOKEN = mu/NQ2Z92+[g
WHATSAPP_ACCESS_TOKEN = EAAjPUGyZBQPoBPuHi3nmXTF8VtvqqTH1raoWFqM8ZAuZCzJZA2827TibaOuXZCVtPUpEmPT4QHNDOFRI1ZCiqZAmyTNJOX3yVuAlZBReJcXgI5OP7dtll9EUZBPt9PGRWdYsPwRQRvO4G2nCWeShzTLgPC0fwABtvfWHRyNMtXultxxPLMhuxJen6rFnPzUZALVWYWLk0ZAnGyNZBuAFC5IPcSn17xkytXwcVU8rARBOuEhQJlJHdc9TPD0tthswG8z4nxQZD
WHATSAPP_PHONE_NUMBER_ID = 779431901927431
WHATSAPP_BUSINESS_ACCOUNT_ID = 806225345331804
DEFAULT_CLINIC_ID = 1
CRON_SECRET = seu_secret_seguro_aqui
```

5. Salve e faça redeploy

---

### **PASSO 5: Testar Sistema Completo (2 min)** 🧪

**Teste as automações:**
```
Envie para +55 11 5874 9885:

1. "oi"          → Deve responder com menu
2. "agendar"     → Deve mostrar horários
3. "localização" → Deve mostrar endereço
4. "horário"     → Deve mostrar horário atendimento
5. "ajuda"       → Deve mostrar menu completo
```

**Verificar no banco:**
```sql
-- Ver mensagens recebidas
SELECT * FROM whatsapp_messages 
WHERE direction = 'inbound' 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver automações executadas
SELECT * FROM whatsapp_automations 
WHERE total_executions > 0;
```

---

## ✅ **VERIFICAÇÃO FINAL:**

Marque cada item quando concluir:

- [ ] Webhook configurado e verificado no Meta
- [ ] Mensagem de teste enviada e recebida
- [ ] Migração aplicada no Supabase
- [ ] Variáveis de ambiente configuradas
- [ ] Automações testadas e funcionando
- [ ] Dados registrados no banco
- [ ] Interface administrativa acessível

---

## 🎯 **COMANDOS ÚTEIS:**

```bash
# Ver logs da Vercel
vercel logs --follow

# Testar webhook localmente
npm run whatsapp:test-webhook

# Executar notificações manualmente
npm run whatsapp:notifications

# Build local
npm run build

# Deploy
vercel --prod
```

---

## 📱 **TESTE RÁPIDO (1 minuto):**

```bash
# Teste de verificação
curl "https://webhook.site/SEU_ID?hub.mode=subscribe&hub.challenge=TEST123&hub.verify_token=mu/NQ2Z92+[g"

# Deve retornar: TEST123
```

---

## 🆘 **PROBLEMAS COMUNS:**

### **Webhook não verifica:**
- Verifique se a URL está correta
- Verifique se o token está correto
- Teste com webhook.site primeiro

### **Mensagens não chegam:**
- Verifique se o webhook está ativo no Meta
- Verifique os logs da Vercel
- Verifique se as variáveis estão configuradas

### **Automações não respondem:**
- Verifique se a migração foi aplicada
- Verifique se as automações estão ativas
- Verifique os logs do banco

---

## 🎉 **PRONTO!**

**Em 15 minutos você terá um sistema WhatsApp Business completo funcionando!**

**Principais funcionalidades:**
- ✅ Recebimento automático de mensagens
- ✅ Respostas automáticas (20+ comandos)
- ✅ Agendamento via WhatsApp
- ✅ Notificações automáticas
- ✅ Interface de gerenciamento

**Comece agora! 🚀**
