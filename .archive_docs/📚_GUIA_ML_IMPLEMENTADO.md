# 📚 GUIA - Machine Learning Implementado

**Data:** 08 de Outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ COMPLETO

---

## 🎯 O QUE FOI IMPLEMENTADO

### ✅ Sistema de ML Completo

1. **MLPredictionService**:
   - Predição de outcome de tratamento
   - Predição de risco de abandono
   - Recomendação de exercícios (collaborative filtering)
   - Integração com banco de dados

2. **ModelTrainingService**:
   - Coleta de dados de treinamento
   - Treinamento de modelos (framework)
   - Monitoramento de performance
   - Detecção de model drift

3. **API com Claude AI**:
   - Análise contextual de pacientes
   - Predições usando Anthropic Claude
   - Análise de tendências de sintomas
   - Explicabilidade das predições

4. **Hooks React Query**:
   - usePredictTreatmentOutcome
   - usePredictDropoutRisk
   - useRecommendExercises
   - useTrainModel
   - useMonitorModel

---

## 🤖 MODELOS IMPLEMENTADOS

### 1. Predição de Outcome de Tratamento

**Input Features:**
- Idade do paciente
- Tipo de condição
- Severidade inicial
- Número de sessões planejadas
- Histórico médico
- Aderência histórica

**Output:**
- Probabilidade de sucesso (0-100%)
- Nível de confiança
- Fatores de risco
- Fatores protetores
- Recomendações específicas

**Algoritmo:** Random Forest / Gradient Boosting  
**Meta de Accuracy:** > 80%

---

### 2. Predição de Risco de Abandono

**Input Features:**
- Taxa de comparecimento
- Faltas recentes
- Dias desde última sessão
- Status de pagamento
- Distância até clínica
- Score de satisfação
- Suporte social

**Output:**
- Nível de risco (low/medium/high)
- Probabilidade de abandono
- Plano de prevenção
- Intervenções sugeridas

**Algoritmo:** Logistic Regression / Random Forest  
**Meta de Precision:** > 75%

---

### 3. Recomendação de Exercícios

**Técnica:** Collaborative Filtering

**Processo:**
1. Encontrar pacientes similares
2. Identificar exercícios com sucesso
3. Filtrar exercícios não realizados
4. Ranquear por relevância
5. Retornar top 10

**Meta de NDCG:** > 0.70

---

### 4. Análise com Claude AI

**Integração com Anthropic Claude 3.5 Sonnet**

```typescript
import { analyzePatientWithClaude } from '@/api/ml/predictions';

const analysis = await analyzePatientWithClaude({
  age: 45,
  condition: 'Lombalgia crônica',
  severity: 7,
  treatment_plan: 'Fisioterapia 2x/semana',
});

// Retorna:
// {
//   probabilidade_sucesso: 85,
//   fatores_risco: [...],
//   fatores_protetores: [...],
//   recomendacoes: [...],
//   justificativa_clinica: "..."
// }
```

**Features:**
- Análise contextual profunda
- Explicações em linguagem natural
- Recomendações personalizadas
- Cenários alternativos

---

## 🚀 COMO USAR

### 1. Predição de Outcome

```typescript
import { usePredictTreatmentOutcome } from '@/hooks/useMLPredictions';

function TreatmentPlan({ patientId }) {
  const predictMutation = usePredictTreatmentOutcome();

  const handlePredict = () => {
    predictMutation.mutate({
      patient_id: patientId,
      prediction_type: 'treatment_outcome',
      features: {
        condition_type: 'lombalgia',
        severity: 7,
        planned_sessions: 12,
      },
    });
  };

  return (
    <button onClick={handlePredict} disabled={predictMutation.isPending}>
      {predictMutation.isPending ? 'Analisando...' : 'Gerar Predição'}
    </button>
  );
}
```

---

### 2. Risco de Abandono

```typescript
import { usePredictDropoutRisk } from '@/hooks/useMLPredictions';

function PatientDashboard({ patientId }) {
  const dropoutMutation = usePredictDropoutRisk();

  const checkDropoutRisk = () => {
    dropoutMutation.mutate(patientId);
  };

  return (
    <div>
      <button onClick={checkDropoutRisk}>
        Avaliar Risco de Abandono
      </button>
      
      {dropoutMutation.data && (
        <div className={`alert alert-${dropoutMutation.data.outcome_prediction}`}>
          Risco: {dropoutMutation.data.outcome_prediction}
          <ul>
            {dropoutMutation.data.recommendations.map(rec => (
              <li key={rec}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Recomendação de Exercícios

```typescript
import { useRecommendExercises } from '@/hooks/useMLPredictions';

function ExercisePlan({ patientId, condition }) {
  const recommendMutation = useRecommendExercises();

  const getRecommendations = () => {
    recommendMutation.mutate({
      patientId,
      conditionType: condition,
    });
  };

  return (
    <div>
      <button onClick={getRecommendations}>
        Recomendar Exercícios (IA)
      </button>
      
      {recommendMutation.data && (
        <div className="exercise-list">
          {recommendMutation.data.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 4. Treinar Modelo

```typescript
import { useTrainModel } from '@/hooks/useMLPredictions';

function MLAdminPanel() {
  const trainMutation = useTrainModel();

  const retrainModel = () => {
    trainMutation.mutate({
      modelName: 'outcome_predictor_v2',
      predictionType: 'treatment_outcome',
      algorithm: 'gradient_boosting',
    });
  };

  return (
    <button onClick={retrainModel} disabled={trainMutation.isPending}>
      {trainMutation.isPending ? 'Treinando... (2-5 min)' : 'Retreinar Modelo'}
    </button>
  );
}
```

---

### 5. Monitorar Modelo

```typescript
import { useMonitorModel } from '@/hooks/useMLPredictions';

function ModelMonitoring({ modelId }) {
  const { data: monitoring, isLoading } = useMonitorModel(modelId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h3>Performance do Modelo</h3>
      <p>Accuracy: {(monitoring.accuracy * 100).toFixed(1)}%</p>
      <p>Predições validadas: {monitoring.validated_predictions}</p>
      
      {monitoring.model_drift_detected && (
        <div className="alert alert-warning">
          ⚠️ Model Drift Detectado!
          <p>Severidade: {monitoring.drift_severity}</p>
          <p>Ação: {monitoring.needs_retraining ? 'Retreinamento necessário' : 'Monitorar'}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 ARQUITETURA ML

```
┌─────────────────────────────────────────┐
│         MACHINE LEARNING SYSTEM         │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (React)                       │
│  ├─ hooks/useMLPredictions.ts          │
│  ├─ pages/MLDashboard.tsx              │
│  └─ components/PredictionCard.tsx      │
│                                         │
│  ↓↓↓ HTTP/WebSocket ↓↓↓                │
│                                         │
│  Services Layer                         │
│  ├─ mlPredictionService.ts             │
│  ├─ modelTrainingService.ts            │
│  └─ api/ml/predictions.ts              │
│                                         │
│  ↓↓↓ API Calls ↓↓↓                     │
│                                         │
│  AI/ML Backends                         │
│  ├─ Claude AI (Anthropic) ✅           │
│  ├─ Python ML API (opcional)           │
│  └─ Supabase (storage)                 │
│                                         │
│  ↓↓↓ Storage ↓↓↓                       │
│                                         │
│  Database (Supabase)                    │
│  ├─ ai_predictions                     │
│  ├─ ml_models                          │
│  ├─ prediction_features                │
│  ├─ model_training_runs                │
│  └─ prediction_monitoring              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 FEATURES IMPLEMENTADAS

### ✅ Core ML

- Predição de outcome ✅
- Predição de dropout ✅
- Recomendação de exercícios ✅
- Feature engineering ✅
- Normalização de dados ✅

### ✅ Model Management

- Training framework ✅
- Hiperparâmetros configuráveis ✅
- Versionamento de modelos ✅
- A/B testing ready ✅

### ✅ Monitoring

- Performance tracking ✅
- Model drift detection ✅
- Accuracy monitoring ✅
- Auto-retrain triggers ✅

### ✅ Explicabilidade

- Feature importance ✅
- SHAP values ready ✅
- Natural language explanations ✅
- Visualizações ✅

### ✅ Integration

- Claude AI ✅
- Supabase storage ✅
- React Query cache ✅
- Real-time updates ✅

---

## 🔧 CONFIGURAÇÃO

### Variáveis de Ambiente

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
VITE_ML_ENDPOINT=https://your-ml-api.com
```

### Habilitar Claude AI

```bash
# Obter API key:
# https://console.anthropic.com/
```

---

## 🧪 COMO TESTAR

### Teste 1: Predição de Outcome

```typescript
const result = await mlPredictionService.predictTreatmentOutcome({
  patient_id: 'test-patient-id',
  prediction_type: 'treatment_outcome',
  features: {
    age: 45,
    condition: 'lombalgia',
    severity: 7,
  },
});

console.log('Outcome:', result.outcome_prediction);
console.log('Confiança:', result.confidence_score);
console.log('Recomendações:', result.recommendations);
```

### Teste 2: Risco de Abandono

```typescript
const dropout = await mlPredictionService.predictDropoutRisk('patient-id');

if (dropout.outcome_prediction === 'high') {
  console.log('ALERTA: Alto risco de abandono!');
  console.log('Ações preventivas:', dropout.recommendations);
}
```

### Teste 3: Recomendação de Exercícios

```typescript
const exercises = await mlPredictionService.recommendExercises(
  'patient-id',
  'lombalgia'
);

console.log(`${exercises.length} exercícios recomendados`);
```

---

## 📈 PRÓXIMAS IMPLEMENTAÇÕES

### Curto Prazo

1. **Análise de Marcha (Visão Computacional)**
   - Upload de vídeo
   - Processamento com OpenCV/MediaPipe
   - Extração de métricas
   - Detecção de anomalias

2. **Python ML API**
   - Scikit-learn models
   - TensorFlow/PyTorch
   - FastAPI endpoint
   - Docker container

### Médio Prazo

3. **Auto-ML**
   - Seleção automática de algoritmo
   - Tuning de hiperparâmetros
   - Ensemble methods

4. **Federated Learning**
   - Treinar sem compartilhar dados
   - Privacy-preserving ML
   - Colaboração entre clínicas

---

## ✅ CHECKLIST

- [x] ✅ MLPredictionService criado
- [x] ✅ ModelTrainingService criado
- [x] ✅ API com Claude AI
- [x] ✅ Hooks React Query
- [x] ✅ Integração com Supabase
- [x] ✅ Feature engineering
- [x] ✅ Model monitoring
- [x] ✅ Drift detection
- [x] ✅ Documentação completa
- [ ] ⬜ Python ML API (opcional)
- [ ] ⬜ Análise de marcha (futuro)
- [ ] ⬜ Auto-ML (futuro)

---

## 🎉 CONCLUSÃO

Sistema de Machine Learning implementado com framework robusto!

**Capacidades:**
- ✅ Predições de outcome
- ✅ Risco de abandono
- ✅ Recomendação de exercícios
- ✅ Análise com Claude AI
- ✅ Monitoramento automático
- ✅ Explicabilidade

**Próximo:** Implementar análise de marcha (visão computacional)

---

**Criado em:** 08 de Outubro de 2025  
**Status:** ✅ IMPLEMENTADO

🚀 **Fase 3.2 COMPLETA!**



