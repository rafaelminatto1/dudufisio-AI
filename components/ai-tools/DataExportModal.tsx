import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  Brain, 
  BarChart3,
  Database,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Filter,
  Archive
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportData {
  laudos: boolean;
  evolucoes: boolean;
  heps: boolean;
  analisesRisco: boolean;
  conversasIA: boolean;
  metricas: boolean;
  configuracoes: boolean;
}

interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  dateRange: 'all' | 'last30' | 'last90' | 'custom';
  customStart?: string;
  customEnd?: string;
  includeMetadata: boolean;
  compressFiles: boolean;
}

const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedData, setSelectedData] = useState<ExportData>({
    laudos: true,
    evolucoes: true,
    heps: true,
    analisesRisco: true,
    conversasIA: false,
    metricas: true,
    configuracoes: false
  });

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    dateRange: 'last30',
    includeMetadata: true,
    compressFiles: false
  });

  const dataTypes = [
    {
      key: 'laudos' as keyof ExportData,
      name: 'Laudos Médicos',
      description: 'Documentos gerados pela IA',
      count: 245,
      icon: FileText,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'evolucoes' as keyof ExportData,
      name: 'Evoluções',
      description: 'Evoluções de tratamento',
      count: 189,
      icon: Calendar,
      color: 'bg-green-100 text-green-800'
    },
    {
      key: 'heps' as keyof ExportData,
      name: 'Planos HEP',
      description: 'Exercícios domiciliares',
      count: 156,
      icon: Users,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'analisesRisco' as keyof ExportData,
      name: 'Análises de Risco',
      description: 'Avaliações de risco clínico',
      count: 98,
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800'
    },
    {
      key: 'conversasIA' as keyof ExportData,
      name: 'Conversas IA',
      description: 'Histórico do chat IA',
      count: 1247,
      icon: Brain,
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      key: 'metricas' as keyof ExportData,
      name: 'Métricas',
      description: 'Dados de performance e uso',
      count: 45,
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-800'
    },
    {
      key: 'configuracoes' as keyof ExportData,
      name: 'Configurações',
      description: 'Configurações do sistema',
      count: 12,
      icon: Settings,
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  const handleDataToggle = (key: keyof ExportData) => {
    setSelectedData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedData).every(Boolean);
    const newState = Object.keys(selectedData).reduce((acc, key) => {
      acc[key as keyof ExportData] = !allSelected;
      return acc;
    }, {} as ExportData);
    setSelectedData(newState);
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const getSelectedCount = () => {
    return Object.values(selectedData).filter(Boolean).length;
  };

  const getTotalRecords = () => {
    return dataTypes.reduce((total, type) => {
      return selectedData[type.key] ? total + type.count : total;
    }, 0);
  };

  const generateMockData = (dataType: string, count: number) => {
    const baseData = {
      id: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-123',
      metadata: {
        version: '1.0',
        source: 'DuduFisio-AI',
        exportDate: new Date().toISOString()
      }
    };

    return Array.from({ length: count }, (_, i) => ({
      ...baseData,
      id: `${dataType}-${i + 1}`,
      content: `Conteúdo mock para ${dataType} ${i + 1}`,
      patientId: `patient-${Math.floor(Math.random() * 100) + 1}`,
      therapistId: `therapist-${Math.floor(Math.random() * 10) + 1}`
    }));
  };

  const exportData = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const selectedTypes = dataTypes.filter(type => selectedData[type.key]);
      const totalSteps = selectedTypes.length + 2; // +2 for metadata and finalization
      let currentStep = 0;

      const exportData: any = {
        metadata: {
          exportDate: new Date().toISOString(),
          format: exportOptions.format,
          dateRange: exportOptions.dateRange,
          totalRecords: getTotalRecords(),
          version: '1.0',
          source: 'DuduFisio-AI'
        },
        data: {}
      };

      // Simular processamento de cada tipo de dado
      for (const type of selectedTypes) {
        await new Promise(resolve => setTimeout(resolve, 500));
        currentStep++;
        setExportProgress((currentStep / totalSteps) * 100);

        exportData.data[type.key] = generateMockData(type.key, type.count);
      }

      // Adicionar metadados se solicitado
      if (exportOptions.includeMetadata) {
        await new Promise(resolve => setTimeout(resolve, 300));
        currentStep++;
        setExportProgress((currentStep / totalSteps) * 100);
      }

      // Finalizar exportação
      await new Promise(resolve => setTimeout(resolve, 200));
      currentStep++;
      setExportProgress((currentStep / totalSteps) * 100);

      // Gerar arquivo
      let fileName = `dudufisio-ai-export-${new Date().toISOString().split('T')[0]}`;
      let mimeType = 'application/json';
      let fileContent: string | Blob = JSON.stringify(exportData, null, 2);

      switch (exportOptions.format) {
        case 'csv':
          mimeType = 'text/csv';
          fileName += '.csv';
          fileContent = generateCSV(exportData);
          break;
        case 'xlsx':
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileName += '.xlsx';
          // Para XLSX, manteremos como JSON por simplicidade
          break;
        case 'pdf':
          mimeType = 'application/pdf';
          fileName += '.pdf';
          // Para PDF, manteremos como JSON por simplicidade
          break;
        default:
          fileName += '.json';
      }

      // Download do arquivo
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exportação concluída! ${getTotalRecords()} registros exportados.`, 'success');

    } catch (error) {
      console.error('Erro na exportação:', error);
      showToast('Erro durante a exportação. Tente novamente.', 'error');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const generateCSV = (data: any) => {
    const headers = ['ID', 'Tipo', 'Data Criação', 'Paciente ID', 'Terapeuta ID'];
    let csv = headers.join(',') + '\n';

    Object.entries(data.data).forEach(([type, records]: [string, any]) => {
      records.forEach((record: any) => {
        csv += [
          record.id,
          type,
          record.createdAt,
          record.patientId,
          record.therapistId
        ].join(',') + '\n';
      });
    });

    return csv;
  };

  const allSelected = Object.values(selectedData).every(Boolean);
  const someSelected = Object.values(selectedData).some(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-green-500" />
            Exportar Dados
          </DialogTitle>
          <DialogDescription>
            Selecione os dados que deseja exportar e configure as opções de exportação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Dados */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Selecionar Dados para Exportação
                  </CardTitle>
                  <CardDescription>
                    {getSelectedCount()} de {dataTypes.length} tipos selecionados
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.key}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={type.key}
                        checked={selectedData[type.key]}
                        onCheckedChange={() => handleDataToggle(type.key)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <Label htmlFor={type.key} className="font-medium">
                            {type.name}
                          </Label>
                          <Badge className={`${type.color} text-xs`}>
                            {type.count}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Opções de Exportação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Opções de Exportação
              </CardTitle>
              <CardDescription>Configure o formato e filtros da exportação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Formato do Arquivo</Label>
                  <Select value={exportOptions.format} onValueChange={(value: any) => handleOptionChange('format', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateRange">Período</Label>
                  <Select value={exportOptions.dateRange} onValueChange={(value: any) => handleOptionChange('dateRange', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os dados</SelectItem>
                      <SelectItem value="last30">Últimos 30 dias</SelectItem>
                      <SelectItem value="last90">Últimos 90 dias</SelectItem>
                      <SelectItem value="custom">Período personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {exportOptions.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={exportOptions.customStart || ''}
                      onChange={(e) => handleOptionChange('customStart', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={exportOptions.customEnd || ''}
                      onChange={(e) => handleOptionChange('customEnd', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={exportOptions.includeMetadata}
                  onCheckedChange={(checked) => handleOptionChange('includeMetadata', checked)}
                />
                <Label htmlFor="includeMetadata" className="text-sm">
                  Incluir metadados (versão, data de exportação, etc.)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compressFiles"
                  checked={exportOptions.compressFiles}
                  onCheckedChange={(checked) => handleOptionChange('compressFiles', checked)}
                />
                <Label htmlFor="compressFiles" className="text-sm">
                  Comprimir arquivos (ZIP)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Resumo da Exportação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Resumo da Exportação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {getSelectedCount()}
                  </div>
                  <div className="text-sm text-blue-600">Tipos de Dados</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {getTotalRecords().toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Registros Totais</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">
                    {exportOptions.format.toUpperCase()}
                  </div>
                  <div className="text-sm text-purple-600">Formato</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progresso da Exportação */}
          {isExporting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <span className="font-medium">Exportando dados...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      data-width={exportProgress}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round(exportProgress)}% concluído
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancelar
            </Button>
            <Button 
              onClick={exportData}
              disabled={!someSelected || isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? 'Exportando...' : 'Exportar Dados'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataExportModal;
