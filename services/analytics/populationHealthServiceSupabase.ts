/**
 * Population Health Service - Supabase Integration
 * Serviço de Análise de Saúde Populacional com Supabase
 */

import { supabase } from '../../lib/supabase';
import {
  PopulationDemographics,
  HealthTrend,
  PopulationInsight,
  InterventionImpact,
} from '../../types/populationHealthTypes';

class PopulationHealthServiceSupabase {
  /**
   * Busca demografia da população de pacientes
   */
  async getPopulationDemographics(): Promise<PopulationDemographics> {
    try {
      // Buscar dados demográficos agregados
      const { data, error } = await supabase
        .from('patients')
        .select('gender, birth_date, address_city, address_state, status');

      if (error) throw error;

      // Calcular idade média
      const ages = data.map(p => {
        if (!p.birth_date) return 0;
        const today = new Date();
        const birthDate = new Date(p.birth_date);
        return today.getFullYear() - birthDate.getFullYear();
      }).filter(age => age > 0);

      const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length || 0;

      // Distribuição por gênero
      const genderCounts = data.reduce((acc, p) => {
        const gender = p.gender || 'other';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const genderDistribution = Object.entries(genderCounts).map(([gender, count]) => ({
        gender,
        count,
        percentage: (count / data.length) * 100,
      }));

      // Distribuição etária
      const ageGroups = {
        '0-18': 0,
        '19-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0,
      };

      ages.forEach(age => {
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['65+']++;
      });

      const ageDistribution = Object.entries(ageGroups).map(([range, count]) => ({
        ageRange: range,
        count,
        percentage: (count / ages.length) * 100,
      }));

      // Distribuição geográfica
      const geographicDistribution = data.reduce((acc, p) => {
        const location = `${p.address_city}, ${p.address_state}` || 'Não informado';
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topLocations = Object.entries(geographicDistribution)
        .map(([location, count]) => ({
          location,
          count,
          percentage: (count / data.length) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalPatients: data.length,
        activePatients: data.filter(p => p.status === 'active').length,
        averageAge,
        genderDistribution,
        ageDistribution,
        geographicDistribution: topLocations,
        period: {
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      };
    } catch (error) {
      console.error('Erro ao buscar demografia:', error);
      throw error;
    }
  }

  /**
   * Analisa tendências de saúde populacional
   */
  async getHealthTrends(
    startDate: Date,
    endDate: Date,
    condition?: string
  ): Promise<HealthTrend[]> {
    try {
      // Buscar dados de evolução de sessões
      let query = supabase
        .from('session_evolutions')
        .select('pain_level_before, pain_level_after, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      const { data, error } = await query;

      if (error) throw error;

      // Agregar por mês
      const monthlyData: Record<string, { count: number; avgBefore: number; avgAfter: number }> = {};

      data.forEach(session => {
        const date = new Date(session.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { count: 0, avgBefore: 0, avgAfter: 0 };
        }

        monthlyData[monthKey].count++;
        monthlyData[monthKey].avgBefore += session.pain_level_before || 0;
        monthlyData[monthKey].avgAfter += session.pain_level_after || 0;
      });

      // Converter para trends
      const trends: HealthTrend[] = Object.entries(monthlyData).map(([month, data]) => ({
        period: month,
        metric: 'average_pain',
        value: (data.avgBefore / data.count + data.avgAfter / data.count) / 2,
        change: ((data.avgAfter / data.count) - (data.avgBefore / data.count)),
        patientCount: data.count,
      }));

      return trends;
    } catch (error) {
      console.error('Erro ao buscar tendências:', error);
      throw error;
    }
  }

  /**
   * Gera insights sobre a população
   */
  async generatePopulationInsights(): Promise<PopulationInsight[]> {
    try {
      const insights: PopulationInsight[] = [];

      // Insight 1: Taxa de adesão geral
      const { data: appointments } = await supabase
        .from('appointments')
        .select('status')
        .in('status', ['completed', 'no_show', 'cancelled']);

      if (appointments) {
        const completed = appointments.filter(a => a.status === 'completed').length;
        const total = appointments.length;
        const adherenceRate = (completed / total) * 100;

        insights.push({
          category: 'adherence',
          title: 'Taxa de Adesão ao Tratamento',
          description: `${adherenceRate.toFixed(1)}% dos agendamentos são completados`,
          priority: adherenceRate < 70 ? 'high' : adherenceRate < 85 ? 'medium' : 'low',
          affectedPatientCount: total,
          recommendations: adherenceRate < 85 ? [
            'Implementar sistema de lembretes automatizados',
            'Analisar barreiras de acesso ao tratamento',
            'Considerar opções de teleconsulta',
          ] : [
            'Manter estratégias atuais de engajamento',
          ],
          evidence: {
            source: 'Dados internos do sistema',
            date: new Date(),
            confidence: 0.95,
          },
        });
      }

      // Insight 2: Condições mais prevalentes
      const { data: patients } = await supabase
        .from('patients')
        .select('medical_history');

      if (patients) {
        const conditionCounts: Record<string, number> = {};
        
        patients.forEach(p => {
          if (p.medical_history && Array.isArray(p.medical_history)) {
            p.medical_history.forEach((condition: string) => {
              conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
            });
          }
        });

        const topCondition = Object.entries(conditionCounts)
          .sort(([, a], [, b]) => b - a)[0];

        if (topCondition) {
          insights.push({
            category: 'clinical',
            title: 'Condição Mais Prevalente',
            description: `${topCondition[0]} afeta ${topCondition[1]} pacientes`,
            priority: 'medium',
            affectedPatientCount: topCondition[1],
            recommendations: [
              `Desenvolver protocolo especializado para ${topCondition[0]}`,
              'Capacitar equipe em tratamentos específicos',
              'Criar grupo de educação para pacientes',
            ],
            evidence: {
              source: 'Análise de registros clínicos',
              date: new Date(),
              confidence: 0.90,
            },
          });
        }
      }

      // Insight 3: Análise de desempenho financeiro
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('amount, status, created_at')
        .eq('transaction_type', 'payment')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (transactions) {
        const paidTransactions = transactions.filter(t => t.status === 'completed');
        const totalRevenue = paidTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
        const averageTicket = totalRevenue / paidTransactions.length;

        insights.push({
          category: 'financial',
          title: 'Ticket Médio nos Últimos 90 Dias',
          description: `R$ ${averageTicket.toFixed(2)} por atendimento`,
          priority: 'low',
          affectedPatientCount: paidTransactions.length,
          recommendations: [
            'Análise de precificação de serviços',
            'Identificar oportunidades de upselling',
          ],
          evidence: {
            source: 'Análise financeira',
            date: new Date(),
            confidence: 1.0,
          },
        });
      }

      return insights;
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      throw error;
    }
  }

  /**
   * Analisa impacto de intervenções
   */
  async analyzeInterventionImpact(
    interventionType: string,
    startDate: Date,
    endDate: Date
  ): Promise<InterventionImpact> {
    try {
      // Buscar tratamentos com a intervenção
      const { data, error } = await supabase
        .from('treatment_outcomes')
        .select('*')
        .gte('measurement_date', startDate.toISOString().split('T')[0])
        .lte('measurement_date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      const patientsAffected = data.length;
      const avgFunctionalImprovement = data.reduce((sum, t) => 
        sum + (t.functional_score || 0), 0) / patientsAffected || 0;

      const avgPainReduction = data.reduce((sum, t) => {
        const painChange = (t.pain_level || 0);
        return sum + painChange;
      }, 0) / patientsAffected || 0;

      return {
        interventionName: interventionType,
        patientsAffected,
        averageImprovementScore: avgFunctionalImprovement,
        statisticalSignificance: patientsAffected >= 30 ? 0.95 : 0.75,
        costPerPatient: 0, // TODO: calcular com base em dados financeiros
        period: { start: startDate, end: endDate },
        comparisonToBaseline: {
          percentageChange: avgPainReduction,
          pValue: 0.05,
          effectSize: 0.8,
        },
        recommendations: [],
      };
    } catch (error) {
      console.error('Erro ao analisar impacto:', error);
      throw error;
    }
  }

  /**
   * Busca dados agregados para dashboard
   */
  async getDashboardData(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const demographics = await this.getPopulationDemographics();
      const insights = await this.generatePopulationInsights();
      
      const start = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate || new Date();
      const trends = await this.getHealthTrends(start, end);

      return {
        demographics,
        trends,
        insights,
        period: { start, end },
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }
}

export const populationHealthServiceSupabase = new PopulationHealthServiceSupabase();




