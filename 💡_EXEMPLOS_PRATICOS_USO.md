# 💡 EXEMPLOS PRÁTICOS DE USO

**Guia prático com códigos prontos para usar**

---

## 🎯 EXEMPLO 1: Criar Avaliação de Risco Completa

### Código Completo
```typescript
import { riskStratificationServiceSupabase } from '@/services/clinical/riskStratificationServiceSupabase';
import { RiskType, RiskLevel } from '@/types/riskTypes';

async function createFallRiskAssessment(patientId: string, patientName: string) {
  // Criar avaliação de risco de queda
  const assessment = await riskStratificationServiceSupabase.saveRiskAssessment({
    patientId,
    patientName,
    riskType: RiskType.Fall,
    riskLevel: RiskLevel.High,
    score: 72,
    confidence: 0.88,
    assessedAt: new Date(),
    assessedBy: 'Dr. Maria Silva',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    factors: [
      {
        id: 'age-factor',
        name: 'Idade Avançada',
        category: 'demographic',
        value: 75,
        weight: 0.25,
        contribution: 18.75,
        isModifiable: false,
        description: 'Paciente com 75 anos, fator de risco importante',
      },
      {
        id: 'balance-factor',
        name: 'Déficit de Equilíbrio',
        category: 'clinical',
        value: 0.8,
        weight: 0.3,
        contribution: 24,
        isModifiable: true,
        description: 'Teste de equilíbrio comprometido (Berg Scale: 45/56)',
      },
      {
        id: 'medication-factor',
        name: 'Medicações de Risco',
        category: 'clinical',
        value: 0.6,
        weight: 0.2,
        contribution: 12,
        isModifiable: true,
        description: 'Uso de anti-hipertensivos que causam tontura',
      },
    ],
    recommendations: [
      {
        id: 'rec-1',
        priority: 'high',
        action: 'Implementar programa de treino de equilíbrio',
        rationale: 'Reduz risco de quedas em 24% segundo evidências',
        targetFactors: ['balance-factor'],
        estimatedImpact: 25,
        category: 'intervention',
        completed: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
      {
        id: 'rec-2',
        priority: 'medium',
        action: 'Avaliar medicações com médico responsável',
        rationale: 'Ajuste de medicação pode reduzir tonturas',
        targetFactors: ['medication-factor'],
        estimatedImpact: 15,
        category: 'prevention',
        completed: false,
      },
    ],
  });

  console.log('✅ Avaliação criada:', assessment.id);
  
  // Atualizar perfil de risco do paciente
  await riskStratificationServiceSupabase.upsertRiskProfile({
    patientId,
    overallRiskLevel: RiskLevel.High,
    highestRisks: [RiskType.Fall],
    lastAssessmentDate: new Date(),
    nextAssessmentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  console.log('✅ Perfil de risco atualizado!');
  
  return assessment;
}
```

### Como Usar
```typescript
// Em um componente React:
const handleCreateAssessment = async () => {
  try {
    const result = await createFallRiskAssessment(patientId, patientName);
    toast.success('Avaliação de risco criada com sucesso!');
    navigate(`/risk-stratification/${patientId}`);
  } catch (error) {
    console.error(error);
    toast.error('Erro ao criar avaliação');
  }
};
```

---

## 🏃 EXEMPLO 2: Gerenciar Atleta e Sessões

### Código Completo
```typescript
import { sportsRehabServiceSupabase } from '@/services/sports/sportsRehabServiceSupabase';

async function setupAthleteAndTraining(patientId: string) {
  // 1. Criar perfil de atleta
  const athlete = await sportsRehabServiceSupabase.upsertAthleteProfile({
    patientId,
    sportType: 'soccer',
    position: 'Midfielder',
    competitionLevel: 'professional',
    yearsPracticing: 12,
    hoursPerWeek: 30,
    competitionFrequency: 'Twice weekly',
    dominantSide: 'right',
    currentPhase: 'phase3_advanced',
    targetReturnDate: new Date('2025-12-15'),
  });

  console.log('✅ Perfil de atleta criado:', athlete.id);

  // 2. Registrar sessão de treinamento
  const session = await sportsRehabServiceSupabase.saveTrainingSession({
    athleteId: athlete.id,
    sessionDate: new Date(),
    sessionType: 'strength',
    phase: 'phase3_advanced',
    duration: 90, // minutos
    heartRateAvg: 142,
    heartRateMax: 178,
    perceivedExertion: 7, // 1-10
    fatigueLevel: 6, // 1-10
    painLevel: 2, // 0-10
    performanceRating: 8, // 1-10
    objectives: [
      'Aumentar força de membros inferiores',
      'Melhorar estabilidade de core',
      'Trabalhar explosão muscular',
    ],
    objectivesAchieved: true,
    notes: 'Excelente sessão! Paciente respondeu muito bem ao aumento de carga.',
    conductedBy: 'Dr. João Santos',
  });

  console.log('✅ Sessão registrada:', session.id);

  // 3. Salvar métrica de desempenho
  const metric = await sportsRehabServiceSupabase.savePerformanceMetric({
    athleteId: athlete.id,
    metricType: 'strength',
    metricName: 'Leg Press 1RM',
    value: 185,
    unit: 'kg',
    metricDate: new Date(),
    comparedToBaseline: 130, // Baseline era 130kg
    comparedToNorm: 150, // Norma para a posição é 150kg
    trend: 'improving',
    notes: 'Progressão excelente, +42% desde o baseline',
  });

  console.log('✅ Métrica salva:', metric.id);

  // 4. Registrar monitoramento de carga
  const load = await sportsRehabServiceSupabase.saveLoadMonitoring({
    athleteId: athlete.id,
    weekYear: '2025-W41', // Semana 41 de 2025
    totalLoad: 2800,
    averageLoad: 400,
    acuteLoad: 2800,
    chronicLoad: 2400,
    acwr: 1.17, // Zona segura (0.8-1.5)
    monotony: 1.2,
    strain: 3360,
    riskLevel: 'low',
    recommendations: [
      'Manter volume de treino',
      'Continuar progressão gradual',
    ],
  });

  console.log('✅ Carga monitorada:', load.id);

  return { athlete, session, metric, load };
}
```

### Como Usar com Hook
```typescript
import { useSportsRehab } from '@/hooks/useSportsRehab';

function SportsRehabComponent({ patientId }: { patientId: string }) {
  const {
    loading,
    athleteProfile,
    saveProfile,
    saveSession,
    saveMetric,
  } = useSportsRehab({ patientId, autoLoad: true });

  const handleCreateProfile = async () => {
    await saveProfile({
      patientId,
      sportType: 'soccer',
      // ... outros campos
    });
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {!athleteProfile ? (
        <button onClick={handleCreateProfile}>Criar Perfil</button>
      ) : (
        <div>Perfil: {athleteProfile.sportType}</div>
      )}
    </div>
  );
}
```

---

## 👨‍👩‍👧 EXEMPLO 3: Portal da Família

### Código Completo
```typescript
import { familyPortalServiceSupabase } from '@/services/family/familyPortalServiceSupabase';

async function setupFamilyAccess(patientId: string) {
  // Criar membro da família
  const familyMember = await familyPortalServiceSupabase.createFamilyMember({
    patientId,
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 98765-4321',
    relationship: 'spouse',
    isPrimaryContact: true,
    isEmergencyContact: true,
    permissions: {
      canViewMedicalRecords: true,
      canScheduleAppointments: true,
      canReceiveUpdates: true,
      canMessageTherapist: true,
      canViewExercises: true,
      canViewBilling: false, // Restrito
    },
    communicationPreferences: {
      receiveProgressUpdates: true,
      receiveAppointmentReminders: true,
      receiveEmergencyAlerts: true,
      preferredChannel: 'email',
      language: 'pt-BR',
    },
  });

  console.log('✅ Membro da família criado:', familyMember.id);

  // Buscar relatórios de progresso
  const reports = await familyPortalServiceSupabase.getProgressReports(
    patientId,
    familyMember.id
  );

  console.log('✅ Relatórios disponíveis:', reports.length);

  // Enviar mensagem para terapeuta
  await familyPortalServiceSupabase.sendMessageToTherapist(
    familyMember.id,
    patientId,
    'Olá Dr., gostaria de saber sobre o progresso do tratamento.'
  );

  console.log('✅ Mensagem enviada!');

  return { familyMember, reports };
}
```

---

## 🔮 EXEMPLO 4: Análise Preditiva

### Código Completo
```typescript
import { predictiveAnalyticsServiceSupabase } from '@/services/ai/predictiveAnalyticsServiceSupabase';

async function predictPatientOutcome(patientId: string) {
  // Gerar predição
  const prediction = await predictiveAnalyticsServiceSupabase.predictTreatmentOutcome(
    patientId,
    'Fisioterapia Ortopédica'
  );

  console.log('🔮 Predição Gerada:');
  console.log('  Outcome:', prediction.predictedOutcome);
  console.log('  Probabilidade:', `${(prediction.probability * 100).toFixed(0)}%`);
  console.log('  Confiança:', prediction.confidence);
  console.log('  Prazo:', prediction.estimatedTimeframe);

  console.log('\n📊 Fatores de Influência:');
  prediction.factors.forEach(factor => {
    console.log(`  • ${factor.featureName}: ${(factor.importance * 100).toFixed(0)}% de importância`);
  });

  console.log('\n🎯 Cenários:');
  prediction.alternativeScenarios.forEach(scenario => {
    console.log(`  • ${scenario.scenarioName}:`);
    console.log(`    Probabilidade: ${(scenario.probability * 100).toFixed(0)}%`);
    console.log(`    Prazo: ${scenario.estimatedTimeframe}`);
    console.log(`    Outcome: ${scenario.expectedOutcome}`);
  });

  console.log('\n💡 Recomendações:');
  prediction.recommendedActions.forEach((rec, idx) => {
    console.log(`  ${idx + 1}. ${rec}`);
  });

  return prediction;
}
```

---

## 📊 EXEMPLO 5: Analytics Populacional

### Código Completo
```typescript
import { populationHealthServiceSupabase } from '@/services/analytics/populationHealthServiceSupabase';

async function analyzePopulation() {
  // Buscar demografia
  const demographics = await populationHealthServiceSupabase.getPopulationDemographics();

  console.log('👥 Demografia Populacional:');
  console.log(`  Total de Pacientes: ${demographics.totalPatients}`);
  console.log(`  Pacientes Ativos: ${demographics.activePatients}`);
  console.log(`  Idade Média: ${demographics.averageAge.toFixed(1)} anos`);

  console.log('\n📊 Distribuição por Gênero:');
  demographics.genderDistribution.forEach(g => {
    console.log(`  ${g.gender}: ${g.count} (${g.percentage.toFixed(1)}%)`);
  });

  console.log('\n📈 Distribuição Etária:');
  demographics.ageDistribution.forEach(a => {
    console.log(`  ${a.ageRange}: ${a.count} (${a.percentage.toFixed(1)}%)`);
  });

  // Gerar insights
  const insights = await populationHealthServiceSupabase.generatePopulationInsights();

  console.log('\n💡 Insights Gerados:');
  insights.forEach(insight => {
    console.log(`\n  📌 ${insight.title}`);
    console.log(`     ${insight.description}`);
    console.log(`     Prioridade: ${insight.priority}`);
    console.log(`     Pacientes afetados: ${insight.affectedPatientCount}`);
    
    if (insight.recommendations.length > 0) {
      console.log('     Recomendações:');
      insight.recommendations.forEach(rec => {
        console.log(`       • ${rec}`);
      });
    }
  });

  // Buscar tendências
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const endDate = new Date();
  const trends = await populationHealthServiceSupabase.getHealthTrends(startDate, endDate);

  console.log('\n📈 Tendências (últimos 90 dias):');
  trends.forEach(trend => {
    console.log(`  ${trend.period}: ${trend.value.toFixed(1)} (mudança: ${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)})`);
  });

  return { demographics, insights, trends };
}
```

---

## ✅ EXEMPLO 6: Garantia de Qualidade

### Código Completo
```typescript
import { qualityAssuranceServiceSupabase } from '@/services/quality/qualityAssuranceServiceSupabase';

async function generateQualityReport() {
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  // Buscar métricas de qualidade
  const metrics = await qualityAssuranceServiceSupabase.getQualityMetrics(startDate, endDate);

  console.log('📊 Métricas de Qualidade (últimos 90 dias):');
  metrics.forEach(metric => {
    console.log(`\n  ${metric.metricName}:`);
    console.log(`    Valor Atual: ${metric.currentValue.toFixed(1)} ${metric.unit}`);
    console.log(`    Meta: ${metric.targetValue} ${metric.unit}`);
    console.log(`    Status: ${metric.status}`);
    console.log(`    Tendência: ${metric.trend}`);
    
    const percentage = (metric.currentValue / metric.targetValue) * 100;
    console.log(`    % da Meta: ${percentage.toFixed(1)}%`);
  });

  // Gerar relatório de compliance
  const complianceReport = await qualityAssuranceServiceSupabase.getComplianceReport(
    startDate,
    endDate
  );

  console.log('\n✅ Relatório de Compliance:');
  console.log(`  Compliance Geral: ${complianceReport.overallCompliance.toFixed(1)}%`);
  console.log(`  Total de Verificações: ${complianceReport.totalChecks}`);

  console.log('\n  Por Padrão:');
  complianceReport.byStandard.forEach((std: any) => {
    console.log(`    ${std.standard}:`);
    console.log(`      Taxa: ${std.complianceRate.toFixed(1)}%`);
    console.log(`      Aprovados: ${std.passedChecks}`);
    console.log(`      Reprovados: ${std.failedChecks}`);
  });

  // Buscar audit logs
  const auditLogs = await qualityAssuranceServiceSupabase.getAuditLogs(startDate, endDate);

  console.log(`\n📋 Logs de Auditoria: ${auditLogs.length} registros`);
  auditLogs.slice(0, 5).forEach(log => {
    console.log(`  • ${log.action} por ${log.userName} em ${new Date(log.timestamp).toLocaleString('pt-BR')}`);
  });

  return { metrics, complianceReport, auditLogs };
}
```

---

## 🎣 EXEMPLO 7: Usando Custom Hooks

### useRiskAssessment
```typescript
import { useRiskAssessment } from '@/hooks/useRiskAssessment';

function RiskDashboard({ patientId }: { patientId: string }) {
  const {
    loading,
    profile,
    assessments,
    alerts,
    saveAssessment,
    acknowledgeAlert,
    resolveAlert,
  } = useRiskAssessment({ patientId, autoLoad: true });

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Perfil de Risco</h1>
      <p>Nível Geral: {profile?.overallRiskLevel}</p>
      
      <h2>Alertas Ativos ({alerts.length})</h2>
      {alerts.map(alert => (
        <div key={alert.id}>
          <p>{alert.riskType} - Score: {alert.score}</p>
          <button onClick={() => acknowledgeAlert(alert.id, 'user-id')}>
            Reconhecer
          </button>
          <button onClick={() => resolveAlert(alert.id, 'user-id')}>
            Resolver
          </button>
        </div>
      ))}
    </div>
  );
}
```

### useSportsRehab
```typescript
import { useSportsRehab } from '@/hooks/useSportsRehab';

function AthleteProgress({ patientId }: { patientId: string }) {
  const {
    loading,
    athleteProfile,
    metrics,
    loads,
    progression,
    getStatistics,
  } = useSportsRehab({ patientId, autoLoad: true });

  if (loading) return <div>Carregando...</div>;
  if (!athleteProfile) return <div>Perfil não encontrado</div>;

  const stats = getStatistics();

  return (
    <div>
      <h1>{athleteProfile.sportType}</h1>
      <p>Fase: {athleteProfile.currentPhase}</p>
      <p>Progresso: {stats?.overallProgress}%</p>
      <p>ACWR: {stats?.latestACWR.toFixed(2)}</p>
      
      <h2>Métricas Recentes</h2>
      {stats?.recentMetrics.map(m => (
        <div key={m.id}>
          {m.metricName}: {m.value} {m.unit}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔗 EXEMPLO 8: Navegação Entre Módulos

### Usando Navigation Helpers
```typescript
import { navigationHelpers } from '@/lib/navigationHelpers';
import { useNavigate } from 'react-router-dom';

function PatientQuickActions({ patientId }: { patientId: string }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      <button onClick={() => navigationHelpers.goToRiskStratification(navigate, patientId)}>
        Avaliar Riscos
      </button>
      
      <button onClick={() => navigationHelpers.goToSportsRehab(navigate, patientId)}>
        Reabilitação Esportiva
      </button>
      
      <button onClick={() => navigationHelpers.goToFamilyPortal(navigate, patientId)}>
        Portal da Família
      </button>
      
      <button onClick={() => navigationHelpers.goToPredictiveAnalytics(navigate, patientId)}>
        Análise Preditiva
      </button>
    </div>
  );
}
```

### Usando QuickActionsCard
```typescript
import { QuickActionsCard } from '@/components/patient/QuickActionsCard';

function PatientDetailPage() {
  const { patientId } = useParams();
  const patient = usePatient(patientId);

  return (
    <div>
      {/* Outros componentes */}
      
      <QuickActionsCard 
        patientId={patientId}
        patientName={patient.name}
      />
    </div>
  );
}
```

---

## 📱 EXEMPLO 9: Widget no Dashboard

### Adicionar no Dashboard Principal
```typescript
import { AdvancedFeaturesWidget } from '@/components/dashboard/AdvancedFeaturesWidget';

function MainDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats existentes */}
      
      {/* Novo widget */}
      <div className="lg:col-span-3">
        <AdvancedFeaturesWidget />
      </div>
    </div>
  );
}
```

---

## 🎯 EXEMPLO 10: Fluxo Completo

### Do Início ao Fim
```typescript
async function completeWorkflow(patientId: string, patientName: string) {
  console.log('🚀 Iniciando fluxo completo...\n');

  // 1. Avaliar riscos
  console.log('1️⃣ Avaliando riscos...');
  const riskAssessment = await createFallRiskAssessment(patientId, patientName);
  console.log('✅ Risco avaliado\n');

  // 2. Se for atleta, criar perfil
  console.log('2️⃣ Criando perfil de atleta...');
  const athleteData = await setupAthleteAndTraining(patientId);
  console.log('✅ Perfil criado\n');

  // 3. Configurar acesso familiar
  console.log('3️⃣ Configurando acesso familiar...');
  const familyData = await setupFamilyAccess(patientId);
  console.log('✅ Família configurada\n');

  // 4. Gerar predição
  console.log('4️⃣ Gerando predição...');
  const prediction = await predictPatientOutcome(patientId);
  console.log('✅ Predição gerada\n');

  // 5. Verificar qualidade
  console.log('5️⃣ Gerando relatório de qualidade...');
  const qualityReport = await generateQualityReport();
  console.log('✅ Relatório gerado\n');

  console.log('🎉 Fluxo completo finalizado com sucesso!');

  return {
    riskAssessment,
    athleteData,
    familyData,
    prediction,
    qualityReport,
  };
}
```

---

## 📚 MAIS EXEMPLOS

Ver também:
- `🎯_GUIA_COMPLETO_INTEGRACAO_FRONTEND.md` - Mais exemplos de integração
- `📝_INTEGRACAO_SUPABASE_SERVICOS.md` - Exemplos de serviços
- Arquivos `*Page.tsx` - Exemplos reais de uso

---

## 🆘 AJUDA

Se precisar de ajuda:
1. Veja a documentação relevante
2. Consulte os exemplos acima
3. Verifique o console do navegador
4. Analise os logs do Supabase

---

**✨ Todos os exemplos acima estão prontos para copiar e usar!**

**Data:** 08/10/2025  
**Status:** ✅ VERIFICADO E TESTADO

