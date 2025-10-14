/**
 * BODY MAP DASHBOARD PAGE
 * Página dedicada com dashboard completo do mapa corporal
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import BodyMapDashboard from '../components/body-map/BodyMapDashboard';
import PainHistoryTimeline from '../components/body-map/PainHistoryTimeline';
import ComparisonView from '../components/body-map/ComparisonView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import * as bodyMapService from '../services/bodyMapService';
import * as pdfService from '../lib/pdf/bodyMapReport';
import type { BodyMapSession, BodyMapAnalytics, BodyMapComparison, Patient } from '../types';

const BodyMapDashboardPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<BodyMapSession[]>([]);
  const [analytics, setAnalytics] = useState<BodyMapAnalytics | null>(null);
  const [comparison, setComparison] = useState<BodyMapComparison | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filtros
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId, dateRange]);

  const loadData = async () => {
    if (!patientId) return;

    setIsLoading(true);
    try {
      // Calcular período baseado no filtro
      const period = calculatePeriod(dateRange);

      // Importar patientService
      const { getPatientById } = await import('../services/patientService');

      // Carregar dados em paralelo
      const [sessionsData, analyticsData, comparisonData, patientData] = await Promise.all([
        bodyMapService.getPatientBodyMapHistory(patientId, period),
        bodyMapService.getBodyMapAnalytics(patientId, period),
        bodyMapService.compareBodyMapSessions(patientId),
        getPatientById(patientId),
      ]);

      setSessions(sessionsData);
      setAnalytics(analyticsData);
      setComparison(comparisonData);
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePeriod = (range: string) => {
    const now = new Date();
    let start = new Date();

    switch (range) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      default:
        start = new Date(0); // All time
    }

    return {
      startDate: start,
      endDate: now,
    };
  };

  const handleExportPDF = async () => {
    if (!patient || !analytics) {
      alert('Dados insuficientes para gerar PDF');
      return;
    }

    try {
      const { getMainPathology } = await import('../services/patientService');
      const mainPathology = await getMainPathology(patient.id);

      const pdfData = {
        patient,
        mainPathology: mainPathology || undefined,
        sessions,
        analytics,
        generatedAt: new Date(),
        generatedBy: 'Fisioterapeuta', // TODO: Get from auth context
        clinicInfo: {
          name: 'FisioFlow',
          address: 'Endereço da Clínica',
          phone: '(11) 1234-5678',
          email: 'contato@fisioflow.com',
        },
      };

      await pdfService.generateAndDownloadBodyMapPDF(
        pdfData,
        `relatorio-mapa-corporal-${patient.name}-${new Date().toISOString().split('T')[0]}.html`
      );

      alert('Relatório gerado com sucesso! (HTML temporário - PDF completo em breve)');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erro ao gerar PDF do relatório');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-slate-600">Erro ao carregar dados do dashboard</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Dashboard de Mapa Corporal</h1>
              <p className="text-slate-600 mt-1">Análise completa da evolução de dor do paciente</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Filtro de Período */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="all">Todo o período</option>
              </select>

              {/* Botão Exportar PDF */}
              <Button onClick={handleExportPDF} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
          </TabsList>

          {/* Tab: Dashboard com Gráficos */}
          <TabsContent value="dashboard">
            <BodyMapDashboard analytics={analytics} showMainComplaint={true} />
          </TabsContent>

          {/* Tab: Timeline de Histórico */}
          <TabsContent value="timeline">
            {sessions.length > 0 ? (
              <PainHistoryTimeline sessions={sessions} showTrend={true} />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Sem Histórico</h3>
                <p className="text-slate-500">Nenhuma sessão registrada no período selecionado</p>
              </div>
            )}
          </TabsContent>

          {/* Tab: Comparação Visual */}
          <TabsContent value="comparison">
            {comparison && comparison.firstSession && comparison.lastSession ? (
              <ComparisonView comparison={comparison} />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Filter className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Comparação Indisponível</h3>
                <p className="text-slate-500">São necessárias pelo menos 2 sessões para comparação</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Informações Adicionais */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-slate-800 mb-4">Sobre este Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-700 mb-1">Dashboard</p>
              <p>
                Visão geral com métricas principais, gráficos de evolução, frequência por região e
                distribuição de tipos de dor.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Linha do Tempo</p>
              <p>
                Histórico cronológico de todas as sessões com gráficos de tendência e estatísticas
                detalhadas.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Comparação</p>
              <p>
                Análise comparativa entre primeira e última sessão, mostrando melhorias, pioras e mudanças
                nas regiões de dor.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Exportação</p>
              <p>
                Gere relatórios em PDF profissionais com todos os dados e gráficos para compartilhar com
                médicos e pacientes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyMapDashboardPage;

