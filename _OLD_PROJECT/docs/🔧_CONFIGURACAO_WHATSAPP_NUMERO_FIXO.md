# 🔧 CONFIGURAÇÃO WHATSAPP - NÚMERO FIXO

**Data**: 15/10/2025  
**Objetivo**: Conectar número fixo da clínica ao sistema CRM

---

## 📱 OPÇÃO RECOMENDADA: WhatsApp Web (GRATUITO)

### **Por que usar WhatsApp Web?**

✅ **100% GRATUITO** - Sem custo por mensagem  
✅ **Implementação imediata** - Já está no código!  
✅ **Sem aprovação necessária** - Meta não precisa aprovar  
✅ **Usa número existente** - Fixo ou celular da clínica  
✅ **Sem limites de features** - Todas funcionalidades disponíveis  

---

## 🚀 PASSO A PASSO - CONFIGURAÇÃO

### **Pré-requisitos**

- ✅ Número de telefone com WhatsApp ativo
- ✅ Pode ser: Fixo ou Celular
- ✅ Recomendado: WhatsApp Business no celular
- ✅ Servidor rodando (local ou produção)

---

### **PASSO 1: Configurar Variáveis de Ambiente**

Edite o arquivo `.env.local`:

```bash
# WhatsApp Web Configuration (GRATUITO)
VITE_WHATSAPP_USE_WEB_CLIENT=true
VITE_WHATSAPP_PHONE_NUMBER=seu_numero_aqui

# Exemplo: 
# VITE_WHATSAPP_PHONE_NUMBER=5511999999999
# (Sem espaços, sem hífens, sem parênteses)
```

---

### **PASSO 2: Instalar Dependências (se ainda não instalou)**

```bash
npm install
```

Isso instalará automaticamente:
- `whatsapp-web.js` - Cliente WhatsApp Web
- `qrcode-terminal` - Exibir QR Code no terminal
- Outras dependências necessárias

---

### **PASSO 3: Iniciar Serviço WhatsApp**

#### **Opção A: Desenvolvimento Local**

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Em outro terminal, iniciar WhatsApp
npm run start:whatsapp
```

#### **Opção B: Produção**

```bash
# Build da aplicação
npm run build

# Iniciar WhatsApp service
node scripts/start-whatsapp.ts
```

---

### **PASSO 4: Escanear QR Code**

1. O terminal mostrará um QR Code
2. Abra o WhatsApp no celular com o número fixo
3. Vá em: **Configurações → Dispositivos Conectados → Conectar dispositivo**
4. Escaneie o QR Code

**Exemplo do que você verá:**

```
████████████████████████████
██ ▄▄▄▄▄ █▀ █▀▀█ █ ▄▄▄▄▄ ██
██ █   █ █▀▀ ▄█▄  █ █   █ ██
██ █▄▄▄█ ██▀ ▀  ▀ █ █▄▄▄█ ██
████████████████████████████

✅ WhatsApp Web conectado!
📱 Número: +55119999999999
🚀 Pronto para enviar e receber mensagens
```

---

### **PASSO 5: Verificar Conexão**

No código, você pode verificar:

```typescript
import { getWhatsAppWebService } from './services/whatsapp/WhatsAppWebService';

const whatsapp = getWhatsAppWebService();

if (whatsapp.isConnected()) {
  console.log('✅ WhatsApp conectado!');
} else {
  console.log('❌ WhatsApp desconectado');
}
```

---

## 📊 RECURSOS DISPONÍVEIS

### **1. Envio de Mensagens**

```typescript
import { whatsappCrmService } from './services/crm/whatsappCrmService';

// Enviar mensagem com rate limiting automático
const result = await whatsappCrmService.sendMessage({
  to: '+5511999999999',
  message: 'Olá! Como posso ajudar?',
  lead_id: 'uuid-do-lead'
});

if (result.queued) {
  console.log(`Mensagem enfileirada: ${result.reason}`);
} else {
  console.log(`Mensagem enviada: ${result.message_id}`);
}
```

### **2. Recebimento Automático**

Mensagens recebidas são processadas automaticamente:

```typescript
// Webhook automático já configurado
// Quando alguém enviar mensagem:
// 1. Sistema verifica se é paciente existente
// 2. Se não, cria lead automaticamente
// 3. Registra interação no CRM
// 4. Calcula score do lead
```

### **3. Rate Limiting Inteligente**

```typescript
// Configuração padrão (já ativa):
- Máximo 30 mensagens/hora
- Máximo 200 mensagens/dia
- Mínimo 2h entre mensagens para mesmo número
- Priorização por lead_score (hot leads primeiro)
```

### **4. Horário Comercial**

```typescript
// Mensagens fora do horário são enfileiradas
// Configuração padrão:
- Segunda a Sexta: 8h-18h
- Sábado: 8h-12h
- Domingo: Fechado
- Respeita feriados brasileiros
```

---

## 🎯 CASOS DE USO

### **Caso 1: Novo lead via WhatsApp**

```
1. Pessoa envia: "Olá, gostaria de agendar fisioterapia"
2. Sistema:
   - Cria lead automaticamente
   - Score inicial: 60 (engajado)
   - Status: 'novo'
3. Resposta automática (se configurado):
   - "Olá! Recebemos sua mensagem. Em breve entraremos em contato."
```

### **Caso 2: Follow-up automático**

```
1. Lead sem interação há 3 dias
2. Sistema:
   - Verifica horário comercial ✅
   - Verifica rate limit ✅
   - Envia mensagem de follow-up
3. Lead responde
4. Score aumenta para 75 (warm → hot)
```

### **Caso 3: Conversão lead → paciente**

```
1. Lead agenda primeira consulta
2. Sistema:
   - Converte lead em paciente
   - Cria appointment
   - Envia confirmação via WhatsApp
3. Mensagem de boas-vindas automática
```

---

## ⚙️ CONFIGURAÇÕES AVANÇADAS

### **Alterar Horário Comercial**

```typescript
import { getBusinessHours } from './services/whatsapp/businessHours';

const businessHours = getBusinessHours();

// Alterar horário de um dia específico
businessHours.setDayHours(
  1, // Segunda-feira (0=domingo, 1=segunda, ...)
  '09:00', // Abertura
  '19:00'  // Fechamento
);

// Adicionar feriado customizado
businessHours.addHoliday('2025-12-24'); // Véspera de Natal
```

### **Alterar Rate Limits**

```typescript
import { getRateLimiter } from './services/whatsapp/rateLimiter';

const rateLimiter = getRateLimiter({
  maxMessagesPerHour: 50,    // Aumentar para 50/hora
  maxMessagesPerDay: 300,     // Aumentar para 300/dia
  minIntervalMinutes: 60,     // Reduzir para 1h
  priorityByScore: true       // Manter priorização
});
```

### **Desabilitar Horário Comercial**

```typescript
import { getBusinessHours } from './services/whatsapp/businessHours';

const businessHours = getBusinessHours({
  respectBusinessHours: false // Enviar a qualquer hora
});
```

---

## 🔄 MANUTENÇÃO

### **Reconectar WhatsApp**

Se a conexão cair:

```bash
# Parar serviço
Ctrl+C (no terminal do WhatsApp)

# Reiniciar
npm run start:whatsapp

# Escanear QR Code novamente
```

### **Verificar Fila de Mensagens**

```typescript
import { getRateLimiter } from './services/whatsapp/rateLimiter';

const rateLimiter = getRateLimiter();
const stats = await rateLimiter.getQueueStats();

console.log('Fila de mensagens:');
console.log(`- Pendentes: ${stats.pending}`);
console.log(`- Enviadas hoje: ${stats.sent_today}`);
console.log(`- Falhas hoje: ${stats.failed_today}`);
console.log(`- Tempo médio de espera: ${stats.avg_wait_minutes}min`);
```

### **Processar Fila Manualmente**

```typescript
import { getRateLimiter } from './services/whatsapp/rateLimiter';

const rateLimiter = getRateLimiter();
const result = await rateLimiter.processQueue(10); // Processar 10 mensagens

console.log(`Processadas: ${result.processed}`);
console.log(`Enviadas: ${result.sent}`);
console.log(`Falhas: ${result.failed}`);
```

### **Limpar Fila Antiga**

```typescript
import { getRateLimiter } from './services/whatsapp/rateLimiter';

const rateLimiter = getRateLimiter();
const deleted = await rateLimiter.cleanQueue(7); // Remover > 7 dias

console.log(`${deleted} mensagens antigas removidas`);
```

---

## 📊 MONITORAMENTO

### **Dashboard de WhatsApp**

Acesse no sistema:

```
/crm/whatsapp-analytics
```

Você verá:
- Taxa de entrega
- Taxa de resposta
- Mensagens por dia/hora
- Fila de mensagens
- Hot leads com mensagens pendentes

### **Logs**

```bash
# Ver logs do WhatsApp Web
tail -f logs/whatsapp.log

# Ver logs de mensagens enviadas
tail -f logs/messages.log
```

---

## ⚠️ LIMITAÇÕES DO WHATSAPP WEB

### **O que pode acontecer:**

1. **Bloqueio por spam**
   - Se enviar > 1000 mensagens/dia
   - Solução: Rate limiter já configurado

2. **Desconexão ocasional**
   - Internet instável
   - Solução: Reconectar via QR Code

3. **Celular precisa estar online**
   - WhatsApp Web depende do celular
   - Solução: Manter celular conectado

### **Como evitar problemas:**

✅ Não enviar spam  
✅ Respeitar horário comercial  
✅ Manter mensagens personalizadas  
✅ Responder leads rapidamente  
✅ Usar rate limiting (já ativo)  

---

## 🎯 QUANDO MIGRAR PARA API OFICIAL

### **Sinais de que precisa migrar:**

- [ ] Enviando > 500 mensagens/dia
- [ ] Precisa de multiple agents simultâneos
- [ ] Precisa de templates aprovados pela Meta
- [ ] Precisa de alta disponibilidade (99.9%)
- [ ] Sofreu bloqueio no WhatsApp Web

### **Custos da API Oficial (Meta/Twilio):**

```
- Mensagem texto: R$ 0,025
- Mensagem mídia: R$ 0,035
- 500 mensagens/dia = R$ 12,50/dia = R$ 375/mês
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### **Setup Inicial**
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas (`npm install`)
- [ ] WhatsApp service iniciado
- [ ] QR Code escaneado
- [ ] Conexão verificada

### **Migration SQL**
- [ ] Aplicar `20251015_create_whatsapp_message_queue.sql` no Supabase
- [ ] Verificar tabela `whatsapp_message_queue` criada
- [ ] Testar functions SQL

### **Testes**
- [ ] Enviar mensagem de teste
- [ ] Receber mensagem de teste
- [ ] Verificar criação de lead automático
- [ ] Verificar fila de mensagens
- [ ] Verificar rate limiting

### **Produção**
- [ ] Configurar cron job para processar fila
- [ ] Configurar alerts de desconexão
- [ ] Documentar número fixo utilizado
- [ ] Treinar equipe

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Iniciar WhatsApp Web
npm run start:whatsapp

# Verificar status
curl http://localhost:3000/api/whatsapp/status

# Processar fila manualmente
curl -X POST http://localhost:3000/api/whatsapp/process-queue

# Estatísticas
curl http://localhost:3000/api/whatsapp/stats
```

---

## 📞 SUPORTE

**Problemas comuns:**

1. **QR Code não aparece**
   - Verificar se porta 3000 está livre
   - Verificar logs: `tail -f logs/whatsapp.log`

2. **Não envia mensagens**
   - Verificar conexão: `whatsapp.isConnected()`
   - Verificar fila: `rateLimiter.getQueueStats()`

3. **Mensagens duplicadas**
   - Verificar rate limiter está ativo
   - Verificar tabela `whatsapp_message_queue`

**Documentação adicional:**
- WhatsApp Web.js: https://wwebjs.dev/
- Supabase: https://supabase.com/docs

---

## 🎉 PRONTO!

Seu sistema CRM agora tem WhatsApp integrado com:

✅ Número fixo da clínica  
✅ Envio/recebimento automático  
✅ Rate limiting inteligente  
✅ Horário comercial  
✅ Retry automático  
✅ Fila de mensagens  
✅ Lead scoring automático  
✅ **CUSTO: R$ 0/mês** 🎁  

---

**Criado em**: 15/10/2025  
**Versão**: 1.0  
**Status**: ✅ Pronto para produção

