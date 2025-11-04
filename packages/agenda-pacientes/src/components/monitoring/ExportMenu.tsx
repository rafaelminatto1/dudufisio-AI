import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileImage, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { PatientWithMonitoringMetrics, KPIMetrics } from '../../types';
import * as exportService from '../../services/exportService';
import { useToast } from '../../contexts/ToastContext';

interface ExportMenuProps {
  patients: PatientWithMonitoringMetrics[];
  kpiMetrics: KPIMetrics | null;
  className?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ 
  patients, 
  kpiMetrics,
  className 
}) => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' | 'image') => {
    if (patients.length === 0) {
      showToast('Nenhum paciente para exportar', 'warning');
      return;
    }

    setIsExporting(true);
    setExportedFormat(format);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = `monitoramento-pacientes-${timestamp}`;

      switch (format) {
        case 'csv':
          exportService.exportToCSV(patients, baseFilename);
          showToast('Dados exportados em CSV', 'success');
          break;

        case 'excel':
          exportService.exportToExcel(patients, baseFilename);
          showToast('Dados exportados para Excel', 'success');
          break;

        case 'pdf':
          if (!kpiMetrics) {
            showToast('Métricas não disponíveis para PDF', 'warning');
            break;
          }
          exportService.exportToPDF(patients, kpiMetrics, baseFilename);
          showToast('Relatório PDF gerado', 'success');
          break;

        case 'image':
          await exportService.exportChartsAsImage('charts-container', baseFilename);
          showToast('Gráficos exportados como imagem', 'success');
          break;
      }

      // Limpar estado após 2 segundos
      setTimeout(() => {
        setExportedFormat(null);
      }, 2000);

    } catch (error) {
      console.error('Erro ao exportar:', error);
      showToast('Erro ao exportar dados', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${className}`}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase">
          Formatos Disponíveis
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* CSV */}
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <div>
                <p className="font-medium">CSV</p>
                <p className="text-xs text-slate-500">Dados brutos para análise</p>
              </div>
            </div>
            {exportedFormat === 'csv' && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </div>
        </DropdownMenuItem>

        {/* Excel */}
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <div>
                <p className="font-medium">Excel</p>
                <p className="text-xs text-slate-500">Planilha formatada</p>
              </div>
            </div>
            {exportedFormat === 'excel' && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </div>
        </DropdownMenuItem>

        {/* PDF */}
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting || !kpiMetrics}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <div>
                <p className="font-medium">PDF</p>
                <p className="text-xs text-slate-500">Relatório completo</p>
              </div>
            </div>
            {exportedFormat === 'pdf' && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Imagem */}
        <DropdownMenuItem
          onClick={() => handleExport('image')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-purple-600" />
              <div>
                <p className="font-medium">Imagem</p>
                <p className="text-xs text-slate-500">Captura dos gráficos</p>
              </div>
            </div>
            {exportedFormat === 'image' && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <p className="text-xs text-slate-500">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} será{patients.length !== 1 ? 'ão' : ''} exportado{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


