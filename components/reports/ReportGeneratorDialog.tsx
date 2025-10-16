/**
 * components/reports/ReportGeneratorDialog.tsx
 * 
 * Dialog para geração de relatórios
 */

import React, { useState } from 'react';
import { Download, FileText, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { generatePatientEvolutionReport } from '@/services/reports/patientEvolutionReport';
import { generateComparativePatientReport } from '@/services/reports/comparativePatientReport';
import { generateTherapistPerformanceReport } from '@/services/reports/therapistPerformanceReport';
import { toast } from 'sonner';

interface ReportGeneratorDialogProps {
  type?: 'patient' | 'comparative' | 'therapist';
  patientId?: string;
  therapistId?: string;
}

export function ReportGeneratorDialog({ type = 'patient', patientId, therapistId }: ReportGeneratorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState(type);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error('Selecione o período');
      return;
    }

    if (reportType === 'comparative' && selectedPatients.length < 2) {
      toast.error('Selecione pelo menos 2 pacientes para comparação');
      return;
    }

    try {
      setLoading(true);

      let report: any;

      switch (reportType) {
        case 'patient':
          if (!patientId) {
            toast.error('ID do paciente não fornecido');
            return;
          }
          report = await generatePatientEvolutionReport(patientId, startDate, endDate);
          break;

        case 'comparative':
          report = await generateComparativePatientReport(selectedPatients, startDate, endDate);
          break;

        case 'therapist':
          if (!therapistId) {
            toast.error('ID do terapeuta não fornecido');
            return;
          }
          report = await generateTherapistPerformanceReport(therapistId, startDate, endDate);
          break;

        default:
          toast.error('Tipo de relatório inválido');
          return;
      }

      toast.success('Relatório gerado com sucesso!');
      console.log('Relatório gerado:', report);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast.error(error.message || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'json') => {
    toast.info(`Export ${format.toUpperCase()} ainda não implementado`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-health-primary-600 hover:bg-health-primary-700">
          <FileText className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerar Relatório</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de Relatório */}
          <div>
            <Label htmlFor="reportType">Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Evolução do Paciente
                  </div>
                </SelectItem>
                <SelectItem value="comparative">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Comparativo entre Pacientes
                  </div>
                </SelectItem>
                <SelectItem value="therapist">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Performance do Terapeuta
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Seleção de Pacientes (apenas para comparativo) */}
          {reportType === 'comparative' && (
            <div>
              <Label htmlFor="patients">Pacientes para Comparação</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione os pacientes" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Buscar pacientes do banco */}
                  <SelectItem value="patient1">Paciente 1</SelectItem>
                  <SelectItem value="patient2">Paciente 2</SelectItem>
                  <SelectItem value="patient3">Paciente 3</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Selecione pelo menos 2 pacientes para comparação
              </p>
            </div>
          )}

          {/* Preview do Relatório */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-semibold text-slate-700 mb-2">Resumo do Relatório</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Tipo: {reportType === 'patient' ? 'Evolução do Paciente' : reportType === 'comparative' ? 'Comparativo entre Pacientes' : 'Performance do Terapeuta'}</li>
              <li>• Período: {startDate && endDate ? `${startDate} até ${endDate}` : 'Não definido'}</li>
              {reportType === 'comparative' && (
                <li>• Pacientes: {selectedPatients.length}</li>
              )}
            </ul>
          </div>

          {/* Botões de Export */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            className="bg-health-primary-600 hover:bg-health-primary-700"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

