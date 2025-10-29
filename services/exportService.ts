// services/exportService.ts
import { PatientWithMonitoringMetrics } from '../types';

/**
 * Exporta dados para CSV
 */
export function exportToCSV(
  patients: PatientWithMonitoringMetrics[],
  filename: string = 'pacientes-monitoramento'
): void {
  const headers = [
    'Nome',
    'CPF',
    'Status',
    'Última Sessão',
    'Taxa de Presença (%)',
    'Total Sessões',
    'Total Faltas',
    'Faltas Consecutivas',
    'Dias Sem Sessão',
    'Nível Dor Médio',
    'Tendência Dor',
    'Nível de Risco',
    'Razões de Risco',
  ];

  const rows = patients.map(p => [
    p.name,
    p.cpf,
    p.status,
    p.lastSessionDate || 'Nunca',
    p.attendanceRate.toFixed(1),
    p.totalSessions,
    p.totalMisses,
    p.consecutiveMisses,
    p.daysSinceLastSession,
    p.averagePainLevel.toFixed(1),
    p.painTrend,
    p.riskLevel,
    p.riskReasons.join('; '),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exporta dados para Excel (formato básico CSV que Excel abre)
 */
export function exportToExcel(
  patients: PatientWithMonitoringMetrics[],
  filename: string = 'pacientes-monitoramento'
): void {
  // BOM para UTF-8 (para Excel abrir corretamente caracteres especiais)
  const BOM = '\uFEFF';
  
  const headers = [
    'Nome',
    'CPF',
    'Status',
    'Última Sessão',
    'Taxa de Presença (%)',
    'Total Sessões',
    'Total Faltas',
    'Faltas Consecutivas',
    'Dias Sem Sessão',
    'Nível Dor Médio',
    'Tendência Dor',
    'Nível de Risco',
    'Razões de Risco',
  ];

  const rows = patients.map(p => [
    p.name,
    p.cpf,
    p.status,
    p.lastSessionDate ? new Date(p.lastSessionDate).toLocaleDateString('pt-BR') : 'Nunca',
    p.attendanceRate.toFixed(1),
    p.totalSessions,
    p.totalMisses,
    p.consecutiveMisses,
    p.daysSinceLastSession,
    p.averagePainLevel.toFixed(1),
    translatePainTrend(p.painTrend),
    translateRiskLevel(p.riskLevel),
    p.riskReasons.join('; '),
  ]);

  const csvContent = BOM + [
    headers.join('\t'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join('\t'))
  ].join('\n');

  downloadFile(csvContent, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Gera relatório em PDF (HTML simplificado para conversão)
 */
export function exportToPDF(
  patients: PatientWithMonitoringMetrics[],
  kpiMetrics: any,
  filename: string = 'relatorio-monitoramento'
): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');

  const highRiskPatients = patients.filter(p => p.riskLevel === 'high');
  const mediumRiskPatients = patients.filter(p => p.riskLevel === 'medium');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Monitoramento de Pacientes</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #1e293b;
    }
    h1 {
      color: #0f172a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
    }
    h2 {
      color: #334155;
      margin-top: 30px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
    }
    .header-info {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #3b82f6;
    }
    .metric-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #f8fafc;
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
      font-size: 13px;
      color: #475569;
      font-weight: 600;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-high {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge-medium {
      background: #fef3c7;
      color: #92400e;
    }
    .badge-low {
      background: #d1fae5;
      color: #065f46;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <h1>📊 Relatório de Monitoramento de Pacientes</h1>
  
  <div class="header-info">
    <strong>Data de Geração:</strong> ${dateStr} às ${timeStr}<br>
    <strong>Total de Pacientes:</strong> ${patients.length}<br>
    <strong>Período de Análise:</strong> Últimos 30 dias
  </div>

  <h2>Métricas Gerais</h2>
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-value">${kpiMetrics?.totalActivePatients || 0}</div>
      <div class="metric-label">Pacientes Ativos</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${kpiMetrics?.averageAttendanceRate.toFixed(1) || 0}%</div>
      <div class="metric-label">Taxa de Presença Média</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${kpiMetrics?.patientsAtRisk || 0}</div>
      <div class="metric-label">Pacientes em Risco</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${kpiMetrics?.totalMissesInPeriod || 0}</div>
      <div class="metric-label">Total de Faltas</div>
    </div>
  </div>

  <h2>⚠️ Pacientes de Alto Risco (${highRiskPatients.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Nome</th>
        <th>Taxa Presença</th>
        <th>Faltas Consec.</th>
        <th>Dias Sem Sessão</th>
        <th>Nível Dor</th>
        <th>Razões</th>
      </tr>
    </thead>
    <tbody>
      ${highRiskPatients.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.attendanceRate.toFixed(1)}%</td>
          <td>${p.consecutiveMisses}</td>
          <td>${p.daysSinceLastSession}</td>
          <td>${p.averagePainLevel.toFixed(1)}</td>
          <td>${p.riskReasons.join(', ')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>⚡ Pacientes de Risco Médio (${mediumRiskPatients.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Nome</th>
        <th>Taxa Presença</th>
        <th>Faltas Consec.</th>
        <th>Dias Sem Sessão</th>
        <th>Nível Dor</th>
        <th>Razões</th>
      </tr>
    </thead>
    <tbody>
      ${mediumRiskPatients.slice(0, 10).map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.attendanceRate.toFixed(1)}%</td>
          <td>${p.consecutiveMisses}</td>
          <td>${p.daysSinceLastSession}</td>
          <td>${p.averagePainLevel.toFixed(1)}</td>
          <td>${p.riskReasons.join(', ')}</td>
        </tr>
      `).join('')}
      ${mediumRiskPatients.length > 10 ? `
        <tr>
          <td colspan="6" style="text-align: center; color: #64748b; font-style: italic;">
            ... e mais ${mediumRiskPatients.length - 10} pacientes
          </td>
        </tr>
      ` : ''}
    </tbody>
  </table>

  <div class="footer">
    Relatório gerado automaticamente pelo DuduFisio AI - Sistema de Gestão de Fisioterapia<br>
    © ${now.getFullYear()} - Todos os direitos reservados
  </div>
</body>
</html>
  `;

  // Abrir HTML em nova janela para impressão/salvar como PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Exporta captura de tela dos gráficos
 */
export async function exportChartsAsImage(
  elementId: string,
  filename: string = 'graficos-monitoramento'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    return;
  }

  try {
    // Usar html2canvas se disponível (deve ser instalado)
    const html2canvas = (window as any).html2canvas;
    if (html2canvas) {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } else {
      console.warn('html2canvas não está disponível. Instale: npm install html2canvas');
    }
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
  }
}

// Helper functions

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function translatePainTrend(trend: string): string {
  const translations: Record<string, string> = {
    improving: 'Melhorando',
    stable: 'Estável',
    worsening: 'Piorando',
    no_data: 'Sem dados',
  };
  return translations[trend] || trend;
}

function translateRiskLevel(level: string): string {
  const translations: Record<string, string> = {
    high: 'Alto',
    medium: 'Médio',
    low: 'Baixo',
  };
  return translations[level] || level;
}
