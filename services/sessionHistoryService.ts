/**
 * Session History Service
 * Serviço para gerenciar histórico de sessões e ações relacionadas
 */

import { supabase } from '../lib/supabase';
import { SoapNote, Appointment } from '../types';

export interface SessionHistory {
  id: string;
  patientId: string;
  appointmentId: string;
  sessionNumber: number;
  date: string;
  therapistId: string;
  duration: number; // em minutos
  status: 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  soapNoteId?: string;
  attachments: SessionAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionAttachment {
  id: string;
  sessionId: string;
  name: string;
  url: string;
  type: 'photo' | 'document' | 'video' | 'audio';
  size: number;
  uploadedAt: string;
}

export interface SessionReport {
  id: string;
  sessionId: string;
  type: 'progress' | 'assessment' | 'treatment' | 'summary';
  title: string;
  content: string;
  generatedBy: 'therapist' | 'ai' | 'system';
  createdAt: string;
}

class SessionHistoryService {
  /**
   * Buscar histórico de sessões de um paciente
   */
  async getPatientSessionHistory(
    patientId: string,
    limit: number = 20
  ): Promise<SessionHistory[]> {
    const { data, error } = await supabase
      .from('session_history')
      .select(`
        *,
        attachments:session_attachments(*)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar sessão específica por ID
   */
  async getSessionById(sessionId: string): Promise<SessionHistory | null> {
    const { data, error } = await supabase
      .from('session_history')
      .select(`
        *,
        attachments:session_attachments(*),
        soap_note:soap_notes(*)
      `)
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Repetir sessão baseada em uma sessão anterior
   */
  async repeatSession(
    originalSessionId: string,
    newAppointmentData: Partial<Appointment>
  ): Promise<SessionHistory> {
    const originalSession = await this.getSessionById(originalSessionId);
    if (!originalSession) {
      throw new Error('Sessão original não encontrada');
    }

    // Criar nova sessão baseada na anterior
    const newSession: Partial<SessionHistory> = {
      patientId: originalSession.patientId,
      appointmentId: newAppointmentData.id!,
      sessionNumber: originalSession.sessionNumber + 1,
      date: new Date().toISOString(),
      therapistId: originalSession.therapistId,
      duration: 0,
      status: 'completed',
      notes: `Sessão repetida baseada na sessão #${originalSession.sessionNumber}`,
      attachments: []
    };

    const { data, error } = await supabase
      .from('session_history')
      .insert(newSession)
      .select()
      .single();

    if (error) throw error;

    // Copiar anexos da sessão original se solicitado
    if (originalSession.attachments.length > 0) {
      await this.copySessionAttachments(originalSessionId, data.id);
    }

    return data;
  }

  /**
   * Visualizar detalhes completos de uma sessão
   */
  async getSessionDetails(sessionId: string): Promise<{
    session: SessionHistory;
    soapNote?: SoapNote;
    reports: SessionReport[];
    attachments: SessionAttachment[];
  }> {
    const session = await this.getSessionById(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    // Buscar relatórios relacionados
    const { data: reports, error: reportsError } = await supabase
      .from('session_reports')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (reportsError) throw reportsError;

    // Buscar nota SOAP se existir
    let soapNote: SoapNote | undefined;
    if (session.soapNoteId) {
      const { data: soapData, error: soapError } = await supabase
        .from('soap_notes')
        .select('*')
        .eq('id', session.soapNoteId)
        .single();

      if (!soapError) soapNote = soapData;
    }

    return {
      session,
      soapNote,
      reports: reports || [],
      attachments: session.attachments || []
    };
  }

  /**
   * Adicionar foto à sessão
   */
  async addSessionPhoto(
    sessionId: string,
    photoData: {
      name: string;
      url: string;
      size: number;
    }
  ): Promise<SessionAttachment> {
    const attachment: Partial<SessionAttachment> = {
      sessionId,
      name: photoData.name,
      url: photoData.url,
      type: 'photo',
      size: photoData.size,
      uploadedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('session_attachments')
      .insert(attachment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Anexar documento à sessão
   */
  async attachSessionDocument(
    sessionId: string,
    documentData: {
      name: string;
      url: string;
      size: number;
      type: 'document' | 'video' | 'audio';
    }
  ): Promise<SessionAttachment> {
    const attachment: Partial<SessionAttachment> = {
      sessionId,
      name: documentData.name,
      url: documentData.url,
      type: documentData.type,
      size: documentData.size,
      uploadedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('session_attachments')
      .insert(attachment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Gerar relatório da sessão
   */
  async generateSessionReport(
    sessionId: string,
    reportData: {
      type: 'progress' | 'assessment' | 'treatment' | 'summary';
      title: string;
      content: string;
      generatedBy: 'therapist' | 'ai' | 'system';
    }
  ): Promise<SessionReport> {
    const report: Partial<SessionReport> = {
      sessionId,
      ...reportData,
      createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('session_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar histórico completo do paciente
   */
  async getCompletePatientHistory(patientId: string): Promise<{
    sessions: SessionHistory[];
    totalSessions: number;
    averageDuration: number;
    lastSessionDate?: string;
    progressSummary: string;
  }> {
    const sessions = await this.getPatientSessionHistory(patientId, 100);
    
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const averageDuration = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length
      : 0;
    
    const lastSessionDate = sessions.length > 0 ? sessions[0].date : undefined;
    
    // Gerar resumo de progresso baseado nas sessões
    const progressSummary = this.generateProgressSummary(sessions);

    return {
      sessions,
      totalSessions,
      averageDuration,
      lastSessionDate,
      progressSummary
    };
  }

  /**
   * Copiar anexos de uma sessão para outra
   */
  private async copySessionAttachments(
    originalSessionId: string,
    newSessionId: string
  ): Promise<void> {
    const { data: originalAttachments, error: fetchError } = await supabase
      .from('session_attachments')
      .select('*')
      .eq('session_id', originalSessionId);

    if (fetchError) throw fetchError;

    if (originalAttachments && originalAttachments.length > 0) {
      const newAttachments = originalAttachments.map(att => ({
        sessionId: newSessionId,
        name: `Cópia - ${att.name}`,
        url: att.url,
        type: att.type,
        size: att.size,
        uploadedAt: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('session_attachments')
        .insert(newAttachments);

      if (insertError) throw insertError;
    }
  }

  /**
   * Gerar resumo de progresso baseado nas sessões
   */
  private generateProgressSummary(sessions: SessionHistory[]): string {
    if (sessions.length === 0) {
      return 'Nenhuma sessão registrada ainda.';
    }

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageDuration = completedSessions.length > 0 
      ? totalDuration / completedSessions.length 
      : 0;

    const firstSession = sessions[sessions.length - 1];
    const lastSession = sessions[0];

    return `
      ${completedSessions.length} sessões concluídas de ${sessions.length} totais.
      Duração média: ${Math.round(averageDuration)} minutos.
      Período de tratamento: ${new Date(firstSession.date).toLocaleDateString('pt-BR')} a ${new Date(lastSession.date).toLocaleDateString('pt-BR')}.
    `.trim();
  }

  /**
   * Deletar anexo de sessão
   */
  async deleteSessionAttachment(attachmentId: string): Promise<void> {
    const { error } = await supabase
      .from('session_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) throw error;
  }

  /**
   * Atualizar sessão
   */
  async updateSession(
    sessionId: string,
    updates: Partial<SessionHistory>
  ): Promise<SessionHistory> {
    const { data, error } = await supabase
      .from('session_history')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const sessionHistoryService = new SessionHistoryService();
