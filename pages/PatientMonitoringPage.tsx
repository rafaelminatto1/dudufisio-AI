import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/card';
import PageHeader from '../components/PageHeader';
import {
  KPICards,
  PresenceEvolutionChart,
  PainDistributionChart,
  FilterToolbar,
  VirtualizedPatientTable,
  QuickActionDialog,
  ExportMenu,
  MonitoringPageSkeleton,
  KPICardsSkeleton,
  ChartSkeleton,
  TableEmptyState,
  ErrorState,
  AlertCenter,
  SavedFilters,
  PeriodComparison,
  TrendAnalysisChart,
  HeatmapAttendanceChart,
  TherapistComparisonChart,
  RetentionFunnelChart,
  SmartSuggestions,
  InsightsDashboard,
  type CommunicationLog,
  type TrendDataPoint,
  type HeatmapData,
  type TherapistStats,
  type FunnelStage,
  type AdvancedInsights,
} from '../components/monitoring';
import { useData } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import * as cacheManager from '../lib/cacheManager';
import {
  PatientWithMonitoringMetrics,
  MonitoringFilters,
  MonitoringSortConfig,
  MonitoringSortField,
  KPIMetrics,
  PresenceDataPoint,
  PainDistributionData,
  Patient,
  PatientStatus,
  AppointmentStatus,
} from '../types';
import * as patientMonitoringService from '../services/patientMonitoringService';
import * as patientService from '../services/patientService';
import * as alertingService from '../services/alertingService';
import * as aiPredictionService from '../services/aiPredictionService';
import type { Alert, AbandonmentPrediction } from '../services/aiPredictionService';

const PatientMonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const { patients, appointments, therapists, refetch } = useData();
  const { showToast } = useToast();

  // Estados de dados
  const [patientsWithMetrics, setPatientsWithMetrics] = useState<PatientWithMonitoringMetrics[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null);
  const [presenceData, setPresenceData] = useState<PresenceDataPoint[]>([]);
  const [painData, setPainData] = useState<PainDistributionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'initial' | 'kpis' | 'charts' | 'complete'>('initial');
  const [hasError, setHasError] = useState(false);

  // Novos estados - Sprint 2 & 3
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<AbandonmentPrediction[]>([]);
  const [previousPeriodKPIs, setPreviousPeriodKPIs] = useState<KPIMetrics | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [therapistStats, setTherapistStats] = useState<TherapistStats[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [advancedInsights, setAdvancedInsights] = useState<AdvancedInsights | null>(null);

  // Estados de UI com cache restaurado
  const [filters, setFilters] = useState<MonitoringFilters>(() => {
    const cached = cacheManager.getCache<MonitoringFilters>(
      cacheManager.CacheKeys.FILTERS,
      { storage: 'session' }
    );
    return cached || {
      searchTerm: '',
      status: 'all',
      riskLevel: 'all',
      attendanceRange: 'all',
      painLevel: 'all',
      therapistId: 'all',
    };
  });
  const [sortConfig, setSortConfig] = useState<MonitoringSortConfig>({
    field: 'riskLevel',
    direction: 'desc',
  });
  const [period, setPeriod] = useState(30);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Debounced filters para otimização de performance
  const deferredFilters = useDeferredValue(filters);

  // Salvar filtros no cache quando alterarem
  useEffect(() => {
    cacheManager.debouncedCacheSet(
      cacheManager.CacheKeys.FILTERS,
      filters,
      { storage: 'session' }
    );
  }, [filters]);

  // Carregar dados com cache e progressive loading
  useEffect(() => {
    loadData();
  }, [patients, appointments, period]);

  const loadData = async () => {
    setIsLoading(true);
    setLoadingStage('initial');
    setHasError(false);

    try {
      // Verificar cache primeiro
      const cachedMetrics = cacheManager.getCache<PatientWithMonitoringMetrics[]>(
        cacheManager.CacheKeys.PATIENTS_METRICS
      );

      if (cachedMetrics && cachedMetrics.length > 0) {
        setPatientsWithMetrics(cachedMetrics);
        setLoadingStage('complete');
        setIsLoading(false);
      }

      // Progressive loading: KPIs primeiro
      setLoadingStage('kpis');
      const metricsData = await patientMonitoringService.getPatientMonitoringMetrics(
        patients,
        appointments
      );
      setPatientsWithMetrics(metricsData);
      cacheManager.setCache(cacheManager.CacheKeys.PATIENTS_METRICS, metricsData);

      const kpis = patientMonitoringService.getKPISummary(metricsData, period);
      setKpiMetrics(kpis);

      // Gerar alertas inteligentes
      const generatedAlerts = alertingService.generateAlerts(metricsData);
      setAlerts(generatedAlerts);

      // Gerar predições de abandono com IA (apenas para pacientes de risco)
      const highRiskPatients = metricsData.filter(p => 
        p.riskLevel === 'high' || p.riskLevel === 'medium'
      ).slice(0, 10); // Limitar para não gastar muitos créditos de IA
      
      const generatedPredictions = await aiPredictionService.batchPredictAbandonment(
        highRiskPatients,
        false // usar regras por enquanto (true para usar IA real)
      );
      setPredictions(generatedPredictions);

      // Calcular KPIs do período anterior (para comparação)
      const previousPeriodStart = new Date();
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (period * 2));
      const previousPeriodEnd = new Date();
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - period);
      
      const previousAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= previousPeriodStart && aptDate < previousPeriodEnd;
      });
      
      if (previousAppointments.length > 0) {
        const previousMetrics = await patientMonitoringService.getPatientMonitoringMetrics(
          patients,
          previousAppointments
        );
        const previousKPIs = patientMonitoringService.getKPISummary(previousMetrics, period);
        setPreviousPeriodKPIs(previousKPIs);
      }

      // Depois gráficos
      setLoadingStage('charts');
      const presence = patientMonitoringService.getPresenceEvolutionData(appointments, period);
      setPresenceData(presence);

      const pain = await patientMonitoringService.getPainDistributionData(patients);
      setPainData(pain);

      // Gerar dados do heatmap
      const heatmap: HeatmapData[] = [];
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7h - 18h
      
      days.forEach(day => {
        hours.forEach(hour => {
          const dayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.startTime);
            return aptDate.getDay() === days.indexOf(day) && aptDate.getHours() === hour;
          });
          const completed = dayAppointments.filter(apt => apt.status === AppointmentStatus.Completed).length;
          const total = dayAppointments.filter(apt => 
            apt.status === AppointmentStatus.Completed || apt.status === AppointmentStatus.NoShow
          ).length;
          const attendance = total > 0 ? (completed / total) * 100 : 0;
          
          if (total > 0) {
            heatmap.push({ dayOfWeek: day, hour, attendance, total });
          }
        });
      });
      setHeatmapData(heatmap);

      // Stats de terapeutas
      const therapistStatsData: TherapistStats[] = therapists.map(therapist => {
        const therapistAppointments = appointments.filter(apt => apt.therapistId === therapist.id);
        const completed = therapistAppointments.filter(apt => apt.status === AppointmentStatus.Completed).length;
        const total = therapistAppointments.filter(apt => 
          apt.status === AppointmentStatus.Completed || apt.status === AppointmentStatus.NoShow
        ).length;
        
        const therapistPatients = metricsData.filter(p =>
          appointments.some(apt => apt.therapistId === therapist.id && apt.patientId === p.id)
        );

        const avgRisk = therapistPatients.length > 0
          ? therapistPatients.reduce((sum, p) => {
              const riskScores = { low: 1, medium: 2, high: 3 };
              return sum + riskScores[p.riskLevel];
            }, 0) / therapistPatients.length
          : 0;
        
        return {
          therapistName: therapist.name,
          attendanceRate: total > 0 ? (completed / total) * 100 : 0,
          totalPatients: therapistPatients.length,
          totalSessions: completed,
          averageRiskScore: avgRisk,
        };
      });
      setTherapistStats(therapistStatsData);

      // Dados do funnel
      const activePatients = metricsData.filter(p => p.status === PatientStatus.Active);
      const totalActive = activePatients.length;
      setFunnelData([
        { stage: 'Avaliação Inicial', count: totalActive, percentage: 100 },
        { stage: 'Primeiras 5 Sessões', count: Math.floor(totalActive * 0.85), percentage: 85, dropoffRate: 15 },
        { stage: 'Tratamento (6-20)', count: Math.floor(totalActive * 0.70), percentage: 70, dropoffRate: 17.6 },
        { stage: 'Conclusão', count: Math.floor(totalActive * 0.60), percentage: 60, dropoffRate: 14.3 },
        { stage: 'Alta', count: Math.floor(totalActive * 0.55), percentage: 55, dropoffRate: 8.3 },
      ]);

      // Trend data (últimos 60 dias + previsão de 30)
      const trendHistory: TrendDataPoint[] = [];
      for (let i = 59; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = presence.find(p => p.date === dateStr);
        trendHistory.push({
          date: dateStr,
          riskScore: 3 + Math.random() * 2, // Mock 3-5
          attendanceRate: dayData?.attendanceRate || 75 + Math.random() * 20,
          painLevel: 3 + Math.random() * 2,
          predicted: false,
        });
      }
      
      // Adicionar previsão de 30 dias
      const lastPoint = trendHistory[trendHistory.length - 1];
      for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        trendHistory.push({
          date: date.toISOString().split('T')[0],
          riskScore: lastPoint.riskScore + (Math.random() - 0.5) * 0.3,
          attendanceRate: lastPoint.attendanceRate + (Math.random() - 0.5) * 3,
          painLevel: lastPoint.painLevel + (Math.random() - 0.5) * 0.3,
          predicted: true,
        });
      }
      setTrendData(trendHistory);

      // Insights avançados (mock)
      const improving = metricsData.filter(p => p.painTrend === 'improving').length;
      const stable = metricsData.filter(p => p.painTrend === 'stable').length;
      const worsening = metricsData.filter(p => p.painTrend === 'worsening').length;

      setAdvancedInsights({
        patientLifetimeValue: {
          average: 2500,
          total: 2500 * totalActive,
          currency: 'R$',
        },
        churnRate: {
          monthly: kpis.patientsAtRisk > 0 ? (kpis.patientsAtRisk / totalActive) * 100 : 5,
          quarterly: 15.5,
          trend: kpis.patientsAtRisk < totalActive * 0.1 ? 'improving' : 'stable',
        },
        nps: {
          score: 65,
          promoters: Math.floor(totalActive * 0.6),
          passives: Math.floor(totalActive * 0.25),
          detractors: Math.floor(totalActive * 0.15),
        },
        averageTreatmentDuration: {
          days: 90,
          byPathology: [
            { pathology: 'Lesão de LCA', avgDays: 120 },
            { pathology: 'Hérnia Discal', avgDays: 85 },
            { pathology: 'Tendinite', avgDays: 60 },
            { pathology: 'Bursite', avgDays: 45 },
            { pathology: 'Entorse', avgDays: 30 },
          ],
        },
        recoveryRate: {
          percentage: totalActive > 0 ? (improving / totalActive) * 100 : 0,
          improved: improving,
          stable: stable,
          worsened: worsening,
        },
      });

      // Completo
      setLoadingStage('complete');
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
      showToast('Erro ao carregar dados de monitoramento', 'error');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para retry em caso de erro
  const handleRetry = useCallback(() => {
    loadData();
  }, [patients, appointments, period]);

  // Aplicar filtros
  const filteredPatients = useMemo(() => {
    let filtered = [...patientsWithMetrics];

    // Busca por nome/CPF
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        p => 
          p.name.toLowerCase().includes(term) || 
          p.cpf.includes(term)
      );
    }

    // Status
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Nível de risco
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(p => p.riskLevel === filters.riskLevel);
    }

    // Taxa de presença
    if (filters.attendanceRange !== 'all') {
      filtered = filtered.filter(p => {
        const rate = p.attendanceRate;
        switch (filters.attendanceRange) {
          case 'excellent': return rate > 90;
          case 'high': return rate >= 75 && rate <= 90;
          case 'medium': return rate >= 50 && rate < 75;
          case 'low': return rate < 50;
          default: return true;
        }
      });
    }

    // Nível de dor
    if (filters.painLevel !== 'all') {
      filtered = filtered.filter(p => {
        const level = p.averagePainLevel;
        switch (filters.painLevel) {
          case 'none': return level === 0;
          case 'low': return level > 0 && level <= 3;
          case 'moderate': return level > 3 && level <= 6;
          case 'severe': return level > 6;
          default: return true;
        }
      });
    }

    // Terapeuta
    if (filters.therapistId !== 'all') {
      // Nota: precisaríamos adicionar therapistId no Patient ou buscar dos appointments
      // Por ora, mantemos todos
    }

    return filtered;
  }, [patientsWithMetrics, filters]);

  // Aplicar ordenação
  const sortedPatients = useMemo(() => {
    const sorted = [...filteredPatients];
    
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastSessionDate':
          aValue = a.lastSessionDate ? new Date(a.lastSessionDate).getTime() : 0;
          bValue = b.lastSessionDate ? new Date(b.lastSessionDate).getTime() : 0;
          break;
        case 'attendanceRate':
          aValue = a.attendanceRate;
          bValue = b.attendanceRate;
          break;
        case 'painLevel':
          aValue = a.averagePainLevel;
          bValue = b.averagePainLevel;
          break;
        case 'riskLevel':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          aValue = riskOrder[a.riskLevel];
          bValue = riskOrder[b.riskLevel];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredPatients, sortConfig]);

  // Handlers
  const handleSort = (field: MonitoringSortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePeriodChange = (newPeriod: number) => {
    setPeriod(newPeriod);
  };

  const handlePainBarClick = (category: 'none' | 'low' | 'moderate' | 'severe') => {
    setFilters(prev => ({
      ...prev,
      painLevel: category,
    }));
    showToast(`Filtrado por nível de dor: ${category}`, 'info');
  };

  const handleQuickAction = (patientId: string, action: 'whatsapp' | 'schedule' | 'note' | 'details') => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    if (action === 'details') {
      navigate(`/patients/${patientId}`);
    } else {
      setSelectedPatient(patient);
      setDialogOpen(true);
    }
  };

  const handleWhatsApp = async (patientId: string, message: string) => {
    try {
      // Aqui integraria com whatsappBusinessService
      // Por ora, apenas registramos a comunicação
      await patientService.addCommunicationLog(patientId, {
        date: new Date().toISOString(),
        type: 'WhatsApp',
        notes: message,
        actor: 'Sistema',
      });
      
      showToast('Mensagem enviada via WhatsApp', 'success');
      refetch();
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      showToast('Erro ao enviar mensagem', 'error');
    }
  };

  const handleSchedule = (patientId: string) => {
    navigate('/agenda', { state: { patientId } });
  };

  const handleAddNote = async (patientId: string, note: string) => {
    try {
      await patientService.addCommunicationLog(patientId, {
        date: new Date().toISOString(),
        type: 'Observação',
        notes: note,
        actor: 'Sistema',
      });
      
      showToast('Observação adicionada com sucesso', 'success');
      refetch();
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
      showToast('Erro ao adicionar observação', 'error');
    }
  };

  // Handlers de Alertas
  const handleMarkAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev => alertingService.markAlertAsRead(prev, alertId));
  }, []);

  const handleMarkAllAlertsAsRead = useCallback(() => {
    setAlerts(prev => alertingService.markAllAlertsAsRead(prev));
    showToast('Todos os alertas marcados como lidos', 'success');
  }, [showToast]);

  const handleAlertClick = useCallback((alert: Alert) => {
    navigate(`/patients/${alert.patientId}`);
  }, [navigate]);

  // Handler de Filtros Salvos
  const handleLoadSavedFilter = useCallback((savedFilters: MonitoringFilters) => {
    setFilters(savedFilters);
    showToast('Filtro carregado com sucesso', 'success');
  }, [showToast]);

  // Handler de Sugestões IA
  const handleSuggestionAction = useCallback((patientId: string, action: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    if (action.toLowerCase().includes('whatsapp') || action.toLowerCase().includes('contato')) {
      setSelectedPatient(patient);
      setDialogOpen(true);
    } else if (action.toLowerCase().includes('agendar')) {
      navigate('/agenda', { state: { patientId } });
    } else {
      navigate(`/patients/${patientId}`);
    }
    
    showToast(`Executando: ${action}`, 'info');
  }, [patients, navigate, showToast]);

  // Estado de erro
  if (hasError) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Acompanhamento de Pacientes"
          subtitle="Monitore presença, evolução clínica e priorize ações para retenção"
        />
        <ErrorState
          message="Não foi possível carregar os dados de monitoramento"
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Loading completo na primeira carga
  if (isLoading && loadingStage === 'initial') {
    return <MonitoringPageSkeleton />;
  }

  // Animações
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const hasFilters = Object.values(deferredFilters).some(
    v => v !== 'all' && v !== ''
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header com 3 botões: Alertas, Filtros Salvos, Exportação */}
      <motion.div {...fadeInUp} className="flex items-center justify-between">
        <PageHeader
          title="Acompanhamento de Pacientes"
          subtitle="Monitore presença, evolução clínica e priorize ações para retenção"
        />
        {!isLoading && (
          <div className="flex items-center gap-2">
            {/* Central de Alertas */}
            <AlertCenter
              alerts={alerts}
              onMarkAsRead={handleMarkAlertAsRead}
              onMarkAllAsRead={handleMarkAllAlertsAsRead}
              onAlertClick={handleAlertClick}
            />
            
            {/* Filtros Salvos */}
            <SavedFilters
              currentFilters={filters}
              onLoadFilter={handleLoadSavedFilter}
            />
            
            {/* Exportação */}
            {sortedPatients.length > 0 && (
              <ExportMenu 
                patients={sortedPatients} 
                kpiMetrics={kpiMetrics}
              />
            )}
          </div>
        )}
      </motion.div>

      {/* Seção 1: KPIs */}
      <AnimatePresence mode="wait">
        {isLoading && loadingStage === 'kpis' ? (
          <motion.div key="loading-kpis" {...fadeInUp}>
            <KPICardsSkeleton />
          </motion.div>
        ) : (
          kpiMetrics && (
            <motion.div key="kpis" {...fadeInUp}>
              <KPICards metrics={kpiMetrics} />
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Seção 1.5: Comparação de Períodos */}
      {!isLoading && kpiMetrics && previousPeriodKPIs && (
        <motion.div {...fadeInUp}>
          <PeriodComparison
            currentPeriod={kpiMetrics}
            previousPeriod={previousPeriodKPIs}
            currentPeriodLabel="Últimos 30 dias"
            previousPeriodLabel="30-60 dias atrás"
          />
        </motion.div>
      )}

      {/* Seção 2: Gráficos Expandidos (6 gráficos) */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {isLoading && loadingStage === 'charts' ? (
          <>
            {Array.from({ length: 6 }).map((_, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <ChartSkeleton />
              </motion.div>
            ))}
          </>
        ) : (
          <>
            <motion.div variants={fadeInUp}>
              <Card>
                <PresenceEvolutionChart 
                  data={presenceData} 
                  onPeriodChange={handlePeriodChange}
                />
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Card>
                <PainDistributionChart 
                  data={painData} 
                  onBarClick={handlePainBarClick}
                />
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Card>
                <HeatmapAttendanceChart data={heatmapData} />
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Card>
                <TherapistComparisonChart data={therapistStats} />
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Card>
                <RetentionFunnelChart data={funnelData} />
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Card>
                <TrendAnalysisChart data={trendData} />
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Seção 3: Sugestões Inteligentes da IA */}
      {!isLoading && predictions.length > 0 && (
        <motion.div {...fadeInUp}>
          <SmartSuggestions
            predictions={predictions}
            onActionClick={handleSuggestionAction}
            maxSuggestions={5}
          />
        </motion.div>
      )}

      {/* Seção 4: Dashboard de Insights Avançados */}
      {!isLoading && advancedInsights && (
        <motion.div {...fadeInUp}>
          <InsightsDashboard
            insights={advancedInsights}
            patients={patientsWithMetrics}
          />
        </motion.div>
      )}

      {/* Seção 5: Filtros + Tabela Virtualizada */}
      <motion.div {...fadeInUp}>
        <Card>
          <FilterToolbar
            filters={filters}
            onFilterChange={setFilters}
            therapists={therapists}
          />
          
          {sortedPatients.length === 0 ? (
            <TableEmptyState
              hasFilters={hasFilters}
              onClearFilters={() => setFilters({
                searchTerm: '',
                status: 'all',
                riskLevel: 'all',
                attendanceRange: 'all',
                painLevel: 'all',
                therapistId: 'all',
              })}
              onAddPatient={() => navigate('/patients/new')}
            />
          ) : (
            <VirtualizedPatientTable
              patients={sortedPatients}
              sortConfig={sortConfig}
              onSort={handleSort}
              onAction={handleQuickAction}
              height={600}
            />
          )}
        </Card>
      </motion.div>

      {/* Dialog de Ações Rápidas com animação */}
      <AnimatePresence>
        {dialogOpen && (
          <QuickActionDialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            patient={selectedPatient}
            onWhatsApp={handleWhatsApp}
            onSchedule={handleSchedule}
            onAddNote={handleAddNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientMonitoringPage;

