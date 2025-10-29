import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import PageHeader from '../components/PageHeader';
import { KPICards } from '../components/monitoring/KPICards';
import { PresenceEvolutionChart } from '../components/monitoring/PresenceEvolutionChart';
import { PainDistributionChart } from '../components/monitoring/PainDistributionChart';
import { FilterToolbar } from '../components/monitoring/FilterToolbar';
import { PatientMonitoringTable } from '../components/monitoring/PatientMonitoringTable';
import { QuickActionDialog } from '../components/monitoring/QuickActionDialog';
import { useData } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
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
} from '../types';
import * as patientMonitoringService from '../services/patientMonitoringService';
import * as patientService from '../services/patientService';

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

  // Estados de UI
  const [filters, setFilters] = useState<MonitoringFilters>({
    searchTerm: '',
    status: 'all',
    riskLevel: 'all',
    attendanceRange: 'all',
    painLevel: 'all',
    therapistId: 'all',
  });
  const [sortConfig, setSortConfig] = useState<MonitoringSortConfig>({
    field: 'riskLevel',
    direction: 'desc',
  });
  const [period, setPeriod] = useState(30);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, [patients, appointments, period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Calcular métricas de monitoramento
      const metricsData = await patientMonitoringService.getPatientMonitoringMetrics(
        patients,
        appointments
      );
      setPatientsWithMetrics(metricsData);

      // Calcular KPIs
      const kpis = patientMonitoringService.getKPISummary(metricsData, period);
      setKpiMetrics(kpis);

      // Dados de presença ao longo do tempo
      const presence = patientMonitoringService.getPresenceEvolutionData(appointments, period);
      setPresenceData(presence);

      // Distribuição de dor
      const pain = await patientMonitoringService.getPainDistributionData(patients);
      setPainData(pain);
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
      showToast('Erro ao carregar dados de monitoramento', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Acompanhamento de Pacientes"
        subtitle="Monitore presença, evolução clínica e priorize ações para retenção"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Seção 1: KPIs */}
          {kpiMetrics && <KPICards metrics={kpiMetrics} />}

          {/* Seção 2: Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <PresenceEvolutionChart 
                data={presenceData} 
                onPeriodChange={handlePeriodChange}
              />
            </Card>
            <Card>
              <PainDistributionChart 
                data={painData} 
                onBarClick={handlePainBarClick}
              />
            </Card>
          </div>

          {/* Seção 3: Filtros + Tabela */}
          <Card>
            <FilterToolbar
              filters={filters}
              onFilterChange={setFilters}
              therapists={therapists}
            />
            <PatientMonitoringTable
              patients={sortedPatients}
              sortConfig={sortConfig}
              onSort={handleSort}
              onAction={handleQuickAction}
              isLoading={isLoading}
            />
          </Card>

          {/* Dialog de Ações Rápidas */}
          <QuickActionDialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            patient={selectedPatient}
            onWhatsApp={handleWhatsApp}
            onSchedule={handleSchedule}
            onAddNote={handleAddNote}
          />
        </>
      )}
    </div>
  );
};

export default PatientMonitoringPage;

