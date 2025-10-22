import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, LineChart, AreaChart as AreaChartIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as testEvolutionService from '../../services/testEvolutionService';
import * as mandatoryTestAlertService from '../../services/mandatoryTestAlertService';
import { TestEvolutionData, MandatoryTestAlert as MandatoryTestAlertType, ChartType } from '../../types';
import MandatoryTestAlert from './MandatoryTestAlert';
import PathologyManager from './PathologyManager';
import EvolutionChart from './EvolutionChart';
import EvolutionTable from './EvolutionTable';

/**
 * Painel completo de evolução de testes
 * Container para: alertas, patologias, gráficos e tabelas
 */

interface TestEvolutionPanelProps {
  patientId: string;
  sessionNumber: number;
}

export const TestEvolutionPanel: React.FC<TestEvolutionPanelProps> = ({
  patientId,
  sessionNumber,
}) => {
  const { showToast } = useToast();

  // State
  const [mandatoryAlerts, setMandatoryAlerts] = useState<MandatoryTestAlertType[]>([]);
  const [availableTests, setAvailableTests] = useState<string[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [evolutionData, setEvolutionData] = useState<TestEvolutionData[]>([]);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [showChart, setShowChart] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [patientId, sessionNumber]);

  useEffect(() => {
    if (selectedTest) {
      loadTestEvolution();
    }
  }, [selectedTest, patientId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar alertas obrigatórios
      const alerts = await mandatoryTestAlertService.generateMandatoryTestAlerts(
        patientId,
        sessionNumber
      );
      setMandatoryAlerts(alerts);

      // Carregar testes disponíveis
      const testHistory = await testEvolutionService.getTestHistory(patientId);
      const tests = Array.from(testHistory.keys());
      setAvailableTests(tests);

      // Sugerir testes baseados em patologias se não houver histórico
      if (tests.length === 0) {
        const suggested = await testEvolutionService.suggestTestsForPatient(patientId);
        setAvailableTests(suggested);
      }

      // Selecionar primeiro teste por padrão
      if (tests.length > 0 && !selectedTest) {
        setSelectedTest(tests[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de evolução:', error);
      showToast('Erro ao carregar dados de evolução', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestEvolution = async () => {
    try {
      const data = await testEvolutionService.getTestEvolutionData(patientId, selectedTest);
      setEvolutionData(data);
    } catch (error) {
      console.error('Erro ao carregar evolução do teste:', error);
      setEvolutionData([]);
    }
  };

  const ChartTypeButton: React.FC<{
    type: ChartType;
    icon: React.ElementType;
    label: string;
  }> = ({ type, icon: Icon, label }) => (
    <Button
      variant={chartType === type ? 'default' : 'outline'}
      size="sm"
      onClick={() => setChartType(type)}
      className="flex items-center space-x-1"
      title={label}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden lg:inline text-xs">{label}</span>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-slate-200 rounded-lg"></div>
        <div className="h-64 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Testes & Evolução</h3>
        <p className="text-xs text-slate-600">
          Acompanhamento de métricas e avaliações
        </p>
      </div>

      {/* Alertas Obrigatórios */}
      {mandatoryAlerts.length > 0 && (
        <MandatoryTestAlert alerts={mandatoryAlerts} />
      )}

      {/* Gerenciador de Patologias */}
      <PathologyManager patientId={patientId} />

      {/* Seletor de Teste e Tipo de Gráfico */}
      {availableTests.length > 0 && (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Selecionar Métrica para Visualizar
            </label>
            
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Escolha uma métrica...</option>
              {availableTests.map(test => (
                <option key={test} value={test}>
                  {test}
                </option>
              ))}
            </select>

            {/* Controles de Visualização */}
            {selectedTest && evolutionData.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ChartTypeButton type="line" icon={LineChart} label="Linha" />
                  <ChartTypeButton type="bar" icon={BarChart3} label="Barras" />
                  <ChartTypeButton type="area" icon={AreaChartIcon} label="Área" />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={showChart ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setShowChart(true); setShowTable(false); }}
                    className="text-xs"
                  >
                    Gráfico
                  </Button>
                  <Button
                    variant={showTable ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setShowTable(true); setShowChart(false); }}
                    className="text-xs"
                  >
                    Tabela
                  </Button>
                  <Button
                    variant={showChart && showTable ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setShowChart(true); setShowTable(true); }}
                    className="text-xs"
                  >
                    Ambos
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico de Evolução */}
          {selectedTest && evolutionData.length > 0 && showChart && (
            <EvolutionChart
              data={evolutionData}
              chartType={chartType}
              title={selectedTest}
              color="#3b82f6"
              height={280}
            />
          )}

          {/* Tabela de Evolução */}
          {selectedTest && evolutionData.length > 0 && showTable && (
            <EvolutionTable
              data={evolutionData}
              testName={selectedTest}
              itemsPerPage={8}
            />
          )}

          {/* Mensagem quando teste selecionado mas sem dados */}
          {selectedTest && evolutionData.length === 0 && (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum dado registrado para "{selectedTest}"</p>
              <p className="text-xs mt-1">Realize medições durante as sessões para ver a evolução</p>
            </div>
          )}
        </>
      )}

      {/* Mensagem quando não há testes */}
      {availableTests.length === 0 && (
        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum teste registrado ainda</p>
          <p className="text-xs mt-1">Comece a registrar medições nas sessões</p>
        </div>
      )}
    </div>
  );
};

export default TestEvolutionPanel;

