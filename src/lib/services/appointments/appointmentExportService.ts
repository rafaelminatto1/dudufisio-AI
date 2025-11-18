import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Therapist = Database['public']['Tables']['therapists']['Row'];

interface ExportOptions {
  appointments: Appointment[];
  patients: Patient[];
  therapists: Therapist[];
  startDate: Date;
  endDate: Date;
  title?: string;
}

interface EnrichedAppointment extends Appointment {
  patientName?: string;
  therapistName?: string;
}

/**
 * Service para exportação de agendamentos
 * Adaptado para Next.js App Router
 */
export class AppointmentExportService {
  /**
   * Exporta agenda em formato CSV
   */
  static async exportToCSV(options: ExportOptions): Promise<{ data: string | null; error: any }> {
    try {
      const { appointments, patients, therapists } = options;
      
      const headers = [
        'Data',
        'Hora Início',
        'Hora Fim',
        'Paciente',
        'Terapeuta',
        'Status',
        'Observações'
      ];
      
      const enriched = this.enrichAppointments(appointments, patients, therapists);
      
      const rows = enriched.map(appointment => {
        const startTime = new Date(appointment.start_time);
        const endTime = new Date(appointment.end_time);
        
        return [
          format(startTime, 'dd/MM/yyyy', { locale: ptBR }),
          format(startTime, 'HH:mm', { locale: ptBR }),
          format(endTime, 'HH:mm', { locale: ptBR }),
          `"${appointment.patientName || 'N/A'}"`,
          `"${appointment.therapistName || 'N/A'}"`,
          `"${appointment.status}"`,
          `"${''}"` // Observações vazias por enquanto
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Adicionar BOM para Excel reconhecer UTF-8
      const csvWithBOM = '\ufeff' + csvContent;

      return { data: csvWithBOM, error: null };
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return { data: null, error };
    }
  }

  /**
   * Gera HTML para impressão/PDF
   */
  static generatePDFHTML(options: ExportOptions): string {
    const { appointments, patients, therapists, startDate, endDate, title = 'Agenda' } = options;
    const enriched = this.enrichAppointments(appointments, patients, therapists);
    const appointmentsByDate = this.groupAppointmentsByDate(enriched);

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
    .status-agendado { background-color: #dbeafe; color: #1e40af; }
    .status-concluido { background-color: #d1fae5; color: #065f46; }
    .status-cancelado { background-color: #fee2e2; color: #991b1b; }
    .status-falta { background-color: #fed7aa; color: #92400e; }
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

  ${this.generateStatsHTML(enriched)}

  ${Object.entries(appointmentsByDate).map(([date, apps]) => `
    <div class="date-section">
      <div class="date-header">
        ${format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
      </div>
      ${apps.map(app => this.generateAppointmentHTML(app)).join('')}
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
  }

  /**
   * Enriquece agendamentos com dados de pacientes e terapeutas
   */
  private static enrichAppointments(
    appointments: Appointment[],
    patients: Patient[],
    therapists: Therapist[]
  ): EnrichedAppointment[] {
    return appointments.map(appointment => {
      const patient = patients.find(p => p.id === appointment.patient_id);
      const therapist = therapists.find(t => t.id === appointment.therapist_id);
      
      return {
        ...appointment,
        patientName: patient?.full_name || 'N/A',
        therapistName: therapist?.id || 'N/A', // Terapeuta precisa de join com users
      };
    });
  }

  /**
   * Agrupa agendamentos por data
   */
  private static groupAppointmentsByDate(
    appointments: EnrichedAppointment[]
  ): Record<string, EnrichedAppointment[]> {
    const grouped: Record<string, EnrichedAppointment[]> = {};

    appointments.forEach(appointment => {
      const startTime = new Date(appointment.start_time);
      const dateKey = format(startTime, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });

    // Ordenar agendamentos por horário dentro de cada data
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    });

    return grouped;
  }

  /**
   * Gera HTML de estatísticas
   */
  private static generateStatsHTML(appointments: EnrichedAppointment[]): string {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'concluido').length;
    const scheduled = appointments.filter(a => a.status === 'agendado').length;
    const canceled = appointments.filter(a => a.status === 'cancelado').length;

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
          <div class="stat-value">${canceled}</div>
          <div class="stat-label">Cancelados</div>
        </div>
      </div>
    `;
  }

  /**
   * Gera HTML de um agendamento
   */
  private static generateAppointmentHTML(appointment: EnrichedAppointment): string {
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);
    const statusClass = `status-${appointment.status?.toLowerCase() || 'desconhecido'}`;

    return `
      <div class="appointment">
        <div class="appointment-header">
          <span class="patient-name">${appointment.patientName || 'N/A'}</span>
          <span class="time">
            ${format(startTime, 'HH:mm', { locale: ptBR })} - ${format(endTime, 'HH:mm', { locale: ptBR })}
          </span>
        </div>
        <div class="details">
          <span class="therapist">${appointment.therapistName || 'N/A'}</span>
          <span class="status ${statusClass}">${appointment.status || 'Desconhecido'}</span>
        </div>
      </div>
    `;
  }
}

