# 🚀 Início Rápido - Funcionalidades de IA

## ⚡ Setup Rápido

### 1. Configure a API Key

```env
# .env.local
GOOGLE_AI_API_KEY=sua_chave_aqui
```

Obtenha em: https://makersuite.google.com/app/apikey

---

## 🎯 Exemplos de Uso

### 📉 Predição de Churn

```typescript
import { calculateChurnRisk, enhanceChurnPredictionWithAI } from '@/lib/ai/churn-prediction';

// Dados do paciente
const patientData = {
  id: 'pat_123',
  appointmentHistory: {
    total: 20,
    completed: 15,
    cancelled: 3,
    noShow: 2,
    lastAppointmentDate: new Date('2025-10-01')
  },
  paymentHistory: {
    totalPaid: 5000,
    pendingPayments: 1,
    averagePaymentDelay: 5,
    hasOverduePayments: false
  },
  engagementMetrics: {
    exerciseCompletionRate: 0.6,
    portalLoginFrequency: 2,
    messageResponseRate: 0.8,
    surveyCompletionRate: 0.4
  },
  treatmentProgress: {
    sessionsPlanned: 20,
    sessionsCompleted: 15,
    goalAchievementRate: 0.7,
    painReductionScore: 5
  },
  demographics: {
    ageGroup: '35-44',
    distanceFromClinic: 5.2,
    hasInsurance: true
  }
};

// Calcular risco
const prediction = calculateChurnRisk(patientData);

console.log(`Risco: ${prediction.riskLevel} (${prediction.riskScore}%)`);
console.log(`Ação: ${prediction.nextBestAction}`);

// Melhorar com IA
const enhanced = await enhanceChurnPredictionWithAI(patientData, prediction);
console.log('Mensagem personalizada:', enhanced.personalizedMessage);
```

**Output Exemplo:**
```
Risco: high (67%)
Ação: Entrar em contato por WhatsApp e entender barreiras

Fatores principais:
1. Alto índice de faltas (24.5% de impacto)
2. Baixo engajamento (18.2% de impacto)
3. Ausência prolongada (6.8% de impacto)
```

---

### 🏥 Gerador de Planos de Tratamento

```typescript
import { generateTreatmentPlan } from '@/lib/ai/treatment-plan-generator';

const patientProfile = {
  demographics: {
    age: 42,
    gender: 'F',
    occupation: 'Professora',
    activityLevel: 'moderate'
  },
  medicalHistory: {
    conditions: ['Hipertensão controlada'],
    surgeries: [],
    medications: ['Losartana 50mg'],
    allergies: [],
    contraindications: []
  },
  currentCondition: {
    diagnosis: 'Tendinite de Aquiles bilateral',
    symptoms: ['Dor ao caminhar', 'Rigidez matinal', 'Edema leve'],
    painLevel: 6,
    functionalLimitations: ['Dificuldade para subir escadas', 'Limitação para corrida'],
    onsetDate: new Date('2025-09-15'),
    mechanism: 'Overuse - aumento súbito de atividade física'
  },
  assessmentFindings: {
    rangeOfMotion: {
      'Dorsiflexão D': '5°',
      'Dorsiflexão E': '5°',
      'Flexão plantar': 'Normal bilateral'
    },
    strength: {
      'Gastrocnêmio': '3+/5',
      'Sóleo': '3/5'
    },
    specialTests: {
      'Thompson': 'Negativo',
      'Royal London': 'Positivo bilateral'
    },
    postureAnalysis: 'Hiperpronação bilateral'
  },
  goals: {
    shortTerm: ['Reduzir dor para 3/10', 'Retomar caminhadas curtas'],
    longTerm: ['Retornar à corrida', 'Prevenir recidivas'],
    timeline: '8-12 semanas'
  }
};

// Gerar plano
const plan = await generateTreatmentPlan(patientProfile);

console.log('Plano gerado:');
console.log(`Duração: ${plan.duration.weeks} semanas`);
console.log(`Frequência: ${plan.duration.sessionsPerWeek}x/semana`);
console.log(`Fases: ${plan.phases.length}`);
console.log(`Exercícios: ${plan.exercises.length}`);

// Explicação para o paciente
const explanation = await generatePatientExplanation(plan, patientProfile);
console.log('\nExplicação:', explanation);
```

---

### 📊 Business Intelligence

```typescript
import { generateBIInsights } from '@/lib/ai/business-intelligence';

const metrics = {
  financial: {
    revenue: {
      total: 125000,
      byService: {
        'Fisioterapia': 85000,
        'RPG': 25000,
        'Pilates': 15000
      },
      byPaymentMethod: {
        'Cartão': 70000,
        'Dinheiro': 30000,
        'PIX': 25000
      },
      trend: 'up'
    },
    expenses: {
      total: 95000,
      byCategory: {
        'Pessoal': 65000,
        'Aluguel': 15000,
        'Materiais': 10000,
        'Marketing': 5000
      }
    },
    profitMargin: 0.24,
    arpu: 450,
    ltv: 2700
  },
  operational: {
    appointmentUtilization: 0.78,
    averageWaitTime: 8,
    sessionDuration: 55,
    cancellationRate: 0.12,
    noShowRate: 0.05,
    therapistProductivity: {
      'Dr. Silva': 0.85,
      'Dra. Santos': 0.82,
      'Dr. Costa': 0.75
    }
  },
  patient: {
    totalActive: 280,
    newPatients: 35,
    churnRate: 0.18,
    satisfactionScore: 4.3,
    nps: 52,
    retentionRate: 0.82
  },
  growth: {
    monthOverMonth: 0.08,
    yearOverYear: 0.45,
    projectedGrowth: 0.12
  },
  period: {
    start: new Date('2025-10-01'),
    end: new Date('2025-10-31')
  }
};

// Gerar insights
const insights = await generateBIInsights(metrics);

console.log('📊 BUSINESS INTELLIGENCE REPORT\n');
console.log(insights.summary);

console.log('\n⚠️ ALERTAS:');
insights.alerts.forEach(alert => {
  console.log(`${alert.type}: ${alert.title}`);
  console.log(`  Ação: ${alert.actionRequired}`);
});

console.log('\n💡 RECOMENDAÇÕES:');
insights.recommendations.forEach((rec, i) => {
  console.log(`${i + 1}. ${rec.title}`);
  console.log(`   ROI estimado: ${rec.estimatedROI}/10`);
  console.log(`   Prazo: ${rec.timeframe}`);
});

console.log('\n📈 PREVISÕES:');
insights.predictions.forEach(pred => {
  console.log(`${pred.metric}: ${pred.current} → ${pred.predicted}`);
  console.log(`  Confiança: ${pred.confidence * 100}%`);
});
```

---

## 🎨 Integração no Frontend

### Exemplo de Hook

```typescript
// hooks/useChurnPrediction.ts
import { useQuery } from '@tanstack/react-query';
import { calculateChurnRisk } from '@/lib/ai/churn-prediction';

export function useChurnPrediction(patientId: string) {
  return useQuery({
    queryKey: ['churn', patientId],
    queryFn: async () => {
      const data = await fetchPatientData(patientId);
      return calculateChurnRisk(data);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
```

### Exemplo de Componente

```tsx
// components/ChurnRiskBadge.tsx
import { useChurnPrediction } from '@/hooks/useChurnPrediction';

export function ChurnRiskBadge({ patientId }: { patientId: string }) {
  const { data: prediction, isLoading } = useChurnPrediction(patientId);

  if (isLoading) return <Skeleton />;
  if (!prediction) return null;

  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors[prediction.riskLevel]}`}>
      <span className="font-medium">
        Risco: {prediction.riskScore}%
      </span>
      <span className="text-xs">
        {prediction.riskLevel}
      </span>
    </div>
  );
}
```

---

## 🧪 Testes

```typescript
// __tests__/churn-prediction.test.ts
import { calculateChurnRisk } from '@/lib/ai/churn-prediction';

describe('Churn Prediction', () => {
  it('should identify high risk patient', () => {
    const patient = {
      // ... dados de teste
    };

    const prediction = calculateChurnRisk(patient);

    expect(prediction.riskLevel).toBe('high');
    expect(prediction.riskScore).toBeGreaterThan(50);
    expect(prediction.recommendations).toHaveLength(3);
  });

  it('should suggest next best action', () => {
    // ...
  });
});
```

---

## 📚 Documentação Completa

- `ROADMAP_IMPLEMENTATION.md` - Resumo completo
- `lib/ai/churn-prediction.ts` - Código com JSDoc
- `lib/ai/treatment-plan-generator.ts` - Exemplos inline
- `lib/ai/business-intelligence.ts` - Interfaces TypeScript

---

## 🆘 Troubleshooting

### API Key não funciona
```bash
# Verificar variável
echo $GOOGLE_AI_API_KEY

# Testar conexão
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"teste"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY"
```

### Fallback sem IA
Todas as funções funcionam sem API key, usando:
- Lógica determinística para churn
- Templates para planos de tratamento
- Regras de negócio para BI

---

## 🎯 Próximos Passos

1. **Configure a API Key** ✅
2. **Teste com dados reais** 
3. **Integre no Dashboard**
4. **Monitore métricas**
5. **Ajuste algoritmos** com feedback

---

**Precisa de ajuda?** Consulte o `ROADMAP_IMPLEMENTATION.md` para detalhes técnicos completos.
