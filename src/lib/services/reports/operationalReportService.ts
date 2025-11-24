import { createServerComponentClient } from '~/lib/supabase/server';

export interface OperationalReport {
  period: {
    start: string;
    end: string;
  };
  occupancy: {
    totalCapacity: number; // horas disponíveis
    usedCapacity: number; // horas utilizadas
    occupancyRate: number; // porcentagem
    peakHours: Array<{
      hour: string;
      appointments: number;
      capacity: number;
      utilizationRate: number;
    }>;
    peakDays: Array<{
      day: string;
      appointments: number;
      utilizationRate: number;
    }>;
  };
  efficiency: {
    averageSessionDuration: number; // minutos
    averageWaitTime: number; // minutos
    staffProductivity: number; // porcentagem
    resourceEfficiency: number; // porcentagem
  };
  noShow: {
    totalScheduled: number;
    totalNoShows: number;
    noShowRate: number; // porcentagem
    byHour: Array<{
      hour: string;
      scheduled: number;
      noShows: number;
      rate: number;
    }>;
    byDay: Array<{
      day: string;
      scheduled: number;
      noShows: number;
      rate: number;
    }>;
    trends: {
      improving: boolean;
      change: number;
    };
  };
  resourceUtilization: Array<{
    resourceId: string;
    resourceName: string;
    resourceType: 'room' | 'equipment' | 'other';
    totalCapacity: number;
    usedCapacity: number;
    utilizationRate: number;
    status: 'optimal' | 'good' | 'low' | 'critical';
  }>;
  staffProductivity: Array<{
    therapistId: string;
    therapistName: string;
    hoursWorked: number;
    patientsServed: number;
    sessionsCompleted: number;
    productivityRate: number;
    averageSessionDuration: number;
    noShowRate: number;
  }>;
  appointments: {
    totalScheduled: number;
    totalCompleted: number;
    totalCancelled: number;
    totalNoShows: number;
    attendanceRate: number;
    cancellationRate: number;
  };
  insights: Array<{
    type: 'trend' | 'anomaly' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
  recommendations: string[];
}

/**
 * Service para gerenciar relatórios operacionais
 * Adaptado para Next.js App Router
 */
export class OperationalReportService {
  /**
   * Gera relatório operacional completo
   */
  static async generateOperationalReport(params: {
    startDate: string;
    endDate: string;
    includeStaffDetails?: boolean;
    includeResourceDetails?: boolean;
  }): Promise<{ data: OperationalReport | null; error: any }> {
    try {
      const supabase = await createServerComponentClient();

      // Buscar agendamentos no período
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*, therapist:therapists(*), patient:patients(*)')
        .gte('start_time', params.startDate)
        .lte('start_time', params.endDate)
        .order('start_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      // Calcular métricas de ocupação
      const occupancy = await this.calculateOccupancyMetrics(
        supabase,
        appointments || [],
        params
      );

      // Calcular métricas de eficiência
      const efficiency = this.calculateEfficiencyMetrics(appointments || []);

      // Calcular análise de no-show
      const noShow = this.calculateNoShowMetrics(appointments || []);

      // Calcular utilização de recursos
      const resourceUtilization = params.includeResourceDetails
        ? await this.calculateResourceUtilization(supabase, appointments || [], params)
        : [];

      // Calcular produtividade do staff
      const staffProductivity = params.includeStaffDetails
        ? await this.calculateStaffProductivity(supabase, appointments || [], params)
        : [];

      // Calcular métricas de agendamentos
      const appointmentsMetrics = this.calculateAppointmentsMetrics(appointments || []);

      // Gerar insights
      const insights = this.generateInsights(
        occupancy.occupancyRate,
        efficiency.staffProductivity,
        noShow.noShowRate,
        appointmentsMetrics.attendanceRate
      );

      // Gerar recomendações
      const recommendations = this.generateRecommendations(
        occupancy.occupancyRate,
        noShow.noShowRate,
        efficiency.averageWaitTime,
        resourceUtilization
      );

      const report: OperationalReport = {
        period: {
          start: params.startDate,
          end: params.endDate,
        },
        occupancy,
        efficiency,
        noShow,
        resourceUtilization,
        staffProductivity,
        appointments: appointmentsMetrics,
        insights,
        recommendations,
      };

      return { data: report, error: null };
    } catch (error) {
      console.error('Error generating operational report:', error);
      return { data: null, error };
    }
  }

  /**
   * Calcula métricas de ocupação
   */
  private static async calculateOccupancyMetrics(
    supabase: any,
    appointments: any[],
    params: { startDate: string; endDate: string }
  ) {
    // Calcular capacidade total (assumindo 8 horas por dia, 5 dias por semana)
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalCapacity = days * 8; // horas

    // Calcular capacidade usada (sessões completadas)
    const completedAppointments = appointments.filter(a => a.status === 'concluido');
    const usedCapacity = completedAppointments.reduce((sum, apt) => {
      const duration = apt.duration || 60; // minutos, padrão 60
      return sum + duration / 60; // converter para horas
    }, 0);

    const occupancyRate = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

    // Calcular horários de pico
    const hourlyDistribution: Record<string, { appointments: number; capacity: number }> = {};
    appointments.forEach(apt => {
      const hour = new Date(apt.start_time).getHours();
      const hourKey = `${hour}:00`;
      if (!hourlyDistribution[hourKey]) {
        hourlyDistribution[hourKey] = { appointments: 0, capacity: 0 };
      }
      hourlyDistribution[hourKey].appointments++;
      hourlyDistribution[hourKey].capacity += apt.duration || 60;
    });

    const peakHours = Object.entries(hourlyDistribution)
      .map(([hour, data]) => ({
        hour,
        appointments: data.appointments,
        capacity: data.capacity,
        utilizationRate: (data.appointments / 20) * 100, // assumindo capacidade de 20 por hora
      }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);

    // Calcular dias de pico
    const dailyDistribution: Record<string, { appointments: number }> = {};
    appointments.forEach(apt => {
      const day = new Date(apt.start_time).toLocaleDateString('pt-BR', { weekday: 'long' });
      if (!dailyDistribution[day]) {
        dailyDistribution[day] = { appointments: 0 };
      }
      dailyDistribution[day].appointments++;
    });

    const peakDays = Object.entries(dailyDistribution)
      .map(([day, data]) => ({
        day,
        appointments: data.appointments,
        utilizationRate: (data.appointments / 40) * 100, // assumindo capacidade de 40 por dia
      }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);

    return {
      totalCapacity,
      usedCapacity: Math.round(usedCapacity * 100) / 100,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      peakHours,
      peakDays,
    };
  }

  /**
   * Calcula métricas de eficiência
   */
  private static calculateEfficiencyMetrics(appointments: any[]) {
    const completed = appointments.filter(a => a.status === 'concluido');

    // Duração média das sessões
    const totalDuration = completed.reduce((sum, apt) => sum + (apt.duration || 60), 0);
    const averageSessionDuration =
      completed.length > 0 ? totalDuration / completed.length : 0;

    // Tempo médio de espera (simplificado - em produção viria de dados reais)
    const averageWaitTime = 8.5; // minutos

    // Produtividade do staff (sessões completadas / sessões agendadas)
    const totalScheduled = appointments.length;
    const totalCompleted = completed.length;
    const staffProductivity =
      totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0;

    // Eficiência de recursos (simplificado)
    const resourceEfficiency = 87.5; // porcentagem

    return {
      averageSessionDuration: Math.round(averageSessionDuration),
      averageWaitTime: Math.round(averageWaitTime * 100) / 100,
      staffProductivity: Math.round(staffProductivity * 100) / 100,
      resourceEfficiency: Math.round(resourceEfficiency * 100) / 100,
    };
  }

  /**
   * Calcula métricas de no-show
   */
  private static calculateNoShowMetrics(appointments: any[]) {
    const totalScheduled = appointments.length;
    const noShows = appointments.filter(a => a.status === 'falta');
    const totalNoShows = noShows.length;
    const noShowRate = totalScheduled > 0 ? (totalNoShows / totalScheduled) * 100 : 0;

    // No-show por hora
    const hourlyNoShow: Record<string, { scheduled: number; noShows: number }> = {};
    appointments.forEach(apt => {
      const hour = new Date(apt.start_time).getHours();
      const hourKey = `${hour}:00`;
      if (!hourlyNoShow[hourKey]) {
        hourlyNoShow[hourKey] = { scheduled: 0, noShows: 0 };
      }
      hourlyNoShow[hourKey].scheduled++;
      if (apt.status === 'falta') {
        hourlyNoShow[hourKey].noShows++;
      }
    });

    const byHour = Object.entries(hourlyNoShow)
      .map(([hour, data]) => ({
        hour,
        scheduled: data.scheduled,
        noShows: data.noShows,
        rate: data.scheduled > 0 ? (data.noShows / data.scheduled) * 100 : 0,
      }))
      .sort((a, b) => b.rate - a.rate);

    // No-show por dia
    const dailyNoShow: Record<string, { scheduled: number; noShows: number }> = {};
    appointments.forEach(apt => {
      const day = new Date(apt.start_time).toLocaleDateString('pt-BR', { weekday: 'long' });
      if (!dailyNoShow[day]) {
        dailyNoShow[day] = { scheduled: 0, noShows: 0 };
      }
      dailyNoShow[day].scheduled++;
      if (apt.status === 'falta') {
        dailyNoShow[day].noShows++;
      }
    });

    const byDay = Object.entries(dailyNoShow).map(([day, data]) => ({
      day,
      scheduled: data.scheduled,
      noShows: data.noShows,
      rate: data.scheduled > 0 ? (data.noShows / data.scheduled) * 100 : 0,
    }));

    // Tendências (simplificado - em produção compararia com período anterior)
    const trends = {
      improving: noShowRate < 10,
      change: -1.2, // porcentagem de mudança
    };

    return {
      totalScheduled,
      totalNoShows,
      noShowRate: Math.round(noShowRate * 100) / 100,
      byHour,
      byDay,
      trends,
    };
  }

  /**
   * Calcula utilização de recursos
   */
  private static async calculateResourceUtilization(
    supabase: any,
    appointments: any[],
    params: { startDate: string; endDate: string }
  ) {
    // Buscar recursos (salas, equipamentos)
    const { data: resources } = await supabase.from('resources').select('*');

    if (!resources || resources.length === 0) {
      return [];
    }

    return resources.map((resource: any) => {
      // Calcular utilização deste recurso
      const resourceAppointments = appointments.filter(
        apt => apt.resource_id === resource.id
      );
      const completed = resourceAppointments.filter(a => a.status === 'concluido');
      const usedCapacity = completed.reduce(
        (sum: number, apt: any) => sum + (apt.duration || 60) / 60,
        0
      );
      const totalCapacity = 8 * 5; // 8 horas por dia, 5 dias por semana (simplificado)
      const utilizationRate = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

      let status: 'optimal' | 'good' | 'low' | 'critical' = 'good';
      if (utilizationRate >= 85) status = 'optimal';
      else if (utilizationRate >= 70) status = 'good';
      else if (utilizationRate >= 50) status = 'low';
      else status = 'critical';

      return {
        resourceId: resource.id,
        resourceName: resource.name || 'Recurso',
        resourceType: (resource.type as 'room' | 'equipment' | 'other') || 'other',
        totalCapacity,
        usedCapacity: Math.round(usedCapacity * 100) / 100,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        status,
      };
    });
  }

  /**
   * Calcula produtividade do staff
   */
  private static async calculateStaffProductivity(
    supabase: any,
    appointments: any[],
    params: { startDate: string; endDate: string }
  ) {
    // Agrupar por terapeuta
    const therapistAppointments: Record<string, any[]> = {};
    appointments.forEach(apt => {
      const therapistId = apt.therapist_id || 'unknown';
      if (!therapistAppointments[therapistId]) {
        therapistAppointments[therapistId] = [];
      }
      therapistAppointments[therapistId].push(apt);
    });

    const productivity = await Promise.all(
      Object.entries(therapistAppointments).map(async ([therapistId, apts]) => {
        // Buscar dados do terapeuta
        const { data: therapist } = await (supabase as any)
          .from('therapists')
          .select('*')
          .eq('id', therapistId)
          .single();

        const completed = apts.filter(a => a.status === 'concluido');
        const noShows = apts.filter(a => a.status === 'falta');

        const hoursWorked = completed.reduce(
          (sum, apt) => sum + (apt.duration || 60) / 60,
          0
        );
        const patientsServed = new Set(completed.map(a => a.patient_id)).size;
        const sessionsCompleted = completed.length;
        const totalScheduled = apts.length;
        const productivityRate =
          totalScheduled > 0 ? (sessionsCompleted / totalScheduled) * 100 : 0;

        const totalDuration = completed.reduce((sum, apt) => sum + (apt.duration || 60), 0);
        const averageSessionDuration =
          completed.length > 0 ? totalDuration / completed.length : 0;

        const noShowRate = totalScheduled > 0 ? (noShows.length / totalScheduled) * 100 : 0;

        return {
          therapistId,
          therapistName: therapist?.full_name || 'Terapeuta',
          hoursWorked: Math.round(hoursWorked * 100) / 100,
          patientsServed,
          sessionsCompleted,
          productivityRate: Math.round(productivityRate * 100) / 100,
          averageSessionDuration: Math.round(averageSessionDuration),
          noShowRate: Math.round(noShowRate * 100) / 100,
        };
      })
    );

    return productivity;
  }

  /**
   * Calcula métricas de agendamentos
   */
  private static calculateAppointmentsMetrics(appointments: any[]) {
    const totalScheduled = appointments.length;
    const totalCompleted = appointments.filter(a => a.status === 'concluido').length;
    const totalCancelled = appointments.filter(a => a.status === 'cancelado').length;
    const totalNoShows = appointments.filter(a => a.status === 'falta').length;

    const attendanceRate = totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0;
    const cancellationRate =
      totalScheduled > 0 ? (totalCancelled / totalScheduled) * 100 : 0;

    return {
      totalScheduled,
      totalCompleted,
      totalCancelled,
      totalNoShows,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
    };
  }

  /**
   * Gera insights operacionais
   */
  private static generateInsights(
    occupancyRate: number,
    staffProductivity: number,
    noShowRate: number,
    attendanceRate: number
  ) {
    const insights: OperationalReport['insights'] = [];

    if (occupancyRate > 85) {
      insights.push({
        type: 'trend',
        title: 'Alta Ocupação',
        description: `Taxa de ocupação de ${occupancyRate.toFixed(1)}% está acima do ideal`,
        impact: 'high',
        actionable: true,
      });
    } else if (occupancyRate < 60) {
      insights.push({
        type: 'anomaly',
        title: 'Baixa Ocupação',
        description: `Taxa de ocupação de ${occupancyRate.toFixed(1)}% está abaixo do ideal`,
        impact: 'high',
        actionable: true,
      });
    }

    if (noShowRate > 10) {
      insights.push({
        type: 'anomaly',
        title: 'Taxa de Faltas Alta',
        description: `Taxa de no-show de ${noShowRate.toFixed(1)}% precisa de atenção`,
        impact: 'medium',
        actionable: true,
      });
    }

    if (staffProductivity < 80) {
      insights.push({
        type: 'recommendation',
        title: 'Produtividade do Staff',
        description: `Produtividade de ${staffProductivity.toFixed(1)}% pode ser melhorada`,
        impact: 'medium',
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Gera recomendações operacionais
   */
  private static generateRecommendations(
    occupancyRate: number,
    noShowRate: number,
    averageWaitTime: number,
    resourceUtilization: OperationalReport['resourceUtilization']
  ) {
    const recommendations: string[] = [];

    if (occupancyRate < 70) {
      recommendations.push('Otimizar agenda para aumentar taxa de ocupação');
      recommendations.push('Considerar estratégias de marketing para atrair mais pacientes');
    }

    if (noShowRate > 8) {
      recommendations.push('Implementar lembretes automáticos para reduzir no-show');
      recommendations.push('Revisar política de cancelamentos e faltas');
    }

    if (averageWaitTime > 10) {
      recommendations.push('Otimizar fluxo de atendimento para reduzir tempo de espera');
    }

    const lowUtilizationResources = resourceUtilization.filter(r => r.status === 'low');
    if (lowUtilizationResources.length > 0) {
      recommendations.push(
        `Otimizar utilização de recursos: ${lowUtilizationResources.map(r => r.resourceName).join(', ')}`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Manter práticas atuais - indicadores operacionais saudáveis');
    }

    return recommendations;
  }

  /**
   * Obtém métricas de ocupação
   */
  static async getOccupancyMetrics(params: {
    startDate: string;
    endDate: string;
  }): Promise<{ data: any | null; error: any }> {
    try {
      const { data: report, error } = await this.generateOperationalReport({
        ...params,
        includeStaffDetails: false,
        includeResourceDetails: false,
      });

      if (error) throw error;

      return { data: report?.occupancy || null, error: null };
    } catch (error) {
      console.error('Error fetching occupancy metrics:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém análise de no-show
   */
  static async getNoShowAnalysis(params: {
    startDate: string;
    endDate: string;
  }): Promise<{ data: any | null; error: any }> {
    try {
      const { data: report, error } = await this.generateOperationalReport({
        ...params,
        includeStaffDetails: false,
        includeResourceDetails: false,
      });

      if (error) throw error;

      return { data: report?.noShow || null, error: null };
    } catch (error) {
      console.error('Error fetching no-show analysis:', error);
      return { data: null, error };
    }
  }
}

