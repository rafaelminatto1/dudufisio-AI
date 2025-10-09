# 📦 Instalação - Activity Fisioterapia Integration

> **Guia passo-a-passo para colocar em funcionamento**

---

## 🚀 Quick Start (5 minutos)

### 1. Instalar Dependências

```bash
npm install --save axios @google/generative-ai
```

### 2. Aplicar Migrations SQL

```bash
# Via Supabase CLI (recomendado)
npx supabase db push

# OU manualmente via psql
psql $DATABASE_URL -f supabase/migrations/20251008100001_create_crm_tables.sql
```

### 3. Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```bash
# Gemini API (já existe provavelmente)
GEMINI_API_KEY=sua_key_aqui
NEXT_PUBLIC_GEMINI_API_KEY=sua_key_aqui

# Twilio (WhatsApp) - Opcional para começar
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+5511999999999
WHATSAPP_VERIFY_TOKEN=token_secreto_webhook
```

### 4. Testar CRM

Acesse:
- `/crm/dashboard` - Dashboard de métricas
- `/crm/leads` - Kanban de leads

---

## 📋 Checklist de Instalação Completa

### ✅ Fase 1: CRM (Pronto para Usar!)

- [ ] Dependências instaladas (`axios`, `@google/generative-ai`)
- [ ] Migration aplicada
- [ ] Tabelas criadas no Supabase
- [ ] Validar que `leads`, `lead_interactions`, `message_templates` existem
- [ ] Criar primeiro lead de teste
- [ ] Visualizar no dashboard

**Teste:**
```typescript
import { LeadService } from '@/services/api/crm/leadService';

const lead = await LeadService.createLead({
  clinic_id: 'your-clinic-id',
  name: 'Teste Lead',
  phone: '+5511999999999',
  source: 'whatsapp',
  urgency_level: 'media',
});

console.log('Lead criado:', lead);
```

---

### ⏳ Fase 2: WhatsApp (Requer Configuração)

#### Pré-requisitos:
1. **Conta Twilio** ([criar aqui](https://www.twilio.com/try-twilio))
   - Verificar identidade
   - Adicionar créditos (R$ 100 inicial)

2. **Número WhatsApp dedicado**
   - Comprar número no Twilio
   - Ativar WhatsApp Sandbox (teste)
   - OU aprovar número para produção

3. **Meta Business Manager**
   - Criar/verificar conta Business
   - Adicionar número ao WhatsApp Business

#### Instalação:

- [ ] Criar conta Twilio
- [ ] Adquirir número ou ativar sandbox
- [ ] Copiar credenciais para `.env.local`
- [ ] Testar envio de mensagem

**Teste:**
```typescript
import { getWhatsAppService } from '@/services/whatsapp/WhatsAppService';

const whatsapp = getWhatsAppService();

if (whatsapp.isConfigured()) {
  await whatsapp.sendMessage(
    '+5511999999999',
    'Olá! Esta é uma mensagem de teste.',
    'clinic-id'
  );
  console.log('Mensagem enviada!');
} else {
  console.log('WhatsApp não configurado');
}
```

---

### ⏳ Fase 3: IA Conversacional (Requer Gemini Key)

#### Pré-requisitos:
1. **Google Gemini API Key**
   - Já deve existir no projeto
   - Ou criar em [ai.google.dev](https://ai.google.dev)

#### Instalação:

- [ ] Verificar que `GEMINI_API_KEY` está no `.env.local`
- [ ] Testar IA

**Teste:**
```typescript
import { getConversationalAgent } from '@/services/ai/ConversationalAgent';

const agent = getConversationalAgent();
const response = await agent.processMessage(
  'lead-id',
  'Estou com dor no joelho há 2 semanas',
  { name: 'João', status: 'novo' }
);

console.log('Resposta da IA:', response.message);
console.log('Intenção detectada:', response.intent);
```

---

## 🔧 Configurações Opcionais (Fase 2 e 3 completas)

### Redis (Para filas e contexto)

```bash
# Opção 1: Redis local (desenvolvimento)
docker run -d -p 6379:6379 redis:alpine

# Opção 2: Upstash (produção recomendada)
# Criar conta em https://upstash.com
# Copiar REDIS_URL
```

Adicionar ao `.env.local`:
```bash
REDIS_URL=redis://localhost:6379
# OU
UPSTASH_REDIS_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_TOKEN=xxxxxxxxxxxxx
```

### Bull/BullMQ (Para automações)

```bash
npm install --save bull bullmq ioredis
```

---

## 🧪 Testes de Validação

### 1. Validar Database

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('leads', 'lead_interactions', 'message_templates');

-- Deve retornar 3 linhas

-- Verificar RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('leads', 'lead_interactions');

-- Deve retornar várias policies
```

### 2. Validar API

```bash
# Testar criação de lead via API
curl -X POST http://localhost:3000/api/crm/leads \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": "uuid",
    "name": "Teste API",
    "phone": "+5511999999999",
    "source": "whatsapp"
  }'
```

### 3. Validar Frontend

Acesse:
- `http://localhost:3000/crm/dashboard`
- Deve exibir métricas (mesmo que zeradas)
- `http://localhost:3000/crm/leads`
- Deve exibir kanban com 5 colunas

---

## 📦 Dependências Instaladas Automaticamente

```json
{
  "dependencies": {
    "axios": "^1.12.2",
    "@google/generative-ai": "^0.21.0"
  }
}
```

---

## 📊 Verificar Instalação

Execute este script para validar:

```typescript
// scripts/validate-installation.ts

async function validate() {
  console.log('🔍 Validando instalação...\n');

  // 1. Verificar dependências
  try {
    require('axios');
    require('@google/generative-ai');
    console.log('✅ Dependências instaladas');
  } catch (err) {
    console.error('❌ Dependências faltando');
    return;
  }

  // 2. Verificar variáveis de ambiente
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

  console.log(`${hasGemini ? '✅' : '⚠️ '} Gemini API Key`);
  console.log(`${hasTwilio ? '✅' : '⏳'} Twilio (opcional)`);

  // 3. Verificar serviços
  try {
    const { getWhatsAppService } = await import('@/services/whatsapp/WhatsAppService');
    const whatsapp = getWhatsAppService();
    console.log(`${whatsapp.isConfigured() ? '✅' : '⏳'} WhatsApp Service`);
  } catch {
    console.log('⏳ WhatsApp Service');
  }

  // 4. Verificar database
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase.from('leads').select('count');
    console.log(`${!error ? '✅' : '❌'} Database (tabela leads)`);
  } catch {
    console.log('❌ Database não acessível');
  }

  console.log('\n✅ Validação completa!');
}

validate();
```

---

## 🆘 Troubleshooting

### Erro: "Tabelas não existem"
```bash
# Solução: Aplicar migrations
npx supabase db push
```

### Erro: "Gemini API Key inválida"
```bash
# Solução: Verificar .env.local
echo $GEMINI_API_KEY
# Se vazio, adicionar ao .env.local
```

### Erro: "WhatsApp Service não configurado"
```bash
# Normal se não configurou Twilio ainda
# Fase 1 (CRM) funciona sem WhatsApp
```

### Erro: "Cannot find module '@/services/api/crm/leadService'"
```bash
# Solução: Verificar paths no tsconfig.json
# Ou ajustar imports para path relativo
```

---

## 🎯 Próximos Passos Após Instalação

### Imediatos
1. ✅ Criar alguns leads de teste
2. ✅ Visualizar no dashboard
3. ✅ Testar conversão de lead em paciente

### Fase 2 (WhatsApp)
1. ⏳ Configurar Twilio
2. ⏳ Submeter templates para Meta
3. ⏳ Implementar webhook

### Fase 3 (IA)
1. ⏳ Configurar Redis
2. ⏳ Implementar SmartScheduler
3. ⏳ Criar dashboard de IA

---

## 📞 Suporte

### Documentação
- [`IMPLEMENTACAO_ACTIVITY_STATUS.md`](IMPLEMENTACAO_ACTIVITY_STATUS.md) - Status completo
- [`docs/PLANEJAMENTO_ACTIVITY_FISIOTERAPIA_INTEGRADO.md`](docs/PLANEJAMENTO_ACTIVITY_FISIOTERAPIA_INTEGRADO.md) - Planejamento detalhado
- [`docs/ACTIVITY_INTEGRATION_QUICKSTART.md`](docs/ACTIVITY_INTEGRATION_QUICKSTART.md) - Guia rápido

### Problemas Comuns
- Veja seção Troubleshooting acima
- Consulte issues no GitHub
- Revise logs do Supabase

---

**Instalação básica leva 5-10 minutos!** ⚡

*Última atualização: 08/10/2025*

