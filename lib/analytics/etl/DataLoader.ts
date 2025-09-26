import { createClient } from '@supabase/supabase-js';
import { LoadResult, LoaderConfig } from '../types';

export class DataLoader {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async loadDimensionPatients(data: any[]): Promise<LoadResult> {
    try {
      const transformedData = data.map(patient => ({
        patient_key: this.generateSurrogateKey('patient', patient.patient_id),
        patient_id: patient.patient_id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        age_group: patient.age_group,
        gender: patient.gender,
        address: patient.address,
        data_quality_score: patient.data_quality_score,
        effective_date: new Date(),
        expiry_date: new Date('9999-12-31'),
        is_current: true,
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Handle SCD Type 2 for patient dimension
      await this.handleSlowlyChangingDimension('dim_patients', transformedData, 'patient_id');

      return {
        recordsLoaded: transformedData.length,
        status: 'success',
        targetTable: 'dim_patients'
      };
    } catch (error) {
      return {
        recordsLoaded: 0,
        status: 'error',
        targetTable: 'dim_patients'
      };
    }
  }

  async loadDimensionTherapists(data: any[]): Promise<LoadResult> {
    try {
      const transformedData = data.map(therapist => ({
        therapist_key: this.generateSurrogateKey('therapist', therapist.therapist_id),
        therapist_id: therapist.therapist_id,
        name: therapist.name,
        email: therapist.email,
        specialization: therapist.specialization,
        license_number: therapist.license_number,
        experience_years: therapist.experience_years,
        experience_level: therapist.experience_level,
        hourly_rate: therapist.hourly_rate,
        status: therapist.status,
        effective_date: new Date(),
        expiry_date: new Date('9999-12-31'),
        is_current: true,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await this.handleSlowlyChangingDimension('dim_therapists', transformedData, 'therapist_id');

      return {
        recordsLoaded: transformedData.length,
        status: 'success',
        targetTable: 'dim_therapists'
      };
    } catch (error) {
      return {
        recordsLoaded: 0,
        status: 'error',
        targetTable: 'dim_therapists'
      };
    }
  }

  async loadDimensionTreatments(data: any[]): Promise<LoadResult> {
    try {
      const treatmentTypes = [...new Set(data.map(session => session.treatment_type))];
      const transformedData = treatmentTypes.map(type => ({
        treatment_key: this.generateSurrogateKey('treatment', type),
        treatment_type: type,
        category: this.categorizeTreatmentType(type),
        avg_duration: this.calculateAvgDuration(data, type),
        avg_effectiveness: this.calculateAvgEffectiveness(data, type),
        created_at: new Date(),
        updated_at: new Date()
      }));

      const { error } = await this.supabase
        .from('dim_treatments')
        .upsert(transformedData, { onConflict: 'treatment_type' });

      if (error) throw error;

      return {
        recordsLoaded: transformedData.length,
        status: 'success',
        targetTable: 'dim_treatments'
      };
    } catch (error) {
      return {
        recordsLoaded: 0,
        status: 'error',
        targetTable: 'dim_treatments'
      };
    }
  }

  async loadFactAppointments(data: any[]): Promise<LoadResult> {
    try {
      const factData = await Promise.all(data.map(async appointment => ({
        appointment_key: this.generateSurrogateKey('appointment', appointment.appointment_id),
        patient_key: await this.lookupDimensionKey('dim_patients', 'patient_id', appointment.patient_id),
        therapist_key: await this.lookupDimensionKey('dim_therapists', 'therapist_id', appointment.therapist_id),
        date_key: this.generateDateKey(appointment.appointment_date),
        appointment_id: appointment.appointment_id,
        appointment_date: appointment.appointment_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        duration_minutes: appointment.duration_minutes,
        status: appointment.status,
        type: appointment.type,
        is_no_show: appointment.is_no_show,
        is_cancelled: appointment.is_cancelled,
        is_rescheduled: appointment.is_rescheduled,
        day_of_week: appointment.day_of_week,
        time_slot: appointment.time_slot,
        created_at: new Date(),
        updated_at: new Date()
      })));

      const { error } = await this.supabase
        .from('fact_appointments')
        .upsert(factData, { onConflict: 'appointment_id' });

      if (error) throw error;

      return {
        recordsLoaded: factData.length,
        status: 'success',
        targetTable: 'fact_appointments'
      };
    } catch (error) {
      return {
        recordsLoaded: 0,
        status: 'error',
        targetTable: 'fact_appointments'
      };
    }
  }

  async loadFactFinancialTransactions(data: any[]): Promise<LoadResult> {
    try {
      const factData = await Promise.all(data.map(async transaction => ({
        transaction_key: this.generateSurrogateKey('transaction', transaction.transaction_id),
        patient_key: await this.lookupDimensionKey('dim_patients', 'patient_id', transaction.patient_id),
        date_key: this.generateDateKey(transaction.transaction_date),
        appointment_key: transaction.appointment_id ?
          await this.lookupFactKey('fact_appointments', 'appointment_id', transaction.appointment_id) : null,
        transaction_id: transaction.transaction_id,
        transaction_date: transaction.transaction_date,
        gross_amount: transaction.gross_amount,
        net_amount: transaction.net_amount,
        discount_amount: transaction.discount_amount,
        tax_amount: transaction.tax_amount,
        transaction_type: transaction.transaction_type,
        payment_method: transaction.payment_method,
        status: transaction.status,
        is_revenue: transaction.is_revenue,
        is_refund: transaction.is_refund,
        created_at: new Date(),
        updated_at: new Date()
      })));

      const { error } = await this.supabase
        .from('fact_financial_transactions')
        .upsert(factData, { onConflict: 'transaction_id' });

      if (error) throw error;

      return {
        recordsLoaded: factData.length,
        status: 'success',
        targetTable: 'fact_financial_transactions'
      };
    } catch (error) {
      return {
        recordsLoaded: 0,
        status: 'error',
        targetTable: 'fact_financial_transactions'
      };
    }
  }

  async loadFactClinicalOutcomes(data: any[]): Promise<LoadResult> {
    try {
      const factData = await Promise.all(data.map(async session => ({
        session_key: this.generateSurrogateKey('session', session.session_id),
        patient_key: await this.lookupDimensionKey('dim_patients', 'patient_id', session.patient_id),
        therapist_key: await this.lookupDimensionKey('dim_therapists', 'therapist_id', session.therapist_id),
        treatment_key: await this.lookupDimensionKey('dim_treatments', 'treatment_type', session.treatment_type),
        date_key: this.generateDateKey(session.session_date),
        appointment_key: session.appointment_id ?
          await this.lookupFactKey('fact_appointments', 'appointment_id', session.appointment_id) : null,
        session_id: session.session_id,
        session_date: session.session_date,
        duration_minutes: session.duration_minutes,
        pre_pain_level: session.pre_pain_level,
        post_pain_level: session.post_pain_level,
        pain_improvement: session.pain_improvement,
        session_effectiveness: session.session_effectiveness,
        patient_satisfaction: session.patient_satisfaction,
        exercises_count: session.exercises_count,
        has_homework: session.has_homework,
        created_at: new Date(),
        updated_at: new Date()
      })));

      const { error } = await this.supabase
        .from('fact_clinical_outcomes')
        .upsert(factData, { onConflict: 'session_id' });

      if (error) throw error;

      return {
        recordsLoaded: factData.length,
        status: 'success',
        targetTable: 'fact_clinical_outcomes'
      };
    } catch (error) {
      return {
        recordsLoaded: 0,
        status: 'error',
        targetTable: 'fact_clinical_outcomes'
      };
    }
  }

  async loadFactPatientEngagement(data: any[]): Promise<LoadResult> {
    try {
      const factData = await Promise.all(data.map(async engagement => ({
        engagement_key: this.generateSurrogateKey('engagement', engagement.engagement_id),
        patient_key: await this.lookupDimensionKey('dim_patients', 'patient_id', engagement.patient_id),
        date_key: this.generateDateKey(engagement.engagement_date),
        engagement_id: engagement.engagement_id,
        engagement_date: engagement.engagement_date,
        engagement_type: engagement.engagement_type,
        channel: engagement.channel,
        time_spent_minutes: engagement.time_spent_minutes,
        interaction_score: engagement.interaction_score,
        engagement_level: engagement.engagement_level,
        created_at: new Date(),
        updated_at: new Date()
      })));

      const { error } = await this.supabase
        .from('fact_patient_engagement')
        .upsert(factData, { onConflict: 'engagement_id' });

      if (error) throw error;

      return {
        recordsLoaded: factData.length,
        status: 'success',
        targetTable: 'fact_patient_engagement'
      };
    } catch (error) {
      return {
        recordsLoaded: 0,
        status: 'error',
        targetTable: 'fact_patient_engagement'
      };
    }
  }

  // Utility methods
  private generateSurrogateKey(prefix: string, naturalKey: string): string {
    const hash = this.simpleHash(naturalKey.toString());
    return `${prefix}_${hash}_${Date.now()}`;
  }

  private generateDateKey(date: string): number {
    const dateObj = new Date(date);
    return parseInt(`${dateObj.getFullYear()}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getDate().toString().padStart(2, '0')}`);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }

  private async lookupDimensionKey(tableName: string, naturalKeyColumn: string, naturalKeyValue: string): Promise<string | null> {
    try {
      const keyColumn = `${tableName.replace('dim_', '')}_key`;
      const { data, error } = await this.supabase
        .from(tableName)
        .select(keyColumn)
        .eq(naturalKeyColumn, naturalKeyValue)
        .eq('is_current', true)
        .limit(1);

      if (error) throw error;
      return data?.[0]?.[keyColumn] || null;
    } catch (error) {
      return null;
    }
  }

  private async lookupFactKey(tableName: string, naturalKeyColumn: string, naturalKeyValue: string): Promise<string | null> {
    try {
      const keyColumn = `${tableName.replace('fact_', '')}_key`;
      const { data, error } = await this.supabase
        .from(tableName)
        .select(keyColumn)
        .eq(naturalKeyColumn, naturalKeyValue)
        .limit(1);

      if (error) throw error;
      return data?.[0]?.[keyColumn] || null;
    } catch (error) {
      return null;
    }
  }

  private async handleSlowlyChangingDimension(tableName: string, newData: any[], naturalKeyColumn: string): Promise<void> {
    for (const record of newData) {
      const naturalKey = record[naturalKeyColumn];

      // Check if record exists
      const { data: existing } = await this.supabase
        .from(tableName)
        .select('*')
        .eq(naturalKeyColumn, naturalKey)
        .eq('is_current', true);

      if (existing && existing.length > 0) {
        const existingRecord = existing[0];

        // Check if data has changed (excluding metadata fields)
        const hasChanged = this.hasRecordChanged(existingRecord, record);

        if (hasChanged) {
          // Mark existing record as expired
          await this.supabase
            .from(tableName)
            .update({
              is_current: false,
              expiry_date: new Date(),
              updated_at: new Date()
            })
            .eq(naturalKeyColumn, naturalKey)
            .eq('is_current', true);

          // Insert new version
          await this.supabase
            .from(tableName)
            .insert(record);
        } else {
          // Just update the updated_at timestamp
          await this.supabase
            .from(tableName)
            .update({ updated_at: new Date() })
            .eq(naturalKeyColumn, naturalKey)
            .eq('is_current', true);
        }
      } else {
        // Insert new record
        await this.supabase
          .from(tableName)
          .insert(record);
      }
    }
  }

  private hasRecordChanged(existing: any, newRecord: any): boolean {
    const fieldsToIgnore = ['created_at', 'updated_at', 'effective_date', 'expiry_date', 'is_current'];

    for (const key in newRecord) {
      if (!fieldsToIgnore.includes(key)) {
        if (existing[key] !== newRecord[key]) {
          return true;
        }
      }
    }
    return false;
  }

  private categorizeTreatmentType(type: string): string {
    const categories: Record<string, string> = {
      'massotherapy': 'Manual Therapy',
      'physiotherapy': 'Physical Therapy',
      'acupuncture': 'Alternative Medicine',
      'pilates': 'Exercise Therapy',
      'rpg': 'Postural Reeducation'
    };
    return categories[type] || 'Other';
  }

  private calculateAvgDuration(sessions: any[], treatmentType: string): number {
    const filteredSessions = sessions.filter(s => s.treatment_type === treatmentType);
    if (filteredSessions.length === 0) return 60;

    const totalDuration = filteredSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    return totalDuration / filteredSessions.length;
  }

  private calculateAvgEffectiveness(sessions: any[], treatmentType: string): number {
    const filteredSessions = sessions.filter(s => s.treatment_type === treatmentType);
    if (filteredSessions.length === 0) return 0;

    const totalImprovement = filteredSessions.reduce((sum, s) => sum + s.pain_improvement, 0);
    return totalImprovement / filteredSessions.length;
  }

  async bulkLoad(config: LoaderConfig[], dataSets: Record<string, any[]>): Promise<LoadResult[]> {
    const results: LoadResult[] = [];

    for (const loaderConfig of config) {
      const data = dataSets[loaderConfig.name];
      if (!data || data.length === 0) continue;

      let result: LoadResult;

      switch (loaderConfig.target) {
        case 'dim_patients':
          result = await this.loadDimensionPatients(data);
          break;
        case 'dim_therapists':
          result = await this.loadDimensionTherapists(data);
          break;
        case 'dim_treatments':
          result = await this.loadDimensionTreatments(data);
          break;
        case 'fact_appointments':
          result = await this.loadFactAppointments(data);
          break;
        case 'fact_financial_transactions':
          result = await this.loadFactFinancialTransactions(data);
          break;
        case 'fact_clinical_outcomes':
          result = await this.loadFactClinicalOutcomes(data);
          break;
        case 'fact_patient_engagement':
          result = await this.loadFactPatientEngagement(data);
          break;
        default:
          result = {
            recordsLoaded: 0,
            status: 'error',
            targetTable: loaderConfig.target
          };
      }

      results.push(result);
    }

    return results;
  }
}