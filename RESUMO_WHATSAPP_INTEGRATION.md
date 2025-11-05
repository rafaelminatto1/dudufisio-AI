# Resumo - WhatsApp Business Integration
**MoocaFisio** | Data: 04 de Novembro de 2025

## ✅ O Que Foi Implementado

### 1. Database Migrations ✅
**Arquivos criados**:
- `supabase/migrations/20251104000004_create_whatsapp_preferences.sql`
- `supabase/migrations/20251104000005_create_whatsapp_logs.sql`

**Tabelas**:
- `whatsapp_preferences` - Gerencia opt-in/opt-out dos pacientes
- `whatsapp_messages_log` - Log de todas mensagens enviadas

**Features**:
- ✅ RLS habilitado
- ✅ Políticas para staff (admin, therapist)
- ✅ Índices de performance
- ✅ Triggers de updated_at
- ✅ Função para atualizar status via webhook

---

### 2. Edge Function ✅
**Arquivo**: `supabase/functions/send-whatsapp/index.ts` (200 linhas)

**Funcionalidades**:
- ✅ Envio de mensagens de texto
- ✅ Envio de templates aprovados
- ✅ Busca automática de pacientes com opt-in ativo
- ✅ Normalização de números brasileiros (+55)
- ✅ Log automático no banco
- ✅ Suporte para múltiplos destinatários
- ✅ Tratamento de erros completo

**Interface**:
```typescript
interface WhatsAppMessageRequest {
  patientId?: string;        // Enviar para um paciente
  patientIds?: string[];     // Enviar para múltiplos
  phoneNumber?: string;      // Enviar para número direto
  type: 'text' | 'template'; // Tipo de mensagem
  message?: string;          // Texto (se type='text')
  templateName?: string;     // Nome do template
  templateVariables?: string[]; // Variáveis do template
  languageCode?: string;     // Padrão: 'pt_BR'
}
```

---

### 3. Documentação Completa ✅
**Arquivo**: `GUIA_IMPLEMENTACAO_WHATSAPP_BUSINESS.md`

**Conteúdo**:
- Passo a passo setup Meta Business
- Como obter credenciais
- Processo de aprovação de templates
- Exemplos de uso
- Troubleshooting completo

---

### 4. Base Existente ✅
Já estava implementado:
- ✅ `services/whatsapp/whatsappBusinessService.ts` - Serviço principal
- ✅ `services/templates/whatsappTemplates.ts` - 15 templates pré-definidos
- ✅ Funções de envio diversas (confirmação, lembrete, boas-vindas, etc.)

---

## 🚀 Próximos Passos (em ordem)

### 1. Setup Meta Business (1-2 horas) ⏳
**Você precisa fazer**:

1. **Criar conta Meta Business**
   - Acessar https://business.facebook.com/
   - Criar conta comercial
   - Verificar empresa

2. **Criar App no Meta Developers**
   - Acessar https://developers.facebook.com/
   - Criar novo App (tipo: Business)
   - Nome: MoocaFisio
   - Adicionar produto WhatsApp

3. **Obter credenciais**
   - Phone Number ID
   - Access Token (permanente)
   - Business Account ID

4. **Adicionar no `.env.local`**:
```bash
VITE_WHATSAPP_ENABLED=true
WHATSAPP_API_URL=https://graph.facebook.com/v21.0
WHATSAPP_PHONE_NUMBER_ID=seu-phone-number-id-aqui
WHATSAPP_ACCESS_TOKEN=seu-access-token-aqui
WHATSAPP_BUSINESS_ACCOUNT_ID=seu-business-account-id-aqui
```

---

### 2. Aplicar Migrations (5 minutos) ⏳

**Opção A: Via Supabase Dashboard** (recomendado)
1. Acessar https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql
2. Copiar conteúdo de `20251104000004_create_whatsapp_preferences.sql`
3. Executar
4. Copiar conteúdo de `20251104000005_create_whatsapp_logs.sql`
5. Executar

**Opção B: Via CLI**
```bash
npx supabase db push
```

---

### 3. Deploy Edge Function (5 minutos) ⏳

```bash
# 1. Deploy
npx supabase functions deploy send-whatsapp

# 2. Configurar secrets
npx supabase secrets set WHATSAPP_API_URL="https://graph.facebook.com/v21.0"
npx supabase secrets set WHATSAPP_PHONE_NUMBER_ID="seu-phone-number-id"
npx supabase secrets set WHATSAPP_ACCESS_TOKEN="seu-access-token"
```

---

### 4. Aprovar Templates no Meta (1-24 horas) ⏳

**Templates prioritários para aprovar**:

1. **lembrete_consulta_24h** (UTILITY)
```
Olá {{1}}!

Sua consulta é amanhã:
📅 {{2}} às {{3}}

Confirma presença?
Digite SIM ou, se precisar remarcar, digite REMARCAR.
```

2. **confirmacao_agendamento** (UTILITY)
```
✅ Agendamento confirmado!

📅 Data: {{1}}
🕐 Horário: {{2}}
👨‍⚕️ Profissional: {{3}}

Chegue 10 minutos antes e traga documento com foto.

Nos vemos em breve! 😊
```

3. **lembrete_consulta_2h** (UTILITY)
```
⏰ Sua consulta é hoje às {{1}}!

Já está a caminho?
Qualquer imprevisto, nos avise. 📞
```

**Como aprovar**:
1. Meta Business Suite → WhatsApp Manager → Message Templates
2. Create Template
3. Preencher dados
4. Submit for Approval
5. Aguardar 1-24 horas

---

### 5. Testar (15-30 minutos) ⏳

**Teste 1: Envio direto**
```typescript
const { data, error } = await supabase.functions.invoke('send-whatsapp', {
  body: {
    phoneNumber: '+5511999998888', // Seu número
    type: 'text',
    message: 'Teste MoocaFisio! 🚀'
  }
});

console.log('Resultado:', data);
```

**Teste 2: Envio com template**
```typescript
const { data, error } = await supabase.functions.invoke('send-whatsapp', {
  body: {
    patientId: 'uuid-paciente',
    type: 'template',
    templateName: 'lembrete_consulta_24h',
    templateVariables: ['João Silva', '05/11/2025', '14:00']
  }
});
```

---

### 6. Integrar com Notificações (opcional - 1-2 horas)

Adicionar WhatsApp como canal no sistema de notificações:

```typescript
// Exemplo: Enviar lembrete 24h antes
await supabase.functions.invoke('send-whatsapp', {
  body: {
    patientId: appointment.patientId,
    type: 'template',
    templateName: 'lembrete_consulta_24h',
    templateVariables: [
      patient.name,
      format(appointment.date, 'dd/MM/yyyy'),
      format(appointment.time, 'HH:mm')
    ]
  }
});
```

---

## 📊 Status Atual

```
Implementação WhatsApp: ███████████░░░░░░░░░ 60%

Backend (Código):       ████████████████████ 100% ✅
Migrations:             ████████████████████ 100% ✅
Edge Function:          ████████████████████ 100% ✅
Documentação:           ████████████████████ 100% ✅

Setup Meta:             ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Migrations Deploy:      ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Edge Function Deploy:   ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Templates Aprovados:    ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Testes:                 ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## 📁 Arquivos Criados

### Migrations (2)
1. ✅ `supabase/migrations/20251104000004_create_whatsapp_preferences.sql`
2. ✅ `supabase/migrations/20251104000005_create_whatsapp_logs.sql`

### Edge Functions (1)
1. ✅ `supabase/functions/send-whatsapp/index.ts` (200 linhas)

### Documentação (2)
1. ✅ `GUIA_IMPLEMENTACAO_WHATSAPP_BUSINESS.md` - Guia completo
2. ✅ `RESUMO_WHATSAPP_INTEGRATION.md` - Este documento

---

## 🎯 Estimativa de Tempo Total

| Tarefa | Tempo | Status |
|--------|-------|--------|
| Código (migrations + edge function) | 1h | ✅ Completo |
| Setup Meta Business | 1-2h | ⏳ Pendente |
| Deploy migrations + function | 10min | ⏳ Pendente |
| Aprovação de templates | 1-24h | ⏳ Pendente (automático) |
| Testes | 30min | ⏳ Pendente |
| **TOTAL** | **3-4 horas** | **60% completo** |

---

## 💡 Recomendação

**O que fazer agora**:
1. Criar conta Meta Business (se não tiver)
2. Obter credenciais do WhatsApp API
3. Aplicar migrations
4. Deploy Edge Function
5. Submeter 3 templates para aprovação
6. Testar quando templates forem aprovados

**Bloqueios**:
- ⚠️ Templates precisam estar aprovados antes de enviar mensagens em produção
- ⚠️ Durante aprovação, pode usar número de teste (sandbox)

---

## 📞 Suporte

**Documentação oficial**:
- [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Getting Started Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Templates Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)

**Dúvidas comuns**:
- Template não aprovado? Verificar guidelines da Meta
- Erro 403? Verificar access token
- Mensagem não enviada? Verificar opt-in do paciente

---

**Desenvolvido por**: Claude (Anthropic)
**Projeto**: MoocaFisio
**Data**: 04 de Novembro de 2025
**Tempo de Implementação**: 1 hora
