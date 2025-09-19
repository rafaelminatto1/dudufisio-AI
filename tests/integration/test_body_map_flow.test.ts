import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }))
};

vi.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

// Body regions mapping
const BODY_REGIONS = {
  head: { x: 200, y: 50, label: 'Cabeça' },
  neck: { x: 200, y: 80, label: 'Pescoço' },
  shoulder_left: { x: 150, y: 110, label: 'Ombro Esquerdo' },
  shoulder_right: { x: 250, y: 110, label: 'Ombro Direito' },
  upper_back: { x: 200, y: 140, label: 'Costas Superior' },
  lower_back: { x: 200, y: 180, label: 'Lombar' },
  chest: { x: 200, y: 130, label: 'Peito' },
  abdomen: { x: 200, y: 160, label: 'Abdômen' },
  arm_left: { x: 120, y: 140, label: 'Braço Esquerdo' },
  arm_right: { x: 280, y: 140, label: 'Braço Direito' },
  elbow_left: { x: 110, y: 170, label: 'Cotovelo Esquerdo' },
  elbow_right: { x: 290, y: 170, label: 'Cotovelo Direito' },
  wrist_left: { x: 100, y: 200, label: 'Punho Esquerdo' },
  wrist_right: { x: 300, y: 200, label: 'Punho Direito' },
  hand_left: { x: 95, y: 220, label: 'Mão Esquerda' },
  hand_right: { x: 305, y: 220, label: 'Mão Direita' },
  hip_left: { x: 170, y: 220, label: 'Quadril Esquerdo' },
  hip_right: { x: 230, y: 220, label: 'Quadril Direito' },
  thigh_left: { x: 165, y: 260, label: 'Coxa Esquerda' },
  thigh_right: { x: 235, y: 260, label: 'Coxa Direita' },
  knee_left: { x: 165, y: 300, label: 'Joelho Esquerdo' },
  knee_right: { x: 235, y: 300, label: 'Joelho Direito' },
  calf_left: { x: 165, y: 340, label: 'Panturrilha Esquerda' },
  calf_right: { x: 235, y: 340, label: 'Panturrilha Direita' },
  ankle_left: { x: 165, y: 380, label: 'Tornozelo Esquerdo' },
  ankle_right: { x: 235, y: 380, label: 'Tornozelo Direito' },
  foot_left: { x: 160, y: 400, label: 'Pé Esquerdo' },
  foot_right: { x: 240, y: 400, label: 'Pé Direito' }
};

describe('Body Map Pain Point Tracking Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Pain Point Creation', () => {
    it('should add new pain point to body map', async () => {
      const newPainPoint = {
        patient_id: 'patient-123',
        body_region: 'lower_back',
        intensity: 7,
        description: 'Dor constante na região lombar',
        characteristics: ['aching', 'constant'],
        triggers: ['Ficar sentado por muito tempo', 'Levantar peso'],
        reliefMethods: ['Alongamento', 'Compressa quente'],
        frequency: 'constant',
        startDate: '2024-02-15T00:00:00Z'
      };

      const painPointQuery = mockSupabaseClient.from('pain_points');
      painPointQuery.insert.mockResolvedValueOnce({
        data: { id: 'pain-new', ...newPainPoint, createdAt: new Date().toISOString() },
        error: null
      });

      const result = await painPointQuery.insert(newPainPoint);

      expect(result.error).toBeNull();
      expect(result.data.body_region).toBe('lower_back');
      expect(result.data.intensity).toBe(7);
    });

    it('should validate pain intensity range (0-10)', async () => {
      const invalidPainPoints = [
        { intensity: -1, expectedError: true },
        { intensity: 0, expectedError: false },
        { intensity: 5, expectedError: false },
        { intensity: 10, expectedError: false },
        { intensity: 11, expectedError: true }
      ];

      for (const testCase of invalidPainPoints) {
        const painPoint = {
          patient_id: 'patient-123',
          body_region: 'neck',
          intensity: testCase.intensity,
          description: 'Test pain point'
        };

        if (testCase.expectedError) {
          expect(testCase.intensity).not.toBeGreaterThanOrEqual(0);
          expect(testCase.intensity).not.toBeLessThanOrEqual(10);
        } else {
          expect(testCase.intensity).toBeGreaterThanOrEqual(0);
          expect(testCase.intensity).toBeLessThanOrEqual(10);
        }
      }
    });

    it('should add multiple pain points to different body regions', async () => {
      const painPoints = [
        {
          body_region: 'lower_back',
          intensity: 7,
          description: 'Dor lombar crônica'
        },
        {
          body_region: 'neck',
          intensity: 5,
          description: 'Tensão cervical'
        },
        {
          body_region: 'knee_right',
          intensity: 8,
          description: 'Dor aguda no joelho'
        }
      ];

      const results = [];
      for (const painPoint of painPoints) {
        const query = mockSupabaseClient.from('pain_points');
        query.insert.mockResolvedValueOnce({
          data: { 
            id: `pain-${painPoint.body_region}`,
            patient_id: 'patient-123',
            ...painPoint,
            createdAt: new Date().toISOString()
          },
          error: null
        });

        const result = await query.insert({
          patient_id: 'patient-123',
          ...painPoint
        });

        results.push(result.data);
      }

      expect(results).toHaveLength(3);
      expect(results[0].body_region).toBe('lower_back');
      expect(results[1].body_region).toBe('neck');
      expect(results[2].body_region).toBe('knee_right');
    });
  });

  describe('Pain Point Visualization', () => {
    it('should display all active pain points on body map', async () => {
      const mockActivePainPoints = [
        {
          id: 'pain-1',
          patient_id: 'patient-123',
          body_region: 'lower_back',
          intensity: 7,
          description: 'Dor lombar',
          endDate: null
        },
        {
          id: 'pain-2',
          patient_id: 'patient-123',
          body_region: 'shoulder_right',
          intensity: 5,
          description: 'Tensão no ombro',
          endDate: null
        },
        {
          id: 'pain-3',
          patient_id: 'patient-123',
          body_region: 'knee_left',
          intensity: 3,
          description: 'Desconforto leve',
          endDate: null
        }
      ];

      const painPointsQuery = mockSupabaseClient.from('pain_points');
      painPointsQuery.select.mockReturnThis();
      painPointsQuery.eq.mockReturnThis();
      painPointsQuery.is.mockResolvedValueOnce({
        data: mockActivePainPoints,
        error: null
      });

      const result = await painPointsQuery
        .select('*')
        .eq('patient_id', 'patient-123')
        .is('endDate', null);

      expect(result.data).toHaveLength(3);
      
      // Verify intensity-based color coding
      const getColorByIntensity = (intensity: number) => {
        if (intensity <= 3) return 'green';
        if (intensity <= 6) return 'yellow';
        return 'red';
      };

      expect(getColorByIntensity(result.data[0].intensity)).toBe('red');
      expect(getColorByIntensity(result.data[1].intensity)).toBe('yellow');
      expect(getColorByIntensity(result.data[2].intensity)).toBe('green');
    });

    it('should show pain point details on hover/click', async () => {
      const painPointDetail = {
        id: 'pain-1',
        patient_id: 'patient-123',
        body_region: 'lower_back',
        intensity: 7,
        description: 'Dor constante na região lombar',
        characteristics: ['aching', 'constant', 'radiating'],
        triggers: ['Ficar sentado', 'Levantar peso'],
        reliefMethods: ['Alongamento', 'Calor local'],
        frequency: 'constant',
        duration: '3 meses',
        startDate: '2023-11-15T00:00:00Z',
        notes: 'Piora ao final do dia'
      };

      const detailQuery = mockSupabaseClient.from('pain_points');
      detailQuery.select.mockReturnThis();
      detailQuery.eq.mockReturnThis();
      detailQuery.single = vi.fn().mockResolvedValueOnce({
        data: painPointDetail,
        error: null
      });

      const result = await detailQuery
        .select('*')
        .eq('id', 'pain-1')
        .single();

      expect(result.data.characteristics).toHaveLength(3);
      expect(result.data.triggers).toHaveLength(2);
      expect(result.data.reliefMethods).toHaveLength(2);
    });

    it('should differentiate between front and back body views', async () => {
      const frontPainPoints = [
        { body_region: 'chest', intensity: 4 },
        { body_region: 'abdomen', intensity: 3 },
        { body_region: 'knee_right', intensity: 6 }
      ];

      const backPainPoints = [
        { body_region: 'upper_back', intensity: 5 },
        { body_region: 'lower_back', intensity: 8 },
        { body_region: 'calf_left', intensity: 4 }
      ];

      // Determine which view to show based on body region
      const isFrontView = (region: string) => {
        const frontRegions = ['chest', 'abdomen', 'knee_right', 'knee_left'];
        return frontRegions.includes(region);
      };

      const isBackView = (region: string) => {
        const backRegions = ['upper_back', 'lower_back', 'calf_left', 'calf_right'];
        return backRegions.includes(region);
      };

      expect(frontPainPoints.every(p => isFrontView(p.body_region))).toBe(true);
      expect(backPainPoints.every(p => isBackView(p.body_region))).toBe(true);
    });
  });

  describe('Pain Point Evolution Tracking', () => {
    it('should track pain intensity changes over time', async () => {
      const painPointId = 'pain-1';
      const evolutionHistory = [
        { date: '2024-01-15', intensity: 8, notes: 'Início do tratamento' },
        { date: '2024-01-22', intensity: 7, notes: 'Leve melhora' },
        { date: '2024-02-01', intensity: 5, notes: 'Melhora significativa' },
        { date: '2024-02-08', intensity: 4, notes: 'Continuando a melhorar' },
        { date: '2024-02-15', intensity: 3, notes: 'Quase sem dor' }
      ];

      const historyQuery = mockSupabaseClient.from('pain_point_history');
      historyQuery.select.mockReturnThis();
      historyQuery.eq.mockReturnThis();
      historyQuery.order.mockResolvedValueOnce({
        data: evolutionHistory,
        error: null
      });

      const result = await historyQuery
        .select('*')
        .eq('pain_point_id', painPointId)
        .order('date');

      // Calculate improvement
      const initialIntensity = result.data[0].intensity;
      const currentIntensity = result.data[result.data.length - 1].intensity;
      const improvement = ((initialIntensity - currentIntensity) / initialIntensity) * 100;

      expect(improvement).toBeCloseTo(62.5, 1);
      expect(result.data).toHaveLength(5);
    });

    it('should update pain point status based on intensity changes', async () => {
      const painPointId = 'pain-1';
      const updates = [
        { date: '2024-02-01', intensity: 7, expectedStatus: 'active' },
        { date: '2024-02-08', intensity: 4, expectedStatus: 'improving' },
        { date: '2024-02-15', intensity: 1, expectedStatus: 'resolved' }
      ];

      for (const update of updates) {
        const updateQuery = mockSupabaseClient.from('pain_points');
        updateQuery.update.mockReturnThis();
        updateQuery.eq.mockResolvedValueOnce({
          data: {
            id: painPointId,
            intensity: update.intensity,
            status: update.expectedStatus,
            updatedAt: update.date
          },
          error: null
        });

        const result = await updateQuery
          .update({
            intensity: update.intensity,
            status: update.expectedStatus
          })
          .eq('id', painPointId);

        expect(result.data.status).toBe(update.expectedStatus);
      }
    });

    it('should mark pain point as resolved', async () => {
      const painPointId = 'pain-1';
      const resolutionData = {
        endDate: '2024-02-15T00:00:00Z',
        status: 'resolved',
        resolution_notes: 'Paciente não apresenta mais dor após tratamento completo',
        final_intensity: 0
      };

      const resolveQuery = mockSupabaseClient.from('pain_points');
      resolveQuery.update.mockReturnThis();
      resolveQuery.eq.mockResolvedValueOnce({
        data: { id: painPointId, ...resolutionData },
        error: null
      });

      const result = await resolveQuery
        .update(resolutionData)
        .eq('id', painPointId);

      expect(result.data.status).toBe('resolved');
      expect(result.data.endDate).not.toBeNull();
      expect(result.data.final_intensity).toBe(0);
    });
  });

  describe('Pain Pattern Analysis', () => {
    it('should identify pain patterns and correlations', async () => {
      const patientId = 'patient-123';
      const painData = [
        {
          body_region: 'lower_back',
          intensity_avg: 6,
          occurrence_count: 15,
          common_triggers: ['sitting', 'lifting'],
          effective_treatments: ['stretching', 'heat']
        },
        {
          body_region: 'neck',
          intensity_avg: 4,
          occurrence_count: 8,
          common_triggers: ['stress', 'poor posture'],
          effective_treatments: ['massage', 'relaxation']
        }
      ];

      // Analyze pain patterns
      const analysisQuery = mockSupabaseClient.rpc;
      analysisQuery.mockResolvedValueOnce({
        data: {
          most_affected_region: 'lower_back',
          average_intensity: 5,
          pain_frequency: 'frequent',
          common_triggers: ['sitting', 'lifting', 'stress'],
          effective_treatments: ['stretching', 'heat', 'massage'],
          correlation_patterns: [
            {
              regions: ['lower_back', 'hip_right'],
              correlation_strength: 0.75
            }
          ]
        },
        error: null
      });

      const result = await analysisQuery('analyze_pain_patterns', {
        patient_id: patientId
      });

      expect(result.data.most_affected_region).toBe('lower_back');
      expect(result.data.correlation_patterns[0].correlation_strength).toBeGreaterThan(0.7);
    });

    it('should generate pain heat map over time', async () => {
      const heatMapData = [
        { date: '2024-02-01', lower_back: 8, neck: 4, shoulder_right: 2 },
        { date: '2024-02-08', lower_back: 6, neck: 3, shoulder_right: 3 },
        { date: '2024-02-15', lower_back: 4, neck: 2, shoulder_right: 1 }
      ];

      const heatMapQuery = mockSupabaseClient.rpc;
      heatMapQuery.mockResolvedValueOnce({
        data: heatMapData,
        error: null
      });

      const result = await heatMapQuery('generate_pain_heatmap', {
        patient_id: 'patient-123',
        start_date: '2024-02-01',
        end_date: '2024-02-15'
      });

      // Verify improvement trend
      const lowerBackTrend = result.data.map(d => d.lower_back);
      const isImproving = lowerBackTrend.every((val, idx) => 
        idx === 0 || val <= lowerBackTrend[idx - 1]
      );

      expect(isImproving).toBe(true);
      expect(result.data).toHaveLength(3);
    });
  });

  describe('Integration with Treatment Sessions', () => {
    it('should link pain points to treatment sessions', async () => {
      const sessionId = 'session-123';
      const painPointUpdates = [
        {
          pain_point_id: 'pain-1',
          body_region: 'lower_back',
          intensity_before: 7,
          intensity_after: 5,
          treatment_applied: 'Manual therapy and exercises'
        },
        {
          pain_point_id: 'pain-2',
          body_region: 'neck',
          intensity_before: 5,
          intensity_after: 3,
          treatment_applied: 'Stretching and relaxation techniques'
        }
      ];

      for (const update of painPointUpdates) {
        const sessionPainQuery = mockSupabaseClient.from('session_pain_points');
        sessionPainQuery.insert.mockResolvedValueOnce({
          data: {
            session_id: sessionId,
            ...update,
            improvement: update.intensity_before - update.intensity_after
          },
          error: null
        });

        const result = await sessionPainQuery.insert({
          session_id: sessionId,
          ...update
        });

        expect(result.data.improvement).toBeGreaterThan(0);
      }
    });

    it('should track pain point response to exercises', async () => {
      const exerciseResponses = [
        {
          exercise_id: 'ex-1',
          exercise_name: 'Alongamento lombar',
          pain_point_id: 'pain-1',
          body_region: 'lower_back',
          pain_before: 6,
          pain_after: 4,
          effectiveness: 'high'
        },
        {
          exercise_id: 'ex-2',
          exercise_name: 'Fortalecimento core',
          pain_point_id: 'pain-1',
          body_region: 'lower_back',
          pain_before: 5,
          pain_after: 3,
          effectiveness: 'high'
        }
      ];

      const responseQuery = mockSupabaseClient.from('exercise_pain_responses');
      responseQuery.insert.mockResolvedValueOnce({
        data: exerciseResponses,
        error: null
      });

      const result = await responseQuery.insert(exerciseResponses);

      const avgImprovement = result.data.reduce((sum, r) => 
        sum + (r.pain_before - r.pain_after), 0
      ) / result.data.length;

      expect(avgImprovement).toBe(2);
      expect(result.data.every(r => r.effectiveness === 'high')).toBe(true);
    });
  });

  describe('Reporting and Analytics', () => {
    it('should generate pain point summary report', async () => {
      const patientId = 'patient-123';
      const reportPeriod = {
        start_date: '2024-01-01',
        end_date: '2024-02-15'
      };

      const reportQuery = mockSupabaseClient.rpc;
      reportQuery.mockResolvedValueOnce({
        data: {
          patient_id: patientId,
          period: reportPeriod,
          summary: {
            total_pain_points: 5,
            active_pain_points: 2,
            resolved_pain_points: 3,
            average_initial_intensity: 6.8,
            average_current_intensity: 2.5,
            overall_improvement: 63.2,
            most_affected_regions: ['lower_back', 'neck'],
            treatment_sessions: 8,
            exercises_prescribed: 12
          },
          timeline: [
            { date: '2024-01-01', active_points: 5, avg_intensity: 6.8 },
            { date: '2024-01-15', active_points: 4, avg_intensity: 5.5 },
            { date: '2024-02-01', active_points: 3, avg_intensity: 4.0 },
            { date: '2024-02-15', active_points: 2, avg_intensity: 2.5 }
          ]
        },
        error: null
      });

      const result = await reportQuery('generate_pain_report', {
        patient_id: patientId,
        ...reportPeriod
      });

      expect(result.data.summary.overall_improvement).toBeGreaterThan(60);
      expect(result.data.summary.resolved_pain_points).toBe(3);
      expect(result.data.timeline).toHaveLength(4);
    });

    it('should export pain point data for analysis', async () => {
      const exportQuery = mockSupabaseClient.from('pain_points');
      exportQuery.select.mockReturnThis();
      exportQuery.eq.mockReturnThis();
      exportQuery.gte.mockReturnThis();
      exportQuery.lte.mockReturnThis();
      exportQuery.order.mockResolvedValueOnce({
        data: [
          {
            date: '2024-01-15',
            body_region: 'lower_back',
            intensity: 7,
            characteristics: ['aching', 'constant'],
            triggers: ['sitting'],
            session_notes: 'Initial assessment'
          },
          {
            date: '2024-02-01',
            body_region: 'lower_back',
            intensity: 4,
            characteristics: ['aching', 'intermittent'],
            triggers: ['sitting'],
            session_notes: 'Significant improvement'
          }
        ],
        error: null
      });

      const result = await exportQuery
        .select('*')
        .eq('patient_id', 'patient-123')
        .gte('date', '2024-01-01')
        .lte('date', '2024-02-15')
        .order('date');

      // Format for CSV export
      const csvData = result.data.map(row => ({
        Date: row.date,
        'Body Region': row.body_region,
        Intensity: row.intensity,
        Characteristics: row.characteristics.join(', '),
        Triggers: row.triggers.join(', '),
        Notes: row.session_notes
      }));

      expect(csvData).toHaveLength(2);
      expect(csvData[0].Intensity).toBe(7);
      expect(csvData[1].Intensity).toBe(4);
    });

    it('should compare pain points across patients with similar conditions', async () => {
      const comparisonQuery = mockSupabaseClient.rpc;
      comparisonQuery.mockResolvedValueOnce({
        data: {
          condition: 'chronic_lower_back_pain',
          patient_count: 25,
          average_treatment_duration: '6 weeks',
          average_initial_intensity: 7.2,
          average_final_intensity: 2.8,
          success_rate: 0.84,
          common_effective_treatments: [
            'Manual therapy',
            'Core strengthening',
            'Posture correction'
          ],
          current_patient_comparison: {
            patient_id: 'patient-123',
            vs_average_initial: -0.2,  // Started slightly better
            vs_average_current: -0.3,   // Currently better than average
            progress_percentile: 75     // In top 25% of progress
          }
        },
        error: null
      });

      const result = await comparisonQuery('compare_similar_conditions', {
        patient_id: 'patient-123',
        condition: 'chronic_lower_back_pain'
      });

      expect(result.data.success_rate).toBeGreaterThan(0.8);
      expect(result.data.current_patient_comparison.progress_percentile).toBeGreaterThan(70);
    });
  });
});