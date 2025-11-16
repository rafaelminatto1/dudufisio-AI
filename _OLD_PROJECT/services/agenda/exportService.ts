import { EnrichedAppointment, Patient, Therapist } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

interface ExportOptions {
  appointments: EnrichedAppointment[];
  patients: Patient[];
  therapists: Therapist[];
  startDate: Date;
  endDate: Date;
  title?: string;
}

/**
 * Serviço de exportação da agenda
 */
export const exportService = {
  /**
   * Exporta agenda em formato PDF (simulado - usa window.print)
   * Em produção, use uma biblioteca como jsPDF ou Puppeteer
   */
  async exportToPDF(options: ExportOptions): Promise<void> {
    const { appointments, patients, therapists, startDate, endDate, title = 'Agenda' } = options;

    // Criar HTML para impressão
    const htmlContent = this.generatePDFHTML(appointments, patients, therapists, startDate, endDate, title);

    // Abrir janela de impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Não foi possível abrir a janela de impressão');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    setTimeout(() => {
      printWindow.print();
    }, 250);
  },

  /**
   * Gera HTML para impressão/PDF
   */
  generatePDFHTML(
    appointments: EnrichedAppointment[],
    patients: Patient[],
    therapists: Therapist[],
    startDate: Date,
    endDate: Date,
    title: string
  ): string {
    const appointmentsByDate = this.groupAppointmentsByDate(appointments);

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 1cm;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #333;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #1e40af;
    }
    .header .period {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
    .date-section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .date-header {
      background-color: #1e40af;
      color: white;
      padding: 8px 12px;
      font-weight: bold;
      font-size: 14px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .appointment {
      background-color: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 10px;
      margin-bottom: 8px;
      border-radius: 4px;
    }
    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    .patient-name {
      font-weight: bold;
      font-size: 14px;
      color: #1e293b;
    }
    .time {
      font-size: 12px;
      color: #64748b;
    }
    .details {
      font-size: 11px;
      color: #64748b;
      margin-top: 5px;
    }
    .therapist {
      display: inline-block;
      background-color: #e0e7ff;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      margin-right: 5px;
    }
    .status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
    }
    .status-scheduled { background-color: #dbeafe; color: #1e40af; }
    .status-completed { background-color: #d1fae5; color: #065f46; }
    .status-canceled { background-color: #fee2e2; color: #991b1b; }
    .status-no-show { background-color: #fed7aa; color: #92400e; }
    .conflict-badge {
      display: inline-block;
      background-color: #fee2e2;
      color: #991b1b;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      margin-left: 5px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
      padding: 15px;
      background-color: #f1f5f9;
      border-radius: 8px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
    }
    .stat-label {
      font-size: 11px;
      color: #64748b;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="period">
      ${format(startDate, "dd 'de' MMMM", { locale: ptBR })} - ${format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
    </div>
  </div>

  ${this.generateStatsHTML(appointments)}

  ${Object.entries(appointmentsByDate).map(([date, apps]) => `
    <div class="date-section">
      <div class="date-header">
        ${format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
      </div>
      ${apps.map(app => this.generateAppointmentHTML(app, patients, therapists)).join('')}
    </div>
  `).join('')}

  <div class="footer">
    <p>Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
    <p>FisioFlow - Sistema de Gestão para Clínicas de Fisioterapia</p>
  </div>
</body>
</html>
    `;

    return html;
  },

  /**
   * Gera HTML de estatísticas
   */
  generateStatsHTML(appointments: EnrichedAppointment[]): string {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const conflicts = appointments.filter(a => a.hasConflict).length;

    return `
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${total}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${scheduled}</div>
          <div class="stat-label">Agendados</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${completed}</div>
          <div class="stat-label">Concluídos</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${conflicts}</div>
          <div class="stat-label">Conflitos</div>
        </div>
      </div>
    `;
  },

  /**
   * Gera HTML de um agendamento
   */
  generateAppointmentHTML(appointment: EnrichedAppointment, patients: Patient[], therapists: Therapist[]): string {
    const therapist = therapists.find(t => t.id === appointment.therapistId);
    const statusClass = `status-${appointment.status.toLowerCase()}`;

    return `
      <div class="appointment">
        <div class="appointment-header">
          <span class="patient-name">${appointment.patientName}</span>
          <span class="time">
            ${format(appointment.startTime, 'HH:mm', { locale: ptBR })} - ${format(appointment.endTime, 'HH:mm', { locale: ptBR })}
          </span>
        </div>
        <div class="details">
          <span class="therapist">${therapist?.name || 'N/A'}</span>
          <span class="status ${statusClass}">${appointment.status}</span>
          ${appointment.hasConflict ? '<span class="conflict-badge">⚠️ Conflito</span>' : ''}
        </div>
        ${appointment.observations ? `<div class="details" style="margin-top: 8px; font-style: italic;">${appointment.observations}</div>` : ''}
      </div>
    `;
  },

  /**
   * Agrupa agendamentos por data
   */
  groupAppointmentsByDate(appointments: EnrichedAppointment[]): Record<string, EnrichedAppointment[]> {
    const grouped: Record<string, EnrichedAppointment[]> = {};

    appointments.forEach(appointment => {
      const dateKey = format(appointment.startTime, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });

    // Ordenar agendamentos por horário dentro de cada data
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });

    return grouped;
  },

  /**
   * Exporta para CSV
   */
  async exportToCSV(options: ExportOptions): Promise<void> {
    const { appointments, patients, therapists } = options;

    const headers = ['Data', 'Hora Início', 'Hora Fim', 'Paciente', 'Terapeuta', 'Tipo', 'Status', 'Valor', 'Observações'];
    
    const rows = appointments.map(appointment => {
      const therapist = therapists.find(t => t.id === appointment.therapistId);
      
      return [
        format(appointment.startTime, 'dd/MM/yyyy', { locale: ptBR }),
        format(appointment.startTime, 'HH:mm', { locale: ptBR }),
        format(appointment.endTime, 'HH:mm', { locale: ptBR }),
        `"${appointment.patientName}"`,
        `"${therapist?.name || 'N/A'}"`,
        `"${appointment.type}"`,
        `"${appointment.status}"`,
        appointment.value.toFixed(2),
        `"${appointment.observations || ''}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agenda_${format(new Date(), 'yyyy-MM-dd', { locale: ptBR })}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
};

