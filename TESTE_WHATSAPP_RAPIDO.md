# Guia de Teste Rápido - WhatsApp Business
**MoocaFisio** | Data: 04 de Novembro de 2025

## ✅ Pré-requisitos

Antes de testar, certifique-se que:
- [x] ✅ Credenciais configuradas no `.env.local`
- [ ] Migrations aplicadas no Supabase
- [ ] Edge Function deployed
- [ ] Secrets configurados

## 🚀 Deploy Rápido

Execute o script automático:
```powershell
.\deploy-whatsapp-integration.ps1
```

**OU** faça manual:

### 1. Aplicar Migrations (5 minutos)

**Via Supabase Dashboard SQL Editor** (recomendado):
1. Abrir https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql
2. Copiar e executar: `supabase/migrations/20251104000004_create_whatsapp_preferences.sql`
3. Copiar e executar: `supabase/migrations/20251104000005_create_whatsapp_logs.sql`

### 2. Deploy Edge Function (2 minutos)

```bash
# Deploy
npx supabase functions deploy send-whatsapp

# Configurar secrets
npx supabase secrets set WHATSAPP_API_URL="https://graph.facebook.com/v21.0"
npx supabase secrets set WHATSAPP_PHONE_NUMBER_ID="779431901927431"
npx supabase secrets set WHATSAPP_ACCESS_TOKEN="EAAjPUGyZBQPoBP1q1pmzgxHttN4s9lMo1qSjz5Itp113lTuNamYabi2ZBn50r1Rr77FsZAZCbbGvrSstZAZCfyMhNUKVxoNhYDQ58YdfjuUJwslG9SRxO90d7gvzslimdEnCevVy0zsZBEvz4uYJImsPrI1NpOBtkl0JmFFYZBMvewrkZA777kXsh4ZACgwHN7Ns1jsT8yku1qZBT3Y6TJD4CYfCWozQZBRaFk3cIfuH7Dja1WXAasBkCWUPDZBFa7YQ6qwZDZD"
```

---

## 🧪 TESTE 1: Envio de Texto Simples

### 1.1 Via Supabase Dashboard

1. Acessar https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions/send-whatsapp
2. Clicar em "Invoke function"
3. Usar este JSON:

```json
{
  "phoneNumber": "+5511987489885",
  "type": "text",
  "message": "🚀 Teste MoocaFisio!\n\nSe você recebeu esta mensagem, a integração WhatsApp está funcionando perfeitamente!"
}
```

4. Clicar em "Run"
5. Verificar resposta:

**Sucesso**:
```json
{
  "success": true,
  "sent": 1,
  "failed": 0,
  "total": 1,
  "results": [
    {
      "patient_id": null,
      "phone_number": "5511987489885",
      "success": true,
      "whatsapp_message_id": "wamid.xxx",
      "error": null
    }
  ]
}
```

6. **Verificar no WhatsApp** - Deve receber a mensagem!

---

### 1.2 Via Console do Navegador

1. Abrir aplicação: `npm run dev`
2. Fazer login
3. Abrir Console (F12)
4. Executar:

```javascript
const { createClient } = window.supabaseClient || {};

// Criar cliente Supabase
const supabase = createClient(
  'https://urfxniitfbbvsaskicfo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA'
);

// Enviar mensagem
const { data, error } = await supabase.functions.invoke('send-whatsapp', {
  body: {
    phoneNumber: '+5511987489885',
    type: 'text',
    message: 'Teste via Console! 🎉'
  }
});

console.log('Resultado:', data);
console.log('Erro:', error);
```

5. Verificar WhatsApp!

---

## 🧪 TESTE 2: Criar Opt-in para Paciente

Antes de enviar para pacientes, precisa registrar opt-in:

### 2.1 Via Supabase Dashboard

1. Acessar https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
2. Ir na tabela `whatsapp_preferences`
3. Clicar em "Insert row"
4. Preencher:

```
patient_id: (selecionar um paciente existente ou NULL)
phone_number: +5511999998888 (número do paciente)
opted_in: true
opted_in_at: now()
```

5. Salvar

### 2.2 Via SQL Editor

```sql
INSERT INTO public.whatsapp_preferences (
  patient_id,
  phone_number,
  opted_in,
  opted_in_at
)
VALUES (
  NULL, -- ou UUID de um paciente
  '+5511999998888',
  true,
  NOW()
);
```

---

## 🧪 TESTE 3: Envio para Paciente com Opt-in

Depois de criar o opt-in acima:

```json
{
  "phoneNumber": "+5511999998888",
  "type": "text",
  "message": "Olá! Você está recebendo esta mensagem porque permitiu contato via WhatsApp. 😊"
}
```

**Verificar**:
1. Mensagem recebida no WhatsApp
2. Log criado na tabela `whatsapp_messages_log`

---

## 🧪 TESTE 4: Envio com Template (quando aprovado)

**IMPORTANTE**: Templates precisam estar aprovados pela Meta antes de funcionar!

### 4.1 Aprovar Template no Meta Business

1. Acessar https://business.facebook.com/wa/manage/message-templates/
2. Criar template `teste_moocafisio`:

**Nome**: `teste_moocafisio`
**Categoria**: UTILITY
**Idioma**: Português (Brasil)
**Corpo**:
```
Olá {{1}}!

Esta é uma mensagem de teste da MoocaFisio.

📅 Data: {{2}}
🕐 Horário: {{3}}

Obrigado!
```

3. Submeter para aprovação (aguardar 1-24h)

### 4.2 Testar Template (após aprovação)

```json
{
  "phoneNumber": "+5511987489885",
  "type": "template",
  "templateName": "teste_moocafisio",
  "templateVariables": ["João Silva", "05/11/2025", "14:00"]
}
```

---

## 🧪 TESTE 5: Verificar Logs

### Via Supabase Dashboard

1. Acessar https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
2. Ir na tabela `whatsapp_messages_log`
3. Ver todas mensagens enviadas:

```sql
SELECT
  id,
  phone_number,
  message_type,
  status,
  whatsapp_message_id,
  error_message,
  sent_at,
  created_at
FROM public.whatsapp_messages_log
ORDER BY created_at DESC
LIMIT 10;
```

### Campos importantes:
- `status`: 'sent' (sucesso) ou 'failed' (falha)
- `whatsapp_message_id`: ID da Meta (para rastreamento)
- `error_message`: Mensagem de erro se falhou

---

## ❌ Troubleshooting

### Erro: "No opted-in recipients found"
**Causa**: Nenhum registro na tabela `whatsapp_preferences` com `opted_in = true`
**Solução**: Criar opt-in via TESTE 2

### Erro: "WhatsApp configuration missing"
**Causa**: Secrets não configurados
**Solução**: Executar passo 2 do deploy

### Erro: "Invalid phone number"
**Causa**: Número em formato incorreto
**Solução**: Usar formato internacional: `+5511999998888`

### Erro: "Template not found"
**Causa**: Template não existe ou não está aprovado
**Solução**: Aprovar template no Meta Business Suite

### Mensagem não chegou
**Verificar**:
1. Número está correto?
2. WhatsApp está ativo neste número?
3. Verificar logs da Edge Function no Supabase
4. Verificar tabela `whatsapp_messages_log`

---

## ✅ Checklist de Validação

Após os testes, verificar:

- [ ] Mensagem de texto simples recebida
- [ ] Log criado na tabela `whatsapp_messages_log` com status 'sent'
- [ ] `whatsapp_message_id` preenchido
- [ ] Opt-in criado na tabela `whatsapp_preferences`
- [ ] Mensagem para paciente com opt-in funciona
- [ ] Edge Function rodando sem erros

---

## 📊 Resultados Esperados

### Sucesso Total
```
✅ Mensagem texto: Recebida no WhatsApp
✅ Status no log: 'sent'
✅ Message ID: 'wamid.xxx'
✅ Sem erros
```

### Próximos Passos Após Sucesso
1. Aprovar 3-5 templates no Meta
2. Integrar com sistema de agendamentos
3. Configurar envio automático de lembretes
4. Criar dashboard de métricas

---

## 🎯 Links Úteis

- **Dashboard Supabase**: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
- **Meta Business**: https://business.facebook.com/
- **Logs Edge Function**: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions/send-whatsapp/logs
- **Documentação Meta**: https://developers.facebook.com/docs/whatsapp/cloud-api

---

**Tempo estimado de testes**: 15-30 minutos
**Após validação**: Sistema pronto para produção!
