/**
 * BODY MAP PDF REPORT GENERATOR
 * Gera relatórios médicos em PDF do mapa corporal de dor
 */

import type { BodyMapPDFData } from '../../types';
import { getPainLevelColor, getPainLevelLabel } from '../../services/bodyMapService';

/**
 * Gera PDF do relatório de mapa corporal
 * 
 * @param data Dados para o relatório
 * @returns Promise<Blob> PDF gerado
 */
export async function generateBodyMapPDF(data: BodyMapPDFData): Promise<Blob> {
  try {
    // Preparar HTML do relatório
    const html = generateReportHTML(data);

    // Criar PDF a partir do HTML
    // Opção 1: Usar html2pdf.js (cliente)
    // Opção 2: Usar API de conversão (servidor)
    // Opção 3: Usar jsPDF + html2canvas

    // Por ora, retornar HTML como PDF simulado
    // TODO: Implementar conversão real para PDF
    const blob = new Blob([html], { type: 'text/html' });
    
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Falha ao gerar PDF do relatório');
  }
}

/**
 * Gera HTML estruturado do relatório médico
 */
function generateReportHTML(data: BodyMapPDFData): string {
  const { patient, mainPathology, sessions, analytics, generatedAt, generatedBy, clinicInfo } = data;

  const firstSession = sessions[sessions.length - 1];
  const lastSession = sessions[0];

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Mapa Corporal - ${patient.name}</title>
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #3b82f6;
      margin-bottom: 30px;
    }
    
    .clinic-logo {
      font-size: 24pt;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 10px;
    }
    
    .report-title {
      font-size: 18pt;
      font-weight: bold;
      color: #1e293b;
      margin-top: 20px;
    }
    
    .patient-info {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: #1e293b;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    
    .main-complaint-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    
    .stat-label {
      font-size: 9pt;
      color: #64748b;
      margin-bottom: 5px;
    }
    
    .stat-value {
      font-size: 18pt;
      font-weight: bold;
      color: #1e293b;
    }
    
    .pain-level-bar {
      height: 20px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 8px;
    }
    
    .pain-level-fill {
      height: 100%;
      background: linear-gradient(90deg, #22c55e 0%, #eab308 50%, #ef4444 100%);
      transition: width 0.3s;
    }
    
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    
    .session-box {
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
    }
    
    .improvement-badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 9pt;
      font-weight: bold;
      margin-top: 10px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      font-size: 9pt;
      color: #64748b;
      text-align: center;
    }
    
    .signature {
      margin-top: 30px;
      text-align: right;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    
    th {
      background: #f1f5f9;
      font-weight: bold;
    }
    
    @media print {
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- CABEÇALHO -->
  <div class="header">
    <div class="clinic-logo">${clinicInfo?.name || 'FisioFlow'}</div>
    <div>${clinicInfo?.address || ''}</div>
    <div>${clinicInfo?.phone || ''} • ${clinicInfo?.email || ''}</div>
    <h1 class="report-title">Relatório de Evolução de Dor</h1>
    <div>Mapa Corporal Detalhado</div>
  </div>

  <!-- INFORMAÇÕES DO PACIENTE -->
  <div class="patient-info">
    <strong>Paciente:</strong> ${patient.name}<br>
    <strong>CPF:</strong> ${patient.cpf}<br>
    <strong>Data de Nascimento:</strong> ${new Date(patient.birthDate).toLocaleDateString('pt-BR')}<br>
    <strong>Período Analisado:</strong> ${new Date(analytics.period.start).toLocaleDateString('pt-BR')} a ${new Date(analytics.period.end).toLocaleDateString('pt-BR')}
  </div>

  <!-- SEÇÃO 1: QUEIXA PRINCIPAL -->
  ${mainPathology?.mainPathology ? `
  <div class="section">
    <h2 class="section-title">1. Queixa Principal</h2>
    <div class="main-complaint-box">
      <strong style="font-size: 12pt;">⭐ ${mainPathology.mainPathology}</strong><br>
      <div style="margin-top: 8px;">
        <strong>Região:</strong> ${mainPathology.mainPathologyRegion || 'Não especificada'}<br>
        ${mainPathology.mainPathologySince ? `<strong>Início:</strong> ${new Date(mainPathology.mainPathologySince).toLocaleDateString('pt-BR')}<br>` : ''}
      </div>
      ${analytics.mainComplaintProgress.length > 0 ? `
      <div style="margin-top: 12px;">
        <strong>Evolução:</strong><br>
        Inicial: ${analytics.mainComplaintProgress[0].painLevel}/10 →
        Atual: ${analytics.mainComplaintProgress[analytics.mainComplaintProgress.length - 1].painLevel}/10
        ${analytics.improvementPercent > 0 ? `
        <div class="improvement-badge">
          ✓ Melhoria de ${analytics.improvementPercent.toFixed(0)}%
        </div>
        ` : ''}
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  <!-- SEÇÃO 2: ESTATÍSTICAS RESUMIDAS -->
  <div class="section">
    <h2 class="section-title">2. Estatísticas do Período</h2>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Total de Sessões</div>
        <div class="stat-value">${analytics.totalSessions}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sessões Sem Dor</div>
        <div class="stat-value" style="color: #10b981;">${analytics.painFreeSessions}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Dor Média</div>
        <div class="stat-value" style="color: ${getPainLevelColor(analytics.averagePainLevel)};">
          ${analytics.averagePainLevel.toFixed(1)}<span style="font-size: 10pt;">/10</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Regiões Resolvidas</div>
        <div class="stat-value" style="color: #10b981;">${analytics.resolvedRegions}</div>
      </div>
    </div>
  </div>

  <!-- SEÇÃO 3: EVOLUÇÃO DA DOR -->
  <div class="section">
    <h2 class="section-title">3. Evolução da Dor ao Longo do Tempo</h2>
    <p>Gráfico mostrando a tendência de dor nas últimas ${analytics.totalSessions} sessões:</p>
    
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Dor Média</th>
          <th>Regiões Ativas</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${analytics.painTrend.slice(0, 10).map(item => `
          <tr>
            <td>${new Date(item.date).toLocaleDateString('pt-BR')}</td>
            <td style="color: ${getPainLevelColor(item.averagePain)}; font-weight: bold;">
              ${item.averagePain.toFixed(1)}/10
            </td>
            <td>${item.activeRegions}</td>
            <td>${item.painFreeSession ? '✓ Sem dor' : getPainLevelLabel(item.averagePain)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- SEÇÃO 4: REGIÕES MAIS AFETADAS -->
  <div class="section">
    <h2 class="section-title">4. Regiões Corporais Mais Afetadas</h2>
    <table>
      <thead>
        <tr>
          <th>Região</th>
          <th>Frequência</th>
          <th>Intensidade Média</th>
        </tr>
      </thead>
      <tbody>
        ${analytics.heatmapData.slice(0, 10).map(item => `
          <tr>
            <td>${item.region.replace(/_/g, ' ')}</td>
            <td>${item.frequency}x</td>
            <td style="color: ${getPainLevelColor(item.avgPainLevel)}; font-weight: bold;">
              ${item.avgPainLevel.toFixed(1)}/10
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- SEÇÃO 5: TIPOS DE DOR -->
  ${Object.keys(analytics.painTypeDistribution).length > 0 ? `
  <div class="section">
    <h2 class="section-title">5. Tipos de Dor Relatados</h2>
    <table>
      <thead>
        <tr>
          <th>Tipo de Dor</th>
          <th>Frequência</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(analytics.painTypeDistribution).map(([type, count]) => `
          <tr>
            <td>${type}</td>
            <td>${count}x</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- SEÇÃO 6: COMPARAÇÃO -->
  ${firstSession && lastSession && sessions.length > 1 ? `
  <div class="section">
    <h2 class="section-title">6. Comparação Primeira vs. Última Avaliação</h2>
    <div class="comparison-grid">
      <div class="session-box">
        <strong>Primeira Avaliação</strong><br>
        <small>${new Date(firstSession.sessionDate).toLocaleDateString('pt-BR')}</small>
        <div class="pain-level-bar">
          <div class="pain-level-fill" style="width: ${(firstSession.overallPainLevel / 10) * 100}%; background: ${getPainLevelColor(firstSession.overallPainLevel)};"></div>
        </div>
        <div style="margin-top: 8px;">
          Dor: ${firstSession.overallPainLevel}/10<br>
          Regiões: ${firstSession.painRegions?.length || 0}
        </div>
      </div>
      
      <div class="session-box">
        <strong>Avaliação Atual</strong><br>
        <small>${new Date(lastSession.sessionDate).toLocaleDateString('pt-BR')}</small>
        <div class="pain-level-bar">
          <div class="pain-level-fill" style="width: ${(lastSession.overallPainLevel / 10) * 100}%; background: ${getPainLevelColor(lastSession.overallPainLevel)};"></div>
        </div>
        <div style="margin-top: 8px;">
          Dor: ${lastSession.overallPainLevel}/10<br>
          Regiões: ${lastSession.painRegions?.length || 0}
        </div>
      </div>
    </div>
    
    ${analytics.improvementPercent > 0 ? `
      <div class="improvement-badge" style="display: block; text-align: center; margin-top: 15px;">
        ✓ Melhoria geral de ${analytics.improvementPercent.toFixed(0)}%
      </div>
    ` : ''}
  </div>
  ` : ''}

  <!-- RODAPÉ -->
  <div class="footer">
    <div class="signature">
      <p>_______________________________________</p>
      <p><strong>${generatedBy}</strong></p>
      <p>Fisioterapeuta Responsável</p>
    </div>
    
    <div style="margin-top: 20px;">
      <p>Relatório gerado em: ${new Date(generatedAt).toLocaleDateString('pt-BR')} às ${new Date(generatedAt).toLocaleTimeString('pt-BR')}</p>
      <p style="font-size: 8pt; color: #94a3b8;">
        Este documento é confidencial e destinado exclusivamente ao profissional de saúde indicado.
        Gerado automaticamente pelo sistema FisioFlow.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Download do PDF gerado
 */
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Wrapper para gerar e baixar PDF em um único passo
 */
export async function generateAndDownloadBodyMapPDF(
  data: BodyMapPDFData,
  filename?: string
): Promise<void> {
  try {
    const pdf = await generateBodyMapPDF(data);
    const finalFilename = filename || `relatorio-mapa-corporal-${data.patient.name}-${new Date().toISOString().split('T')[0]}.html`;
    downloadPDF(pdf, finalFilename);
  } catch (error) {
    console.error('Error generating and downloading PDF:', error);
    throw error;
  }
}

