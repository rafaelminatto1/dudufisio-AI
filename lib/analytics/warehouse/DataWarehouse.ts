/**
 * Data Warehouse implementation for FisioFlow BI system
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DateRange, DimensionTable, FactTable, DataMart } from '../types';

export class DataWarehouse {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Execute a SQL query on the data warehouse
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const { data, error } = await this.supabase.rpc('execute_sql', {
        query: sql,
        params
      });

      if (error) {
        throw new Error(`Data warehouse query error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Data warehouse query failed:', error);
      throw error;
    }
  }

  /**
   * Get dimension table schema
   */
  getDimensionTables(): DimensionTable[] {
    return [
      {
        tableName: 'dim_patients',
        primaryKey: 'patient_key',
        attributes: {
          patient_id: 'UUID',
          name: 'VARCHAR(255)',
          birth_date: 'DATE',
          gender: 'VARCHAR(10)',
          age_group: 'VARCHAR(20)',
          city: 'VARCHAR(100)',
          state: 'VARCHAR(50)',
          registration_date: 'DATE',
          patient_source: 'VARCHAR(50)'
        },
        scdType: 2
      },
      {
        tableName: 'dim_therapists',
        primaryKey: 'therapist_key',
        attributes: {
          therapist_id: 'UUID',
          name: 'VARCHAR(255)',
          specialty: 'VARCHAR(100)',
          license_number: 'VARCHAR(50)',
          experience_years: 'INTEGER',
          hire_date: 'DATE'
        },
        scdType: 2
      },
      {
        tableName: 'dim_date',
        primaryKey: 'date_key',
        attributes: {
          full_date: 'DATE',
          day_of_week: 'INTEGER',
          day_name: 'VARCHAR(10)',
          day_of_month: 'INTEGER',
          day_of_year: 'INTEGER',
          week_of_year: 'INTEGER',
          month_number: 'INTEGER',
          month_name: 'VARCHAR(10)',
          quarter: 'INTEGER',
          year: 'INTEGER',
          is_weekend: 'BOOLEAN',
          is_holiday: 'BOOLEAN',
          holiday_name: 'VARCHAR(100)'
        },
        scdType: 1
      },
      {
        tableName: 'dim_treatments',
        primaryKey: 'treatment_key',
        attributes: {
          treatment_id: 'UUID',
          treatment_type: 'VARCHAR(100)',
          body_region: 'VARCHAR(50)',
          primary_diagnosis: 'VARCHAR(100)',
          icd_code: 'VARCHAR(20)',
          complexity_level: 'INTEGER'
        },
        scdType: 1
      }
    ];
  }

  /**
   * Get fact table schema
   */
  getFactTables(): FactTable[] {
    return [
      {
        tableName: 'fact_appointments',
        primaryKey: 'appointment_key',
        dimensions: ['patient_key', 'therapist_key', 'date_key', 'treatment_key'],
        measures: {
          duration_minutes: 'INTEGER',
          session_value: 'DECIMAL(10,2)',
          discount_applied: 'DECIMAL(10,2)',
          net_value: 'DECIMAL(10,2)',
          was_late: 'BOOLEAN',
          was_no_show: 'BOOLEAN',
          was_cancelled: 'BOOLEAN',
          minutes_late: 'INTEGER'
        },
        grain: 'One row per appointment'
      },
      {
        tableName: 'fact_financial_transactions',
        primaryKey: 'transaction_key',
        dimensions: ['patient_key', 'date_key'],
        measures: {
          gross_amount: 'DECIMAL(12,2)',
          discount_amount: 'DECIMAL(10,2)',
          tax_amount: 'DECIMAL(10,2)',
          net_amount: 'DECIMAL(12,2)',
          installments: 'INTEGER',
          days_to_payment: 'INTEGER'
        },
        grain: 'One row per financial transaction'
      },
      {
        tableName: 'fact_clinical_outcomes',
        primaryKey: 'outcome_key',
        dimensions: ['patient_key', 'therapist_key', 'date_key', 'treatment_key'],
        measures: {
          initial_pain_level: 'INTEGER',
          final_pain_level: 'INTEGER',
          pain_reduction: 'INTEGER',
          sessions_completed: 'INTEGER',
          treatment_duration_days: 'INTEGER',
          goals_achieved: 'INTEGER',
          total_goals: 'INTEGER',
          treatment_successful: 'BOOLEAN',
          patient_satisfied: 'BOOLEAN'
        },
        grain: 'One row per completed treatment'
      },
      {
        tableName: 'fact_patient_engagement',
        primaryKey: 'engagement_key',
        dimensions: ['patient_key', 'date_key'],
        measures: {
          portal_logins: 'INTEGER',
          messages_sent: 'INTEGER',
          exercises_completed: 'INTEGER',
          appointments_scheduled: 'INTEGER',
          cancellations: 'INTEGER',
          no_shows: 'INTEGER',
          rating_given: 'INTEGER'
        },
        grain: 'One row per patient per day'
      }
    ];
  }

  /**
   * Get data mart definitions
   */
  getDataMarts(): DataMart[] {
    return [
      {
        name: 'financial_mart',
        subject: 'Financial Analysis',
        factTables: ['fact_financial_transactions', 'fact_appointments'],
        dimensionTables: ['dim_patients', 'dim_date'],
        purpose: 'Revenue analysis, payment tracking, and financial reporting'
      },
      {
        name: 'clinical_mart',
        subject: 'Clinical Outcomes',
        factTables: ['fact_clinical_outcomes', 'fact_appointments'],
        dimensionTables: ['dim_patients', 'dim_therapists', 'dim_treatments', 'dim_date'],
        purpose: 'Treatment effectiveness and clinical outcome analysis'
      },
      {
        name: 'operational_mart',
        subject: 'Operations',
        factTables: ['fact_appointments', 'fact_patient_engagement'],
        dimensionTables: ['dim_patients', 'dim_therapists', 'dim_date'],
        purpose: 'Appointment scheduling, no-shows, and operational efficiency'
      },
      {
        name: 'patient_mart',
        subject: 'Patient Analytics',
        factTables: ['fact_patient_engagement', 'fact_appointments', 'fact_clinical_outcomes'],
        dimensionTables: ['dim_patients', 'dim_date'],
        purpose: 'Patient behavior, retention, and satisfaction analysis'
      }
    ];
  }

  /**
   * Initialize data warehouse schema
   */
  async initializeSchema(): Promise<void> {
    try {
      console.log('Initializing data warehouse schema...');

      // Create dimension tables
      await this.createDimensionTables();

      // Create fact tables
      await this.createFactTables();

      // Create indexes for performance
      await this.createIndexes();

      // Populate date dimension
      await this.populateDateDimension();

      console.log('Data warehouse schema initialized successfully');
    } catch (error) {
      console.error('Failed to initialize data warehouse schema:', error);
      throw error;
    }
  }

  /**
   * Create dimension tables
   */
  private async createDimensionTables(): Promise<void> {
    const queries = [
      `
      CREATE TABLE IF NOT EXISTS dim_patients (
        patient_key SERIAL PRIMARY KEY,
        patient_id UUID UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        birth_date DATE,
        gender VARCHAR(10),
        age_group VARCHAR(20),
        city VARCHAR(100),
        state VARCHAR(50),
        registration_date DATE,
        patient_source VARCHAR(50),

        -- SCD Type 2 fields
        effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
        expiry_date DATE DEFAULT '9999-12-31',
        is_current BOOLEAN DEFAULT TRUE,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      `,

      `
      CREATE TABLE IF NOT EXISTS dim_therapists (
        therapist_key SERIAL PRIMARY KEY,
        therapist_id UUID UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(100),
        license_number VARCHAR(50),
        experience_years INTEGER,
        hire_date DATE,

        -- SCD Type 2 fields
        effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
        expiry_date DATE DEFAULT '9999-12-31',
        is_current BOOLEAN DEFAULT TRUE,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      `,

      `
      CREATE TABLE IF NOT EXISTS dim_date (
        date_key INTEGER PRIMARY KEY,
        full_date DATE UNIQUE NOT NULL,
        day_of_week INTEGER,
        day_name VARCHAR(10),
        day_of_month INTEGER,
        day_of_year INTEGER,
        week_of_year INTEGER,
        month_number INTEGER,
        month_name VARCHAR(10),
        quarter INTEGER,
        year INTEGER,
        is_weekend BOOLEAN,
        is_holiday BOOLEAN,
        holiday_name VARCHAR(100)
      );
      `,

      `
      CREATE TABLE IF NOT EXISTS dim_treatments (
        treatment_key SERIAL PRIMARY KEY,
        treatment_id UUID UNIQUE NOT NULL,
        treatment_type VARCHAR(100) NOT NULL,
        body_region VARCHAR(50),
        primary_diagnosis VARCHAR(100),
        icd_code VARCHAR(20),
        complexity_level INTEGER DEFAULT 1,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      `
    ];

    for (const query of queries) {
      await this.query(query);
    }
  }

  /**
   * Create fact tables
   */
  private async createFactTables(): Promise<void> {
    const queries = [
      `
      CREATE TABLE IF NOT EXISTS fact_appointments (
        appointment_key SERIAL PRIMARY KEY,
        appointment_id UUID UNIQUE NOT NULL,

        -- Foreign keys to dimensions
        patient_key INTEGER REFERENCES dim_patients(patient_key),
        therapist_key INTEGER REFERENCES dim_therapists(therapist_key),
        date_key INTEGER REFERENCES dim_date(date_key),
        treatment_key INTEGER REFERENCES dim_treatments(treatment_key),

        -- Time attributes
        scheduled_time TIMESTAMP,
        actual_start_time TIMESTAMP,
        actual_end_time TIMESTAMP,
        duration_minutes INTEGER,

        -- Status flags
        status VARCHAR(20),
        appointment_type VARCHAR(50),
        was_late BOOLEAN DEFAULT FALSE,
        was_no_show BOOLEAN DEFAULT FALSE,
        was_cancelled BOOLEAN DEFAULT FALSE,
        minutes_late INTEGER DEFAULT 0,

        -- Financial measures
        session_value DECIMAL(10,2) DEFAULT 0,
        discount_applied DECIMAL(10,2) DEFAULT 0,
        net_value DECIMAL(10,2) DEFAULT 0,

        created_at TIMESTAMP DEFAULT NOW()
      );
      `,

      `
      CREATE TABLE IF NOT EXISTS fact_financial_transactions (
        transaction_key SERIAL PRIMARY KEY,
        transaction_id UUID UNIQUE NOT NULL,

        -- Dimensions
        patient_key INTEGER REFERENCES dim_patients(patient_key),
        date_key INTEGER REFERENCES dim_date(date_key),

        -- Financial measures
        gross_amount DECIMAL(12,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        net_amount DECIMAL(12,2) NOT NULL,

        -- Transaction details
        transaction_type VARCHAR(50),
        payment_method VARCHAR(30),
        installments INTEGER DEFAULT 1,

        -- Status and timing
        status VARCHAR(20),
        due_date DATE,
        paid_date DATE,
        days_to_payment INTEGER,

        created_at TIMESTAMP DEFAULT NOW()
      );
      `,

      `
      CREATE TABLE IF NOT EXISTS fact_clinical_outcomes (
        outcome_key SERIAL PRIMARY KEY,

        -- Dimensions
        patient_key INTEGER REFERENCES dim_patients(patient_key),
        therapist_key INTEGER REFERENCES dim_therapists(therapist_key),
        date_key INTEGER REFERENCES dim_date(date_key),
        treatment_key INTEGER REFERENCES dim_treatments(treatment_key),

        -- Clinical measures
        initial_pain_level INTEGER,
        final_pain_level INTEGER,
        pain_reduction INTEGER,
        sessions_completed INTEGER,
        treatment_duration_days INTEGER,

        -- Outcome measures
        treatment_successful BOOLEAN DEFAULT FALSE,
        patient_satisfied BOOLEAN DEFAULT FALSE,
        goals_achieved INTEGER DEFAULT 0,
        total_goals INTEGER DEFAULT 0,

        created_at TIMESTAMP DEFAULT NOW()
      );
      `,

      `
      CREATE TABLE IF NOT EXISTS fact_patient_engagement (
        engagement_key SERIAL PRIMARY KEY,

        -- Dimensions
        patient_key INTEGER REFERENCES dim_patients(patient_key),
        date_key INTEGER REFERENCES dim_date(date_key),

        -- Engagement measures
        portal_logins INTEGER DEFAULT 0,
        messages_sent INTEGER DEFAULT 0,
        exercises_completed INTEGER DEFAULT 0,
        appointments_scheduled INTEGER DEFAULT 0,
        cancellations INTEGER DEFAULT 0,
        no_shows INTEGER DEFAULT 0,
        rating_given INTEGER,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      `
    ];

    for (const query of queries) {
      await this.query(query);
    }
  }

  /**
   * Create performance indexes
   */
  private async createIndexes(): Promise<void> {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_fact_appointments_date ON fact_appointments(date_key);',
      'CREATE INDEX IF NOT EXISTS idx_fact_appointments_patient ON fact_appointments(patient_key);',
      'CREATE INDEX IF NOT EXISTS idx_fact_appointments_therapist ON fact_appointments(therapist_key);',
      'CREATE INDEX IF NOT EXISTS idx_fact_financial_date ON fact_financial_transactions(date_key);',
      'CREATE INDEX IF NOT EXISTS idx_fact_financial_patient ON fact_financial_transactions(patient_key);',
      'CREATE INDEX IF NOT EXISTS idx_fact_outcomes_date ON fact_clinical_outcomes(date_key);',
      'CREATE INDEX IF NOT EXISTS idx_fact_outcomes_patient ON fact_clinical_outcomes(patient_key);',
      'CREATE INDEX IF NOT EXISTS idx_fact_engagement_date ON fact_patient_engagement(date_key);',
      'CREATE INDEX IF NOT EXISTS idx_fact_engagement_patient ON fact_patient_engagement(patient_key);',
      'CREATE INDEX IF NOT EXISTS idx_dim_patients_current ON dim_patients(is_current, patient_id);',
      'CREATE INDEX IF NOT EXISTS idx_dim_therapists_current ON dim_therapists(is_current, therapist_id);'
    ];

    for (const index of indexes) {
      await this.query(index);
    }
  }

  /**
   * Populate date dimension with 5 years of data
   */
  private async populateDateDimension(): Promise<void> {
    const startDate = new Date(2023, 0, 1); // January 1, 2023
    const endDate = new Date(2028, 11, 31); // December 31, 2028
    const dates: any[] = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateKey = parseInt(
        date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0')
      );

      dates.push({
        date_key: dateKey,
        full_date: date.toISOString().split('T')[0],
        day_of_week: date.getDay(),
        day_name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        day_of_month: date.getDate(),
        day_of_year: this.getDayOfYear(date),
        week_of_year: this.getWeekOfYear(date),
        month_number: date.getMonth() + 1,
        month_name: date.toLocaleDateString('pt-BR', { month: 'short' }),
        quarter: Math.ceil((date.getMonth() + 1) / 3),
        year: date.getFullYear(),
        is_weekend: date.getDay() === 0 || date.getDay() === 6,
        is_holiday: this.isHoliday(date),
        holiday_name: this.getHolidayName(date)
      });
    }

    // Insert dates in batches
    const batchSize = 100;
    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize);
      await this.insertDateBatch(batch);
    }
  }

  private async insertDateBatch(dates: any[]): Promise<void> {
    const values = dates.map(date =>
      `(${date.date_key}, '${date.full_date}', ${date.day_of_week}, '${date.day_name}',
        ${date.day_of_month}, ${date.day_of_year}, ${date.week_of_year},
        ${date.month_number}, '${date.month_name}', ${date.quarter}, ${date.year},
        ${date.is_weekend}, ${date.is_holiday}, ${date.holiday_name ? `'${date.holiday_name}'` : 'NULL'})`
    ).join(',');

    const query = `
      INSERT INTO dim_date (date_key, full_date, day_of_week, day_name, day_of_month,
        day_of_year, week_of_year, month_number, month_name, quarter, year,
        is_weekend, is_holiday, holiday_name)
      VALUES ${values}
      ON CONFLICT (date_key) DO NOTHING;
    `;

    await this.query(query);
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private getWeekOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  private isHoliday(date: Date): boolean {
    const holidays = this.getBrazilianHolidays(date.getFullYear());
    const dateStr = date.toISOString().split('T')[0];
    return holidays.some(holiday => holiday.date === dateStr);
  }

  private getHolidayName(date: Date): string | null {
    const holidays = this.getBrazilianHolidays(date.getFullYear());
    const dateStr = date.toISOString().split('T')[0];
    const holiday = holidays.find(h => h.date === dateStr);
    return holiday ? holiday.name : null;
  }

  private getBrazilianHolidays(year: number): { date: string; name: string }[] {
    return [
      { date: `${year}-01-01`, name: 'Ano Novo' },
      { date: `${year}-04-21`, name: 'Tiradentes' },
      { date: `${year}-05-01`, name: 'Dia do Trabalhador' },
      { date: `${year}-09-07`, name: 'Independência do Brasil' },
      { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida' },
      { date: `${year}-11-02`, name: 'Finados' },
      { date: `${year}-11-15`, name: 'Proclamação da República' },
      { date: `${year}-12-25`, name: 'Natal' }
      // Note: Easter-based holidays would require calculation
    ];
  }

  /**
   * Get data warehouse health metrics
   */
  async getHealthMetrics(): Promise<{
    totalRecords: number;
    lastETLRun: Date | null;
    dataQuality: number;
    storageUsed: number;
  }> {
    const queries = await Promise.all([
      this.query('SELECT COUNT(*) as count FROM fact_appointments'),
      this.query('SELECT COUNT(*) as count FROM fact_financial_transactions'),
      this.query('SELECT COUNT(*) as count FROM fact_clinical_outcomes'),
      this.query('SELECT COUNT(*) as count FROM fact_patient_engagement')
    ]);

    const totalRecords = queries.reduce((sum, result) => sum + (result[0]?.count || 0), 0);

    return {
      totalRecords,
      lastETLRun: new Date(), // This would come from ETL log table
      dataQuality: 0.95, // This would be calculated from data quality rules
      storageUsed: 0 // This would come from database statistics
    };
  }
}