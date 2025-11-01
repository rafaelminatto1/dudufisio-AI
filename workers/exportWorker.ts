/**
 * Web Worker para processamento de exports pesados
 * Evita travar a UI durante exports grandes
 */

import { EnrichedAppointment, Therapist } from '../types';

interface ExportMessage {
  type: 'export-csv' | 'export-excel' | 'export-json';
  data: {
    appointments: EnrichedAppointment[];
    therapists?: Therapist[];
    filename?: string;
  };
}

interface ExportProgress {
  type: 'progress';
  progress: number;
  total: number;
  message: string;
}

interface ExportComplete {
  type: 'complete';
  result: string | Blob;
  filename: string;
  mimeType: string;
}

self.onmessage = async (e: MessageEvent<ExportMessage>) => {
  const { type, data } = e.message;

  try {
    switch (type) {
      case 'export-csv':
        await exportToCSV(data.appointments, data.filename);
        break;
      case 'export-excel':
        await exportToExcel(data.appointments, data.therapists || [], data.filename);
        break;
      case 'export-json':
        await exportToJSON(data.appointments, data.filename);
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

async function exportToCSV(appointments: EnrichedAppointment[], filename?: string) {
  const total = appointments.length;
  let processed = 0;

  // Progress update
  const updateProgress = (message: string) => {
    self.postMessage({
      type: 'progress',
      progress: processed,
      total,
      message
    } as ExportProgress);
  };

  updateProgress('Preparando cabeçalhos...');

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

  updateProgress('Processando agendamentos...');

  const rows = appointments.map((apt, index) => {
    processed = index + 1;
    if (processed % 100 === 0) {
      updateProgress(`Processando ${processed}/${total}...`);
    }

    const date = new Date(apt.startTime);
    const startTime = new Date(apt.startTime);
    const endTime = new Date(apt.endTime);

    return [
      formatDate(date),
      formatTime(startTime),
      formatTime(endTime),
      apt.patientName,
      apt.therapistName || '',
      apt.type,
      apt.status,
      apt.value.toString(),
      apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
      apt.notes || ''
    ];
  });

  updateProgress('Gerando arquivo CSV...');

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  self.postMessage({
    type: 'complete',
    result: blob,
    filename: filename || `agenda_${formatDate(new Date())}.csv`,
    mimeType: 'text/csv;charset=utf-8;'
  } as ExportComplete);
}

async function exportToExcel(appointments: EnrichedAppointment[], therapists: Therapist[], filename?: string) {
  const BOM = '\uFEFF';
  const total = appointments.length;
  let processed = 0;

  const updateProgress = (message: string) => {
    self.postMessage({
      type: 'progress',
      progress: processed,
      total,
      message
    } as ExportProgress);
  };

  updateProgress('Preparando formato Excel...');

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

  const rows = appointments.map((apt, index) => {
    processed = index + 1;
    if (processed % 50 === 0) {
      updateProgress(`Processando ${processed}/${total}...`);
    }

    const therapist = therapists.find(t => t.id === apt.therapistId);
    const duration = (new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()) / 60000;

    return [
      formatDate(new Date(apt.startTime)),
      getDayOfWeek(new Date(apt.startTime)),
      formatTime(new Date(apt.startTime)),
      formatTime(new Date(apt.endTime)),
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

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  self.postMessage({
    type: 'complete',
    result: blob,
    filename: filename || `agenda_excel_${formatDate(new Date())}.csv`,
    mimeType: 'text/csv;charset=utf-8;'
  } as ExportComplete);
}

async function exportToJSON(appointments: EnrichedAppointment[], filename?: string) {
  const total = appointments.length;
  
  self.postMessage({
    type: 'progress',
    progress: 0,
    total,
    message: 'Estruturando dados JSON...'
  } as ExportProgress);

  const data = {
    exportedAt: new Date().toISOString(),
    totalAppointments: appointments.length,
    dateRange: {
      start: appointments.length > 0 ? formatDate(new Date(appointments[0].startTime)) : null,
      end: appointments.length > 0 ? formatDate(new Date(appointments[appointments.length - 1].startTime)) : null
    },
    appointments: appointments.map((apt, index) => {
      if (index % 100 === 0) {
        self.postMessage({
          type: 'progress',
          progress: index,
          total,
          message: `Processando ${index}/${total}...`
        } as ExportProgress);
      }

      return {
        id: apt.id,
        date: formatDate(new Date(apt.startTime)),
        startTime: formatTime(new Date(apt.startTime)),
        endTime: formatTime(new Date(apt.endTime)),
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
      };
    })
  };

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });

  self.postMessage({
    type: 'complete',
    result: blob,
    filename: filename || `agenda_${formatDate(new Date())}.json`,
    mimeType: 'application/json'
  } as ExportComplete);
}

// Helper functions
function formatDate(date: Date): string {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatTime(date: Date): string {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getDayOfWeek(date: Date): string {
  const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  return days[new Date(date).getDay()];
}

