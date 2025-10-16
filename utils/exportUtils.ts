import type { EvolutionReportData, AssessmentStatistics } from '../types';
import { logger } from '../lib/logger';

/**
 * Utilitários para export de dados de pacientes
 */

// ============================================================================
// EXPORT PARA EXCEL (CSV)
// ============================================================================

/**
 * Exportar dados de avaliações para CSV/Excel
 */
export function exportAssessmentsToExcel(
  data: EvolutionReportData,
  patientName: string
): void {
  try {
    // Preparar headers
    const headers = ['Data', 'Métrica', 'Valor', 'Unidade', 'Sessão', 'Timing', 'Notas'];
    
    // Preparar linhas de dados
    const rows = data.assessments.map(assessment => [
      new Date(assessment.date).toLocaleDateString('pt-BR'),
      assessment.fieldName || '',
      assessment.value?.toString() || '',
      assessment.unit || '',
      assessment.sessionNumber?.toString() || '',
      assessment.timing || '',
      assessment.notes || ''
    ]);

    // Criar CSV
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    // Adicionar BOM para Excel reconhecer UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${sanitizeFilename(patientName)}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    logger.error('Erro ao exportar dados para Excel.', {
      context: 'exportUtils.exportAssessmentsToExcel',
      data: error,
    });
    throw new Error('Falha ao exportar dados para Excel');
  }
}

/**
 * Exportar estatísticas para CSV
 */
export function exportStatisticsToExcel(
  statistics: AssessmentStatistics[],
  patientName: string
): void {
  try {
    // Headers
    const headers = [
      'Métrica',
      'Unidade',
      'Contagem',
      'Mínimo',
      'Máximo',
      'Média',
      'Último Valor',
      'Variação %',
      'Tendência'
    ];

    // Linhas
    const rows = statistics.map(stat => [
      stat.fieldName,
      stat.unit || '',
      stat.count.toString(),
      stat.min.toString(),
      stat.max.toString(),
      stat.average.toString(),
      stat.latest.toString(),
      stat.percentChange.toString(),
      stat.trend === 'improving' ? 'Melhorando' :
      stat.trend === 'declining' ? 'Piorando' : 'Estável'
    ]);

    // Criar CSV
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estatisticas_${sanitizeFilename(patientName)}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    logger.error('Erro ao exportar estatísticas.', {
      context: 'exportUtils.exportStatisticsToExcel',
      data: error,
    });
    throw new Error('Falha ao exportar estatísticas');
  }
}

// ============================================================================
// EXPORT PARA PDF
// ============================================================================

/**
 * Gerar PDF do relatório de evolução
 * Nota: Usa print do navegador como fallback simples
 */
export function exportReportToPDF(
  data: EvolutionReportData,
  patientName: string
): void {
  try {
    // Criar HTML para impressão
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Popup bloqueado. Por favor, permita popups para este site.');
    }

    const html = generatePrintHTML(data, patientName);
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Aguardar carregamento e abrir diálogo de impressão
    printWindow.onload = () => {
      printWindow.print();
    };
  } catch (error) {
    logger.error('Erro ao gerar PDF do relatório de evolução.', {
      context: 'exportUtils.exportReportToPDF',
      data: error,
    });
    throw new Error('Falha ao gerar PDF');
  }
}

/**
 * Gerar HTML formatado para impressão
 */
function generatePrintHTML(data: EvolutionReportData, patientName: string): string {
  const now = new Date().toLocaleString('pt-BR');
  const periodStart = new Date(data.period.start).toLocaleDateString('pt-BR');
  const periodEnd = new Date(data.period.end).toLocaleDateString('pt-BR');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Evolução - ${patientName}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24pt;
          color: #2563eb;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          font-size: 18pt;
          color: #1e40af;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat-card {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
          text-align: center;
        }
        .stat-card .value {
          font-size: 24pt;
          font-weight: bold;
          color: #2563eb;
        }
        .stat-card .label {
          font-size: 10pt;
          color: #666;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        .trend-improving { color: #10b981; font-weight: bold; }
        .trend-stable { color: #6b7280; }
        .trend-declining { color: #ef4444; font-weight: bold; }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 10pt;
          color: #999;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Evolução</h1>
        <p><strong>Paciente:</strong> ${patientName}</p>
        <p><strong>Período:</strong> ${periodStart} a ${periodEnd}</p>
        <p><strong>Gerado em:</strong> ${now}</p>
      </div>

      <div class="section">
        <h2>Resumo do Período</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="value">${data.totalSessions}</div>
            <div class="label">Sessões Realizadas</div>
          </div>
          <div class="stat-card">
            <div class="value">${data.statistics.length}</div>
            <div class="label">Métricas Monitoradas</div>
          </div>
          <div class="stat-card">
            <div class="value">${data.observations.length}</div>
            <div class="label">Observações Registradas</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Estatísticas Detalhadas</h2>
        <table>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Unidade</th>
              <th>Média</th>
              <th>Mín</th>
              <th>Máx</th>
              <th>Último</th>
              <th>Variação</th>
              <th>Tendência</th>
            </tr>
          </thead>
          <tbody>
            ${data.statistics.map(stat => `
              <tr>
                <td><strong>${stat.fieldName}</strong></td>
                <td>${stat.unit || '-'}</td>
                <td>${stat.average}</td>
                <td>${stat.min}</td>
                <td>${stat.max}</td>
                <td><strong>${stat.latest}</strong></td>
                <td>${stat.percentChange > 0 ? '+' : ''}${stat.percentChange}%</td>
                <td class="trend-${stat.trend}">
                  ${stat.trend === 'improving' ? 'Melhorando' : 
                    stat.trend === 'declining' ? 'Piorando' : 'Estável'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Observações do Período</h2>
        ${data.observations.length === 0 ? 
          '<p>Nenhuma observação registrada no período.</p>' :
          `<p><strong>${data.observations.length} observações registradas</strong></p>
           <ul>
             ${data.observations.slice(0, 10).map(obs => `
               <li>
                 <strong>${new Date(obs.createdAt).toLocaleDateString('pt-BR')}</strong> - 
                 ${obs.content.substring(0, 100)}${obs.content.length > 100 ? '...' : ''}
               </li>
             `).join('')}
           </ul>
           ${data.observations.length > 10 ? 
             `<p><em>... e mais ${data.observations.length - 10} observações.</em></p>` : 
             ''}
          `
        }
      </div>

      <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema DuduFisio-AI</p>
        <p>Este documento é confidencial e destinado exclusivamente para uso profissional</p>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// COMPARTILHAMENTO
// ============================================================================

/**
 * Gerar link de compartilhamento (funcionalidade futura)
 */
export function generateShareableLink(patientId: string): string {
  // TODO: Implementar geração de link com token temporário
  // Por enquanto, retorna URL base
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/report/${patientId}?token=TEMP_TOKEN`;
}

/**
 * Copiar dados para clipboard
 */
export async function copyReportToClipboard(data: EvolutionReportData): Promise<void> {
  try {
    const text = formatReportAsText(data);
    await navigator.clipboard.writeText(text);
  } catch (error) {
    logger.error('Erro ao copiar relatório para o clipboard.', {
      context: 'exportUtils.copyReportToClipboard',
      data: error,
    });
    throw new Error('Falha ao copiar dados');
  }
}

/**
 * Formatar relatório como texto simples
 */
function formatReportAsText(data: EvolutionReportData): string {
  const periodStart = new Date(data.period.start).toLocaleDateString('pt-BR');
  const periodEnd = new Date(data.period.end).toLocaleDateString('pt-BR');

  let text = `RELATÓRIO DE EVOLUÇÃO\n`;
  text += `Período: ${periodStart} a ${periodEnd}\n`;
  text += `\n`;
  text += `RESUMO:\n`;
  text += `- Sessões: ${data.totalSessions}\n`;
  text += `- Métricas: ${data.statistics.length}\n`;
  text += `- Observações: ${data.observations.length}\n`;
  text += `\n`;
  text += `ESTATÍSTICAS:\n`;
  
  data.statistics.forEach(stat => {
    text += `\n${stat.fieldName} (${stat.unit || 'un'}):\n`;
    text += `  Média: ${stat.average}\n`;
    text += `  Mínimo: ${stat.min} | Máximo: ${stat.max}\n`;
    text += `  Último: ${stat.latest}\n`;
    text += `  Variação: ${stat.percentChange}%\n`;
    text += `  Tendência: ${stat.trend === 'improving' ? 'Melhorando' : stat.trend === 'declining' ? 'Piorando' : 'Estável'}\n`;
  });

  return text;
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Sanitizar nome de arquivo
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '_') // Substitui caracteres especiais
    .replace(/_+/g, '_') // Remove underscores duplicados
    .substring(0, 50); // Limita tamanho
}

/**
 * Formatar bytes para tamanho legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ============================================================================
// EXPORTS DEFAULT
// ============================================================================

export default {
  exportAssessmentsToExcel,
  exportStatisticsToExcel,
  exportReportToPDF,
  generateShareableLink,
  copyReportToClipboard,
  formatFileSize
};




