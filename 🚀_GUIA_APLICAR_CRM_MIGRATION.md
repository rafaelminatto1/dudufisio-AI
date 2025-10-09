# 🚀 GUIA: Aplicar Migration CRM no Supabase

## 📋 PASSO A PASSO

### **1. Acessar Supabase Dashboard**
1. Ir para: https://app.supabase.com
2. Fazer login
3. Selecionar seu projeto DuduFisio-AI

---

### **2. Abrir SQL Editor**
1. No menu lateral esquerdo, clicar em **"SQL Editor"**
2. Clicar no botão **"New query"** (+ Nova Query)

---

### **3. Copiar Migration SQL**

**Arquivo**: `supabase/migrations/20251009_create_leads_crm_integration.sql`

Você pode:
- **Opção A**: Copiar todo o conteúdo do arquivo
- **Opção B**: Usar o comando abaixo no terminal:

```bash
# Windows
type "supabase\migrations\20251009_create_leads_crm_integration.sql" | clip

# macOS/Linux
cat supabase/migrations/20251009_create_leads_crm_integration.sql | pbcopy
```

---

### **4. Colar e Executar**
1. Colar o SQL copiado no editor
2. Pressionar **CTRL + Enter** ou clicar em **"Run"**
3. Aguardar execução (5-10 segundos)

**Resultado esperado:**
```
✅ Success. No rows returned
```

---

### **5. Verificar Tabelas Criadas**
1. No menu lateral, clicar em **"Table Editor"**
2. Você deve ver as novas tabelas:
   - ✅ `leads`
   - ✅ `lead_interactions`
   - ✅ `sales_pipeline`

---

### **6. Verificar Dados Iniciais**
1. Clicar na tabela **`sales_pipeline`**
2. Deve ter **1 registro** (Pipeline Fisioterapia padrão)
3. Verificar stages: new → contacted → qualified → won

---

## ✅ VALIDAÇÃO

### **Testar Functions SQL**
No SQL Editor, execute:

```sql
-- Teste 1: Verificar função de score
SELECT calculate_lead_score('00000000-0000-0000-0000-000000000000');
-- Deve retornar: 0 (lead não existe)

-- Teste 2: Verificar view de métricas
SELECT * FROM lead_conversion_metrics;
-- Deve retornar: vazio (ainda sem leads)

-- Teste 3: Criar lead de teste
INSERT INTO leads (name, phone, email, source, interested_in)
VALUES ('João Teste', '+5511999999999', 'joao@teste.com', 'whatsapp', 'Fisioterapia');

-- Teste 4: Ver lead criado
SELECT id, name, lead_score, engagement_level FROM leads;
-- Deve mostrar: João Teste com score inicial

-- Teste 5: Calcular score do lead
SELECT calculate_lead_score(id) FROM leads WHERE name = 'João Teste';
-- Deve retornar: score entre 40-60
```

---

## 🔗 INTEGRAR COM WHATSAPP EXISTENTE

Agora vamos conectar o CRM com sua infraestrutura WhatsApp:

### **1. Atualizar WhatsAppBusinessIntegration**

**Arquivo**: `lib/ai-scheduling/integrations/WhatsAppBusinessIntegration.ts`

Adicionar método para criar leads automaticamente:

```typescript
import { leadService } from '../../../services/crm/leadService';

// Adicionar no método handleIncomingMessage
async handleIncomingMessage(message: any): Promise<void> {
  const { from, text, name } = message;

  // Criar ou atualizar lead automaticamente
  try {
    const lead = await leadService.createLeadFromWhatsApp(
      from,
      name || from,
      text.body
    );

    console.log('✅ Lead criado/atualizado:', lead.id);
  } catch (error) {
    if (error.message === 'ALREADY_PATIENT') {
      console.log('ℹ️ Mensagem de paciente existente, não é lead');
    } else {
      console.error('❌ Erro ao processar lead:', error);
    }
  }

  // ... resto do código existente
}
```

---

### **2. Criar Serviço Unificado**

**Arquivo**: `services/crm/whatsappCrmService.ts`

```typescript
import { leadService } from './leadService';
import { whatsappService } from '../whatsapp/whatsappService';
import { supabase } from '../supabase/client';

export const whatsappCrmService = {
  /**
   * Processar mensagem recebida e criar/atualizar lead
   */
  async processIncomingMessage(message: {
    from: string;
    name: string;
    text: string;
    timestamp: number;
  }) {
    // 1. Verificar se já é paciente
    const { data: patient } = await supabase
      .from('patients')
      .select('id, name')
      .eq('phone', message.from)
      .maybeSingle();

    if (patient) {
      // Já é paciente, só registrar mensagem
      await supabase.from('messages').insert({
        patient_id: patient.id,
        channel: 'whatsapp',
        type: 'generic',
        status: 'delivered',
        body: message.text,
        delivered_at: new Date(message.timestamp * 1000),
        metadata: { direction: 'inbound', from: message.from }
      });
      return { type: 'patient', id: patient.id };
    }

    // 2. Criar ou atualizar lead
    const lead = await leadService.createLeadFromWhatsApp(
      message.from,
      message.name,
      message.text
    );

    return { type: 'lead', id: lead.id };
  },

  /**
   * Enviar mensagem e registrar interação
   */
  async sendMessage(to: string, message: string, leadId?: string) {
    // Enviar via WhatsApp Business API
    const result = await whatsappService.sendMessage({
      to,
      message,
      patient_id: leadId
    });

    // Registrar interação se for lead
    if (leadId) {
      await leadService.addInteraction(leadId, {
        type: 'whatsapp_message',
        direction: 'outbound',
        content: message
      });
    }

    return result;
  },

  /**
   * Converter lead em paciente após primeira consulta agendada
   */
  async convertLeadOnAppointment(leadId: string, appointmentId: string) {
    const patientId = await leadService.convertToPatient(leadId);

    // Atualizar appointment com patient_id
    await supabase
      .from('appointments')
      .update({ patient_id: patientId })
      .eq('id', appointmentId);

    return patientId;
  }
};
```

---

### **3. Atualizar Webhook Handler**

Se você tiver um webhook handler, atualize para usar o CRM:

```typescript
// webhook-handler.ts ou similar
import { whatsappCrmService } from './services/crm/whatsappCrmService';

export async function handleWhatsAppWebhook(req: Request) {
  const body = await req.json();

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const messages = change.value?.messages || [];

      for (const msg of messages) {
        await whatsappCrmService.processIncomingMessage({
          from: msg.from,
          name: msg.profile?.name || msg.from,
          text: msg.text?.body || '',
          timestamp: msg.timestamp
        });
      }
    }
  }

  return new Response(JSON.stringify({ success: true }));
}
```

---

## 🎯 RESULTADO ESPERADO

Após aplicar a migration e integração:

### **Quando alguém mandar mensagem no WhatsApp:**
1. ✅ Sistema verifica se é paciente existente
2. ✅ Se não for, cria novo lead automaticamente
3. ✅ Lead recebe score inicial (40-60)
4. ✅ Cada mensagem adiciona +5 pontos no score
5. ✅ Lead classificado como hot/warm/cold
6. ✅ Histórico completo de interações salvo

### **No CRM (quando implementar frontend):**
1. ✅ Ver todos os leads no Kanban
2. ✅ Filtrar por hot/warm/cold
3. ✅ Converter lead em paciente com 1 clique
4. ✅ Analytics de conversão por fonte
5. ✅ Timeline de interações

---

## 🐛 TROUBLESHOOTING

### **Erro: "relation leads does not exist"**
➡️ Migration não foi aplicada. Volte ao passo 3 e execute novamente.

### **Erro: "function calculate_lead_score does not exist"**
➡️ Execute esta parte da migration separadamente:
```sql
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id_param UUID)
RETURNS INTEGER AS $$
-- [copiar função completa do arquivo de migration]
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Erro de permissão ao inserir lead**
➡️ Verificar RLS policies:
```sql
-- Temporariamente desabilitar RLS para teste
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Testar inserção
INSERT INTO leads (name, phone) VALUES ('Teste', '+5511999999999');

-- Reabilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```

### **Score sempre retorna 0**
➡️ Verificar se a função está calculando corretamente:
```sql
-- Debug da função
SELECT
  id,
  name,
  email,
  phone,
  total_interactions,
  lead_score
FROM leads;

-- Forçar recálculo
SELECT calculate_lead_score(id) FROM leads;
```

---

## 📞 PRÓXIMOS PASSOS

Após aplicar a migration:

1. **Testar criação de leads** via `leadService.ts`
2. **Integrar com webhook** WhatsApp existente
3. **Implementar frontend** CRM Dashboard
4. **Configurar automações** de follow-up

---

## 🎊 COMANDOS ÚTEIS

### **Ver todos os leads**
```sql
SELECT
  name,
  phone,
  status,
  lead_score,
  engagement_level,
  source,
  created_at
FROM leads
ORDER BY lead_score DESC;
```

### **Ver métricas de conversão**
```sql
SELECT * FROM lead_conversion_metrics;
```

### **Ver leads quentes (hot)**
```sql
SELECT * FROM leads
WHERE engagement_level = 'hot'
AND status NOT IN ('won', 'lost')
ORDER BY lead_score DESC;
```

### **Ver histórico de interações de um lead**
```sql
SELECT
  li.created_at,
  li.type,
  li.direction,
  li.content
FROM lead_interactions li
JOIN leads l ON li.lead_id = l.id
WHERE l.phone = '+5511999999999'
ORDER BY li.created_at DESC;
```

---

**Está pronto para aplicar? Vamos começar pelo Passo 1!** 🚀

**Precisa de ajuda em algum passo específico?** 💬
