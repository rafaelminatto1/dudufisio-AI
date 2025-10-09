/**
 * Serviço de Exportação
 * Exportação de exercícios em múltiplos formatos
 */

import { Exercise, ExerciseProtocol, ExerciseAssignment } from '../types/exercise';

class ExportService {
  /**
   * Exportar para JSON
   */
  exportToJSON(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.downloadBlob(blob, `${filename}.json`);
  }

  /**
   * Exportar para CSV
   */
  exportToCSV(data: Exercise[], filename: string): void {
    const headers = [
      'Nome',
      'Descrição',
      'Categoria',
      'Dificuldade',
      'Equipamentos',
      'Músculos Alvo',
      'Séries',
      'Repetições',
      'Status',
      'Uso',
    ];

    const rows = data.map(ex => [
      this.escapeCSV(ex.name),
      this.escapeCSV(ex.description),
      this.escapeCSV(ex.category),
      this.escapeCSV(ex.difficulty),
      this.escapeCSV(ex.equipment.join(', ')),
      this.escapeCSV(ex.targetMuscles.join(', ')),
      ex.sets || '',
      ex.reps || '',
      ex.isActive ? 'Ativo' : 'Inativo',
      ex.usageCount,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  /**
   * Exportar protocolos para CSV
   */
  exportProtocolsToCSV(data: ExerciseProtocol[], filename: string): void {
    const headers = [
      'Nome',
      'Descrição',
      'Duração (semanas)',
      'Frequência (sessões/semana)',
      'Intensidade',
      'Exercícios',
      'Condições Alvo',
      'Status',
    ];

    const rows = data.map(prot => [
      this.escapeCSV(prot.name),
      this.escapeCSV(prot.description),
      prot.duration,
      prot.frequency,
      this.escapeCSV(prot.intensity),
      prot.exercises.length,
      this.escapeCSV(prot.targetConditions.join(', ')),
      prot.isActive ? 'Ativo' : 'Inativo',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  /**
   * Exportar atribuições para CSV
   */
  exportAssignmentsToCSV(data: ExerciseAssignment[], filename: string): void {
    const headers = [
      'Paciente ID',
      'Exercício',
      'Data Atribuição',
      'Data Início',
      'Data Fim',
      'Status',
      'Sessões',
      'Taxa Conclusão',
    ];

    const rows = data.map(assign => [
      this.escapeCSV(assign.patientId),
      this.escapeCSV(assign.exercise.name),
      new Date(assign.assignedAt).toLocaleDateString(),
      new Date(assign.startDate).toLocaleDateString(),
      assign.endDate ? new Date(assign.endDate).toLocaleDateString() : 'N/A',
      this.escapeCSV(assign.status),
      assign.progress?.length || 0,
      assign.progress?.length > 0
        ? Math.round(assign.progress.reduce((sum, p) => sum + p.completionRate, 0) / assign.progress.length)
        : 0,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  /**
   * Escapar valores para CSV
   */
  private escapeCSV(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Download de blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Exportar relatório completo
   */
  exportFullReport(options: {
    exercises: Exercise[];
    protocols: ExerciseProtocol[];
    assignments: ExerciseAssignment[];
    format: 'json' | 'csv';
  }): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `relatorio-completo-${timestamp}`;

    if (options.format === 'json') {
      const data = {
        exercises: options.exercises,
        protocols: options.protocols,
        assignments: options.assignments,
        exportDate: new Date(),
        stats: {
          totalExercises: options.exercises.length,
          totalProtocols: options.protocols.length,
          totalAssignments: options.assignments.length,
        },
      };
      this.exportToJSON(data, filename);
    } else {
      // Exportar múltiplos CSVs em um ZIP seria ideal
      // Por enquanto, exportar o mais importante
      this.exportToCSV(options.exercises, `${filename}-exercicios`);
      this.exportProtocolsToCSV(options.protocols, `${filename}-protocolos`);
      this.exportAssignmentsToCSV(options.assignments, `${filename}-atribuicoes`);
    }
  }
}

export const exportService = new ExportService();

