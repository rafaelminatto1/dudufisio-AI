// components/supplies/SupplyReports.tsx
import React, { useState } from 'react';
import { 
  supplyReportsService,
  ConsumptionByPeriodReport,
  ProcedureCostAnalysis,
  SupplyMovementReport,
  PeriodFilter
import { SupplyCategory } from '../../types';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  Filter,
  FileSpreadsheet,
  FilePdf,
  Loader2
} from 'lucide-react';

type ReportType = 'consumption' | 'procedure' | 'movement' | 'valuation';

interface SupplyReportsProps {
  onClose?: () => void;
}

const SupplyReports: React.FC<SupplyReportsProps> = ({ onClose }) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('consumption');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [period, setPeriod] = useState<PeriodFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedCategory, setSelectedCategory] = useState<SupplyCategory | ''>('');
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>('');
  const [selectedProcedureType, setSelectedProcedureType] = useState<string>('eletroterapia');
  
  const { supplies } = useSupplies();

  const categories: SupplyCategory[] = [
    'equipamentos',
    'materiais_descartaveis', 
    'medicamentos_topicos',
    'materiais_limpeza',
    'materiais_escritorio',
    'equipamentos_protecao'
  ];

  const procedureTypes = [
    { value: 'eletroterapia', label: 'Eletroterapia' },
    { value: 'exercicios_terapeuticos', label: 'Exercícios Terapêuticos' },
    { value: 'terapia_manual', label: 'Terapia Manual' },
    { value: 'ultrassom', label: 'Ultrassom' },
    { value: 'crioterapia', label: 'Crioterapia' },
    { value: 'termoterapia', label: 'Termoterapia' },
    { value: 'avaliacao', label: 'Avaliação' }
  ];

  const reportTypes = [
    { 
      id: 'consumption', 
      name: 'Consumo por Período', 
      icon: TrendingUp,
      description: 'Análise detalhada do consumo de insumos em um período'
    },
    { 
      id: 'procedure', 
      name: 'Custo por Procedimento', 
      icon: DollarSign,
      description: 'Análise de custos de insumos por tipo de procedimento'
    },
    { 
      id: 'movement', 
      name: 'Movimentação de Estoque', 
      icon: Package,
      description: 'Relatório de entradas e saídas de um insumo específico'
    }
  ];

  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    
    try {
      let data: any;
      
      switch (selectedReport) {
        case 'consumption':
          data = await supplyReportsService.generateConsumptionByPeriodReport(
            period,
            selectedCategory as SupplyCategory || undefined
          );
          break;
          
        case 'procedure':
          data = await supplyReportsService.generateProcedureCostAnalysis(
            selectedProcedureType,
            period
          );
          break;
          
        case 'movement':
          if (!selectedSupplyId) {
            alert('Selecione um insumo');
            return;
          }
          data = await supplyReportsService.generateStockMovementReport(
            selectedSupplyId,
            period
          );
          break;
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'excel' | 'pdf') => {
    if (!reportData) {
      alert('Gere um relatório primeiro');
      return;
    }

    setLoading(true);
    try {
      let blob: Blob;
      let filename: string;
      
      if (format === 'excel') {
        blob = await supplyReportsService.exportToExcel(reportData, selectedReport);
        filename = `relatorio_${selectedReport}_${new Date().toISOString().split('T')[0]}.xlsx`;
      } else {
        const title = reportTypes.find(r => r.id === selectedReport)?.name || 'Relatório';
        blob = await supplyReportsService.exportToPDF(reportData, selectedReport, title);
        filename = `relatorio_${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`;
      }
      
      // Criar link de download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(`Erro ao exportar para ${format}:`, error);
      alert(`Erro ao exportar para ${format}`);
    } finally {
      setLoading(false);
    }
  };

  const renderReportData = () => {
    if (!reportData) return null;

    switch (selectedReport) {
      case 'consumption':
        return renderConsumptionReport(reportData as ConsumptionByPeriodReport);
      case 'procedure':
        return renderProcedureReport(reportData as ProcedureCostAnalysis);
      case 'movement':
        return renderMovementReport(reportData as SupplyMovementReport);
      default:
        return null;
    }
  };

  const renderConsumptionReport = (data: ConsumptionByPeriodReport) => (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Consumido</div>
          <div className="text-2xl font-bold text-gray-900">{data.totalConsumed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Custo Total</div>
          <div className="text-2xl font-bold text-green-600">
            R$ {data.totalCost.toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Itens Diferentes</div>
          <div className="text-2xl font-bold text-blue-600">{data.itemsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Média Diária</div>
          <div className="text-2xl font-bold text-purple-600">
            R$ {(data.totalCost / data.dailyConsumption.length).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Top Insumos */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Top 10 Insumos Mais Consumidos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insumo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custo Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % do Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topSupplies.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantityConsumed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {item.totalCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${item.percentageOfTotal}%` }}
                        />
                      </div>
                      <span>{item.percentageOfTotal.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown por Categoria */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Consumo por Categoria</h3>
        <div className="space-y-3">
          {data.categoryBreakdown.map((cat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                  <span className="text-sm text-gray-500">R$ {cat.cost.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 text-sm font-medium text-gray-900">
                {cat.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProcedureReport = (data: ProcedureCostAnalysis) => (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Procedimentos Realizados</div>
          <div className="text-2xl font-bold text-gray-900">{data.procedureCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Custo Médio por Procedimento</div>
          <div className="text-2xl font-bold text-green-600">
            R$ {data.averageSupplyCost.toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Custo Total</div>
          <div className="text-2xl font-bold text-blue-600">
            R$ {data.totalSupplyCost.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Insumos Utilizados */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Insumos Utilizados no Procedimento</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insumo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade Média
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custo Médio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequência de Uso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.supplies.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.averageQuantity.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {item.averageCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.frequency.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMovementReport = (data: SupplyMovementReport) => (
    <div className="space-y-6">
      {/* Informações do Insumo */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">{data.supply.name}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Estoque Inicial</div>
            <div className="text-xl font-bold text-gray-900">{data.openingStock}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Estoque Final</div>
            <div className="text-xl font-bold text-gray-900">{data.closingStock}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Recebido</div>
            <div className="text-xl font-bold text-green-600">+{data.totalReceived}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Consumido</div>
            <div className="text-xl font-bold text-red-600">-{data.totalConsumed}</div>
          </div>
        </div>
      </div>

      {/* Análise de Valores */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Análise Financeira</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Valor Inicial</div>
            <div className="text-xl font-bold text-gray-900">
              R$ {data.valueAnalysis.openingValue.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Valor Final</div>
            <div className="text-xl font-bold text-gray-900">
              R$ {data.valueAnalysis.closingValue.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Valor Recebido</div>
            <div className="text-xl font-bold text-green-600">
              R$ {data.valueAnalysis.receivedValue.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Valor Consumido</div>
            <div className="text-xl font-bold text-red-600">
              R$ {data.valueAnalysis.consumedValue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Giro de Estoque */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Giro de Estoque</h3>
            <p className="text-sm text-gray-600 mt-1">
              Quantas vezes o estoque foi renovado no período
            </p>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {data.stockTurnover.toFixed(2)}x
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios de Insumos</h1>
              <p className="text-gray-600 mt-1">Análises detalhadas e exportação de dados</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Voltar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Configuração */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              {/* Tipo de Relatório */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de Relatório</h3>
                <div className="space-y-2">
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedReport(type.id as ReportType)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedReport === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <Icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{type.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Período */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Período</h3>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={period.startDate}
                    onChange={(e) => setPeriod({ ...period, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={period.endDate}
                    onChange={(e) => setPeriod({ ...period, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filtros específicos por tipo de relatório */}
              {selectedReport === 'consumption' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Categoria (Opcional)</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as SupplyCategory | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedReport === 'procedure' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de Procedimento</h3>
                  <select
                    value={selectedProcedureType}
                    onChange={(e) => setSelectedProcedureType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {procedureTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedReport === 'movement' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Insumo</h3>
                  <select
                    value={selectedSupplyId}
                    onChange={(e) => setSelectedSupplyId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um insumo</option>
                    {supplies.map(supply => (
                      <option key={supply.id} value={supply.id}>{supply.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botão Gerar */}
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Área de Visualização */}
          <div className="lg:col-span-3">
            {reportData ? (
              <>
                {/* Botões de Exportação */}
                <div className="mb-4 flex justify-end space-x-2">
                  <button
                    onClick={() => exportReport('excel')}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </button>
                  <button
                    onClick={() => exportReport('pdf')}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FilePdf className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </button>
                </div>

                {/* Dados do Relatório */}
                {renderReportData()}
              </>
            ) : (
              <div className="bg-white rounded-lg border p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum relatório gerado
                </h3>
                <p className="text-gray-500">
                  Configure os parâmetros e clique em "Gerar Relatório" para visualizar os dados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyReports;