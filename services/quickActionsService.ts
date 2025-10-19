/**
 * Quick Actions Service
 * Serviço para gerenciar ações rápidas da sessão de atendimento
 */

import { supabase } from '../lib/supabaseClient';

export interface QuickActionPhoto {
  id: string;
  sessionId: string;
  patientId: string;
  name: string;
  url: string;
  description?: string;
  category: 'before' | 'during' | 'after' | 'exercise' | 'assessment' | 'progress';
  uploadedAt: string;
  uploadedBy: string;
}

export interface QuickActionDocument {
  id: string;
  sessionId: string;
  patientId: string;
  name: string;
  url: string;
  type: 'prescription' | 'exam' | 'report' | 'protocol' | 'exercise_guide' | 'other';
  size: number;
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface QuickActionReport {
  id: string;
  sessionId: string;
  patientId: string;
  title: string;
  type: 'progress' | 'assessment' | 'treatment_summary' | 'exercise_progress' | 'pain_assessment';
  content: string;
  generatedAt: string;
  generatedBy: 'therapist' | 'ai' | 'system';
  isAutomated: boolean;
}

export interface CompleteHistoryEntry {
  id: string;
  patientId: string;
  type: 'session' | 'appointment' | 'note' | 'assessment' | 'exercise' | 'communication';
  title: string;
  description: string;
  date: string;
  relatedId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

class QuickActionsService {
  /**
   * Adicionar foto à sessão
   */
  async addPhoto(
    sessionId: string,
    patientId: string,
    photoData: {
      name: string;
      url: string;
      description?: string;
      category: QuickActionPhoto['category'];
    },
    uploadedBy: string
  ): Promise<QuickActionPhoto> {
    const photo: Partial<QuickActionPhoto> = {
      sessionId,
      patientId,
      name: photoData.name,
      url: photoData.url,
      description: photoData.description,
      category: photoData.category,
      uploadedAt: new Date().toISOString(),
      uploadedBy
    };

    const { data, error } = await supabase
      .from('quick_action_photos')
      .insert(photo)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Anexar documento à sessão
   */
  async attachDocument(
    sessionId: string,
    patientId: string,
    documentData: {
      name: string;
      url: string;
      size: number;
      type: QuickActionDocument['type'];
      description?: string;
    },
    uploadedBy: string
  ): Promise<QuickActionDocument> {
    const document: Partial<QuickActionDocument> = {
      sessionId,
      patientId,
      name: documentData.name,
      url: documentData.url,
      size: documentData.size,
      type: documentData.type,
      description: documentData.description,
      uploadedAt: new Date().toISOString(),
      uploadedBy
    };

    const { data, error } = await supabase
      .from('quick_action_documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar relatórios da sessão
   */
  async getSessionReports(sessionId: string): Promise<QuickActionReport[]> {
    const { data, error } = await supabase
      .from('quick_action_reports')
      .select('*')
      .eq('session_id', sessionId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Gerar relatório automático
   */
  async generateReport(
    sessionId: string,
    patientId: string,
    reportData: {
      type: QuickActionReport['type'];
      title: string;
      content: string;
      isAutomated?: boolean;
    },
    generatedBy: string
  ): Promise<QuickActionReport> {
    const report: Partial<QuickActionReport> = {
      sessionId,
      patientId,
      type: reportData.type,
      title: reportData.title,
      content: reportData.content,
      generatedAt: new Date().toISOString(),
      generatedBy: generatedBy as 'therapist' | 'ai' | 'system',
      isAutomated: reportData.isAutomated || false
    };

    const { data, error } = await supabase
      .from('quick_action_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar histórico completo do paciente
   */
  async getCompleteHistory(patientId: string): Promise<CompleteHistoryEntry[]> {
    // Buscar sessões
    const { data: sessions, error: sessionsError } = await supabase
      .from('session_history')
      .select('id, date, notes, session_number')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (sessionsError) throw sessionsError;

    // Buscar agendamentos
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, start_time, type, notes, status')
      .eq('patient_id', patientId)
      .order('start_time', { ascending: false });

    if (appointmentsError) throw appointmentsError;

    // Buscar notas SOAP
    const { data: soapNotes, error: soapError } = await supabase
      .from('soap_notes')
      .select('id, appointment_id, created_at, subjective, objective')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (soapError) throw soapError;

    // Buscar avaliações
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('id, type, date, notes')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (assessmentsError) throw assessmentsError;

    // Buscar exercícios prescritos
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercise_prescriptions')
      .select('id, exercise_name, prescribed_at, notes')
      .eq('patient_id', patientId)
      .order('prescribed_at', { ascending: false });

    if (exercisesError) throw exercisesError;

    // Buscar comunicações
    const { data: communications, error: commError } = await supabase
      .from('communication_logs')
      .select('id, date, type, notes, actor')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (commError) throw commError;

    // Consolidar histórico
    const history: CompleteHistoryEntry[] = [];

    // Adicionar sessões
    sessions?.forEach(session => {
      history.push({
        id: `session-${session.id}`,
        patientId,
        type: 'session',
        title: `Sessão #${session.session_number}`,
        description: session.notes || 'Sessão de fisioterapia',
        date: session.date,
        relatedId: session.id,
        createdAt: session.date
      });
    });

    // Adicionar agendamentos
    appointments?.forEach(appointment => {
      history.push({
        id: `appointment-${appointment.id}`,
        patientId,
        type: 'appointment',
        title: `${appointment.type} - ${appointment.status}`,
        description: appointment.notes || 'Agendamento',
        date: appointment.start_time,
        relatedId: appointment.id,
        createdAt: appointment.start_time
      });
    });

    // Adicionar notas SOAP
    soapNotes?.forEach(note => {
      const summary = note.subjective?.substring(0, 100) || note.objective?.substring(0, 100) || 'Nota SOAP';
      history.push({
        id: `soap-${note.id}`,
        patientId,
        type: 'note',
        title: 'Nota SOAP',
        description: summary,
        date: note.created_at,
        relatedId: note.id,
        createdAt: note.created_at
      });
    });

    // Adicionar avaliações
    assessments?.forEach(assessment => {
      history.push({
        id: `assessment-${assessment.id}`,
        patientId,
        type: 'assessment',
        title: `Avaliação - ${assessment.type}`,
        description: assessment.notes || 'Avaliação clínica',
        date: assessment.date,
        relatedId: assessment.id,
        createdAt: assessment.date
      });
    });

    // Adicionar exercícios
    exercises?.forEach(exercise => {
      history.push({
        id: `exercise-${exercise.id}`,
        patientId,
        type: 'exercise',
        title: `Exercício - ${exercise.exercise_name}`,
        description: exercise.notes || 'Exercício prescrito',
        date: exercise.prescribed_at,
        relatedId: exercise.id,
        createdAt: exercise.prescribed_at
      });
    });

    // Adicionar comunicações
    communications?.forEach(comm => {
      history.push({
        id: `comm-${comm.id}`,
        patientId,
        type: 'communication',
        title: `Contato - ${comm.type}`,
        description: `${comm.actor}: ${comm.notes}`,
        date: comm.date,
        relatedId: comm.id,
        createdAt: comm.date
      });
    });

    // Ordenar por data
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Buscar fotos da sessão
   */
  async getSessionPhotos(sessionId: string): Promise<QuickActionPhoto[]> {
    const { data, error } = await supabase
      .from('quick_action_photos')
      .select('*')
      .eq('session_id', sessionId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar documentos da sessão
   */
  async getSessionDocuments(sessionId: string): Promise<QuickActionDocument[]> {
    const { data, error } = await supabase
      .from('quick_action_documents')
      .select('*')
      .eq('session_id', sessionId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Deletar foto
   */
  async deletePhoto(photoId: string): Promise<void> {
    const { error } = await supabase
      .from('quick_action_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;
  }

  /**
   * Deletar documento
   */
  async deleteDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('quick_action_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  }

  /**
   * Gerar relatório de progresso automático
   */
  async generateProgressReport(
    sessionId: string,
    patientId: string,
    sessionData: {
      duration: number;
      painScale?: number;
      exercises: string[];
      notes: string;
    }
  ): Promise<QuickActionReport> {
    const content = `
      ## Relatório de Progresso - Sessão ${new Date().toLocaleDateString('pt-BR')}
      
      **Duração da Sessão:** ${sessionData.duration} minutos
      ${sessionData.painScale ? `**Escala de Dor:** ${sessionData.painScale}/10` : ''}
      
      **Exercícios Realizados:**
      ${sessionData.exercises.map(ex => `- ${ex}`).join('\n')}
      
      **Observações:**
      ${sessionData.notes}
      
      **Próximos Passos:**
      - Continuar com protocolo estabelecido
      - Monitorar evolução da dor
      - Próxima sessão agendada conforme cronograma
    `.trim();

    return this.generateReport(
      sessionId,
      patientId,
      {
        type: 'progress',
        title: 'Relatório de Progresso Automático',
        content,
        isAutomated: true
      },
      'system'
    );
  }
}

export const quickActionsService = new QuickActionsService();
