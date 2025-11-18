import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type FinancialTransaction = Database['public']['Tables']['payment_transactions']['Row'];

export interface DashboardStats {
  appointments: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStatus: {
      agendado: number;
      confirmado: number;
      concluido: number;
      cancelado: number;
    };
  };
  patients: {
    total: number;
    active: number;
    newThisMonth: number;
    byStatus: {
      ativo: number;
      inativo: number;
      aguardando: number;
      alta: number;
    };
  };
  financial: {
    revenueThisMonth: number;
    revenueThisYear: number;
    pendingPayments: number;
    transactionsThisMonth: number;
  };
}

export class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<{ data: DashboardStats | null; error: any }> {
    try {
      const supabase = await createServerComponentClient();
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Appointments
      const { data: allAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('status, start_time');

      if (appointmentsError) throw appointmentsError;

      const appointmentsToday = allAppointments?.filter(
        (a) => new Date(a.start_time) >= startOfToday
      ).length || 0;

      const appointmentsThisWeek = allAppointments?.filter(
        (a) => new Date(a.start_time) >= startOfWeek
      ).length || 0;

      const appointmentsThisMonth = allAppointments?.filter(
        (a) => new Date(a.start_time) >= startOfMonth
      ).length || 0;

      const appointmentsByStatus = {
        agendado: allAppointments?.filter((a) => a.status === 'agendado').length || 0,
        confirmado: allAppointments?.filter((a) => a.status === 'confirmado').length || 0,
        concluido: allAppointments?.filter((a) => a.status === 'concluido').length || 0,
        cancelado: allAppointments?.filter((a) => a.status === 'cancelado').length || 0,
      };

      // Patients
      const { data: allPatients, error: patientsError } = await supabase
        .from('patients')
        .select('status, created_at');

      if (patientsError) throw patientsError;

      const activePatients = allPatients?.filter((p) => p.status === 'ativo').length || 0;
      const newPatientsThisMonth = allPatients?.filter(
        (p) => p.created_at && new Date(p.created_at) >= startOfMonth
      ).length || 0;

      const patientsByStatus = {
        ativo: allPatients?.filter((p) => p.status === 'ativo').length || 0,
        inativo: allPatients?.filter((p) => p.status === 'inativo').length || 0,
        aguardando: allPatients?.filter((p) => p.status === 'aguardando').length || 0,
        alta: allPatients?.filter((p) => p.status === 'alta').length || 0,
      };

      // Financial
      const { data: transactions, error: financialError } = await supabase
        .from('payment_transactions')
        .select('amount, event_type, status, created_at')
        .eq('event_type', 'receita');

      if (financialError) throw financialError;

      const revenueThisMonth = transactions
        ?.filter(
          (t) =>
            t.created_at && new Date(t.created_at) >= startOfMonth &&
            t.status === 'pago'
        )
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const revenueThisYear = transactions
        ?.filter(
          (t) =>
            t.created_at && new Date(t.created_at) >= startOfYear &&
            t.status === 'pago'
        )
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const pendingPayments = transactions
        ?.filter((t) => t.status === 'pendente')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const transactionsThisMonth = transactions?.filter(
        (t) => t.created_at && new Date(t.created_at) >= startOfMonth
      ).length || 0;

      const stats: DashboardStats = {
        appointments: {
          total: allAppointments?.length || 0,
          today: appointmentsToday,
          thisWeek: appointmentsThisWeek,
          thisMonth: appointmentsThisMonth,
          byStatus: appointmentsByStatus,
        },
        patients: {
          total: allPatients?.length || 0,
          active: activePatients,
          newThisMonth: newPatientsThisMonth,
          byStatus: patientsByStatus,
        },
        financial: {
          revenueThisMonth,
          revenueThisYear,
          pendingPayments,
          transactionsThisMonth,
        },
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { data: null, error };
    }
  }

  /**
   * Get appointments trend (last N days)
   */
  static async getAppointmentsTrend(days: number = 30) {
    try {
      const supabase = await createServerComponentClient();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('appointments')
        .select('start_time, status')
        .gte('start_time', startDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Group by date
      const trend = data?.reduce((acc, appointment) => {
        const date = new Date(appointment.start_time).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, total: 0, completed: 0, cancelled: 0 };
        }
        acc[date].total++;
        if (appointment.status === 'concluido') acc[date].completed++;
        if (appointment.status === 'cancelado') acc[date].cancelled++;
        return acc;
      }, {} as Record<string, { date: string; total: number; completed: number; cancelled: number }>);

      return {
        data: Object.values(trend || {}),
        error: null,
      };
    } catch (error) {
      console.error('Error fetching appointments trend:', error);
      return { data: null, error };
    }
  }

  /**
   * Get revenue trend (last N days)
   */
  static async getRevenueTrend(days: number = 30) {
    try {
      const supabase = await createServerComponentClient();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('amount, created_at, status, event_type')
        .eq('event_type', 'receita')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const trend = data?.reduce((acc, transaction) => {
        if (!transaction.created_at) return acc;
        const date = new Date(transaction.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, pending: 0 };
        }
        if (transaction.status === 'pago') {
          acc[date].revenue += transaction.amount || 0;
        } else if (transaction.status === 'pendente') {
          acc[date].pending += transaction.amount || 0;
        }
        return acc;
      }, {} as Record<string, { date: string; revenue: number; pending: number }>);

      return {
        data: Object.values(trend || {}),
        error: null,
      };
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
      return { data: null, error };
    }
  }
}

