/**
 * AI Dashboard Service
 * Service layer for fetching and processing dashboard data from Supabase
 */

import { supabase } from '@/lib/supabaseClient';
import type { PatientData } from '@/lib/ai/churn-prediction';
import type { ClinicMetrics } from '@/lib/ai/business-intelligence';

// Type for user_actions table (add to supabase types later)
interface UserAction {
  id?: string;
  user_id: string;
  action_type: 'call' | 'whatsapp' | 'email' | 'generate_plan' | 'view_details';
  target_id: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

/**
 * Fetch patients data for churn analysis
 * Aggregates data from multiple tables to build PatientData objects
 */
export async function fetchPatientsForChurnAnalysis(): Promise<PatientData[]> {
  try {
    // Fetch patients with aggregated appointment and payment data
    const { data: patients, error } = await supabase
      .from('patients')
      .select(`
        id,
        created_at,
        appointments (
          id,
          status,
          start_time,
          created_at
        ),
        payments (
          id,
          amount,
          status,
          due_date,
          paid_at
        )
      `)
      .eq('status', 'active')
      .limit(100);

    if (error) throw error;

    // Transform Supabase data to PatientData format
    return patients.map((patient: any) => {
      const appointments = patient.appointments || [];
      const payments = patient.payments || [];

      // Calculate appointment metrics
      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter((a: any) => a.status === 'completed').length;
      const cancelledAppointments = appointments.filter((a: any) => a.status === 'cancelled').length;
      const noShowAppointments = appointments.filter((a: any) => a.status === 'no_show').length;
      const lastAppointment = appointments.length > 0 
        ? new Date(Math.max(...appointments.map((a: any) => new Date(a.start_time).getTime())))
        : null;

      // Calculate payment metrics
      const totalPaid = payments
        .filter((p: any) => p.status === 'paid')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      
      const pendingPayments = payments.filter((p: any) => p.status === 'pending').length;
      
      const overduePayments = payments.filter((p: any) => 
        p.status === 'pending' && new Date(p.due_date) < new Date()
      );

      const paymentDelays = payments
        .filter((p: any) => p.status === 'paid' && p.paid_at && p.due_date)
        .map((p: any) => {
          const dueDate = new Date(p.due_date);
          const paidDate = new Date(p.paid_at);
          return Math.max(0, Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        });

      const averagePaymentDelay = paymentDelays.length > 0
        ? paymentDelays.reduce((sum, delay) => sum + delay, 0) / paymentDelays.length
        : 0;

      return {
        id: patient.id,
        appointmentHistory: {
          total: totalAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          noShow: noShowAppointments,
          lastAppointmentDate: lastAppointment,
        },
        paymentHistory: {
          totalPaid,
          pendingPayments,
          averagePaymentDelay,
          hasOverduePayments: overduePayments.length > 0,
        },
        engagementMetrics: {
          // TODO: Add exercise completion tracking
          exerciseCompletionRate: 0.7, // Placeholder
          portalLoginFrequency: 0, // Placeholder
          messageResponseRate: 0.8, // Placeholder
          surveyCompletionRate: 0.5, // Placeholder
        },
        treatmentProgress: {
          sessionsPlanned: totalAppointments,
          sessionsCompleted: completedAppointments,
          goalAchievementRate: completedAppointments / Math.max(totalAppointments, 1),
          painReductionScore: 5, // Placeholder - needs pain tracking
        },
        demographics: {
          ageGroup: '35-44', // Placeholder - needs patient age
          distanceFromClinic: 5, // Placeholder - needs address
          hasInsurance: false, // Placeholder
        },
      };
    });
  } catch (error) {
    console.error('Error fetching patients for churn analysis:', error);
    throw error;
  }
}

/**
 * Fetch clinic metrics for BI insights
 * Aggregates data from appointments, payments, and patients
 */
export async function fetchClinicMetrics(
  startDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  endDate: Date = new Date()
): Promise<ClinicMetrics> {
  try {
    // Fetch revenue data
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, payment_method, status, created_at')
      .eq('status', 'paid')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (paymentsError) throw paymentsError;

    // Fetch appointment data
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, status, start_time, duration, created_at')
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    if (appointmentsError) throw appointmentsError;

    // Fetch patient data
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, status, created_at');

    if (patientsError) throw patientsError;

    // Calculate financial metrics
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const revenueByPaymentMethod = payments.reduce((acc: Record<string, number>, p) => {
      const method = p.payment_method || 'Outros';
      acc[method] = (acc[method] || 0) + (p.amount || 0);
      return acc;
    }, {});

    // Calculate operational metrics
    const totalSlots = appointments.length; // Simplified - should calculate from schedule
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
    const noShowAppointments = appointments.filter(a => a.status === 'no_show').length;

    const appointmentUtilization = totalSlots > 0 ? completedAppointments / totalSlots : 0;
    const cancellationRate = totalSlots > 0 ? cancelledAppointments / totalSlots : 0;
    const noShowRate = totalSlots > 0 ? noShowAppointments / totalSlots : 0;

    // Calculate patient metrics
    const activePatients = patients.filter(p => p.status === 'active').length;
    const newPatients = patients.filter(p => {
      if (!p.created_at) return false;
      const createdAt = new Date(p.created_at);
      return createdAt >= startDate && createdAt <= endDate;
    }).length;

    // Calculate previous period for trends
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    
    const { data: previousPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    const previousRevenue = previousPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const monthOverMonth = previousRevenue > 0 
      ? (totalRevenue - previousRevenue) / previousRevenue 
      : 0;

    return {
      financial: {
        revenue: {
          total: totalRevenue,
          byService: {
            'Fisioterapia': totalRevenue * 0.7, // Placeholder - needs service tracking
            'RPG': totalRevenue * 0.2,
            'Pilates': totalRevenue * 0.1,
          },
          byPaymentMethod: revenueByPaymentMethod,
          trend: monthOverMonth > 0 ? 'up' : monthOverMonth < 0 ? 'down' : 'stable',
        },
        expenses: {
          total: totalRevenue * 0.75, // Placeholder - needs expense tracking
          byCategory: {
            'Pessoal': totalRevenue * 0.5,
            'Aluguel': totalRevenue * 0.15,
            'Materiais': totalRevenue * 0.08,
            'Marketing': totalRevenue * 0.02,
          },
        },
        profitMargin: 0.25, // Simplified calculation
        arpu: activePatients > 0 ? totalRevenue / activePatients : 0,
        ltv: activePatients > 0 ? (totalRevenue / activePatients) * 6 : 0, // 6 months LTV
      },
      operational: {
        appointmentUtilization,
        averageWaitTime: 10, // Placeholder - needs wait time tracking
        sessionDuration: 50, // Placeholder - needs duration tracking
        cancellationRate,
        noShowRate,
        therapistProductivity: {
          'Média Geral': appointmentUtilization,
        },
      },
      patient: {
        totalActive: activePatients,
        newPatients,
        churnRate: 0.18, // Placeholder - needs churn tracking
        satisfactionScore: 4.3, // Placeholder - needs satisfaction surveys
        nps: 52, // Placeholder - needs NPS surveys
        retentionRate: 0.82,
      },
      growth: {
        monthOverMonth,
        yearOverYear: monthOverMonth * 12, // Simplified
        projectedGrowth: monthOverMonth * 1.1, // Conservative projection
      },
      period: {
        start: startDate,
        end: endDate,
      },
    };
  } catch (error) {
    console.error('Error fetching clinic metrics:', error);
    throw error;
  }
}

/**
 * Fetch treatment plans statistics
 * TODO: Implement when treatment_plans table is created
 */
export async function fetchTreatmentPlansStats() {
  try {
    // For now, return mock data until treatment_plans table exists
    return {
      total: 0,
      active: 0,
      completed: 0,
      thisMonth: 0,
      aiGenerated: 0,
      recentPlans: [],
    };
  } catch (error) {
    console.error('Error fetching treatment plans stats:', error);
    throw error;
  }
}

/**
 * Save user action (for tracking and analytics)
 */
export async function saveUserAction(action: {
  userId: string;
  actionType: 'call' | 'whatsapp' | 'email' | 'generate_plan' | 'view_details';
  targetId: string; // patient_id or plan_id
  metadata?: Record<string, any>;
}) {
  try {
    // Cast to any to bypass type checking for user_actions table
    // TODO: Add user_actions to Supabase schema types
    const { error } = await (supabase as any)
      .from('user_actions')
      .insert({
        user_id: action.userId,
        action_type: action.actionType,
        target_id: action.targetId,
        metadata: action.metadata || {},
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving user action:', error);
    // Don't throw - analytics shouldn't break the app
  }
}
