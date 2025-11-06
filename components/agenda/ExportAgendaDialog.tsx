import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { EnrichedAppointment, Therapist } from '../../types';
import { agendaExportService, ExportProgress } from '../../services/agendaExportService';
import {
  FileSpreadsheet,
  FileText,
  FileJson,
  Printer,
  Copy,
  Download,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportAgendaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  title?: string;
}

const ExportAgendaDialog: React.FC<ExportAgendaDialogProps> = ({
  isOpen,
  onClose,
  appointments,
  therapists,
  title
}) => {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const exportTitle = title || `Agenda ${format(new Date(), 'dd-MM-yyyy', { locale: ptBR })}`;

  const handleExportCSV = async () => {
    setExporting(true);
    setExportProgress({ progress: 0, total: appointments.length, message: 'Iniciando...' });
    
    try {
      await agendaExportService.exportToCSV(
        appointments,
        undefined,
        (progress) => setExportProgress(progress)
      );
    } finally {
      setExporting(false);
      setTimeout(() => setExportProgress(null), 1000);
    }
  };

  const handleExportExcel = () => {
    setExporting(true);
    try {
      agendaExportService.exportToExcel(appointments, therapists);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcelXLSX = () => {
    setExporting(true);
    try {
      agendaExportService.exportToExcelXLSX(appointments, therapists);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = () => {
    setExporting(true);
    try {
      agendaExportService.exportToJSON(appointments);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    agendaExportService.exportToPrint(appointments, therapists, exportTitle);
  };

  const handleCopy = async () => {
    const success = await agendaExportService.copyToClipboard(appointments);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exportOptions = [
    {
      title: 'Excel (.xlsx)',
      description: 'Planilha Excel nativa com formatação completa',
      icon: FileSpreadsheet,
      color: 'text-emerald-600 bg-emerald-50',
      action: handleExportExcelXLSX,
      format: '.xlsx'
    },
    {
      title: 'Excel (CSV)',
      description: 'Arquivo compatível com Excel e Google Sheets',
      icon: FileSpreadsheet,
      color: 'text-green-600 bg-green-50',
      action: handleExportExcel,
      format: '.csv (Excel)'
    },
    {
      title: 'CSV Simples',
      description: 'Arquivo CSV padrão para importação',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
      action: handleExportCSV,
      format: '.csv'
    },
    {
      title: 'JSON',
      description: 'Dados estruturados para integrações',
      icon: FileJson,
      color: 'text-purple-600 bg-purple-50',
      action: handleExportJSON,
      format: '.json'
    },
    {
      title: 'Imprimir',
      description: 'Versão formatada para impressão',
      icon: Printer,
      color: 'text-slate-600 bg-slate-50',
      action: handlePrint,
      format: 'PDF via Print'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Exportar Agenda</DialogTitle>
          <DialogDescription>
            Exporte sua agenda em diferentes formatos para análise ou compartilhamento
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
              <div className="text-xs text-slate-600">Consultas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{therapists.length}</div>
              <div className="text-xs text-slate-600">Terapeutas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {new Set(appointments.map(a => a.patientId)).size}
              </div>
              <div className="text-xs text-slate-600">Pacientes</div>
            </div>
          </div>
        </Card>

        {/* Export Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-slate-700">Escolha o formato:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-blue-400"
                  onClick={option.action}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", option.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{option.title}</h4>
                      <p className="text-xs text-slate-600 mb-2">{option.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {option.format}
                      </Badge>
                    </div>
                    <Download className="w-4 h-4 text-slate-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Copy */}
        <Card className="p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-slate-900 mb-1">
                Copiar Lista Rápida
              </h4>
              <p className="text-xs text-slate-600">
                Copia lista simplificada para colar em mensagens
              </p>
            </div>
            <Button
              onClick={handleCopy}
              variant={copied ? "default" : "outline"}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Footer Note */}
        <p className="text-xs text-slate-500 text-center">
          💡 Todos os formatos incluem dados completos dos agendamentos
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ExportAgendaDialog;

