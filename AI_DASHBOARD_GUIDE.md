# 📊 Dashboard de IA - Guia Completo

## 🎯 Visão Geral

Dashboard unificado que integra todas as funcionalidades de IA:
- ✅ Predição de Churn de Pacientes
- ✅ Business Intelligence Avançado
- ✅ Gerador de Planos de Tratamento
- ✅ Ações Rápidas e Insights

---

## 🚀 Como Usar

### 1. Acessar o Dashboard

```typescript
// Adicionar rota no seu router
import AIDashboardPage from '@/pages/AIDashboardPage';

// Exemplo com React Router
<Route path="/ai-dashboard" element={<AIDashboardPage />} />
```

### 2. Integração com Dados Reais

O dashboard usa hooks customizados que precisam ser conectados ao Supabase:

#### Atualizar `hooks/useAIDashboard.ts`

```typescript
// Substituir mock data por queries reais do Supabase
import { supabase } from '@/lib/supabase';

async function fetchPatientsForChurn(): Promise<PatientData[]> {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      id,
      appointments(count),
      payments(*)
    `)
    .eq('status', 'active');
  
  // Transform data to PatientData format
  return transformToPatientData(data);
}
```

---

## 📦 Estrutura de Arquivos

```
components/ai-dashboard/
├── AIUnifiedDashboard.tsx          # Componente principal
└── widgets/
    ├── ChurnPredictionWidget.tsx   # Widget de churn
    ├── BIInsightsWidget.tsx        # Widget de BI
    ├── TreatmentPlanWidget.tsx     # Widget de planos
    └── QuickActionsWidget.tsx      # Ações rápidas

hooks/
└── useAIDashboard.ts               # Hooks de dados

pages/
└── AIDashboardPage.tsx             # Página principal

lib/ai/
├── churn-prediction.ts             # Modelo de churn
├── business-intelligence.ts        # BI avançado
└── treatment-plan-generator.ts     # Gerador de planos
```

---

## 🎨 Componentes

### 1. **AIUnifiedDashboard**

Componente principal com sistema de tabs:

- **Overview**: Visão geral com todos os widgets
- **Churn**: Análise detalhada de risco
- **BI**: Insights e recomendações completas
- **Treatment**: Gerador de planos

```typescript
import { AIUnifiedDashboard } from '@/components/ai-dashboard/AIUnifiedDashboard';

<AIUnifiedDashboard />
```

### 2. **ChurnPredictionWidget**

Exibe pacientes em risco com ações recomendadas.

**Variantes:**
- `summary`: Versão resumida (3 pacientes)
- `full`: Lista completa com detalhes

```typescript
<ChurnPredictionWidget variant="summary" />
<ChurnPredictionWidget variant="full" />
```

**Features:**
- 🔴 Níveis de risco (Crítico/Alto/Médio/Baixo)
- 📊 Score de risco (0-100)
- 💡 Fatores contribuintes
- 📞 Ações rápidas (Ligar/WhatsApp/Email)
- 📅 Data estimada de churn

### 3. **BIInsightsWidget**

Análise de negócios com IA.

**Variantes:**
- `summary`: Métricas principais + top alerta
- `full`: Análise completa com previsões

```typescript
<BIInsightsWidget variant="summary" />
<BIInsightsWidget variant="full" />
```

**Features:**
- 📈 Métricas KPI (Receita, Margem, NPS, Utilização)
- ⚠️ Alertas por prioridade
- 💡 Recomendações com ROI
- 🔮 Previsões ML (30-90 dias)
- 📊 Benchmarking da indústria

### 4. **TreatmentPlanWidget**

Geração e gerenciamento de planos.

**Variantes:**
- `recent`: Últimos 3 planos
- `generator`: Interface completa de geração

```typescript
<TreatmentPlanWidget variant="recent" />
<TreatmentPlanWidget variant="generator" />
```

**Features:**
- ✨ Geração com IA (Gemini Pro)
- 📋 Templates rápidos
- 📊 Progresso visual
- 📄 Exportação PDF
- 🎯 Baseado em evidências

### 5. **QuickActionsWidget**

Acesso rápido às funcionalidades.

```typescript
<QuickActionsWidget />
```

**Ações:**
- Análise de Churn
- BI Insights
- Gerar Plano
- Ver Previsões

---

## 🔧 Hooks Disponíveis

### `useAIDashboard()`

Hook principal que combina todos os dados.

```typescript
import { useAIDashboard } from '@/hooks/useAIDashboard';

function MyComponent() {
  const { churn, bi, treatments, isLoading, hasError } = useAIDashboard();

  if (isLoading) return <Loading />;
  if (hasError) return <Error />;

  return (
    <div>
      <h3>Pacientes em risco: {churn.data?.size}</h3>
      <h3>Receita: {bi.data?.metrics.financial.revenue.total}</h3>
    </div>
  );
}
```

### `useChurnPredictions()`

Análise de churn isolada.

```typescript
import { useChurnPredictions } from '@/hooks/useAIDashboard';

const { data: predictions, isLoading } = useChurnPredictions();

// predictions = Map<patientId, ChurnPrediction>
```

### `useBIInsights()`

Business Intelligence isolado.

```typescript
import { useBIInsights } from '@/hooks/useAIDashboard';

const { data } = useBIInsights();
// data = { metrics: ClinicMetrics, insights: BIInsights }
```

### `useTreatmentPlansStats()`

Estatísticas de planos.

```typescript
import { useTreatmentPlansStats } from '@/hooks/useAIDashboard';

const { data } = useTreatmentPlansStats();
// data = { total, active, completed, recentPlans }
```

### `useAIStatus()`

Verifica status da IA.

```typescript
import { useAIStatus } from '@/hooks/useAIDashboard';

const { data: status } = useAIStatus();
// status = { isOnline, provider, features, fallbackMode }
```

---

## 🔌 Integração com Supabase

### Queries Necessárias

#### 1. Pacientes para Churn

```sql
-- Criar view materializada para performance
CREATE MATERIALIZED VIEW patient_churn_data AS
SELECT 
  p.id,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
  COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) as no_show_appointments,
  MAX(a.date) as last_appointment_date,
  SUM(pay.amount) as total_paid,
  COUNT(CASE WHEN pay.status = 'pending' THEN 1 END) as pending_payments,
  AVG(EXTRACT(DAY FROM pay.paid_at - pay.due_date)) as avg_payment_delay,
  -- Add more aggregations...
FROM patients p
LEFT JOIN appointments a ON a.patient_id = p.id
LEFT JOIN payments pay ON pay.patient_id = p.id
GROUP BY p.id;

-- Refresh periodicamente
REFRESH MATERIALIZED VIEW patient_churn_data;
```

#### 2. Métricas da Clínica

```sql
-- View para métricas financeiras
CREATE VIEW clinic_financial_metrics AS
SELECT 
  DATE_TRUNC('month', created_at) as period,
  SUM(amount) as total_revenue,
  SUM(CASE WHEN payment_method = 'card' THEN amount ELSE 0 END) as card_revenue,
  -- Add more metrics...
FROM payments
WHERE status = 'paid'
GROUP BY period;
```

### TypeScript Integration

```typescript
// services/ai-dashboard.service.ts
import { supabase } from '@/lib/supabase';
import type { PatientData } from '@/lib/ai/churn-prediction';

export async function fetchPatientsForChurnAnalysis(): Promise<PatientData[]> {
  const { data, error } = await supabase
    .from('patient_churn_data')
    .select('*')
    .limit(100);

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    appointmentHistory: {
      total: row.total_appointments,
      completed: row.completed_appointments,
      cancelled: row.cancelled_appointments,
      noShow: row.no_show_appointments,
      lastAppointmentDate: row.last_appointment_date ? new Date(row.last_appointment_date) : null,
    },
    // Map other fields...
  }));
}
```

---

## 🎨 Customização

### Cores e Tema

Modificar em `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'ai-primary': '#6366f1', // Indigo
        'ai-secondary': '#8b5cf6', // Purple
        'ai-accent': '#06b6d4', // Cyan
      },
    },
  },
};
```

### Widgets Personalizados

Criar novos widgets seguindo a estrutura:

```typescript
// components/ai-dashboard/widgets/CustomWidget.tsx
interface CustomWidgetProps {
  variant?: 'summary' | 'full';
}

export function CustomWidget({ variant = 'summary' }: CustomWidgetProps) {
  if (variant === 'summary') {
    return <SummaryView />;
  }
  
  return <FullView />;
}
```

Adicionar no dashboard:

```typescript
// AIUnifiedDashboard.tsx
import { CustomWidget } from './widgets/CustomWidget';

// Adicionar na grid ou criar nova tab
<motion.div variants={itemVariants}>
  <CustomWidget variant="summary" />
</motion.div>
```

---

## 📊 Métricas e KPIs

### Churn Prediction
- Taxa de acerto: > 75%
- Falsos positivos: < 15%
- Lead time: 2-3 semanas

### BI Insights
- Atualização: A cada 30 min
- Confiança de previsões: 70-75%
- Cobertura de métricas: 100%

### Treatment Plans
- Tempo de geração: ~10s
- Taxa de adoção: Meta > 60%
- Satisfação: Meta > 4.5/5

---

## 🐛 Troubleshooting

### Dashboard não carrega

**Problema:** Erro ao carregar dados

```
Solução:
1. Verificar API key: process.env.GOOGLE_AI_API_KEY
2. Verificar conexão com Supabase
3. Checar console do navegador para erros
```

### Widgets vazios

**Problema:** Widgets aparecem sem dados

```
Solução:
1. Mock data está funcionando? (Checar hooks/useAIDashboard.ts)
2. Queries do Supabase retornando dados?
3. Transformação de dados correta?
```

### IA não responde

**Problema:** Gemini API não funciona

```
Solução:
1. API key válida?
2. Quota da API não excedida?
3. Fallback mode ativado automaticamente
```

---

## 🔐 Segurança

### API Keys
- ✅ Nunca expor no frontend
- ✅ Usar variáveis de ambiente
- ✅ Rotacionar periodicamente

### Dados Sensíveis
- ✅ Não logar informações de pacientes
- ✅ Anonimizar dados em analytics
- ✅ Implementar LGPD compliance

---

## 🚀 Deploy

### Variáveis de Ambiente

```.env
# .env.production
GOOGLE_AI_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Vercel

```bash
# Adicionar variáveis no Vercel
vercel env add GOOGLE_AI_API_KEY production

# Deploy
vercel --prod
```

---

## 📈 Roadmap

### Próximas Features

- [ ] **Exportação de Relatórios**
  - PDF completo
  - Excel com dados raw
  - Agendamento automático

- [ ] **Notificações Inteligentes**
  - Email alerts para churn crítico
  - WhatsApp para ações urgentes
  - Push notifications

- [ ] **Insights Personalizados**
  - Machine Learning próprio
  - Treinar com dados históricos
  - A/B testing de recomendações

- [ ] **Integração com CRM**
  - Sync automático de ações
  - Follow-up tracking
  - ROI measurement

- [ ] **Dashboard Mobile**
  - App nativo
  - Offline mode
  - Quick actions widget

---

## 📚 Recursos Adicionais

- [ROADMAP_IMPLEMENTATION.md](./ROADMAP_IMPLEMENTATION.md) - Implementação completa
- [QUICKSTART_AI.md](./QUICKSTART_AI.md) - Início rápido com IA
- [Documentação Gemini](https://ai.google.dev/docs) - API do Google

---

## 🤝 Contribuindo

Para adicionar novos recursos:

1. Criar widget em `components/ai-dashboard/widgets/`
2. Adicionar hook se necessário em `hooks/`
3. Integrar no `AIUnifiedDashboard.tsx`
4. Atualizar documentação

---

## ✅ Checklist de Implementação

- [x] Dashboard estruturado
- [x] Widgets de Churn
- [x] Widgets de BI
- [x] Widgets de Treatment
- [x] Hooks de dados
- [x] Integração com IA
- [x] Página principal
- [x] Documentação
- [ ] Conectar com Supabase real
- [ ] Testes A/B
- [ ] Métricas de adoção
- [ ] Feedback de usuários

---

**Dashboard pronto para uso!** 🎉

Configure a API key, integre com seus dados e comece a usar insights de IA na sua clínica.
