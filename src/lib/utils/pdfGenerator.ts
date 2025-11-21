/**
 * Utilitário para geração de PDFs
 * TODO: Implementar com react-pdf ou @react-pdf/renderer
 */

interface PDFOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
}

/**
 * Gera PDF de nota fiscal/recibo
 */
export async function generateInvoicePDF(data: {
  invoiceNumber: string;
  patientName: string;
  patientCPF?: string;
  description: string;
  amount: number;
  paymentMethod: string;
  date: string;
  clinicData?: {
    name: string;
    cnpj?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}): Promise<Blob> {
  // TODO: Implementar geração real de PDF
  // Por enquanto, retorna um blob vazio
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Nota Fiscal - ${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin: 20px 0; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.clinicData?.name || 'Clínica de Fisioterapia'}</h1>
          ${data.clinicData?.cnpj ? `<p>CNPJ: ${data.clinicData.cnpj}</p>` : ''}
        </div>
        <div class="info">
          <p><strong>Número:</strong> ${data.invoiceNumber}</p>
          <p><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-BR')}</p>
          <p><strong>Paciente:</strong> ${data.patientName}</p>
          ${data.patientCPF ? `<p><strong>CPF:</strong> ${data.patientCPF}</p>` : ''}
        </div>
        <div class="info">
          <p><strong>Descrição:</strong> ${data.description}</p>
          <p><strong>Forma de Pagamento:</strong> ${data.paymentMethod}</p>
        </div>
        <div class="total">
          <p>Total: R$ ${data.amount.toFixed(2).replace('.', ',')}</p>
        </div>
      </body>
    </html>
  `;

  // TODO: Converter HTML para PDF usando react-pdf ou similar
  // Por enquanto, retorna um texto simples
  return new Blob([html], { type: 'text/html' });
}

/**
 * Gera PDF de relatório financeiro
 */
export async function generateFinancialReportPDF(data: {
  title: string;
  period: { start: string; end: string };
  income: number;
  expenses: number;
  balance: number;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
  }>;
}): Promise<Blob> {
  // TODO: Implementar geração real de PDF
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        <p>Período: ${new Date(data.period.start).toLocaleDateString('pt-BR')} a ${new Date(data.period.end).toLocaleDateString('pt-BR')}</p>
        <table>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Valor</th>
          </tr>
          ${data.transactions.map((t) => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
              <td>${t.description}</td>
              <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
              <td>R$ ${t.amount.toFixed(2).replace('.', ',')}</td>
            </tr>
          `).join('')}
        </table>
        <div style="margin-top: 20px;">
          <p><strong>Total Receitas:</strong> R$ ${data.income.toFixed(2).replace('.', ',')}</p>
          <p><strong>Total Despesas:</strong> R$ ${data.expenses.toFixed(2).replace('.', ',')}</p>
          <p><strong>Saldo:</strong> R$ ${data.balance.toFixed(2).replace('.', ',')}</p>
        </div>
      </body>
    </html>
  `;

  return new Blob([html], { type: 'text/html' });
}

/**
 * Gera PDF de mapa de dor
 */
export async function generatePainMapPDF(data: {
  patientName: string;
  date: string;
  view: 'front' | 'back';
  points: Array<{
    x: number;
    y: number;
    intensity: number;
    bodyPart: string;
  }>;
}): Promise<Blob> {
  // TODO: Implementar geração real de PDF com imagem do mapa
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Mapa de Dor - ${data.patientName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .points { margin-top: 20px; }
          .point { margin: 10px 0; padding: 10px; border-left: 4px solid #3b82f6; }
        </style>
      </head>
      <body>
        <h1>Mapa de Dor Corporal</h1>
        <p><strong>Paciente:</strong> ${data.patientName}</p>
        <p><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-BR')}</p>
        <p><strong>Vista:</strong> ${data.view === 'front' ? 'Frontal' : 'Posterior'}</p>
        <div class="points">
          <h2>Pontos de Dor Registrados</h2>
          ${data.points.map((point, idx) => `
            <div class="point">
              <p><strong>Ponto ${idx + 1}:</strong> ${point.bodyPart}</p>
              <p>Intensidade (EVA): ${point.intensity}/10</p>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;

  return new Blob([html], { type: 'text/html' });
}

