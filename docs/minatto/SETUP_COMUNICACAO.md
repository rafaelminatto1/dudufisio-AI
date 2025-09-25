# Setup do Sistema de Comunicação Omnichannel - Guia Passo a Passo

## 📋 Checklist de Configuração

### ✅ **Pré-requisitos**
- [ ] Node.js 18+ instalado
- [ ] Conta Supabase ativa
- [ ] Redis instalado (local ou cloud)
- [ ] Contas nos provedores de comunicação

---

## 🔧 **Passo 1: Configuração do Ambiente**

### 1.1 Copiar arquivo de exemplo
```bash
cp .env.example .env.local
```

### 1.2 Editar .env.local com suas credenciais
```bash
nano .env.local
# ou
code .env.local
```

---

## 📱 **Passo 2: Configurar Canais de Comunicação**

### 2.1 WhatsApp Business (Recomendado para produção)

**Opção A: WhatsApp Business API (Meta)**
1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Crie um app WhatsApp Business
3. Configure webhook URL: `https://seu-dominio.com/webhooks/whatsapp/status`
4. Anote as credenciais:
```env
WHATSAPP_BUSINESS_API_TOKEN=EAAxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=1234567890123456
WHATSAPP_WEBHOOK_VERIFY_TOKEN=meu_token_secreto_123
WHATSAPP_USE_WEB_CLIENT=false
```

**Opção B: WhatsApp Web Client (Para desenvolvimento)**
```env
WHATSAPP_USE_WEB_CLIENT=true
```

### 2.2 SMS via Twilio

1. Acesse [Twilio Console](https://console.twilio.com/)
2. Crie uma conta ou faça login
3. Vá em **Phone Numbers** → **Manage** → **Buy a number**
4. Anote as credenciais:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+5511999999999
```

5. Configure webhook para status de entrega:
   - URL: `https://seu-dominio.com/webhooks/twilio/sms/status`
   - Método: POST

### 2.3 Email via SMTP

**Gmail (Recomendado):**
1. Ative 2FA na sua conta Google
2. Gere uma senha de app:
   - Google Account → Security → App passwords
3. Configure:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_de_app_16_caracteres
EMAIL_FROM=noreply@fisioflow.com
EMAIL_FROM_NAME=FisioFlow
```

**Outros provedores:**
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Mailgun**: Configure webhook em `https://seu-dominio.com/webhooks/email/mailgun`

### 2.4 Push Notifications

**Para Web Push:**
1. Gere chaves VAPID:
```bash
npx web-push generate-vapid-keys
```

2. Configure:
```env
VAPID_PUBLIC_KEY=BF....(chave_publica_gerada)
VAPID_PRIVATE_KEY=K....(chave_privada_gerada)
```

**Para Mobile (opcional):**
1. Crie projeto no [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Project Settings** → **Cloud Messaging**
3. Copie a Server Key:
```env
FCM_SERVER_KEY=AAAAxxxxxxx:APA91bH...
```

---

## 🗄️ **Passo 3: Configurar Banco de Dados**

### 3.1 Supabase
1. Acesse [Supabase Dashboard](https://app.supabase.com/)
2. Crie um novo projeto ou use existente
3. Configure variáveis:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Executar Migrações
```bash
# Instalar Supabase CLI se não tiver
npm install -g supabase

# Login no Supabase
supabase login

# Linkar projeto local
supabase link --project-ref seu-projeto-ref

# Executar migração do sistema de comunicação
supabase db push

# Verificar se tabelas foram criadas
supabase db reset --debug
```

### 3.3 Redis (Para filas de mensagens)

**Local:**
```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis
```

**Cloud (Recomendado para produção):**
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
- [AWS ElastiCache](https://aws.amazon.com/elasticache/)
- [Railway Redis](https://railway.app/)

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## ⚙️ **Passo 4: Configurações do Sistema**

### 4.1 Configurações Gerais
```env
# Configurações do sistema de comunicação
COMMUNICATION_DEFAULT_TIMEZONE=America/Sao_Paulo
COMMUNICATION_DEFAULT_LANGUAGE=pt-BR
COMMUNICATION_RETRY_ATTEMPTS=3
COMMUNICATION_RETRY_DELAY=1000
COMMUNICATION_RATE_LIMIT_GLOBAL=10000
COMMUNICATION_WEBHOOK_TIMEOUT=30000
COMMUNICATION_ENABLE_ANALYTICS=true
COMMUNICATION_ENABLE_WEBHOOKS=true
COMMUNICATION_ENABLE_LOGGING=true
COMMUNICATION_LOG_LEVEL=info
```

### 4.2 Rate Limits por Canal
```env
SMS_RATE_LIMIT_PER_HOUR=100
EMAIL_RATE_LIMIT_PER_HOUR=1000
WHATSAPP_RATE_LIMIT_PER_HOUR=1000
PUSH_RATE_LIMIT_PER_HOUR=5000
```

---

## 🚀 **Passo 5: Inicialização e Testes**

### 5.1 Instalar Dependências
```bash
npm install
```

### 5.2 Executar em Desenvolvimento
```bash
npm run dev
```

### 5.3 Testar Conexões
1. Acesse: `http://localhost:5173`
2. Vá em **Configurações** → **Comunicação**
3. Teste cada canal usando os botões "Testar"

### 5.4 Verificar Health Endpoint
```bash
curl http://localhost:5173/api/webhooks/health
```

---

## 📧 **Passo 6: Configurar Templates Iniciais**

### 6.1 Acessar Template Manager
1. Vá em **Comunicação** → **Templates**
2. Clique em **"Novo Template"**

### 6.2 Template de Lembrete de Consulta
```yaml
Nome: Lembrete de Consulta
Tipo: appointment_reminder
Canais: WhatsApp, SMS, Email

Conteúdo:
Olá {{patient.name}},

Você tem uma consulta agendada:

📅 Data: {{appointment.date}}
🕐 Horário: {{appointment.time}}
👨‍⚕️ Fisioterapeuta: {{appointment.therapist}}
📍 Local: {{clinic.address}}

Para reagendar: {{clinic.phone}}

Atenciosamente,
{{clinic.name}}
```

### 6.3 Template de Confirmação
```yaml
Nome: Confirmação de Agendamento
Tipo: appointment_confirmation
Canais: WhatsApp, SMS, Email

Conteúdo:
✅ Consulta confirmada!

Paciente: {{patient.name}}
Data/Hora: {{appointment.date}} às {{appointment.time}}
Fisioterapeuta: {{appointment.therapist}}

Chegue 10 minutos antes.

{{clinic.name}}
```

---

## 🤖 **Passo 7: Configurar Automação**

### 7.1 Acessar Automation Manager
1. Vá em **Comunicação** → **Automação**
2. Clique em **"Nova Regra"**

### 7.2 Regra: Lembrete 24h
```yaml
Nome: Lembrete 24h antes da consulta
Trigger: appointment_reminder
Condições:
  - appointment.hoursUntil equals 24
  - patient.allowReminders equals true

Ações:
  - Canal: WhatsApp
  - Template: Lembrete de Consulta
  - Delay: 0 minutos
  - Fallback: SMS, Email
```

### 7.3 Regra: Confirmação Imediata
```yaml
Nome: Confirmação ao agendar
Trigger: appointment_scheduled
Condições: (nenhuma)

Ações:
  - Canal: WhatsApp
  - Template: Confirmação de Agendamento
  - Delay: 1 minuto
```

---

## 🔒 **Passo 8: Configurar Webhooks (Produção)**

### 8.1 Configurar Domínio e SSL
```bash
# Exemplo com nginx
server {
    listen 443 ssl;
    server_name seu-dominio.com;

    location /webhooks/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 8.2 URLs de Webhook para Configurar

**Twilio SMS:**
- URL: `https://seu-dominio.com/webhooks/twilio/sms/status`
- Método: POST

**WhatsApp Business:**
- URL: `https://seu-dominio.com/webhooks/whatsapp/status`
- Verify Token: valor do `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

**SendGrid Email:**
- URL: `https://seu-dominio.com/webhooks/email/sendgrid`

**Mailgun Email:**
- URL: `https://seu-dominio.com/webhooks/email/mailgun`

---

## 📊 **Passo 9: Monitoramento**

### 9.1 Acessar Dashboard
1. Vá em **Comunicação** → **Dashboard**
2. Configure filtros de período
3. Ative atualização automática

### 9.2 Configurar Alertas
No arquivo de configuração, definir limites:
```env
ALERT_DELIVERY_RATE_MIN=95
ALERT_RESPONSE_TIME_MAX=5000
ALERT_QUEUE_SIZE_MAX=1000
ALERT_DAILY_COST_MAX=100
```

---

## 🧪 **Passo 10: Testar Sistema Completo**

### 10.1 Teste Manual
1. **Criar paciente** com telefone/email válidos
2. **Agendar consulta** para amanhã
3. **Verificar** se lembrete foi enviado
4. **Conferir** no dashboard as métricas

### 10.2 Teste de Templates
```bash
# Endpoint de teste
curl -X POST http://localhost:5173/api/webhooks/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "João Teste",
    "appointment_date": "16/01/2025",
    "appointment_time": "14:00"
  }'
```

### 10.3 Executar Testes Unitários
```bash
npm test tests/communication/
```

---

## 🆘 **Troubleshooting**

### Problemas Comuns

**❌ Erro: "Channel not registered"**
- Verificar se as credenciais estão corretas no .env.local
- Reiniciar o servidor após mudanças

**❌ WhatsApp não conecta**
- Verificar se `WHATSAPP_USE_WEB_CLIENT=true` para desenvolvimento
- Para Business API, verificar token e phone number ID

**❌ SMS não envia**
- Verificar Account SID e Auth Token do Twilio
- Confirmar se o número está verificado

**❌ Email não envia**
- Verificar senha de app do Gmail (não a senha normal)
- Testar SMTP com telnet: `telnet smtp.gmail.com 587`

**❌ Redis não conecta**
- Verificar se Redis está rodando: `redis-cli ping`
- Conferir host e porta no .env.local

### Logs Úteis
```bash
# Ver logs do sistema
tail -f logs/communication.log

# Ver status dos serviços
curl http://localhost:5173/api/webhooks/health

# Ver métricas em tempo real
curl http://localhost:5173/api/communication/metrics
```

---

## 📞 **Suporte**

**Em caso de dúvidas:**
1. Consulte a documentação completa em `docs/COMMUNICATION_SYSTEM.md`
2. Verifique os testes em `tests/communication/` para exemplos
3. Examine os logs de erro detalhados
4. Teste cada canal individualmente antes da integração

---

## ✅ **Checklist Final**

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados migrado com sucesso
- [ ] Redis conectado e funcionando
- [ ] Pelo menos 1 canal de comunicação testado
- [ ] Template inicial criado
- [ ] Regra de automação configurada
- [ ] Dashboard acessível e mostrando dados
- [ ] Webhooks configurados (se produção)
- [ ] Testes unitários passando
- [ ] Sistema funcionando end-to-end

**🎉 Sistema pronto para uso!**

---

**Data de criação:** Janeiro 2025
**Versão:** 1.0
**Sistema:** DuduFisio-AI Communication System