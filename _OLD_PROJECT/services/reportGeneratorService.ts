/**
 * Serviço de Geração de Relatórios Customizados
 * Cria relatórios profissionais de exercícios, protocolos e progresso
 */

import { Exercise, ExerciseProtocol, ExerciseAssignment } from '../types/exercise';
import { exportService } from './exportService';

interface ReportConfig {
  title: string;
  subtitle?: string;
  includeCharts?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface ExerciseReport {
  config: ReportConfig;
  exercises: Exercise[];
  totalExercises: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  mostUsed: Exercise[];
}

interface ProtocolReport {
  config: ReportConfig;
  protocols: ExerciseProtocol[];
  totalProtocols: number;
  averageExercisesPerProtocol: number;
  byIntensity: Record<string, number>;
}

interface ProgressReport {
  config: ReportConfig;
  assignments: ExerciseAssignment[];
  totalSessions: number;
  completionRate: number;
  averageDifficulty: number;
  averagePain: number;
}

class ReportGeneratorService {
  /**
   * Gerar relatório de exercícios
   */
  generateExerciseReport(
    exercises: Exercise[],
    config: Partial<ReportConfig> = {}
  ): ExerciseReport {
    const fullConfig: ReportConfig = {
      title: 'Relatório de Exercícios',
      subtitle: `Gerado em ${new Date().toLocaleDateString()}`,
      includeCharts: true,
      includeSummary: true,
      includeDetails: true,
      ...config,
    };

    // Filtrar por data se especificado
    let filteredExercises = exercises;
    if (fullConfig.dateRange) {
      filteredExercises = exercises.filter(ex => {
        const createdAt = new Date(ex.createdAt);
        return createdAt >= fullConfig.dateRange!.start && 
               createdAt <= fullConfig.dateRange!.end;
      });
    }

    // Estatísticas
    const byCategory = this.groupBy(filteredExercises, 'category');
    const byDifficulty = this.groupBy(filteredExercises, 'difficulty');
    
    // Exercícios mais usados (simula com order)
    const mostUsed = [...filteredExercises]
      .sort((a, b) => (b.sets || 0) - (a.sets || 0))
      .slice(0, 10);

    return {
      config: fullConfig,
      exercises: filteredExercises,
      totalExercises: filteredExercises.length,
      byCategory,
      byDifficulty,
      mostUsed,
    };
  }

  /**
   * Gerar relatório de protocolos
   */
  generateProtocolReport(
    protocols: ExerciseProtocol[],
    config: Partial<ReportConfig> = {}
  ): ProtocolReport {
    const fullConfig: ReportConfig = {
      title: 'Relatório de Protocolos',
      subtitle: `Gerado em ${new Date().toLocaleDateString()}`,
      ...config,
    };

    const totalExercises = protocols.reduce(
      (sum, p) => sum + (p.exercises?.length || 0),
      0
    );
    const averageExercisesPerProtocol = protocols.length > 0
      ? totalExercises / protocols.length
      : 0;

    const byIntensity = protocols.reduce((acc, p) => {
      acc[p.intensity] = (acc[p.intensity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      config: fullConfig,
      protocols,
      totalProtocols: protocols.length,
      averageExercisesPerProtocol,
      byIntensity,
    };
  }

  /**
   * Gerar relatório de progresso
   */
  generateProgressReport(
    assignments: ExerciseAssignment[],
    config: Partial<ReportConfig> = {}
  ): ProgressReport {
    const fullConfig: ReportConfig = {
      title: 'Relatório de Progresso',
      subtitle: `Gerado em ${new Date().toLocaleDateString()}`,
      ...config,
    };

    const totalSessions = assignments.reduce(
      (sum, a) => sum + (a.progress?.length || 0),
      0
    );

    const completedAssignments = assignments.filter(
      a => a.status === 'completed'
    ).length;
    const completionRate = assignments.length > 0
      ? (completedAssignments / assignments.length) * 100
      : 0;

    // Médias
    let totalDifficulty = 0;
    let totalPain = 0;
    let count = 0;

    assignments.forEach(assignment => {
      assignment.progress?.forEach(session => {
        if (session.difficultyRating) totalDifficulty += session.difficultyRating;
        if (session.painLevel !== undefined) totalPain += session.painLevel;
        count++;
      });
    });

    const averageDifficulty = count > 0 ? totalDifficulty / count : 0;
    const averagePain = count > 0 ? totalPain / count : 0;

    return {
      config: fullConfig,
      assignments,
      totalSessions,
      completionRate,
      averageDifficulty,
      averagePain,
    };
  }

  /**
   * Exportar relatório para CSV
   */
  async exportReportToCSV(
    report: ExerciseReport | ProtocolReport | ProgressReport,
    filename: string
  ): Promise<void> {
    const data = this.prepareDataForExport(report);
    await exportService.exportToCSV(data, filename);
  }

  /**
   * Exportar relatório para JSON
   */
  async exportReportToJSON(
    report: ExerciseReport | ProtocolReport | ProgressReport,
    filename: string
  ): Promise<void> {
    await exportService.exportToJSON(report, filename);
  }

  /**
   * Gerar relatório HTML
   */
  generateHTMLReport(
    report: ExerciseReport | ProtocolReport | ProgressReport
  ): string {
    const { config } = report;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${config.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .header {
            background: #4F46E5;
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          .subtitle {
            opacity: 0.9;
            margin-top: 10px;
          }
          .section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .section h2 {
            color: #4F46E5;
            margin-top: 0;
          }
          .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          .stat-card {
            background: #F3F4F6;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #4F46E5;
          }
          .stat-label {
            color: #6B7280;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
          }
          th {
            background: #F9FAFB;
            font-weight: 600;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${config.title}</h1>
          ${config.subtitle ? `<p class="subtitle">${config.subtitle}</p>` : ''}
        </div>
    `;

    if ('exercises' in report) {
      html += this.generateExerciseHTMLContent(report);
    } else if ('protocols' in report) {
      html += this.generateProtocolHTMLContent(report);
    } else if ('assignments' in report) {
      html += this.generateProgressHTMLContent(report);
    }

    html += `
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Conteúdo HTML para relatório de exercícios
   */
  private generateExerciseHTMLContent(report: ExerciseReport): string {
    return `
      <div class="section">
        <h2>Resumo Geral</h2>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">${report.totalExercises}</div>
            <div class="stat-label">Total de Exercícios</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Object.keys(report.byCategory).length}</div>
            <div class="stat-label">Categorias</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${report.mostUsed.length}</div>
            <div class="stat-label">Mais Usados</div>
          </div>
        </div>
      </div>

      ${report.config.includeDetails ? `
        <div class="section">
          <h2>Top 10 Exercícios Mais Usados</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Dificuldade</th>
                <th>Séries</th>
              </tr>
            </thead>
            <tbody>
              ${report.mostUsed.map(ex => `
                <tr>
                  <td>${ex.name}</td>
                  <td>${ex.category}</td>
                  <td>${this.translateDifficulty(ex.difficulty)}</td>
                  <td>${ex.sets || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;
  }

  /**
   * Conteúdo HTML para relatório de protocolos
   */
  private generateProtocolHTMLContent(report: ProtocolReport): string {
    return `
      <div class="section">
        <h2>Estatísticas</h2>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">${report.totalProtocols}</div>
            <div class="stat-label">Total de Protocolos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${report.averageExercisesPerProtocol.toFixed(1)}</div>
            <div class="stat-label">Média de Exercícios/Protocolo</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Conteúdo HTML para relatório de progresso
   */
  private generateProgressHTMLContent(report: ProgressReport): string {
    return `
      <div class="section">
        <h2>Métricas de Progresso</h2>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">${report.totalSessions}</div>
            <div class="stat-label">Total de Sessões</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${report.completionRate.toFixed(1)}%</div>
            <div class="stat-label">Taxa de Conclusão</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${report.averageDifficulty.toFixed(1)}/10</div>
            <div class="stat-label">Dificuldade Média</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${report.averagePain.toFixed(1)}/10</div>
            <div class="stat-label">Dor Média</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Helpers
   */
  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key] || 'Não especificado';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private prepareDataForExport(report: any): any[] {
    if ('exercises' in report) {
      return report.exercises;
    } else if ('protocols' in report) {
      return report.protocols;
    } else if ('assignments' in report) {
      return report.assignments;
    }
    return [];
  }

  private translateDifficulty(difficulty: string): string {
    const map: Record<string, string> = {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
      expert: 'Expert',
    };
    return map[difficulty] || difficulty;
  }
}

export const reportGeneratorService = new ReportGeneratorService();

