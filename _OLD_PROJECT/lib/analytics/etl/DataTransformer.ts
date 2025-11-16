import { TransformationResult, TransformationRule } from '../types';

export class DataTransformer {

  transformPatientData(rawData: any[]): TransformationResult {
    try {
      const transformedData = rawData.map(patient => ({
        patient_id: patient.id,
        name: this.cleanString(patient.name),
        email: this.normalizeEmail(patient.email),
        phone: this.normalizePhone(patient.phone),
        age: this.calculateAge(patient.birth_date),
        age_group: this.categorizeAge(this.calculateAge(patient.birth_date)),
        gender: this.normalizeGender(patient.gender),
        address: this.cleanString(patient.address),
        registration_date: patient.created_at,
        last_update: patient.updated_at,
        status: this.normalizeStatus(patient.status),
        data_quality_score: this.calculateDataQualityScore(patient)
      }));

      return {
        recordsTransformed: transformedData.length,
        status: 'success',
        data: transformedData
      };
    } catch (error) {
      return {
        recordsTransformed: 0,
        status: 'error',
        data: []
      };
    }
  }

  transformAppointmentData(rawData: any[]): TransformationResult {
    try {
      const transformedData = rawData.map(appointment => ({
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        therapist_id: appointment.therapist_id,
        appointment_date: appointment.appointment_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        duration_minutes: this.calculateDuration(appointment.start_time, appointment.end_time),
        status: this.normalizeAppointmentStatus(appointment.status),
        type: this.normalizeAppointmentType(appointment.type),
        is_no_show: appointment.no_show || false,
        is_cancelled: appointment.status === 'cancelled',
        is_rescheduled: !!appointment.rescheduled_from,
        cancellation_reason: appointment.cancellation_reason,
        day_of_week: this.getDayOfWeek(appointment.appointment_date),
        time_slot: this.categorizeTimeSlot(appointment.start_time),
        created_at: appointment.created_at,
        updated_at: appointment.updated_at
      }));

      return {
        recordsTransformed: transformedData.length,
        status: 'success',
        data: transformedData
      };
    } catch (error) {
      return {
        recordsTransformed: 0,
        status: 'error',
        data: []
      };
    }
  }

  transformFinancialData(rawData: any[]): TransformationResult {
    try {
      const transformedData = rawData.map(transaction => ({
        transaction_id: transaction.id,
        patient_id: transaction.patient_id,
        appointment_id: transaction.appointment_id,
        gross_amount: parseFloat(transaction.amount) || 0,
        net_amount: this.calculateNetAmount(transaction.amount, transaction.discount_amount, transaction.tax_amount),
        discount_amount: parseFloat(transaction.discount_amount) || 0,
        tax_amount: parseFloat(transaction.tax_amount) || 0,
        transaction_type: this.normalizeTransactionType(transaction.transaction_type),
        payment_method: this.normalizePaymentMethod(transaction.payment_method),
        transaction_date: transaction.transaction_date,
        status: this.normalizeTransactionStatus(transaction.status),
        description: this.cleanString(transaction.description),
        is_revenue: this.isRevenueTransaction(transaction.transaction_type),
        is_refund: this.isRefundTransaction(transaction.transaction_type),
        created_at: transaction.created_at,
        updated_at: transaction.updated_at
      }));

      return {
        recordsTransformed: transformedData.length,
        status: 'success',
        data: transformedData
      };
    } catch (error) {
      return {
        recordsTransformed: 0,
        status: 'error',
        data: []
      };
    }
  }

  transformTreatmentData(rawData: any[]): TransformationResult {
    try {
      const transformedData = rawData.map(session => ({
        session_id: session.id,
        patient_id: session.patient_id,
        therapist_id: session.therapist_id,
        appointment_id: session.appointment_id,
        session_date: session.session_date,
        duration_minutes: session.duration_minutes || 60,
        treatment_type: this.normalizeTreatmentType(session.treatment_type),
        pre_pain_level: this.normalizePainLevel(session.pre_session_pain_level),
        post_pain_level: this.normalizePainLevel(session.post_session_pain_level),
        pain_improvement: this.calculatePainImprovement(
          session.pre_session_pain_level,
          session.post_session_pain_level
        ),
        session_effectiveness: this.calculateSessionEffectiveness(
          session.pre_session_pain_level,
          session.post_session_pain_level
        ),
        patient_satisfaction: this.normalizePatientSatisfaction(session.patient_satisfaction),
        exercises_count: this.countExercises(session.exercises_performed),
        has_homework: !!session.homework_assigned,
        session_notes: this.cleanString(session.session_notes),
        created_at: session.created_at,
        updated_at: session.updated_at
      }));

      return {
        recordsTransformed: transformedData.length,
        status: 'success',
        data: transformedData
      };
    } catch (error) {
      return {
        recordsTransformed: 0,
        status: 'error',
        data: []
      };
    }
  }

  transformTherapistData(rawData: any[]): TransformationResult {
    try {
      const transformedData = rawData.map(therapist => ({
        therapist_id: therapist.id,
        name: this.cleanString(therapist.name),
        email: this.normalizeEmail(therapist.email),
        specialization: this.normalizeSpecialization(therapist.specialization),
        license_number: therapist.license_number,
        experience_years: therapist.experience_years || 0,
        experience_level: this.categorizeExperience(therapist.experience_years),
        hourly_rate: parseFloat(therapist.hourly_rate) || 0,
        status: this.normalizeStatus(therapist.status),
        registration_date: therapist.created_at,
        last_update: therapist.updated_at
      }));

      return {
        recordsTransformed: transformedData.length,
        status: 'success',
        data: transformedData
      };
    } catch (error) {
      return {
        recordsTransformed: 0,
        status: 'error',
        data: []
      };
    }
  }

  transformEngagementData(rawData: any[]): TransformationResult {
    try {
      const transformedData = rawData.map(engagement => ({
        engagement_id: engagement.id,
        patient_id: engagement.patient_id,
        engagement_date: engagement.engagement_date,
        engagement_type: this.normalizeEngagementType(engagement.engagement_type),
        channel: this.normalizeChannel(engagement.channel),
        content_viewed: this.cleanString(engagement.content_viewed),
        time_spent_minutes: engagement.time_spent_minutes || 0,
        interaction_score: this.normalizeInteractionScore(engagement.interaction_score),
        engagement_level: this.categorizeEngagementLevel(engagement.interaction_score),
        created_at: engagement.created_at,
        updated_at: engagement.updated_at
      }));

      return {
        recordsTransformed: transformedData.length,
        status: 'success',
        data: transformedData
      };
    } catch (error) {
      return {
        recordsTransformed: 0,
        status: 'error',
        data: []
      };
    }
  }

  // Utility methods for data cleaning and normalization
  private cleanString(value: string): string {
    if (!value) return '';
    return value.trim().replace(/\s+/g, ' ');
  }

  private normalizeEmail(email: string): string {
    if (!email) return '';
    return email.toLowerCase().trim();
  }

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  private calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private categorizeAge(age: number): string {
    if (age < 18) return 'Criança/Adolescente';
    if (age < 30) return 'Jovem Adulto';
    if (age < 50) return 'Adulto';
    if (age < 65) return 'Meia-idade';
    return 'Idoso';
  }

  private normalizeGender(gender: string): string {
    if (!gender) return 'Não informado';
    const normalized = gender.toLowerCase();
    if (normalized.includes('m') || normalized.includes('masc')) return 'M';
    if (normalized.includes('f') || normalized.includes('fem')) return 'F';
    return 'Outro';
  }

  private normalizeStatus(status: string): string {
    if (!status) return 'unknown';
    return status.toLowerCase().replace(/\s+/g, '_');
  }

  private calculateDataQualityScore(patient: any): number {
    let score = 0;
    let maxScore = 0;

    const fields = ['name', 'email', 'phone', 'birth_date', 'gender', 'address'];
    fields.forEach(field => {
      maxScore++;
      if (patient[field] && patient[field].toString().trim().length > 0) {
        score++;
      }
    });

    return maxScore > 0 ? (score / maxScore) * 100 : 0;
  }

  private calculateDuration(startTime: string, endTime: string): number {
    if (!startTime || !endTime) return 60; // default duration
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return Math.abs((end.getTime() - start.getTime()) / (1000 * 60));
  }

  private normalizeAppointmentStatus(status: string): string {
    if (!status) return 'unknown';
    return status.toLowerCase().replace(/\s+/g, '_');
  }

  private normalizeAppointmentType(type: string): string {
    if (!type) return 'standard';
    return type.toLowerCase().replace(/\s+/g, '_');
  }

  private getDayOfWeek(date: string): string {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[new Date(date).getDay()];
  }

  private categorizeTimeSlot(time: string): string {
    if (!time) return 'unknown';
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Manhã';
    if (hour < 18) return 'Tarde';
    return 'Noite';
  }

  private calculateNetAmount(gross: string, discount: string, tax: string): number {
    const grossAmount = parseFloat(gross) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const taxAmount = parseFloat(tax) || 0;
    return grossAmount - discountAmount + taxAmount;
  }

  private normalizeTransactionType(type: string): string {
    if (!type) return 'unknown';
    return type.toLowerCase().replace(/\s+/g, '_');
  }

  private normalizePaymentMethod(method: string): string {
    if (!method) return 'unknown';
    return method.toLowerCase().replace(/\s+/g, '_');
  }

  private normalizeTransactionStatus(status: string): string {
    if (!status) return 'unknown';
    return status.toLowerCase().replace(/\s+/g, '_');
  }

  private isRevenueTransaction(type: string): boolean {
    const revenueTypes = ['payment', 'consultation_fee', 'treatment_fee'];
    return revenueTypes.includes(type?.toLowerCase());
  }

  private isRefundTransaction(type: string): boolean {
    const refundTypes = ['refund', 'chargeback'];
    return refundTypes.includes(type?.toLowerCase());
  }

  private normalizePainLevel(level: any): number {
    if (level === null || level === undefined) return 0;
    const numLevel = parseInt(level);
    return Math.max(0, Math.min(10, numLevel || 0));
  }

  private calculatePainImprovement(prePain: any, postPain: any): number {
    const pre = this.normalizePainLevel(prePain);
    const post = this.normalizePainLevel(postPain);
    return pre - post;
  }

  private calculateSessionEffectiveness(prePain: any, postPain: any): string {
    const improvement = this.calculatePainImprovement(prePain, postPain);
    if (improvement >= 3) return 'Alta';
    if (improvement >= 1) return 'Média';
    if (improvement > 0) return 'Baixa';
    return 'Nenhuma';
  }

  private normalizeTreatmentType(type: string): string {
    if (!type) return 'geral';
    return type.toLowerCase().replace(/\s+/g, '_');
  }

  private normalizePatientSatisfaction(satisfaction: any): number {
    if (satisfaction === null || satisfaction === undefined) return 0;
    const numSatisfaction = parseFloat(satisfaction);
    return Math.max(0, Math.min(10, numSatisfaction || 0));
  }

  private countExercises(exercises: string): number {
    if (!exercises) return 0;
    return exercises.split(',').filter(ex => ex.trim().length > 0).length;
  }

  private normalizeSpecialization(specialization: string): string {
    if (!specialization) return 'geral';
    return specialization.toLowerCase().replace(/\s+/g, '_');
  }

  private categorizeExperience(years: number): string {
    if (years < 2) return 'Junior';
    if (years < 5) return 'Pleno';
    if (years < 10) return 'Senior';
    return 'Especialista';
  }

  private normalizeEngagementType(type: string): string {
    if (!type) return 'unknown';
    return type.toLowerCase().replace(/\s+/g, '_');
  }

  private normalizeChannel(channel: string): string {
    if (!channel) return 'unknown';
    return channel.toLowerCase().replace(/\s+/g, '_');
  }

  private normalizeInteractionScore(score: any): number {
    if (score === null || score === undefined) return 0;
    const numScore = parseFloat(score);
    return Math.max(0, Math.min(100, numScore || 0));
  }

  private categorizeEngagementLevel(score: any): string {
    const numScore = this.normalizeInteractionScore(score);
    if (numScore >= 80) return 'Alto';
    if (numScore >= 50) return 'Médio';
    if (numScore >= 20) return 'Baixo';
    return 'Muito Baixo';
  }
}