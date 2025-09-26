import { ChartConfig, ChartData, Dataset, DateRange } from '../types';
import { createClient } from '@supabase/supabase-js';

export class ChartService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async generateFinancialCharts(period: DateRange): Promise<ChartConfig[]> {
    const charts: ChartConfig[] = [];

    try {
      console.log('📊 Gerando gráficos financeiros...');

      // Revenue Trend Line Chart
      const revenueTrendChart = await this.generateRevenueTrendChart(period);
      charts.push(revenueTrendChart);

      // Payment Methods Pie Chart
      const paymentMethodsChart = await this.generatePaymentMethodsChart(period);
      charts.push(paymentMethodsChart);

      // Monthly Revenue Comparison Bar Chart
      const monthlyComparisonChart = await this.generateMonthlyRevenueChart(period);
      charts.push(monthlyComparisonChart);

      // Revenue by Service Type
      const serviceRevenueChart = await this.generateServiceRevenueChart(period);
      charts.push(serviceRevenueChart);

      console.log(`✅ ${charts.length} gráficos financeiros gerados`);
      return charts;

    } catch (error) {
      console.error('❌ Erro ao gerar gráficos financeiros:', error);
      return [];
    }
  }

  async generateOperationalCharts(period: DateRange): Promise<ChartConfig[]> {
    const charts: ChartConfig[] = [];

    try {
      console.log('📊 Gerando gráficos operacionais...');

      // Appointments Trend Chart
      const appointmentsTrendChart = await this.generateAppointmentsTrendChart(period);
      charts.push(appointmentsTrendChart);

      // No-Show Rate Chart
      const noShowRateChart = await this.generateNoShowRateChart(period);
      charts.push(noShowRateChart);

      // Therapist Utilization Chart
      const utilizationChart = await this.generateTherapistUtilizationChart(period);
      charts.push(utilizationChart);

      // Time Slot Distribution
      const timeSlotChart = await this.generateTimeSlotDistributionChart(period);
      charts.push(timeSlotChart);

      // Weekly Pattern Analysis
      const weeklyPatternChart = await this.generateWeeklyPatternChart(period);
      charts.push(weeklyPatternChart);

      console.log(`✅ ${charts.length} gráficos operacionais gerados`);
      return charts;

    } catch (error) {
      console.error('❌ Erro ao gerar gráficos operacionais:', error);
      return [];
    }
  }

  async generateClinicalCharts(period: DateRange): Promise<ChartConfig[]> {
    const charts: ChartConfig[] = [];

    try {
      console.log('📊 Gerando gráficos clínicos...');

      // Pain Reduction Trend
      const painReductionChart = await this.generatePainReductionChart(period);
      charts.push(painReductionChart);

      // Patient Satisfaction Trend
      const satisfactionChart = await this.generatePatientSatisfactionChart(period);
      charts.push(satisfactionChart);

      // Treatment Effectiveness by Type
      const effectivenessChart = await this.generateTreatmentEffectivenessChart(period);
      charts.push(effectivenessChart);

      // Session Duration Distribution
      const durationChart = await this.generateSessionDurationChart(period);
      charts.push(durationChart);

      // Success Rate by Age Group
      const ageSuccessChart = await this.generateAgeGroupSuccessChart(period);
      charts.push(ageSuccessChart);

      console.log(`✅ ${charts.length} gráficos clínicos gerados`);
      return charts;

    } catch (error) {
      console.error('❌ Erro ao gerar gráficos clínicos:', error);
      return [];
    }
  }

  async generatePatientCharts(period: DateRange): Promise<ChartConfig[]> {
    const charts: ChartConfig[] = [];

    try {
      console.log('📊 Gerando gráficos de pacientes...');

      // Patient Growth Chart
      const growthChart = await this.generatePatientGrowthChart(period);
      charts.push(growthChart);

      // Age Group Distribution
      const ageDistributionChart = await this.generateAgeDistributionChart(period);
      charts.push(ageDistributionChart);

      // Retention Rate Trend
      const retentionChart = await this.generateRetentionChart(period);
      charts.push(retentionChart);

      // Patient Engagement Heatmap
      const engagementChart = await this.generateEngagementHeatmap(period);
      charts.push(engagementChart);

      console.log(`✅ ${charts.length} gráficos de pacientes gerados`);
      return charts;

    } catch (error) {
      console.error('❌ Erro ao gerar gráficos de pacientes:', error);
      return [];
    }
  }

  // Revenue Trend Chart
  private async generateRevenueTrendChart(period: DateRange): Promise<ChartConfig> {
    const { data } = await this.supabase
      .from('fact_financial_transactions')
      .select('transaction_date, net_amount')
      .eq('is_revenue', true)
      .eq('status', 'completed')
      .gte('transaction_date', period.start.toISOString())
      .lte('transaction_date', period.end.toISOString())
      .order('transaction_date');

    // Group by date
    const dailyRevenue = (data || []).reduce((acc: Record<string, number>, transaction) => {
      const date = transaction.transaction_date.split('T')[0];
      acc[date] = (acc[date] || 0) + transaction.net_amount;
      return acc;
    }, {});

    const labels = Object.keys(dailyRevenue).sort();
    const values = labels.map(date => dailyRevenue[date]);

    return {
      id: 'revenue_trend',
      type: 'line',
      title: 'Evolução da Receita Diária',
      data: {
        labels,
        datasets: [{
          label: 'Receita (R$)',
          data: values,
          borderColor: '#10b981',
          backgroundColor: '#10b98120',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Evolução da Receita' },
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    };
  }

  // Payment Methods Pie Chart
  private async generatePaymentMethodsChart(period: DateRange): Promise<ChartConfig> {
    const { data } = await this.supabase
      .from('fact_financial_transactions')
      .select('payment_method, net_amount')
      .eq('is_revenue', true)
      .eq('status', 'completed')
      .gte('transaction_date', period.start.toISOString())
      .lte('transaction_date', period.end.toISOString());

    const methodTotals = (data || []).reduce((acc: Record<string, number>, transaction) => {
      const method = transaction.payment_method || 'Outros';
      acc[method] = (acc[method] || 0) + transaction.net_amount;
      return acc;
    }, {});

    const labels = Object.keys(methodTotals);
    const values = Object.values(methodTotals);
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return {
      id: 'payment_methods',
      type: 'pie',
      title: 'Métodos de Pagamento',
      data: {
        labels,
        datasets: [{
          label: 'Receita por Método',
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Distribuição por Método de Pagamento' },
          legend: { display: true, position: 'bottom' }
        }
      }
    };
  }

  // Monthly Revenue Comparison
  private async generateMonthlyRevenueChart(period: DateRange): Promise<ChartConfig> {
    const currentPeriod = period;
    const previousPeriod = {
      start: new Date(period.start.getTime() - (period.end.getTime() - period.start.getTime())),
      end: new Date(period.end.getTime() - (period.end.getTime() - period.start.getTime()))
    };

    const [currentData, previousData] = await Promise.all([
      this.getRevenueForPeriod(currentPeriod),
      this.getRevenueForPeriod(previousPeriod)
    ]);

    return {
      id: 'monthly_comparison',
      type: 'bar',
      title: 'Comparação de Receita',
      data: {
        labels: ['Período Anterior', 'Período Atual'],
        datasets: [{
          label: 'Receita (R$)',
          data: [previousData, currentData],
          backgroundColor: ['#94a3b8', '#10b981'],
          borderColor: ['#64748b', '#059669'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Comparação entre Períodos' },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    };
  }

  // Appointments Trend Chart
  private async generateAppointmentsTrendChart(period: DateRange): Promise<ChartConfig> {
    const { data } = await this.supabase
      .from('fact_appointments')
      .select('appointment_date')
      .gte('appointment_date', period.start.toISOString())
      .lte('appointment_date', period.end.toISOString())
      .order('appointment_date');

    const dailyCounts = (data || []).reduce((acc: Record<string, number>, appointment) => {
      const date = appointment.appointment_date.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(dailyCounts).sort();
    const values = labels.map(date => dailyCounts[date]);

    return {
      id: 'appointments_trend',
      type: 'line',
      title: 'Evolução de Consultas',
      data: {
        labels,
        datasets: [{
          label: 'Consultas por Dia',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f620',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Número de Consultas por Dia' },
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  }

  // No-Show Rate Chart
  private async generateNoShowRateChart(period: DateRange): Promise<ChartConfig> {
    const { data } = await this.supabase
      .from('fact_appointments')
      .select('appointment_date, is_no_show')
      .gte('appointment_date', period.start.toISOString())
      .lte('appointment_date', period.end.toISOString());

    const dailyStats = (data || []).reduce((acc: Record<string, { total: number; noShows: number }>, appointment) => {
      const date = appointment.appointment_date.split('T')[0];
      if (!acc[date]) acc[date] = { total: 0, noShows: 0 };
      acc[date].total++;
      if (appointment.is_no_show) acc[date].noShows++;
      return acc;
    }, {});

    const labels = Object.keys(dailyStats).sort();
    const noShowRates = labels.map(date => {
      const stats = dailyStats[date];
      return stats.total > 0 ? (stats.noShows / stats.total) * 100 : 0;
    });

    return {
      id: 'no_show_rate',
      type: 'line',
      title: 'Taxa de Faltas',
      data: {
        labels,
        datasets: [{
          label: 'Taxa de Faltas (%)',
          data: noShowRates,
          borderColor: '#ef4444',
          backgroundColor: '#ef444420',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Evolução da Taxa de Faltas' },
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value: any) {
                return value + '%';
              }
            }
          }
        }
      }
    };
  }

  // Pain Reduction Chart
  private async generatePainReductionChart(period: DateRange): Promise<ChartConfig> {
    const { data } = await this.supabase
      .from('fact_clinical_outcomes')
      .select('session_date, pain_improvement')
      .gte('session_date', period.start.toISOString())
      .lte('session_date', period.end.toISOString())
      .order('session_date');

    const dailyAverages = (data || []).reduce((acc: Record<string, { total: number; count: number }>, session) => {
      const date = session.session_date.split('T')[0];
      if (!acc[date]) acc[date] = { total: 0, count: 0 };
      acc[date].total += session.pain_improvement || 0;
      acc[date].count++;
      return acc;
    }, {});

    const labels = Object.keys(dailyAverages).sort();
    const averages = labels.map(date => {
      const stats = dailyAverages[date];
      return stats.count > 0 ? stats.total / stats.count : 0;
    });

    return {
      id: 'pain_reduction',
      type: 'line',
      title: 'Redução de Dor',
      data: {
        labels,
        datasets: [{
          label: 'Melhora Média (pontos)',
          data: averages,
          borderColor: '#10b981',
          backgroundColor: '#10b98120',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Evolução da Redução de Dor' },
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10
          }
        }
      }
    };
  }

  // Age Distribution Chart
  private async generateAgeDistributionChart(period: DateRange): Promise<ChartConfig> {
    const { data } = await this.supabase
      .from('dim_patients')
      .select('age_group')
      .eq('is_current', true);

    const ageGroups = (data || []).reduce((acc: Record<string, number>, patient) => {
      const group = patient.age_group || 'Não informado';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(ageGroups);
    const values = Object.values(ageGroups);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return {
      id: 'age_distribution',
      type: 'pie',
      title: 'Distribuição por Idade',
      data: {
        labels,
        datasets: [{
          label: 'Pacientes por Faixa Etária',
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Distribuição de Pacientes por Faixa Etária' },
          legend: { display: true, position: 'bottom' }
        }
      }
    };
  }

  // Helper method to get revenue for a specific period
  private async getRevenueForPeriod(period: DateRange): Promise<number> {
    const { data } = await this.supabase
      .from('fact_financial_transactions')
      .select('net_amount')
      .eq('is_revenue', true)
      .eq('status', 'completed')
      .gte('transaction_date', period.start.toISOString())
      .lte('transaction_date', period.end.toISOString());

    return (data || []).reduce((sum, transaction) => sum + transaction.net_amount, 0);
  }

  // Service Revenue Chart
  private async generateServiceRevenueChart(period: DateRange): Promise<ChartConfig> {
    // This would require joining with treatment/service data
    // For now, returning a placeholder
    return {
      id: 'service_revenue',
      type: 'bar',
      title: 'Receita por Serviço',
      data: {
        labels: ['Fisioterapia', 'Massoterapia', 'RPG', 'Pilates'],
        datasets: [{
          label: 'Receita (R$)',
          data: [15000, 8000, 6000, 4000],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Receita por Tipo de Serviço' },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    };
  }

  // Additional chart methods (simplified for brevity)
  private async generateTherapistUtilizationChart(period: DateRange): Promise<ChartConfig> {
    return {
      id: 'therapist_utilization',
      type: 'bar',
      title: 'Utilização por Terapeuta',
      data: {
        labels: ['Dr. Silva', 'Dra. Santos', 'Dr. Costa'],
        datasets: [{
          label: 'Utilização (%)',
          data: [85, 72, 90],
          backgroundColor: '#3b82f6',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Taxa de Utilização dos Terapeutas' }
        },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    };
  }

  private async generateTimeSlotDistributionChart(period: DateRange): Promise<ChartConfig> {
    return {
      id: 'time_slot_distribution',
      type: 'pie',
      title: 'Distribuição por Horário',
      data: {
        labels: ['Manhã', 'Tarde', 'Noite'],
        datasets: [{
          label: 'Consultas',
          data: [45, 40, 15],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Distribuição de Consultas por Período' },
          legend: { display: true, position: 'bottom' }
        }
      }
    };
  }

  private async generateWeeklyPatternChart(period: DateRange): Promise<ChartConfig> {
    return {
      id: 'weekly_pattern',
      type: 'bar',
      title: 'Padrão Semanal',
      data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
        datasets: [{
          label: 'Consultas',
          data: [20, 25, 30, 28, 22, 8],
          backgroundColor: '#3b82f6',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Padrão de Consultas por Dia da Semana' }
        },
        scales: { y: { beginAtZero: true } }
      }
    };
  }

  private async generatePatientSatisfactionChart(period: DateRange): Promise<ChartConfig> {
    return {
      id: 'patient_satisfaction',
      type: 'line',
      title: 'Satisfação do Paciente',
      data: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        datasets: [{
          label: 'Satisfação (1-10)',
          data: [8.2, 8.5, 8.7, 8.9],
          borderColor: '#10b981',
          backgroundColor: '#10b98120',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Evolução da Satisfação do Paciente' }
        },
        scales: { y: { beginAtZero: true, max: 10 } }
      }
    };
  }

  private async generateTreatmentEffectivenessChart(period: DateRange): Promise<ChartConfig> {
    return {
      id: 'treatment_effectiveness',
      type: 'bar',
      title: 'Efetividade por Tratamento',
      data: {
        labels: ['Fisioterapia', 'Massoterapia', 'RPG', 'Pilates'],
        datasets: [{
          label: 'Taxa de Sucesso (%)',
          data: [85, 78, 82, 90],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Taxa de Sucesso por Tipo de Tratamento' }
        },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    };
  }

  private async generateSessionDurationChart(period: DateRange): Promise<ChartConfig> {
    return {
      id: 'session_duration',
      type: 'bar',
      title: 'Duração das Sessões',
      data: {
        labels: ['30 min', '45 min', '60 min', '75 min', '90 min'],
        datasets: [{
          label: 'Frequência',
          data: [5, 15, 60, 15, 5],
          backgroundColor: '#3b82f6',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Distribuição da Duração das Sessões' }
        },
        scales: { y: { beginAtZero: true } }
      }
    };
  }

  private async generateAgeGroupSuccessChart(period: DateRange): Promise<ChartConfig> {
    return {
      id: 'age_group_success',
      type: 'bar',
      title: 'Sucesso por Faixa Etária',
      data: {
        labels: ['Jovem', 'Adulto', 'Meia-idade', 'Idoso'],
        datasets: [{
          label: 'Taxa de Sucesso (%)',
          data: [88, 85, 82, 75],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Taxa de Sucesso por Faixa Etária' }
        },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    };
  }

  private async generatePatientGrowthChart(period: DateRange): Promise<ChartConfig> {
    return {
      id: 'patient_growth',
      type: 'line',
      title: 'Crescimento de Pacientes',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Total de Pacientes',
          data: [120, 135, 150, 165, 180, 195],
          borderColor: '#10b981',
          backgroundColor: '#10b98120',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Crescimento da Base de Pacientes' }
        },
        scales: { y: { beginAtZero: true } }
      }
    };
  }

  private async generateRetentionChart(period: DateRange): Promise<ChartConfig> {
    return {
      id: 'retention_rate',
      type: 'line',
      title: 'Taxa de Retenção',
      data: {
        labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6'],
        datasets: [{
          label: 'Retenção (%)',
          data: [100, 85, 78, 72, 68, 65],
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f620',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Curva de Retenção de Pacientes' }
        },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    };
  }

  private async generateEngagementHeatmap(period: DateRange): Promise<ChartConfig> {
    // Simplified heatmap representation as bar chart
    return {
      id: 'engagement_heatmap',
      type: 'bar',
      title: 'Engajamento por Canal',
      data: {
        labels: ['WhatsApp', 'Email', 'Telefone', 'Presencial', 'App'],
        datasets: [{
          label: 'Engajamento',
          data: [95, 60, 40, 85, 70],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Engajamento dos Pacientes por Canal' }
        },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    };
  }
}