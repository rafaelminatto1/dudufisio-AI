# 🎯 GUIA COMPLETO - INTEGRAÇÃO FRONTEND COM SUPABASE

**Data:** 08/10/2025  
**Status:** ✅ PRONTO PARA IMPLEMENTAR

---

## 📋 Resumo do Progresso

### ✅ Concluído

1. **Migrations Aplicadas** (29 tabelas)
   - Sistema de Estratificação de Risco (9 tabelas)
   - Sistema de Reabilitação Esportiva (20 tabelas)

2. **Serviços Criados** (2 serviços completos)
   - `riskStratificationServiceSupabase` (12 métodos)
   - `sportsRehabServiceSupabase` (15 métodos)

3. **Recursos Implementados**
   - CRUD completo
   - Type safety
   - Error handling
   - Data mapping automático

### 🎯 Próximo: Integração Frontend

---

## 🚀 PASSO A PASSO DE INTEGRAÇÃO

### 1. Atualizar Página de Estratificação de Risco

**Arquivo:** `pages/RiskStratificationPage.tsx`

```typescript
// ANTES (Mock)
import { riskStratificationService } from '../services/clinical/riskStratificationService';

// DEPOIS (Supabase)
import { riskStratificationServiceSupabase as riskService } from '../services/clinical/riskStratificationServiceSupabase';

export default function RiskStratificationPage() {
  const { patientId } = useParams();
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar assessments do paciente
      const patientAssessments = await riskService.getPatientAssessments(patientId);
      setAssessments(patientAssessments);
      
      // Buscar perfil de risco
      const riskProfile = await riskService.getPatientRiskProfile(patientId);
      setProfile(riskProfile);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de risco');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssessment = async (assessment: Omit<RiskAssessment, 'id'>) => {
    try {
      await riskService.saveRiskAssessment(assessment);
      toast.success('Avaliação salva com sucesso!');
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar avaliação');
    }
  };

  // ... resto do componente
}
```

---

### 2. Atualizar Dashboard de Risco

**Arquivo:** `components/clinical/RiskAssessmentDashboard.tsx`

```typescript
import { riskStratificationServiceSupabase as riskService } from '../../services/clinical/riskStratificationServiceSupabase';

export default function RiskAssessmentDashboard() {
  const [highRiskPatients, setHighRiskPatients] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState<RiskAlert[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Buscar pacientes de alto risco
      const patients = await riskService.getHighRiskPatients();
      setHighRiskPatients(patients);
      
      // Buscar alertas ativos
      const alerts = await riskService.getActiveAlerts();
      setActiveAlerts(alerts);
      
      // Buscar estatísticas
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
      const endDate = new Date();
      const stats = await riskService.getRiskStatistics(startDate, endDate);
      setStatistics(stats);
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await riskService.acknowledgeAlert(alertId, 'current-user-id');
      toast.success('Alerta reconhecido');
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao reconhecer alerta:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await riskService.resolveAlert(alertId, 'current-user-id');
      toast.success('Alerta resolvido');
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
    }
  };

  // ... resto do componente
}
```

---

### 3. Atualizar Página de Reabilitação Esportiva

**Arquivo:** `pages/SportsRehabilitationPage.tsx` (criar se não existir)

```typescript
import { sportsRehabServiceSupabase as sportsService } from '../services/sports/sportsRehabServiceSupabase';

export default function SportsRehabilitationPage() {
  const { patientId } = useParams();
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);
  const [rtsCriteria, setRtsCriteria] = useState<ReturnToSportCriteria[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAthleteData();
  }, [patientId]);

  const loadAthleteData = async () => {
    try {
      setLoading(true);
      
      // Buscar perfil do atleta
      const profile = await sportsService.getAthleteProfile(patientId);
      setAthleteProfile(profile);
      
      if (profile) {
        // Buscar critérios RTS
        const criteria = await sportsService.getReturnToSportCriteria(profile.id);
        setRtsCriteria(criteria);
        
        // Buscar métricas
        const performanceMetrics = await sportsService.getPerformanceMetrics(profile.id);
        setMetrics(performanceMetrics);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do atleta:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (profile: Omit<AthleteProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const saved = await sportsService.upsertAthleteProfile(profile);
      setAthleteProfile(saved);
      toast.success('Perfil salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    }
  };

  const handleSaveMetric = async (metric: Omit<PerformanceMetric, 'id' | 'createdAt'>) => {
    try {
      await sportsService.savePerformanceMetric(metric);
      toast.success('Métrica salva!');
      loadAthleteData();
    } catch (error) {
      console.error('Erro ao salvar métrica:', error);
      toast.error('Erro ao salvar métrica');
    }
  };

  // ... resto do componente
}
```

---

### 4. Adicionar ao Router

**Arquivo:** `AppRoutes.tsx` ou `pages/CompleteDashboard.tsx`

```typescript
import { lazy } from 'react';

const SportsRehabilitationPage = lazy(() => import('./SportsRehabilitationPage'));

// ... no Routes:
<Route path="/sports-rehab/:patientId" element={<SportsRehabilitationPage />} />
```

---

## 💡 EXEMPLOS PRÁTICOS

### Exemplo 1: Criar Avaliação de Risco Completa

```typescript
import { riskStratificationServiceSupabase as riskService } from '@/services/clinical/riskStratificationServiceSupabase';
import { RiskType, RiskLevel } from '@/types/riskTypes';

async function createCompleteRiskAssessment(patientId: string, patientName: string) {
  // Criar assessment
  const assessment = await riskService.saveRiskAssessment({
    patientId,
    patientName,
    riskType: RiskType.Fall,
    riskLevel: RiskLevel.High,
    score: 75,
    confidence: 0.85,
    assessedAt: new Date(),
    assessedBy: 'Dr. Silva',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    factors: [
      {
        name: 'Idade Avançada',
        category: 'demographic',
        value: 75,
        weight: 0.2,
        contribution: 15,
        isModifiable: false,
      },
      {
        name: 'Histórico de Quedas',
        category: 'clinical',
        value: true,
        weight: 0.25,
        contribution: 25,
        isModifiable: false,
      }
    ],
    recommendations: [
      {
        priority: 'high',
        action: 'Implementar programa de treino de equilíbrio',
        rationale: 'Reduz risco de quedas em 24%',
        targetFactors: ['balance-deficit'],
        estimatedImpact: 25,
        category: 'intervention',
        completed: false,
      }
    ],
  });

  // Criar alerta se high/critical
  if (assessment.riskLevel === RiskLevel.High || assessment.riskLevel === RiskLevel.Critical) {
    await riskService.createRiskAlert({
      patientId,
      patientName,
      assessmentId: assessment.id,
      riskType: assessment.riskType,
      riskLevel: assessment.riskLevel,
      score: assessment.score,
      triggeredAt: new Date(),
      acknowledged: false,
      resolved: false,
    });
  }

  // Atualizar perfil
  await riskService.upsertRiskProfile({
    patientId,
    overallRiskLevel: RiskLevel.High,
    highestRisks: [RiskType.Fall],
    lastAssessmentDate: new Date(),
    nextAssessmentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  console.log('Avaliação completa criada!', assessment);
}
```

### Exemplo 2: Criar Perfil de Atleta e Sessão

```typescript
import { sportsRehabServiceSupabase as sportsService } from '@/services/sports/sportsRehabServiceSupabase';

async function createAthleteAndSession(patientId: string) {
  // Criar perfil
  const profile = await sportsService.upsertAthleteProfile({
    patientId,
    sportType: 'soccer',
    position: 'Forward',
    competitionLevel: 'professional',
    yearsPracticing: 10,
    hoursPerWeek: 25,
    competitionFrequency: 'Weekly',
    dominantSide: 'right',
    currentPhase: 'phase3_advanced',
    targetReturnDate: new Date('2025-12-01'),
  });

  // Criar sessão de treinamento
  const session = await sportsService.saveTrainingSession({
    athleteId: profile.id,
    sessionDate: new Date(),
    sessionType: 'strength',
    phase: 'phase3_advanced',
    duration: 90, // minutos
    heartRateAvg: 145,
    heartRateMax: 175,
    perceivedExertion: 7,
    fatigueLevel: 6,
    painLevel: 2,
    performanceRating: 8,
    objectives: ['Força de membros inferiores', 'Estabilidade de core'],
    objectivesAchieved: true,
    notes: 'Ótima sessão, paciente respondeu bem ao aumento de carga',
    conductedBy: 'Dr. Silva',
  });

  // Salvar métrica de desempenho
  await sportsService.savePerformanceMetric({
    athleteId: profile.id,
    metricType: 'strength',
    metricName: 'Leg Press 1RM',
    value: 180,
    unit: 'kg',
    metricDate: new Date(),
    comparedToBaseline: 125, // +44%
    trend: 'improving',
    notes: 'Excelente progressão',
  });

  console.log('Perfil e sessão criados!', { profile, session });
}
```

### Exemplo 3: Dashboard com Real-time Updates (Opcional)

```typescript
import { subscribeToTable } from '@/lib/supabase';

function RiskDashboard() {
  useEffect(() => {
    // Subscrever a novos alertas
    const subscription = subscribeToTable(
      'risk_alerts',
      (payload) => {
        console.log('Novo alerta!', payload);
        toast.info(`Novo alerta de risco: ${payload.new.patient_name}`);
        // Recarregar dados
        loadData();
      },
      { column: 'resolved', value: 'false' }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ... resto do componente
}
```

---

## 📊 CHECKLIST DE INTEGRAÇÃO

### Risk Stratification
- [ ] Atualizar `RiskStratificationPage.tsx`
- [ ] Atualizar `RiskAssessmentDashboard.tsx`
- [ ] Atualizar `RiskDetailModal.tsx`
- [ ] Testar salvamento de assessment
- [ ] Testar busca de pacientes de alto risco
- [ ] Testar alertas (criar, acknowledge, resolve)
- [ ] Testar estatísticas

### Sports Rehabilitation
- [ ] Criar `SportsRehabilitationPage.tsx`
- [ ] Criar componentes de perfil de atleta
- [ ] Criar componentes de testes funcionais
- [ ] Criar componentes de métricas
- [ ] Adicionar rota no router
- [ ] Testar salvamento de perfil
- [ ] Testar sessões de treinamento
- [ ] Testar monitoramento de carga

### Geral
- [ ] Adicionar toast notifications
- [ ] Adicionar loading states
- [ ] Adicionar error boundaries
- [ ] Testar em desenvolvimento
- [ ] Testar com dados reais
- [ ] Documentar componentes

---

## 🎊 RESULTADO ESPERADO

Após a integração, você terá:

✅ **Dados Persistentes** - Todos os dados salvos no Supabase  
✅ **CRUD Completo** - Criar, ler, atualizar, deletar  
✅ **Real-time** (opcional) - Updates automáticos  
✅ **Type Safety** - TypeScript end-to-end  
✅ **Performance** - Queries otimizadas com índices  
✅ **Escalabilidade** - Pronto para produção  

---

## 🆘 TROUBLESHOOTING

### Erro: "Tabela não encontrada"
```typescript
// Verificar se migrations foram aplicadas
// Ver: ✅_MIGRATIONS_APLICADAS_SUCESSO.md
```

### Erro: "Permission denied"
```typescript
// Verificar RLS policies no Supabase Dashboard
// Tabelas > risk_assessments > Policies
```

### Erro: "Invalid date format"
```typescript
// Sempre usar .toISOString() para datas
const date = new Date();
assessment_date: date.toISOString()
```

---

## 📚 PRÓXIMOS PASSOS

1. **Implementar integração** (este guia)
2. **Adicionar testes** (Jest + React Testing Library)
3. **Otimizar queries** (React Query para cache)
4. **Adicionar real-time** (subscriptions)
5. **Deploy para produção**

---

**Tudo está pronto! Basta seguir este guia e integrar com o frontend!** 🚀

---

**Desenvolvido com 💙 por Claude**

