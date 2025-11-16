import { createClient } from '@supabase/supabase-js';
import { ExtractionResult, ExtractorConfig } from '../types';

export class DataExtractor {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async extractPatients(lastExtraction?: Date): Promise<ExtractionResult> {
    try {
      let query = this.supabase
        .from('patients')
        .select(`
          id,
          name,
          email,
          phone,
          birth_date,
          gender,
          address,
          created_at,
          updated_at,
          status
        `);

      if (lastExtraction) {
        query = query.gt('updated_at', lastExtraction.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        table: 'patients',
        recordsExtracted: data?.length || 0,
        lastExtraction: new Date(),
        status: 'success',
        data: data || []
      };
    } catch (error) {
      return {
        table: 'patients',
        recordsExtracted: 0,
        lastExtraction: new Date(),
        status: 'error',
        data: []
      };
    }
  }

  async extractAppointments(lastExtraction?: Date): Promise<ExtractionResult> {
    try {
      let query = this.supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          therapist_id,
          appointment_date,
          start_time,
          end_time,
          status,
          type,
          notes,
          created_at,
          updated_at,
          cancellation_reason,
          no_show,
          rescheduled_from
        `);

      if (lastExtraction) {
        query = query.gt('updated_at', lastExtraction.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        table: 'appointments',
        recordsExtracted: data?.length || 0,
        lastExtraction: new Date(),
        status: 'success',
        data: data || []
      };
    } catch (error) {
      return {
        table: 'appointments',
        recordsExtracted: 0,
        lastExtraction: new Date(),
        status: 'error',
        data: []
      };
    }
  }

  async extractFinancialTransactions(lastExtraction?: Date): Promise<ExtractionResult> {
    try {
      let query = this.supabase
        .from('financial_transactions')
        .select(`
          id,
          patient_id,
          appointment_id,
          amount,
          transaction_type,
          payment_method,
          transaction_date,
          status,
          description,
          created_at,
          updated_at,
          discount_amount,
          tax_amount
        `);

      if (lastExtraction) {
        query = query.gt('updated_at', lastExtraction.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        table: 'financial_transactions',
        recordsExtracted: data?.length || 0,
        lastExtraction: new Date(),
        status: 'success',
        data: data || []
      };
    } catch (error) {
      return {
        table: 'financial_transactions',
        recordsExtracted: 0,
        lastExtraction: new Date(),
        status: 'error',
        data: []
      };
    }
  }

  async extractTreatmentSessions(lastExtraction?: Date): Promise<ExtractionResult> {
    try {
      let query = this.supabase
        .from('treatment_sessions')
        .select(`
          id,
          patient_id,
          therapist_id,
          appointment_id,
          session_date,
          duration_minutes,
          treatment_type,
          pre_session_pain_level,
          post_session_pain_level,
          session_notes,
          exercises_performed,
          homework_assigned,
          patient_satisfaction,
          therapist_notes,
          created_at,
          updated_at
        `);

      if (lastExtraction) {
        query = query.gt('updated_at', lastExtraction.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        table: 'treatment_sessions',
        recordsExtracted: data?.length || 0,
        lastExtraction: new Date(),
        status: 'success',
        data: data || []
      };
    } catch (error) {
      return {
        table: 'treatment_sessions',
        recordsExtracted: 0,
        lastExtraction: new Date(),
        status: 'error',
        data: []
      };
    }
  }

  async extractTherapists(lastExtraction?: Date): Promise<ExtractionResult> {
    try {
      let query = this.supabase
        .from('therapists')
        .select(`
          id,
          name,
          email,
          specialization,
          license_number,
          experience_years,
          created_at,
          updated_at,
          status,
          hourly_rate
        `);

      if (lastExtraction) {
        query = query.gt('updated_at', lastExtraction.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        table: 'therapists',
        recordsExtracted: data?.length || 0,
        lastExtraction: new Date(),
        status: 'success',
        data: data || []
      };
    } catch (error) {
      return {
        table: 'therapists',
        recordsExtracted: 0,
        lastExtraction: new Date(),
        status: 'error',
        data: []
      };
    }
  }

  async extractPatientEngagement(lastExtraction?: Date): Promise<ExtractionResult> {
    try {
      let query = this.supabase
        .from('patient_engagement')
        .select(`
          id,
          patient_id,
          engagement_date,
          engagement_type,
          channel,
          content_viewed,
          time_spent_minutes,
          interaction_score,
          created_at,
          updated_at
        `);

      if (lastExtraction) {
        query = query.gt('updated_at', lastExtraction.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        table: 'patient_engagement',
        recordsExtracted: data?.length || 0,
        lastExtraction: new Date(),
        status: 'success',
        data: data || []
      };
    } catch (error) {
      return {
        table: 'patient_engagement',
        recordsExtracted: 0,
        lastExtraction: new Date(),
        status: 'error',
        data: []
      };
    }
  }

  async extractAllTables(config: ExtractorConfig[], lastExtractionMap: Record<string, Date> = {}): Promise<ExtractionResult[]> {
    const results: ExtractionResult[] = [];

    for (const extractorConfig of config) {
      const lastExtraction = lastExtractionMap[extractorConfig.name];
      let result: ExtractionResult;

      switch (extractorConfig.name) {
        case 'patients':
          result = await this.extractPatients(lastExtraction);
          break;
        case 'appointments':
          result = await this.extractAppointments(lastExtraction);
          break;
        case 'financial_transactions':
          result = await this.extractFinancialTransactions(lastExtraction);
          break;
        case 'treatment_sessions':
          result = await this.extractTreatmentSessions(lastExtraction);
          break;
        case 'therapists':
          result = await this.extractTherapists(lastExtraction);
          break;
        case 'patient_engagement':
          result = await this.extractPatientEngagement(lastExtraction);
          break;
        default:
          result = {
            table: extractorConfig.name,
            recordsExtracted: 0,
            lastExtraction: new Date(),
            status: 'error',
            data: []
          };
      }

      results.push(result);
    }

    return results;
  }

  async getTableRowCount(tableName: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return count || 0;
    } catch (error) {
      return 0;
    }
  }

  async validateExtractionIntegrity(tableName: string, expectedCount: number): Promise<boolean> {
    try {
      const actualCount = await this.getTableRowCount(tableName);
      return actualCount === expectedCount;
    } catch (error) {
      return false;
    }
  }
}