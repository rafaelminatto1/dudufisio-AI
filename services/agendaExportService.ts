import { EnrichedAppointment, Therapist, AppointmentStatus } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyBR } from '../lib/format';
import * as XLSX from 'xlsx';

export interface ExportProgress {
  progress: number;
  total: number;
  message: string;
}

export type ExportProgressCallback = (progress: ExportProgress) => void;

class AgendaExportService {
  private worker: Worker | null = null;

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/exportWorker.ts', import.meta.url), {
        type: 'module'
      });
    }
    return this.worker;
  }

  /**
   * Exporta agenda para CSV (com Web Worker para grandes volumes)
   */
  exportToCSV(
    appointments: EnrichedAppointment[],
    filename?: string,
    onProgress?: ExportProgressCallback
  ): Promise<void> {
    // Se for pequeno (<1000), usar método síncrono
    if (appointments.length < 1000 && !onProgress) {
      return this.exportToCSVSync(appointments, filename);
    }

    // Para grandes volumes, usar Web Worker
    return new Promise((resolve, reject) => {
      const worker = this.getWorker();

      worker.onmessage = (e) => {
        const { type, progress, total, message, result, mimeType } = e.data;

        if (type === 'progress' && onProgress) {
          onProgress({ progress, total, message });
        } else if (type === 'complete') {
          this.downloadBlob(result, filename || `agenda_${format(new Date(), 'yyyy-MM-dd')}.csv`, mimeType);
          resolve();
        } else if (type === 'error') {
          reject(new Error(e.data.error));
        }
      };

      worker.onerror = (error) => reject(error);

      worker.postMessage({
        type: 'export-csv',
        data: { appointments, filename }
      });
    });
  }

  /**
   * Download helper para Blob
   */
  private downloadBlob(blob: Blob, filename: string, mimeType: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Método síncrono para exports pequenos
   */
  private exportToCSVSync(appointments: EnrichedAppointment[], filename?: string): Promise<void> {
    return new Promise((resolve) => {
      const headers = [
        'Data',
        'Hora Início',
        'Hora Fim',
        'Paciente',
      'Terapeuta',
      'Tipo',
      'Status',
      'Valor',
      'Pagamento',
      'Observações'
    ];

    const rows = appointments.map(apt => [
      format(apt.startTime, 'dd/MM/yyyy', { locale: ptBR }),
      format(apt.startTime, 'HH:mm'),
      format(apt.endTime, 'HH:mm'),
      apt.patientName,
      apt.therapistName || '',
      apt.type,
      apt.status,
      apt.value.toString(),
      apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
      apt.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

      this.downloadFile(
        csvContent,
        filename || `agenda_${format(new Date(), 'yyyy-MM-dd')}.csv`,
        'text/csv;charset=utf-8;'
      );
      resolve();
    });
  }

  /**
   * Exporta agenda para Excel (formato CSV compatível)
   */
  exportToExcel(appointments: EnrichedAppointment[], therapists: Therapist[], filename?: string): void {
    // Excel-friendly CSV with UTF-8 BOM
    const BOM = '\uFEFF';
    
    const headers = [
      'Data',
      'Dia da Semana',
      'Hora Início',
      'Hora Fim',
      'Duração (min)',
      'Paciente',
      'Telefone',
      'Terapeuta',
      'Especialização',
      'Tipo de Consulta',
      'Status',
      'Valor',
      'Status Pagamento',
      'Sessão',
      'Observações'
    ];

    const rows = appointments.map(apt => {
      const therapist = therapists.find(t => t.id === apt.therapistId);
      const duration = (apt.endTime.getTime() - apt.startTime.getTime()) / 60000;
      
      return [
        format(apt.startTime, 'dd/MM/yyyy'),
        format(apt.startTime, 'EEEE', { locale: ptBR }),
        format(apt.startTime, 'HH:mm'),
        format(apt.endTime, 'HH:mm'),
        duration.toString(),
        apt.patientName,
        apt.patientPhone || '',
        apt.therapistName || '',
        therapist?.specialization || '',
        apt.type,
        apt.status,
        apt.value.toString().replace('.', ','),
        apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
        apt.sessionNumber && apt.totalSessions ? `${apt.sessionNumber}/${apt.totalSessions}` : '',
        apt.notes || ''
      ];
    });

    const csvContent = BOM + [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    this.downloadFile(
      csvContent,
      filename || `agenda_excel_${format(new Date(), 'yyyy-MM-dd')}.csv`,
      'text/csv;charset=utf-8;'
    );
  }

  /**
   * Exporta agenda para Excel nativo (.xlsx) usando biblioteca xlsx
   */
  exportToExcelXLSX(
    appointments: EnrichedAppointment[],
    therapists: Therapist[],
    filename?: string
  ): void {
    // Mapeamento de labels de status
    const statusLabels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.Scheduled]: 'Agendado',
      [AppointmentStatus.Confirmed]: 'Confirmado',
      [AppointmentStatus.Completed]: 'Realizado',
      [AppointmentStatus.Canceled]: 'Cancelado',
      [AppointmentStatus.NoShow]: 'Faltou',
      [AppointmentStatus.InProgress]: 'Em Andamento',
      [AppointmentStatus.Rescheduled]: 'Reagendado'
    };

    // Preparar dados para exportação
    const data = appointments.map(apt => {
      const therapist = therapists.find(t => t.id === apt.therapistId);
      const duration = Math.round((apt.endTime.getTime() - apt.startTime.getTime()) / 60000);
      
      return {
        'Data': format(apt.startTime, 'dd/MM/yyyy'),
        'Dia da Semana': format(apt.startTime, 'EEEE', { locale: ptBR }),
        'Horário Início': format(apt.startTime, 'HH:mm'),
        'Horário Fim': format(apt.endTime, 'HH:mm'),
        'Duração (min)': duration,
        'Paciente': apt.patientName,
        'Telefone': apt.patientPhone || '-',
        'Terapeuta': apt.therapistName || '-',
        'Especialização': therapist?.specialization || '-',
        'Tipo de Consulta': apt.type,
        'Status': statusLabels[apt.status] || apt.status,
        'Valor': formatCurrencyBR(apt.value || 0),
        'Status Pagamento': apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
        'Sessão': apt.sessionNumber && apt.totalSessions ? `${apt.sessionNumber}/${apt.totalSessions}` : '-',
        'Sessões Restantes': apt.sessions_remaining !== undefined ? apt.sessions_remaining : '-',
        'Observações': apt.notes || apt.observations || '-'
      };
    });

    // Criar worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Configurar largura das colunas para melhor visualização
    const colWidths = [
      { wch: 12 },  // Data
      { wch: 15 },  // Dia da Semana
      { wch: 12 },  // Horário Início
      { wch: 12 },  // Horário Fim
      { wch: 12 },  // Duração
      { wch: 30 },  // Paciente
      { wch: 15 },  // Telefone
      { wch: 25 },  // Terapeuta
      { wch: 20 },  // Especialização
      { wch: 20 },  // Tipo
      { wch: 12 },  // Status
      { wch: 12 },  // Valor
      { wch: 15 },  // Pagamento
      { wch: 10 },  // Sessão
      { wch: 12 },  // Sessões Restantes
      { wch: 40 }   // Observações
    ];
    ws['!cols'] = colWidths;

    // Criar workbook e adicionar worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agenda');

    // Adicionar metadados ao workbook
    wb.Props = {
      Title: 'Agenda MoocaFisio',
      Subject: 'Exportação de Agendamentos',
      Author: 'MoocaFisio',
      CreatedDate: new Date()
    };

    // Fazer download do arquivo
    const fileName = filename || `agenda_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Exporta agenda para JSON
   */
  exportToJSON(appointments: EnrichedAppointment[], filename?: string): void {
    const data = {
      exportedAt: new Date().toISOString(),
      totalAppointments: appointments.length,
      dateRange: {
        start: appointments.length > 0 ? format(appointments[0].startTime, 'yyyy-MM-dd') : null,
        end: appointments.length > 0 ? format(appointments[appointments.length - 1].startTime, 'yyyy-MM-dd') : null
      },
      appointments: appointments.map(apt => ({
        id: apt.id,
        date: format(apt.startTime, 'yyyy-MM-dd'),
        startTime: format(apt.startTime, 'HH:mm'),
        endTime: format(apt.endTime, 'HH:mm'),
        patient: {
          id: apt.patientId,
          name: apt.patientName,
          phone: apt.patientPhone
        },
        therapist: {
          id: apt.therapistId,
          name: apt.therapistName
        },
        type: apt.type,
        status: apt.status,
        value: apt.value,
        paymentStatus: apt.paymentStatus,
        session: apt.sessionNumber && apt.totalSessions ? {
          current: apt.sessionNumber,
          total: apt.totalSessions
        } : null,
        notes: apt.notes,
        hasConflict: apt.hasConflict
      }))
    };

    const jsonContent = JSON.stringify(data, null, 2);
    
    this.downloadFile(
      jsonContent,
      filename || `agenda_${format(new Date(), 'yyyy-MM-dd')}.json`,
      'application/json'
    );
  }

  /**
   * Exporta relatório formatado para impressão
   */
  exportToPrint(appointments: EnrichedAppointment[], therapists: Therapist[], title: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir');
      return;
    }

    const html = this.generatePrintHTML(appointments, therapists, title);
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Auto print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  /**
   * Gera HTML para impressão
   */
  private generatePrintHTML(appointments: EnrichedAppointment[], therapists: Therapist[], title: string): string {
    const appointmentsByTherapist = therapists.map(therapist => ({
      therapist,
      appointments: appointments.filter(apt => apt.therapistId === therapist.id)
    }));

    const totalRevenue = appointments.reduce((sum, apt) => sum + apt.value, 0);
    const paidRevenue = appointments.filter(apt => apt.paymentStatus === 'paid').reduce((sum, apt) => sum + apt.value, 0);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @media print {
      @page { margin: 2cm; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      font-size: 12px;
    }
    h1 {
      color: #1e40af;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 {
      color: #334155;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #475569;
    }
    tr:hover {
      background-color: #f8fafc;
    }
    .summary {
      background-color: #eff6ff;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .summary-item {
      display: inline-block;
      margin-right: 30px;
      margin-bottom: 10px;
    }
    .summary-label {
      font-weight: bold;
      color: #1e40af;
    }
    .status-scheduled { color: #3b82f6; }
    .status-completed { color: #10b981; }
    .status-canceled { color: #ef4444; }
    .paid { color: #10b981; font-weight: bold; }
    .pending { color: #f59e0b; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  
  <div class="summary">
    <div class="summary-item">
      <span class="summary-label">Total de Consultas:</span> ${appointments.length}
    </div>
    <div class="summary-item">
      <span class="summary-label">Receita Total:</span> ${formatCurrencyBR(totalRevenue)}
    </div>
    <div class="summary-item">
      <span class="summary-label">Pago:</span> <span class="paid">${formatCurrencyBR(paidRevenue)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Pendente:</span> <span class="pending">${formatCurrencyBR(totalRevenue - paidRevenue)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Terapeutas:</span> ${therapists.length}
    </div>
  </div>

  ${appointmentsByTherapist.map(({ therapist, appointments: therapistApts }) => `
    <h2>${therapist.name} ${therapist.specialization ? `- ${therapist.specialization}` : ''}</h2>
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Horário</th>
          <th>Paciente</th>
          <th>Tipo</th>
          <th>Status</th>
          <th>Valor</th>
          <th>Pgto</th>
        </tr>
      </thead>
      <tbody>
        ${therapistApts.length === 0 ? `
          <tr>
            <td colspan="7" style="text-align: center; color: #94a3b8; padding: 20px;">
              Nenhum agendamento
            </td>
          </tr>
        ` : therapistApts.map(apt => `
          <tr>
            <td>${format(apt.startTime, 'dd/MM/yyyy (EEE)', { locale: ptBR })}</td>
            <td>${format(apt.startTime, 'HH:mm')} - ${format(apt.endTime, 'HH:mm')}</td>
            <td>${apt.patientName}</td>
            <td>${apt.type}</td>
            <td class="status-${apt.status}">${apt.status}</td>
            <td>${formatCurrencyBR(apt.value)}</td>
            <td class="${apt.paymentStatus}">${apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `).join('')}

  <div class="footer">
    <p>MoocaFisio - Sistema de Gestão em Fisioterapia</p>
    <p>Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Download helper
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copia agenda para clipboard (formato texto)
   */
  async copyToClipboard(appointments: EnrichedAppointment[]): Promise<boolean> {
    const text = appointments.map(apt => 
      `${format(apt.startTime, 'dd/MM HH:mm')} - ${apt.patientName} (${apt.type}) - ${apt.therapistName || 'Sem terapeuta'}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erro ao copiar para clipboard:', error);
      return false;
    }
  }
}

export const agendaExportService = new AgendaExportService();

