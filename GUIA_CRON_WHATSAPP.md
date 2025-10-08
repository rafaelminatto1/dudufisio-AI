# ⏰ Guia de Configuração - Cron Jobs WhatsApp

## 📋 **Visão Geral**

Sistema automatizado para enviar notificações via WhatsApp:
- ✅ Lembretes de consulta (1 dia antes)
- ✅ Confirmações de presença (2 dias antes)
- ✅ Lembretes de retorno (pacientes inativos 30+ dias)
- ✅ Lembretes de pagamento pendente

## 🚀 **Opções de Implementação:**

### **Opção 1: Vercel Cron Jobs (Recomendado)**

1. **Criar arquivo de configuração:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/whatsapp-notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

2. **Criar endpoint de cron:**

```javascript
// api/cron/whatsapp-notifications.js
import { getWhatsAppNotificationService } from '../../services/whatsapp/WhatsAppNotificationService';

export default async function handler(req, res) {
  // Verificar authorization
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const service = getWhatsAppNotificationService();
    await service.runDailyNotifications(process.env.DEFAULT_CLINIC_ID);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

### **Opção 2: GitHub Actions**

```yaml
# .github/workflows/whatsapp-notifications.yml
name: WhatsApp Daily Notifications

on:
  schedule:
    - cron: '0 9 * * *'  # Diariamente às 9h UTC (6h BRT)
  workflow_dispatch:  # Permitir execução manual

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run notifications
        env:
          WHATSAPP_ACCESS_TOKEN: ${{ secrets.WHATSAPP_ACCESS_TOKEN }}
          WHATSAPP_PHONE_NUMBER_ID: ${{ secrets.WHATSAPP_PHONE_NUMBER_ID }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
        run: npm run whatsapp:notifications
```

### **Opção 3: Cron tradicional (Linux Server)**

```bash
# Editar crontab
crontab -e

# Adicionar linha
0 9 * * * cd /path/to/project && node scripts/whatsapp-daily-notifications.js >> /var/log/whatsapp-cron.log 2>&1
```

### **Opção 4: Railway Cron Jobs**

```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "cronJobs": [
      {
        "schedule": "0 9 * * *",
        "command": "node scripts/whatsapp-daily-notifications.js"
      }
    ]
  }
}
```

## 📦 **Adicionar Script ao package.json:**

```json
{
  "scripts": {
    "whatsapp:notifications": "node scripts/whatsapp-daily-notifications.js",
    "whatsapp:test-notifications": "node scripts/whatsapp-daily-notifications.js --test"
  }
}
```

## 🧪 **Teste Manual:**

```bash
# Teste local
npm run whatsapp:notifications

# Teste específico
node scripts/whatsapp-daily-notifications.js
```

## 📊 **Monitoramento:**

### **Ver Logs de Execução:**
```sql
SELECT 
  phone,
  message_type,
  status,
  created_at
FROM whatsapp_messages
WHERE direction = 'outbound'
AND message_type = 'notification'
ORDER BY created_at DESC
LIMIT 100;
```

### **Estatísticas de Envio:**
```sql
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM whatsapp_messages
WHERE direction = 'outbound'
AND message_type = 'notification'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

## ⚙️ **Configurações Recomendadas:**

### **Horários de Envio:**
- **Lembretes de consulta:** 9h (1 dia antes)
- **Confirmações:** 9h (2 dias antes)
- **Lembretes de retorno:** 10h (semanal)
- **Lembretes de pagamento:** 14h (semanal)

### **Variáveis de Ambiente:**
```env
CRON_SECRET=your_cron_secret_key
DEFAULT_CLINIC_ID=your_clinic_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

## 🚨 **Troubleshooting:**

### **Cron não executa:**
1. Verificar permissões do arquivo
2. Verificar logs do sistema
3. Testar execução manual primeiro

### **Mensagens não são enviadas:**
1. Verificar configuração do WhatsApp
2. Verificar saldo/limites da conta
3. Verificar logs de erro

### **Performance:**
- Limite de 50 mensagens por execução
- Delay de 1s entre mensagens
- Retry automático em caso de erro

## 📈 **Métricas Esperadas:**

- Taxa de envio: ~95%
- Taxa de entrega: ~90%
- Taxa de leitura: ~70%
- Tempo de execução: ~5 min para 100 mensagens

## 🎯 **Próximos Passos:**

1. ✅ Escolher opção de cron (Vercel/GitHub Actions/Railway)
2. ✅ Configurar variáveis de ambiente
3. ✅ Testar execução manual
4. ✅ Configurar schedule automático
5. ✅ Monitorar execuções

**Sistema de notificações automáticas pronto para uso!** 🚀
