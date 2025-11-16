# 🤖 MACHINE LEARNING - SISTEMA COMPLETO

**Data:** 09 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 🎯 GUIA TÉCNICO COMPLETO

---

## 🎯 VISÃO GERAL

Sistema completo de Machine Learning para fisioterapia, incluindo:
- Modelos preditivos de outcomes clínicos
- Recomendações personalizadas de tratamento
- Detecção precoce de complicações
- Otimização de protocolos
- Análise de sentimento em notas clínicas

---

## 📋 ÍNDICE

1. [Arquitetura ML](#arquitetura-ml)
2. [Modelos Existentes](#modelos-existentes)
3. [Novos Modelos Propostos](#novos-modelos-propostos)
4. [Feature Engineering](#feature-engineering)
5. [Treinamento e Avaliação](#treinamento-e-avaliação)
6. [Deploy e Monitoramento](#deploy-e-monitoramento)
7. [Implementação no Sistema](#implementação-no-sistema)

---

## 1. ARQUITETURA ML

### 1.1 Pipeline Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Database:                                             │
│  - patients                                                     │
│  - sessions                                                     │
│  - clinical_outcomes                                            │
│  - ml_predictions                                               │
│  - ml_models                                                    │
│  - ml_training_runs                                             │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ Feature Extraction
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE STORE                                │
├─────────────────────────────────────────────────────────────────┤
│  Patient Features:                                              │
│  - Demographics (age, gender, BMI)                              │
│  - Medical history                                              │
│  - Lifestyle factors                                            │
│                                                                 │
│  Clinical Features:                                             │
│  - Diagnosis & severity                                         │
│  - Pain levels & mobility                                       │
│  - Session progress                                             │
│                                                                 │
│  Behavioral Features:                                           │
│  - Adherence rate                                               │
│  - No-show history                                              │
│  - Engagement metrics                                           │
│                                                                 │
│  Temporal Features:                                             │
│  - Trends over time                                             │
│  - Seasonality                                                  │
│  - Time since events                                            │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ Training / Inference
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ML MODELS                                    │
├─────────────────────────────────────────────────────────────────┤
│  Predictive Models:                                             │
│  - Treatment Outcome Predictor                                  │
│  - Dropout Risk Predictor                                       │
│  - Recovery Time Predictor                                      │
│  - Complication Detector                                        │
│  - No-Show Predictor                                            │
│                                                                 │
│  Recommendation Models:                                         │
│  - Exercise Recommender                                         │
│  - Protocol Optimizer                                           │
│  - Treatment Plan Generator                                     │
│                                                                 │
│  NLP Models:                                                    │
│  - Sentiment Analyzer                                           │
│  - Entity Extraction                                            │
│  - Clinical Note Summarizer                                     │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ Predictions & Recommendations
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EXPLAINABILITY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  - SHAP Values                                                  │
│  - Feature Importance                                           │
│  - Natural Language Explanations                                │
│  - Visual Decision Trees                                        │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ API / UI
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT APPLICATION                            │
├─────────────────────────────────────────────────────────────────┤
│  Components:                                                    │
│  - <PredictionCard />                                           │
│  - <RecommendationsList />                                      │
│  - <ExplanationView />                                          │
│  - <ModelMonitor />                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. MODELOS EXISTENTES

### 2.1 Treatment Outcome Predictor ✅ IMPLEMENTADO

**Objetivo:** Predizer probabilidade de sucesso do tratamento

**Features:**
```typescript
interface TreatmentOutcomeFeatures {
  // Paciente
  age: number;
  gender: string;
  bmi: number;
  chronicDiseases: number; // count
  hasAllergies: boolean;
  smokingStatus: string;
  alcoholConsumption: string;
  physicalActivityLevel: string;
  
  // Condição
  diagnosisType: string;
  severity: number; // 1-10
  daysSinceOnset: number;
  previousInjuries: number;
  
  // Tratamento
  sessionsPerWeek: number;
  plannedTotalSessions: number;
  historicalAdherenceRate: number;
  
  // Social
  socialSupport: number; // 1-10
  occupationalDemand: string;
  distance: number; // distância até clínica em km
  
  // Histórico (similar patients)
  similarPatientsSuccessRate: number;
}
```

**Output:**
```typescript
interface TreatmentOutcomePrediction {
  successProbability: number; // 0-1
  confidence: number; // 0-1
  confidenceLevel: 'low' | 'medium' | 'high';
  outcomeCategory: 'excellent' | 'good' | 'moderate' | 'poor';
  
  // Fatores que influenciam
  riskFactors: Factor[];
  protectiveFactors: Factor[];
  
  // Explicação
  explanation: string;
  featureImportance: Record<string, number>;
  
  // Recomendações
  recommendations: Recommendation[];
  alternativeTreatments: TreatmentOption[];
  
  // Similar cases
  similarCases: SimilarCase[];
}

interface Factor {
  name: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  value: any;
}
```

**Algoritmo Atual:** Heurístico (regras simples)

**Melhoria Proposta:** Random Forest Classifier

```python
# Python - Treinar modelo

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score

# Preparar dados
X = df[feature_columns]
y = df['treatment_success']  # 1 = sucesso, 0 = não sucesso

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Treinar modelo
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=20,
    min_samples_leaf=10,
    class_weight='balanced',
    random_state=42
)

model.fit(X_train, y_train)

# Avaliar
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_pred_proba)

print(f"Accuracy: {accuracy:.4f}")
print(f"AUC-ROC: {auc:.4f}")

# Feature importance
importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print(importance)

# Salvar modelo
import joblib
joblib.dump(model, 'treatment_outcome_model.pkl')
```

**Métricas Alvo:**
- Accuracy > 80%
- AUC-ROC > 0.85
- Precision > 0.75
- Recall > 0.80

---

### 2.2 Dropout Risk Predictor ✅ IMPLEMENTADO

**Objetivo:** Predizer risco de abandono do tratamento

**Features:**
```typescript
interface DropoutRiskFeatures {
  // Aderência
  attendanceRate: number; // 0-1
  noShowCount: number;
  cancelledCount: number;
  missedLastSession: boolean;
  daysSinceLastSession: number;
  consecutiveMissedSessions: number;
  
  // Financeiro
  hasOutstandingBalance: boolean;
  outstandingAmount: number;
  daysOverdue: number;
  paymentHistory: number[]; // últimos 6 meses
  
  // Progresso clínico
  painReduction: number;
  mobilityImprovement: number;
  satisfactionScore: number;
  frustrationLevel: number; // detectado via NLP em notas
  
  // Engagement
  homeExerciseCompliance: number; // 0-1
  responseRateToMessages: number; // 0-1
  questionsAsked: number;
  feedbackProvided: boolean;
  
  // Contextual
  distance: number;
  hasTransportIssues: boolean;
  hasChildcare: boolean;
  workScheduleConflicts: number;
}
```

**Output:**
```typescript
interface DropoutRiskPrediction {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  confidence: number; // 0-1
  
  // Principais motivos
  topReasons: {
    reason: string;
    weight: number;
    description: string;
  }[];
  
  // Plano de prevenção
  preventionPlan: {
    priority: 'urgent' | 'high' | 'medium';
    interventions: Intervention[];
    contactRecommendation: string;
    suggestedActions: string[];
    timeline: string;
  };
  
  // Predições
  estimatedDaysUntilDropout: number;
  recoveryProbability: number; // se intervenção for feita
}

interface Intervention {
  type: 'call' | 'message' | 'email' | 'in_person';
  content: string;
  timing: string;
  assignedTo: string;
  expectedImpact: 'high' | 'medium' | 'low';
}
```

**Algoritmo Atual:** Logistic Regression (simplificado)

**Melhoria Proposta:** Gradient Boosting (XGBoost)

```python
import xgboost as xgb
from sklearn.metrics import classification_report, confusion_matrix

# Preparar dados
X = df[feature_columns]
y = df['dropped_out']  # 1 = abandonou, 0 = continuou

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Balancear classes
scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

# Treinar XGBoost
model = xgb.XGBClassifier(
    max_depth=6,
    learning_rate=0.1,
    n_estimators=200,
    scale_pos_weight=scale_pos_weight,
    eval_metric='auc',
    random_state=42
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    early_stopping_rounds=20,
    verbose=False
)

# Avaliar
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]

print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))

# Feature importance
xgb.plot_importance(model, max_num_features=15)

# Salvar
model.save_model('dropout_risk_model.json')
```

---

### 2.3 Exercise Recommender ✅ IMPLEMENTADO

**Objetivo:** Recomendar exercícios personalizados

**Técnica:** Collaborative Filtering + Content-Based

**Approach:**
1. Encontrar pacientes similares (características demográficas + diagnóstico)
2. Identificar exercícios que tiveram sucesso com eles
3. Filtrar por capacidade atual do paciente
4. Ordenar por probabilidade de sucesso

```typescript
interface ExerciseRecommendation {
  exercise: Exercise;
  score: number; // 0-1
  reasoning: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedBenefit: {
    painReduction: number;
    mobilityImprovement: number;
    strengthGain: number;
  };
  similarPatientsSuccess: number; // % de sucesso
  contraindications: string[];
  alternatives: Exercise[];
}
```

**Melhoria Proposta:** Deep Learning (Neural Collaborative Filtering)

```python
import torch
import torch.nn as nn

class ExerciseRecommender(nn.Module):
    def __init__(self, num_patients, num_exercises, embedding_dim=50):
        super().__init__()
        
        self.patient_embedding = nn.Embedding(num_patients, embedding_dim)
        self.exercise_embedding = nn.Embedding(num_exercises, embedding_dim)
        
        self.fc = nn.Sequential(
            nn.Linear(embedding_dim * 2, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
    
    def forward(self, patient_ids, exercise_ids):
        patient_emb = self.patient_embedding(patient_ids)
        exercise_emb = self.exercise_embedding(exercise_ids)
        
        x = torch.cat([patient_emb, exercise_emb], dim=1)
        score = self.fc(x)
        
        return score

# Treinar
model = ExerciseRecommender(num_patients, num_exercises)
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(100):
    for batch in train_loader:
        patient_ids, exercise_ids, labels = batch
        
        optimizer.zero_grad()
        predictions = model(patient_ids, exercise_ids)
        loss = criterion(predictions, labels)
        loss.backward()
        optimizer.step()
```

---

## 3. NOVOS MODELOS PROPOSTOS

### 3.1 Recovery Time Predictor 🆕 NOVO

**Objetivo:** Estimar tempo até recuperação completa

**Features:**
```typescript
interface RecoveryTimeFeatures {
  // Baseline
  initialPainLevel: number;
  initialMobility: number;
  initialFunctionality: number;
  
  // Condição
  diagnosisType: string;
  severity: number;
  affectedBodyPart: string;
  bilateral: boolean;
  
  // Paciente
  age: number;
  bmi: number;
  comorbidities: number;
  healingCapacity: number; // baseado em histórico
  
  // Tratamento
  treatmentIntensity: 'low' | 'medium' | 'high';
  sessionsPerWeek: number;
  adherenceRate: number;
  homeExerciseCompliance: number;
  
  // Progresso até agora
  weeksSinceTreatmentStart: number;
  painReductionRate: number; // por semana
  mobilityImprovementRate: number;
  
  // Similar cases
  similarCasesAvgRecoveryDays: number;
  similarCasesStdDev: number;
}
```

**Output:**
```typescript
interface RecoveryTimePrediction {
  estimatedDays: number;
  estimatedWeeks: number;
  uncertaintyRange: {
    min: number;
    max: number;
    confidence: number; // 0-1
  };
  
  // Milestones previstos
  milestones: {
    week: number;
    expectedPainLevel: number;
    expectedMobility: number;
    expectedFunctionality: number;
    description: string;
  }[];
  
  // Fatores que influenciam
  acceleratingFactors: Factor[];
  delayingFactors: Factor[];
  
  // Recomendações para acelerar
  recommendations: {
    action: string;
    estimatedImpact: number; // dias reduzidos
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  
  // Comparação
  comparedToAverage: {
    fasterBy: number; // dias (pode ser negativo)
    percentile: number; // 0-100
  };
}
```

**Algoritmo:** Gradient Boosting Regressor

```python
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

# Preparar dados
X = df[feature_columns]
y = df['days_to_recovery']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Treinar modelo
model = GradientBoostingRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    min_samples_split=20,
    min_samples_leaf=10,
    loss='huber',  # robusto a outliers
    alpha=0.9,  # quantile para huber loss
    random_state=42
)

model.fit(X_train, y_train)

# Avaliar
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"MAE: {mae:.2f} days")
print(f"RMSE: {rmse:.2f} days")
print(f"R²: {r2:.4f}")

# Predição com intervalo de confiança
# Usar quantile regression para estimar incerteza
from sklearn.ensemble import GradientBoostingRegressor

models = {}
for quantile in [0.1, 0.5, 0.9]:
    models[quantile] = GradientBoostingRegressor(
        loss='quantile',
        alpha=quantile,
        n_estimators=200,
        random_state=42
    )
    models[quantile].fit(X_train, y_train)

# Predição
def predict_with_confidence(X_new):
    lower = models[0.1].predict(X_new)
    median = models[0.5].predict(X_new)
    upper = models[0.9].predict(X_new)
    
    return {
        'median': median,
        'lower_bound': lower,  # 80% confidence
        'upper_bound': upper,
        'confidence': 0.8
    }
```

---

### 3.2 Protocol Optimizer 🆕 NOVO

**Objetivo:** Sugerir melhor protocolo de tratamento para cada paciente

**Approach:** Reinforcement Learning + Case-Based Reasoning

```typescript
interface ProtocolOptimizationInput {
  patient: PatientProfile;
  condition: ClinicalCondition;
  constraints: {
    maxSessions: number;
    budget: number;
    timeAvailable: number; // weeks
    equipment: string[];
  };
  goals: {
    targetPainReduction: number;
    targetMobility: number;
    targetFunctionality: number;
    priority: 'speed' | 'cost' | 'outcome';
  };
}

interface ProtocolRecommendation {
  protocol: TreatmentProtocol;
  score: number; // 0-1
  
  // Predições
  expectedOutcome: {
    painReduction: number;
    mobilityImprovement: number;
    functionalityGain: number;
    recoveryDays: number;
    successProbability: number;
  };
  
  // Recursos necessários
  resources: {
    totalSessions: number;
    sessionsPerWeek: number;
    duration: number; // weeks
    estimatedCost: number;
    equipmentNeeded: string[];
    specialistRequired: string[];
  };
  
  // Justificativa
  reasoning: {
    whyThisProtocol: string;
    evidenceStrength: 'strong' | 'moderate' | 'weak';
    similarCasesCount: number;
    successRateInSimilarCases: number;
    literatureSupport: string[];
  };
  
  // Alternativas
  alternatives: {
    protocol: TreatmentProtocol;
    score: number;
    tradeoffs: string;
  }[];
  
  // Personalização
  modifications: {
    reason: string;
    change: string;
    impact: string;
  }[];
}

interface TreatmentProtocol {
  id: string;
  name: string;
  description: string;
  
  phases: {
    phase: number;
    name: string;
    durationWeeks: number;
    objectives: string[];
    
    sessions: {
      frequency: number; // per week
      duration: number; // minutes
      type: string;
      
      exercises: {
        exercise: Exercise;
        sets: number;
        reps: number;
        intensity: string;
        progression: string;
      }[];
      
      modalities: {
        type: string;
        duration: number;
        parameters: Record<string, any>;
      }[];
    };
  }[];
  
  progressionCriteria: {
    metric: string;
    threshold: number;
    action: string;
  }[];
}
```

**Implementação:**

```python
import numpy as np
from sklearn.neighbors import NearestNeighbors

class ProtocolOptimizer:
    def __init__(self, historical_data):
        self.data = historical_data
        self.nn_model = NearestNeighbors(n_neighbors=10, metric='euclidean')
        
        # Treinar nearest neighbors com features de pacientes
        X = historical_data[feature_columns].values
        self.nn_model.fit(X)
    
    def recommend_protocol(self, patient_features, goals, constraints):
        # 1. Encontrar casos similares
        distances, indices = self.nn_model.kneighbors([patient_features])
        similar_cases = self.data.iloc[indices[0]]
        
        # 2. Avaliar protocolos baseado em outcomes de casos similares
        protocol_scores = {}
        
        for protocol_id in similar_cases['protocol_id'].unique():
            cases_with_protocol = similar_cases[similar_cases['protocol_id'] == protocol_id]
            
            # Calcular score baseado em:
            # - Taxa de sucesso
            # - Outcome médio
            # - Adequação aos constraints
            # - Adequação aos goals
            
            success_rate = cases_with_protocol['success'].mean()
            avg_outcome = cases_with_protocol['outcome_score'].mean()
            meets_constraints = self._check_constraints(protocol_id, constraints)
            goal_alignment = self._calculate_goal_alignment(protocol_id, goals)
            
            score = (
                0.4 * success_rate +
                0.3 * (avg_outcome / 100) +
                0.2 * meets_constraints +
                0.1 * goal_alignment
            )
            
            protocol_scores[protocol_id] = {
                'score': score,
                'success_rate': success_rate,
                'avg_outcome': avg_outcome,
                'similar_cases_count': len(cases_with_protocol)
            }
        
        # 3. Ordenar protocolos por score
        ranked_protocols = sorted(
            protocol_scores.items(),
            key=lambda x: x[1]['score'],
            reverse=True
        )
        
        # 4. Retornar top protocolo com personalização
        best_protocol_id = ranked_protocols[0][0]
        protocol = self._get_protocol(best_protocol_id)
        
        # Personalizar protocolo baseado em características específicas
        personalized_protocol = self._personalize_protocol(
            protocol,
            patient_features,
            goals
        )
        
        return {
            'protocol': personalized_protocol,
            'score': ranked_protocols[0][1]['score'],
            'alternatives': ranked_protocols[1:4],  # Top 3 alternativas
            'reasoning': self._generate_reasoning(best_protocol_id, similar_cases)
        }
    
    def _personalize_protocol(self, protocol, patient_features, goals):
        # Ajustar intensidade baseado em idade, comorbidades, etc
        # Modificar progressão baseado em goals de tempo
        # Adicionar exercícios específicos para condição secundária
        # etc
        
        modifications = []
        
        if patient_features['age'] > 65:
            protocol = self._reduce_intensity(protocol, factor=0.8)
            modifications.append({
                'reason': 'Idade > 65 anos',
                'change': 'Reduzida intensidade em 20%',
                'impact': 'Melhor tolerância, menor risco de lesão'
            })
        
        if patient_features['bmi'] > 30:
            protocol = self._add_weight_considerations(protocol)
            modifications.append({
                'reason': 'IMC > 30',
                'change': 'Adicionados exercícios de baixo impacto',
                'impact': 'Proteção articular'
            })
        
        if goals['priority'] == 'speed':
            protocol = self._increase_frequency(protocol)
            modifications.append({
                'reason': 'Prioridade: Velocidade',
                'change': 'Aumentada frequência para 4-5x/semana',
                'impact': 'Recuperação 20-30% mais rápida'
            })
        
        protocol['modifications'] = modifications
        return protocol
```

---

### 3.3 Complication Detector 🆕 NOVO

**Objetivo:** Detectar precocemente sinais de complicações ou piora

**Approach:** LSTM (Long Short-Term Memory) para análise de séries temporais

```typescript
interface ComplicationDetectionInput {
  patientId: string;
  timeSeriesData: {
    sessionDate: string;
    painLevel: number;
    mobilityScore: number;
    functionalityScore: number;
    satisfactionScore: number;
    sessionNotes: string;
  }[];
  latestSession: Session;
}

interface ComplicationAlert {
  detected: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  
  // Anomalias detectadas
  anomalies: {
    type: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
    firstDetected: string; // date
    trend: 'worsening' | 'stable' | 'improving';
    
    // Dados
    currentValue: number;
    expectedValue: number;
    deviation: number; // standard deviations
  }[];
  
  // Possíveis complicações
  suspectedComplications: {
    complication: string;
    probability: number;
    indicators: string[];
    urgency: 'routine' | 'soon' | 'urgent' | 'immediate';
  }[];
  
  // Ações recomendadas
  recommendedActions: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    timing: string;
    assignTo: string;
    reasoning: string;
  }[];
  
  // Contexto
  patientHistory: string;
  recentEvents: string[];
  riskFactors: string[];
}
```

**Implementação:**

```python
import torch
import torch.nn as nn
from sklearn.preprocessing import StandardScaler

class ComplicationLSTM(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, num_layers=2):
        super().__init__()
        
        self.lstm = nn.LSTM(
            input_dim,
            hidden_dim,
            num_layers,
            batch_first=True,
            dropout=0.2
        )
        
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        # x shape: (batch, sequence_length, features)
        lstm_out, (h_n, c_n) = self.lstm(x)
        
        # Usar último hidden state
        last_hidden = h_n[-1]
        
        # Predição
        out = self.fc(last_hidden)
        
        return out

# Preparar dados de série temporal
def prepare_sequences(data, sequence_length=10):
    sequences = []
    labels = []
    
    for patient_id in data['patient_id'].unique():
        patient_data = data[data['patient_id'] == patient_id].sort_values('session_date')
        
        features = patient_data[['pain_level', 'mobility', 'functionality', 'satisfaction']].values
        
        # Criar sequências deslizantes
        for i in range(len(features) - sequence_length):
            seq = features[i:i+sequence_length]
            label = patient_data.iloc[i+sequence_length]['complication_occurred']
            
            sequences.append(seq)
            labels.append(label)
    
    return np.array(sequences), np.array(labels)

# Treinar
sequence_length = 10
X_seq, y = prepare_sequences(data, sequence_length)

X_train, X_test, y_train, y_test = train_test_split(X_seq, y, test_size=0.2, random_state=42)

# Normalizar
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train.reshape(-1, X_train.shape[-1])).reshape(X_train.shape)
X_test_scaled = scaler.transform(X_test.reshape(-1, X_test.shape[-1])).reshape(X_test.shape)

# Converter para tensors
X_train_tensor = torch.FloatTensor(X_train_scaled)
y_train_tensor = torch.FloatTensor(y_train).unsqueeze(1)

# Modelo
model = ComplicationLSTM(input_dim=4)
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# Training loop
for epoch in range(100):
    model.train()
    
    optimizer.zero_grad()
    outputs = model(X_train_tensor)
    loss = criterion(outputs, y_train_tensor)
    loss.backward()
    optimizer.step()
    
    if (epoch + 1) % 10 == 0:
        print(f'Epoch [{epoch+1}/100], Loss: {loss.item():.4f}')

# Avaliar
model.eval()
with torch.no_grad():
    X_test_tensor = torch.FloatTensor(X_test_scaled)
    predictions = model(X_test_tensor).numpy()
    
from sklearn.metrics import classification_report, roc_auc_score

y_pred = (predictions > 0.5).astype(int)
print(classification_report(y_test, y_pred))
print(f"AUC-ROC: {roc_auc_score(y_test, predictions):.4f}")

# Detecção de anomalias com Isolation Forest
from sklearn.ensemble import IsolationForest

anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
anomaly_detector.fit(X_train_scaled.reshape(-1, X_train.shape[-1]))

def detect_anomalies(sequence):
    scores = anomaly_detector.decision_function(sequence)
    is_anomaly = anomaly_detector.predict(sequence)
    
    return is_anomaly, scores
```

---

### 3.4 Sentiment Analyzer (NLP) 🆕 NOVO

**Objetivo:** Analisar sentimento e extrair insights de notas clínicas

**Approach:** Transformer-based NLP (BERT Portuguese fine-tuned)

```typescript
interface SentimentAnalysisInput {
  clinicalNote: string;
  patientId: string;
  sessionId: string;
  sessionDate: string;
}

interface SentimentAnalysisResult {
  // Sentimento geral
  overallSentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  sentimentScore: number; // -1 a +1
  confidence: number;
  
  // Emoções detectadas
  emotions: {
    emotion: string;
    intensity: number; // 0-1
  }[];
  
  // Tom emocional
  emotionalTone: string[];
  
  // Frases-chave
  keyPhrases: {
    phrase: string;
    sentiment: string;
    relevance: number;
  }[];
  
  // Preocupações identificadas
  concerns: {
    concern: string;
    severity: 'low' | 'medium' | 'high';
    category: 'pain' | 'progress' | 'motivation' | 'other';
  }[];
  
  // Aspectos positivos
  positiveAspects: {
    aspect: string;
    description: string;
  }[];
  
  // Insights acionáveis
  actionableInsights: {
    insight: string;
    suggestedAction: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  
  // Entidades clínicas extraídas
  clinicalEntities: {
    entity: string;
    type: 'symptom' | 'body_part' | 'procedure' | 'medication';
    context: string;
  }[];
  
  // Análise de tendência
  trendAnalysis: {
    comparedToPrevious: 'better' | 'same' | 'worse';
    changeDescription: string;
    concerningPatterns: string[];
  };
}
```

**Implementação:**

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import pipeline
import torch

class ClinicalSentimentAnalyzer:
    def __init__(self):
        # Carregar modelo BERT Portuguese
        model_name = "neuralmind/bert-base-portuguese-cased"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_name,
            num_labels=5  # 5 classes de sentimento
        )
        
        # Pipeline para NER (Named Entity Recognition)
        self.ner_pipeline = pipeline(
            "ner",
            model="pucpr/clinicalnerpt-chemical",
            tokenizer="pucpr/clinicalnerpt-chemical"
        )
    
    def analyze(self, text):
        # 1. Análise de sentimento
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            sentiment_class = torch.argmax(probs).item()
        
        sentiment_map = {
            0: 'very_negative',
            1: 'negative',
            2: 'neutral',
            3: 'positive',
            4: 'very_positive'
        }
        
        sentiment = sentiment_map[sentiment_class]
        confidence = probs[0][sentiment_class].item()
        
        # Converter para score -1 a +1
        sentiment_score = (sentiment_class - 2) / 2  # Normalizar para -1 a 1
        
        # 2. Extrair entidades clínicas
        entities = self.ner_pipeline(text)
        
        # 3. Identificar frases-chave
        sentences = text.split('.')
        key_phrases = []
        
        for sentence in sentences:
            if len(sentence.strip()) < 10:
                continue
                
            # Análise de sentimento por frase
            sent_inputs = self.tokenizer(sentence, return_tensors="pt", truncation=True)
            with torch.no_grad():
                sent_outputs = self.model(**sent_inputs)
                sent_probs = torch.softmax(sent_outputs.logits, dim=1)
                sent_class = torch.argmax(sent_probs).item()
            
            # Relevância baseada em keywords clínicas
            relevance = self._calculate_relevance(sentence)
            
            if relevance > 0.3:  # Threshold
                key_phrases.append({
                    'phrase': sentence.strip(),
                    'sentiment': sentiment_map[sent_class],
                    'relevance': relevance
                })
        
        # 4. Identificar preocupações
        concerns = self._identify_concerns(text, entities, key_phrases)
        
        # 5. Aspectos positivos
        positive_aspects = self._identify_positive_aspects(key_phrases)
        
        # 6. Insights acionáveis
        insights = self._generate_insights(sentiment, concerns, positive_aspects)
        
        return {
            'overallSentiment': sentiment,
            'sentimentScore': sentiment_score,
            'confidence': confidence,
            'keyPhrases': key_phrases,
            'concerns': concerns,
            'positiveAspects': positive_aspects,
            'actionableInsights': insights,
            'clinicalEntities': entities
        }
    
    def _calculate_relevance(self, sentence):
        # Keywords clínicas com pesos
        clinical_keywords = {
            'dor': 1.0,
            'melhora': 0.9,
            'piora': 0.9,
            'dificuldade': 0.8,
            'limitação': 0.8,
            'progresso': 0.7,
            'evolução': 0.7,
            'queixa': 0.8,
            'relata': 0.6,
        }
        
        sentence_lower = sentence.lower()
        relevance = 0
        
        for keyword, weight in clinical_keywords.items():
            if keyword in sentence_lower:
                relevance += weight
        
        # Normalizar
        return min(relevance, 1.0)
    
    def _identify_concerns(self, text, entities, key_phrases):
        concerns = []
        
        # Patterns de preocupação
        concern_patterns = [
            ('dor aumentou', 'pain', 'high'),
            ('piora', 'progress', 'high'),
            ('dificuldade para', 'progress', 'medium'),
            ('não consegu', 'progress', 'medium'),
            ('desanimado', 'motivation', 'medium'),
            ('frustrado', 'motivation', 'high'),
        ]
        
        text_lower = text.lower()
        
        for pattern, category, severity in concern_patterns:
            if pattern in text_lower:
                # Extrair contexto
                idx = text_lower.find(pattern)
                context_start = max(0, idx - 50)
                context_end = min(len(text), idx + 100)
                context = text[context_start:context_end]
                
                concerns.append({
                    'concern': pattern,
                    'severity': severity,
                    'category': category,
                    'context': context.strip()
                })
        
        return concerns
    
    def _identify_positive_aspects(self, key_phrases):
        positive_aspects = []
        
        positive_keywords = ['melhora', 'progresso', 'evolução', 'satisfeito', 'consegue']
        
        for phrase_obj in key_phrases:
            phrase = phrase_obj['phrase'].lower()
            sentiment = phrase_obj['sentiment']
            
            if sentiment in ['positive', 'very_positive']:
                for keyword in positive_keywords:
                    if keyword in phrase:
                        positive_aspects.append({
                            'aspect': keyword,
                            'description': phrase_obj['phrase']
                        })
                        break
        
        return positive_aspects
    
    def _generate_insights(self, sentiment, concerns, positive_aspects):
        insights = []
        
        if sentiment in ['negative', 'very_negative'] and len(concerns) > 0:
            insights.append({
                'insight': 'Paciente apresenta múltiplas preocupações e sentimento negativo',
                'suggestedAction': 'Agendar conversa para revisar plano de tratamento',
                'priority': 'high'
            })
        
        if len(positive_aspects) > 2:
            insights.append({
                'insight': 'Paciente mostra boa evolução em múltiplos aspectos',
                'suggestedAction': 'Reforçar aspectos positivos e manter estratégia atual',
                'priority': 'low'
            })
        
        for concern in concerns:
            if concern['severity'] == 'high':
                insights.append({
                    'insight': f"Preocupação de alta gravidade identificada: {concern['concern']}",
                    'suggestedAction': 'Avaliar imediatamente e ajustar tratamento se necessário',
                    'priority': 'high'
                })
        
        return insights

# Uso
analyzer = ClinicalSentimentAnalyzer()

note = """
Paciente relata melhora significativa da dor lombar. Está conseguindo 
realizar as atividades do dia a dia sem limitações. Demonstra bom engajamento 
com os exercícios domiciliares. Refere estar satisfeito com o progresso do tratamento.
"""

result = analyzer.analyze(note)
print(result)
```

---

## 4. FEATURE ENGINEERING

### 4.1 Feature Store Centralizado

```typescript
// services/ml/featureStore.ts

interface FeatureStore {
  // Patient features
  getPatientFeatures(patientId: string): Promise<PatientFeatures>;
  
  // Clinical features
  getClinicalFeatures(patientId: string): Promise<ClinicalFeatures>;
  
  // Behavioral features
  getBehavioralFeatures(patientId: string): Promise<BehavioralFeatures>;
  
  // Temporal features
  getTemporalFeatures(patientId: string, lookbackDays: number): Promise<TemporalFeatures>;
  
  // Aggregated features
  getAggregatedFeatures(patientId: string): Promise<AggregatedFeatures>;
}

interface PatientFeatures {
  // Demographics
  age: number;
  gender: string;
  bmi: number;
  bmCategory: string;
  
  // Medical history
  hasChronicDiseases: boolean;
  chronicDiseasesCount: number;
  hasAllergies: boolean;
  allergiesCount: number;
  hasPreviousSurgeries: boolean;
  surgeriesCount: number;
  
  // Lifestyle
  smokingStatus: string;
  alcoholConsumption: string;
  physicalActivityLevel: string;
  
  // Social
  maritalStatus: string;
  hasEmergencyContact: boolean;
  distance: number;
}

interface ClinicalFeatures {
  // Diagnosis
  diagnosisType: string;
  diagnosisCategory: string;
  severity: number;
  affectedBodyPart: string;
  bilateral: boolean;
  daysSinceOnset: number;
  
  // Baseline metrics
  initialPainLevel: number;
  initialMobility: number;
  initialFunctionality: number;
  
  // Current metrics
  currentPainLevel: number;
  currentMobility: number;
  currentFunctionality: number;
  currentSatisfaction: number;
  
  // Progress
  painReduction: number;
  painImprovementPct: number;
  mobilityImprovement: number;
  functionalityImprovement: number;
  
  // Treatment
  treatmentType: string;
  sessionsCompleted: number;
  sessionsPlanned: number;
  progressPct: number;
  weeksSinceTreatmentStart: number;
}

interface BehavioralFeatures {
  // Adherence
  attendanceRate: number;
  adherenceCategory: string;
  noShowCount: number;
  cancelledCount: number;
  missedLast: boolean;
  consecutiveMissed: number;
  daysSinceLastSession: number;
  
  // Engagement
  homeExerciseCompliance: number;
  responseRate: number;
  questionsAskedCount: number;
  feedbackProvidedCount: number;
  
  // Communication
  preferredContactMethod: string;
  responseTime: number; // average hours
  
  // Satisfaction
  avgSatisfactionScore: number;
  satisfactionTrend: string;
  npsCategory: string;
}

interface TemporalFeatures {
  // Trends (últimos N dias)
  painTrend: {
    slope: number;
    direction: 'improving' | 'stable' | 'worsening';
    volatility: number;
  };
  
  mobilityTrend: {
    slope: number;
    direction: 'improving' | 'stable' | 'worsening';
    volatility: number;
  };
  
  satisfactionTrend: {
    slope: number;
    direction: 'improving' | 'stable' | 'worsening';
    volatility: number;
  };
  
  // Seasonality
  dayOfWeekEffect: Record<string, number>;
  timeOfDayEffect: Record<string, number>;
  
  // Lag features
  painLevel_lag1: number;
  painLevel_lag7: number;
  mobilityScore_lag1: number;
  mobilityScore_lag7: number;
  
  // Rolling statistics (últimos 7/14/30 dias)
  painLevel_rolling_mean_7d: number;
  painLevel_rolling_std_7d: number;
  mobilityScore_rolling_mean_7d: number;
  adherenceRate_rolling_mean_30d: number;
}
```

### 4.2 Feature Engineering Functions

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder

class FeatureEngineer:
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
    
    def engineer_features(self, df):
        """Pipeline completo de feature engineering"""
        
        # 1. Features básicas
        df = self._add_basic_features(df)
        
        # 2. Features temporais
        df = self._add_temporal_features(df)
        
        # 3. Features de interação
        df = self._add_interaction_features(df)
        
        # 4. Features agregadas
        df = self._add_aggregated_features(df)
        
        # 5. Encoding categórico
        df = self._encode_categorical(df)
        
        # 6. Normalização
        df = self._normalize_features(df)
        
        return df
    
    def _add_basic_features(self, df):
        # BMI category
        df['bmi_category'] = pd.cut(
            df['bmi'],
            bins=[0, 18.5, 25, 30, 100],
            labels=['underweight', 'normal', 'overweight', 'obese']
        )
        
        # Age groups
        df['age_group'] = pd.cut(
            df['age'],
            bins=[0, 18, 30, 45, 60, 100],
            labels=['<18', '18-30', '31-45', '46-60', '60+']
        )
        
        # Comorbidity score
        df['comorbidity_score'] = (
            df['chronic_diseases_count'] +
            df['previous_surgeries_count'] +
            df['allergies_count']
        )
        
        # Adherence category
        df['adherence_category'] = pd.cut(
            df['adherence_rate'],
            bins=[0, 0.5, 0.7, 0.9, 1.0],
            labels=['low', 'medium', 'good', 'excellent']
        )
        
        return df
    
    def _add_temporal_features(self, df):
        # Garantir que session_date é datetime
        df['session_date'] = pd.to_datetime(df['session_date'])
        
        # Extrair componentes de data
        df['day_of_week'] = df['session_date'].dt.dayofweek
        df['week_of_year'] = df['session_date'].dt.isocalendar().week
        df['month'] = df['session_date'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Lag features
        for col in ['pain_level', 'mobility_score', 'functionality_score']:
            df[f'{col}_lag1'] = df.groupby('patient_id')[col].shift(1)
            df[f'{col}_lag7'] = df.groupby('patient_id')[col].shift(7)
        
        # Rolling statistics
        for window in [7, 14, 30]:
            for col in ['pain_level', 'mobility_score', 'satisfaction_score']:
                df[f'{col}_rolling_mean_{window}d'] = (
                    df.groupby('patient_id')[col]
                    .rolling(window, min_periods=1)
                    .mean()
                    .reset_index(0, drop=True)
                )
                
                df[f'{col}_rolling_std_{window}d'] = (
                    df.groupby('patient_id')[col]
                    .rolling(window, min_periods=1)
                    .std()
                    .reset_index(0, drop=True)
                )
        
        # Trends (slope dos últimos N dias)
        for col in ['pain_level', 'mobility_score']:
            df[f'{col}_trend_7d'] = (
                df.groupby('patient_id')
                .apply(lambda x: self._calculate_trend(x[col], window=7))
                .reset_index(level=0, drop=True)
            )
        
        return df
    
    def _calculate_trend(self, series, window=7):
        if len(series) < 2:
            return 0
        
        recent = series.tail(window)
        x = np.arange(len(recent))
        
        # Linear regression simples
        slope = np.polyfit(x, recent, 1)[0]
        return slope
    
    def _add_interaction_features(self, df):
        # Interações importantes
        
        # Age × BMI
        df['age_bmi_interaction'] = df['age'] * df['bmi']
        
        # Severity × Comorbidities
        df['severity_comorbidity'] = df['severity'] * df['comorbidity_score']
        
        # Pain × Adherence
        df['pain_adherence_interaction'] = df['current_pain_level'] * (1 - df['adherence_rate'])
        
        # Progress rate
        df['improvement_rate'] = (
            df['pain_reduction'] / (df['weeks_since_treatment_start'] + 1)
        )
        
        # Efficiency score (melhora por sessão)
        df['efficiency_score'] = (
            df['pain_improvement_pct'] / (df['sessions_completed'] + 1)
        )
        
        return df
    
    def _add_aggregated_features(self, df):
        # Features agregadas por paciente
        
        patient_agg = df.groupby('patient_id').agg({
            'pain_level': ['mean', 'std', 'min', 'max'],
            'mobility_score': ['mean', 'std', 'min', 'max'],
            'satisfaction_score': ['mean', 'std'],
            'no_show': 'sum',
            'session_id': 'count'
        })
        
        patient_agg.columns = ['_'.join(col).strip() for col in patient_agg.columns.values]
        patient_agg = patient_agg.add_prefix('patient_')
        
        df = df.merge(patient_agg, left_on='patient_id', right_index=True, how='left')
        
        return df
    
    def _encode_categorical(self, df):
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        
        for col in categorical_cols:
            if col not in self.encoders:
                self.encoders[col] = LabelEncoder()
                df[f'{col}_encoded'] = self.encoders[col].fit_transform(df[col].astype(str))
            else:
                df[f'{col}_encoded'] = self.encoders[col].transform(df[col].astype(str))
        
        return df
    
    def _normalize_features(self, df):
        numerical_cols = df.select_dtypes(include=[np.number]).columns
        
        # Excluir colunas já encodadas e IDs
        cols_to_normalize = [
            col for col in numerical_cols 
            if not col.endswith('_encoded') and not col.endswith('_id')
        ]
        
        for col in cols_to_normalize:
            if col not in self.scalers:
                self.scalers[col] = StandardScaler()
                df[f'{col}_scaled'] = self.scalers[col].fit_transform(df[[col]])
            else:
                df[f'{col}_scaled'] = self.scalers[col].transform(df[[col]])
        
        return df
```

---

## 5. DEPLOY E MONITORAMENTO

### 5.1 Model Serving API

```typescript
// api/ml/serve.ts

import { NextApiRequest, NextApiResponse } from 'next';
import * as tf from '@tensorflow/tfjs-node';

// Cache de modelos carregados
const modelCache: Map<string, any> = new Map();

async function loadModel(modelName: string, version: string) {
  const cacheKey = `${modelName}_${version}`;
  
  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey);
  }
  
  // Carregar modelo do storage
  const modelPath = `file://./models/${modelName}/${version}/model.json`;
  const model = await tf.loadLayersModel(modelPath);
  
  modelCache.set(cacheKey, model);
  return model;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { modelName, version, features } = req.body;
  
  try {
    // 1. Carregar modelo
    const model = await loadModel(modelName, version);
    
    // 2. Preparar features
    const inputTensor = tf.tensor2d([Object.values(features)]);
    
    // 3. Fazer predição
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const result = await prediction.data();
    
    // 4. Cleanup
    inputTensor.dispose();
    prediction.dispose();
    
    // 5. Retornar resultado
    return res.status(200).json({
      prediction: Array.from(result),
      modelName,
      version,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Prediction error:', error);
    return res.status(500).json({ error: 'Prediction failed' });
  }
}
```

### 5.2 Model Monitoring

```typescript
// services/ml/modelMonitoring.ts

export class ModelMonitoringService {
  /**
   * Monitorar drift de dados
   */
  async detectDataDrift(modelId: string, recentData: any[]): Promise<{
    hasDrift: boolean;
    driftScore: number;
    affectedFeatures: string[];
  }> {
    // Buscar distribuição de features do training
    const trainingStats = await this.getTrainingStats(modelId);
    
    // Calcular estatísticas dos dados recentes
    const recentStats = this.calculateStats(recentData);
    
    // Comparar distribuições (KS test, PSI, etc)
    const driftScores: Record<string, number> = {};
    
    for (const feature in trainingStats) {
      const psi = this.calculatePSI(
        trainingStats[feature],
        recentStats[feature]
      );
      
      driftScores[feature] = psi;
    }
    
    // Identificar features com drift significativo
    const driftThreshold = 0.2; // PSI > 0.2 indica drift significativo
    const affectedFeatures = Object.entries(driftScores)
      .filter(([_, score]) => score > driftThreshold)
      .map(([feature, _]) => feature);
    
    const maxDrift = Math.max(...Object.values(driftScores));
    
    return {
      hasDrift: maxDrift > driftThreshold,
      driftScore: maxDrift,
      affectedFeatures
    };
  }
  
  /**
   * Calcular PSI (Population Stability Index)
   */
  private calculatePSI(expected: number[], actual: number[]): number {
    let psi = 0;
    
    for (let i = 0; i < expected.length; i++) {
      if (expected[i] > 0 && actual[i] > 0) {
        psi += (actual[i] - expected[i]) * Math.log(actual[i] / expected[i]);
      }
    }
    
    return psi;
  }
  
  /**
   * Monitorar performance do modelo
   */
  async monitorPerformance(modelId: string): Promise<{
    currentAccuracy: number;
    baselineAccuracy: number;
    degradation: number;
    needsRetraining: boolean;
  }> {
    // Buscar predições recentes com labels reais
    const recentPredictions = await supabase
      .from('ml_predictions')
      .select('*')
      .eq('model_id', modelId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .not('actual_outcome', 'is', null);
    
    // Calcular accuracy atual
    const correct = recentPredictions.data?.filter(
      p => p.prediction === p.actual_outcome
    ).length || 0;
    
    const total = recentPredictions.data?.length || 1;
    const currentAccuracy = correct / total;
    
    // Buscar baseline accuracy
    const { data: model } = await supabase
      .from('ml_models')
      .select('metrics')
      .eq('id', modelId)
      .single();
    
    const baselineAccuracy = model?.metrics?.accuracy || 0;
    
    // Calcular degradação
    const degradation = baselineAccuracy - currentAccuracy;
    const degradationPct = (degradation / baselineAccuracy) * 100;
    
    // Decisão de re-treinamento
    const needsRetraining = degradationPct > 10; // Se degradar > 10%
    
    return {
      currentAccuracy,
      baselineAccuracy,
      degradation: degradationPct,
      needsRetraining
    };
  }
  
  /**
   * Alertas automáticos
   */
  async checkAlertsAndNotify(modelId: string): Promise<void> {
    // 1. Verificar drift
    const driftResult = await this.detectDataDrift(modelId, []);
    
    if (driftResult.hasDrift) {
      await this.sendAlert({
        type: 'data_drift',
        severity: 'high',
        modelId,
        message: `Drift detectado em ${driftResult.affectedFeatures.length} features`,
        details: driftResult
      });
    }
    
    // 2. Verificar performance
    const perfResult = await this.monitorPerformance(modelId);
    
    if (perfResult.needsRetraining) {
      await this.sendAlert({
        type: 'model_degradation',
        severity: 'critical',
        modelId,
        message: `Performance degradou ${perfResult.degradation.toFixed(2)}%`,
        details: perfResult
      });
    }
  }
}
```

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Melhorar Modelos Existentes (2 semanas)
- [ ] Coletar e preparar dados reais de treino
- [ ] Implementar Random Forest para Treatment Outcome
- [ ] Implementar XGBoost para Dropout Risk
- [ ] Treinar e avaliar modelos
- [ ] Deploy em staging

### Fase 2: Novos Modelos Preditivos (3 semanas)
- [ ] Implementar Recovery Time Predictor
- [ ] Implementar Protocol Optimizer
- [ ] Implementar Complication Detector (LSTM)
- [ ] Treinar e validar modelos
- [ ] Integrar com sistema

### Fase 3: NLP e Sentiment Analysis (2 semanas)
- [ ] Fine-tuning BERT Portuguese para notas clínicas
- [ ] Implementar extração de entidades
- [ ] Implementar análise de sentimento
- [ ] Integrar com interface

### Fase 4: Feature Store e Pipeline (1 semana)
- [ ] Implementar Feature Store centralizado
- [ ] Criar pipeline de feature engineering
- [ ] Automatizar extração de features
- [ ] Documentar features

### Fase 5: Deploy e Monitoramento (1 semana)
- [ ] Configurar Model Serving API
- [ ] Implementar monitoramento de drift
- [ ] Implementar alertas automáticos
- [ ] Dashboard de monitoramento

---

## 📊 MÉTRICAS DE SUCESSO

- 🎯 Accuracy de predições > 80%
- 🎯 AUC-ROC > 0.85
- 🎯 Latência de predição < 500ms
- 🎯 Model explainability score > 0.7
- 🎯 70% das recomendações aceitas por clínicos
- 🎯 Zero model drift não detectado

---

**Última Atualização:** 09 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 🟢 GUIA COMPLETO

