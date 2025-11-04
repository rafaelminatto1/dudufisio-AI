import React, { useState } from 'react';
import { Download, Printer, FileText, Share2, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useToast } from '../../contexts/ToastContext';
import { EnrichedAppointment, Therapist } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

interface AgendaExportProps {
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  currentView: 'daily' | 'weekly' | 'monthly' | 'list';
  currentDate: Date;
  onClose: () => void;
}

const AgendaExport: React.FC<AgendaExportProps> = ({
  appointments,
  therapists,
  currentView,
  currentDate,
  onClose
}) => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    showToast('Preparando impressão...', 'info');
    
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Erro ao abrir janela de impressão', 'error');
      return;
    }

    const html = generatePrintHTML();
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      showToast('Impressão iniciada', 'success');
    }, 500);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      showToast('Exportando para PDF...', 'info');
      
      // Em produção, você usaria uma biblioteca como jsPDF ou html2pdf
      const html = generatePrintHTML();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agenda_${format(currentDate, 'yyyy-MM-dd', { locale: ptBR })}.html`;
      link.click();
      
      showToast('PDF exportado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao exportar PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      showToast('Exportando para Excel...', 'info');
      
      // Criar CSV
      const csv = generateCSV();
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agenda_${format(currentDate, 'yyyy-MM-dd', { locale: ptBR })}.csv`;
      link.click();
      
      showToast('Excel exportado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao exportar Excel', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `Agenda - ${format(currentDate, 'dd/MM/yyyy', { locale: ptBR })}`,
        text: `Agenda com ${appointments.length} agendamentos`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
        showToast('Agenda compartilhada!', 'success');
      } else {
        // Fallback: copiar link
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copiado para área de transferência!', 'success');
      }
    } catch (error) {
      showToast('Erro ao compartilhar', 'error');
    }
  };

  const generatePrintHTML = () => {
    const viewTitle = getViewTitle();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Agenda - ${viewTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; }
            .header { margin-bottom: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #64748b; }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Agenda - ${viewTitle}</h1>
            <p>Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Paciente</th>
                <th>Terapeuta</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${appointments.map(app => `
                <tr>
                  <td>${format(app.startTime, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</td>
                  <td>${app.patientName}</td>
                  <td>${app.therapistName}</td>
                  <td>${app.type}</td>
                  <td>${app.status}</td>
                  <td>R$ ${app.value.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Total de agendamentos: ${appointments.length}</p>
          </div>
        </body>
      </html>
    `;
  };

  const generateCSV = () => {
    const headers = ['Data/Hora', 'Paciente', 'Terapeuta', 'Tipo', 'Status', 'Valor'];
    const rows = appointments.map(app => [
      format(app.startTime, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      app.patientName,
      app.therapistName,
      app.type,
      app.status,
      app.value.toFixed(2)
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'daily':
        return format(currentDate, "dd/MM/yyyy", { locale: ptBR });
      case 'weekly':
        return `Semana de ${format(currentDate, "dd/MM/yyyy", { locale: ptBR })}`;
      case 'monthly':
        return format(currentDate, "MMMM/yyyy", { locale: ptBR });
      case 'list':
        return 'Lista de Agendamentos';
      default:
        return 'Agenda';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Agenda
          </DialogTitle>
          <DialogDescription>
            Escolha o formato de exportação desejado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Print */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Agenda
          </Button>

          {/* PDF */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar para PDF
          </Button>

          {/* Excel/CSV */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar para Excel (CSV)
          </Button>

          {/* Share */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Link
          </Button>
        </div>

        {/* Info */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 mt-0.5" />
            <div>
              <p className="font-medium">{getViewTitle()}</p>
              <p className="text-xs mt-1">{appointments.length} agendamento(s)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgendaExport;

