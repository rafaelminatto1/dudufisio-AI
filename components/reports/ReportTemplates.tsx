import React from 'react';
import { Patient } from '../../types';

export interface ReportData {
  patient: Patient;
  therapist?: {
    name: string;
    crefito: string;
  };
  sessions?: Array<{
    date: string;
    type: string;
    soap?: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    };
  }>;
  goals?: Array<{
    title: string;
    progress: number;
    status: string;
  }>;
  metrics?: {
    painEvolution?: Array<{ date: string; value: number }>;
    rangeOfMotion?: Array<{ date: string; value: number }>;
    strength?: Array<{ date: string; value: number }>;
  };
  observations?: string;
  period?: {
    start: string;
    end: string;
  };
}

// Template de Relatório de Evolução
export const generateEvolutionReport = (data: ReportData): string => {
  const { patient, therapist, sessions = [], goals = [], period, observations } = data;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Evolução - ${patient.fullName}</title>
  <style>
    @page { margin: 2cm; }
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
      font-size: 11pt;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1e40af;
      margin: 10px 0;
      font-size: 20pt;
    }
    .header .subtitle {
      color: #666;
      font-size: 12pt;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section-title {
      background-color: #3b82f6;
      color: white;
      padding: 8px 12px;
      font-size: 13pt;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    .info-item {
      padding: 8px;
      background-color: #f8f9fa;
      border-left: 3px solid #3b82f6;
    }
    .info-label {
      font-weight: bold;
      color: #555;
      font-size: 9pt;
      text-transform: uppercase;
    }
    .info-value {
      color: #000;
      font-size: 11pt;
    }
    .session {
      border: 1px solid #e5e7eb;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 5px;
      background-color: #fafafa;
    }
    .session-date {
      font-weight: bold;
      color: #1e40af;
      font-size: 12pt;
      margin-bottom: 10px;
    }
    .soap-section {
      margin: 10px 0;
    }
    .soap-label {
      font-weight: bold;
      color: #3b82f6;
      display: inline-block;
      width: 120px;
    }
    .goal-item {
      padding: 10px;
      border-left: 4px solid #10b981;
      background-color: #f0fdf4;
      margin-bottom: 10px;
    }
    .goal-progress {
      height: 10px;
      background-color: #d1d5db;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 5px;
    }
    .goal-progress-bar {
      height: 100%;
      background-color: #10b981;
      transition: width 0.3s;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }
    .signature-box {
      margin-top: 50px;
      padding-top: 50px;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 300px;
      margin: 0 auto 10px;
    }
    @media print {
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>RELATÓRIO DE EVOLUÇÃO FISIOTERAPÊUTICA</h1>
    <div class="subtitle">MoocaFisio - Centro de Reabilitação</div>
  </div>

  <div class="section">
    <div class="section-title">DADOS DO PACIENTE</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Nome Completo</div>
        <div class="info-value">${patient.fullName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Data de Nascimento</div>
        <div class="info-value">${patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">CPF</div>
        <div class="info-value">${patient.cpf || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Convênio</div>
        <div class="info-value">${patient.healthInsurance || 'Particular'}</div>
      </div>
    </div>
    ${period ? `
    <div class="info-item" style="margin-top: 10px;">
      <div class="info-label">Período do Relatório</div>
      <div class="info-value">${new Date(period.start).toLocaleDateString('pt-BR')} a ${new Date(period.end).toLocaleDateString('pt-BR')}</div>
    </div>
    ` : ''}
  </div>

  ${goals.length > 0 ? `
  <div class="section">
    <div class="section-title">OBJETIVOS DO TRATAMENTO</div>
    ${goals.map(goal => `
      <div class="goal-item">
        <strong>${goal.title}</strong> - <em>${goal.status}</em>
        <div class="goal-progress">
          <div class="goal-progress-bar" style="width: ${goal.progress}%"></div>
        </div>
        <small>${goal.progress}% concluído</small>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${sessions.length > 0 ? `
  <div class="section page-break">
    <div class="section-title">EVOLUÇÃO DAS SESSÕES</div>
    ${sessions.map((session, index) => `
      <div class="session">
        <div class="session-date">Sessão #${index + 1} - ${new Date(session.date).toLocaleDateString('pt-BR')}</div>
        <div><strong>Tipo:</strong> ${session.type}</div>
        ${session.soap ? `
          <div class="soap-section">
            <div><span class="soap-label">Subjetivo (S):</span> ${session.soap.subjective}</div>
          </div>
          <div class="soap-section">
            <div><span class="soap-label">Objetivo (O):</span> ${session.soap.objective}</div>
          </div>
          <div class="soap-section">
            <div><span class="soap-label">Avaliação (A):</span> ${session.soap.assessment}</div>
          </div>
          <div class="soap-section">
            <div><span class="soap-label">Plano (P):</span> ${session.soap.plan}</div>
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${observations ? `
  <div class="section">
    <div class="section-title">OBSERVAÇÕES GERAIS</div>
    <p>${observations}</p>
  </div>
  ` : ''}

  <div class="signature-box">
    <div class="signature-line"></div>
    <div><strong>${therapist?.name || 'Fisioterapeuta Responsável'}</strong></div>
    ${therapist?.crefito ? `<div>CREFITO: ${therapist.crefito}</div>` : ''}
    <div style="margin-top: 10px;">Data: ${new Date().toLocaleDateString('pt-BR')}</div>
  </div>

  <div class="footer">
    <p><strong>MoocaFisio</strong> - Centro de Reabilitação e Fisioterapia</p>
    <p>Este documento foi gerado automaticamente pelo sistema MoocaFisio</p>
  </div>
</body>
</html>
  `;
};

// Template de Relatório de Alta
export const generateDischargeReport = (data: ReportData): string => {
  const { patient, therapist, observations } = data;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Alta - ${patient.fullName}</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #059669; margin: 10px 0; }
    .section { margin-bottom: 25px; }
    .section-title { background-color: #10b981; color: white; padding: 8px 12px; font-weight: bold; margin-bottom: 15px; }
    .highlight-box { background-color: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
    .signature-box { margin-top: 50px; padding-top: 50px; text-align: center; }
    .signature-line { border-top: 1px solid #000; width: 300px; margin: 0 auto 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RELATÓRIO DE ALTA FISIOTERAPÊUTICA</h1>
    <div class="subtitle">MoocaFisio - Centro de Reabilitação</div>
  </div>

  <div class="section">
    <div class="section-title">DADOS DO PACIENTE</div>
    <p><strong>Nome:</strong> ${patient.fullName}</p>
    <p><strong>CPF:</strong> ${patient.cpf || 'N/A'}</p>
    <p><strong>Data de Alta:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>

  <div class="highlight-box">
    <h3 style="margin-top: 0; color: #059669;">✓ ALTA CONCEDIDA</h3>
    <p>O paciente recebeu alta fisioterapêutica após avaliação e evolução satisfatória do quadro clínico.</p>
  </div>

  ${observations ? `
  <div class="section">
    <div class="section-title">OBSERVAÇÕES FINAIS</div>
    <p>${observations}</p>
  </div>
  ` : ''}

  <div class="signature-box">
    <div class="signature-line"></div>
    <div><strong>${therapist?.name || 'Fisioterapeuta Responsável'}</strong></div>
    ${therapist?.crefito ? `<div>CREFITO: ${therapist.crefito}</div>` : ''}
    <div>Data: ${new Date().toLocaleDateString('pt-BR')}</div>
  </div>
</body>
</html>
  `;
};

// Template de Relatório para Perícia
export const generateExpertiseReport = (data: ReportData): string => {
  const { patient, therapist, sessions = [], period, observations } = data;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Pericial - ${patient.fullName}</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: Arial, sans-serif; line-height: 1.8; color: #000; }
    .header { text-align: center; border: 2px solid #000; padding: 20px; margin-bottom: 30px; }
    .header h1 { margin: 10px 0; text-transform: uppercase; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .section-title { font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .info-table td { padding: 8px; border: 1px solid #000; }
    .info-table td:first-child { font-weight: bold; width: 30%; background-color: #f0f0f0; }
    .declaration { margin: 30px 0; padding: 20px; border: 2px solid #000; text-align: justify; }
    .signature-box { margin-top: 80px; text-align: right; }
    .signature-line { border-top: 2px solid #000; width: 400px; margin-left: auto; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RELATÓRIO MÉDICO-PERICIAL</h1>
    <p><strong>FISIOTERAPIA</strong></p>
  </div>

  <div class="section">
    <div class="section-title">I. IDENTIFICAÇÃO DO PACIENTE</div>
    <table class="info-table">
      <tr>
        <td>Nome Completo</td>
        <td>${patient.fullName}</td>
      </tr>
      <tr>
        <td>CPF</td>
        <td>${patient.cpf || 'N/A'}</td>
      </tr>
      <tr>
        <td>Data de Nascimento</td>
        <td>${patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
      </tr>
      <tr>
        <td>Convênio/Plano</td>
        <td>${patient.healthInsurance || 'Particular'}</td>
      </tr>
    </table>
  </div>

  ${period ? `
  <div class="section">
    <div class="section-title">II. PERÍODO DE TRATAMENTO</div>
    <p><strong>Início:</strong> ${new Date(period.start).toLocaleDateString('pt-BR')}</p>
    <p><strong>Término:</strong> ${new Date(period.end).toLocaleDateString('pt-BR')}</p>
    <p><strong>Total de Sessões:</strong> ${sessions.length}</p>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">III. HISTÓRICO DO TRATAMENTO</div>
    ${observations || 'Paciente realizou tratamento fisioterapêutico conforme prescrição médica, com evolução adequada do quadro clínico.'}
  </div>

  <div class="declaration">
    <p style="text-align: center; font-weight: bold; margin-bottom: 15px;">DECLARAÇÃO</p>
    <p>Declaro, para os devidos fins, que o(a) paciente acima identificado(a) encontra-se em tratamento fisioterapêutico nesta clínica, tendo comparecido regularmente às sessões agendadas no período informado.</p>
    <p style="margin-top: 15px;">São Paulo, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div><strong>${therapist?.name || 'Fisioterapeuta Responsável'}</strong></div>
    ${therapist?.crefito ? `<div>CREFITO: ${therapist.crefito}</div>` : ''}
    <div>Carimbo e Assinatura</div>
  </div>
</body>
</html>
  `;
};

export const REPORT_TEMPLATES = {
  evolution: {
    name: 'Relatório de Evolução',
    description: 'Relatório completo com histórico de sessões e evolução do paciente',
    generator: generateEvolutionReport
  },
  discharge: {
    name: 'Relatório de Alta',
    description: 'Documento de alta fisioterapêutica',
    generator: generateDischargeReport
  },
  expertise: {
    name: 'Relatório para Perícia',
    description: 'Relatório formal para fins periciais ou jurídicos',
    generator: generateExpertiseReport
  }
};

