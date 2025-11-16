/**
 * Utilitários para exportação de relatórios em PDF
 * Utiliza html2pdf.js para conversão de HTML para PDF
 */

import html2pdf from 'html2pdf.js';

export interface PdfExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  pagebreak?: {
    mode?: 'avoid-all' | 'css' | 'legacy';
    before?: string;
    after?: string;
    avoid?: string;
  };
}

/**
 * Exporta HTML para PDF
 * @param htmlContent - Conteúdo HTML a ser exportado
 * @param options - Opções de configuração do PDF
 */
export const exportHtmlToPdf = async (
  htmlContent: string,
  options: PdfExportOptions = {}
): Promise<void> => {
  const {
    filename = `relatorio-${new Date().getTime()}.pdf`,
    margin = 10,
    format = 'a4',
    orientation = 'portrait',
    pagebreak = { mode: 'avoid-all', avoid: '.page-break' }
  } = options;

  // Criar elemento temporário com o HTML
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.width = '100%';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);

  const opt = {
    margin,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format, 
      orientation 
    },
    pagebreak
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    // Limpar elemento temporário
    document.body.removeChild(element);
  }
};

/**
 * Visualiza PDF antes de baixar (abre em nova aba)
 * @param htmlContent - Conteúdo HTML a ser visualizado
 * @param options - Opções de configuração do PDF
 */
export const previewPdf = async (
  htmlContent: string,
  options: PdfExportOptions = {}
): Promise<void> => {
  const {
    margin = 10,
    format = 'a4',
    orientation = 'portrait'
  } = options;

  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.width = '100%';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);

  const opt = {
    margin,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format, 
      orientation 
    }
  };

  try {
    const pdf = await html2pdf().set(opt).from(element).toPdf().get('pdf');
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } finally {
    document.body.removeChild(element);
  }
};

/**
 * Gera PDF como Blob para uso posterior
 * @param htmlContent - Conteúdo HTML a ser convertido
 * @param options - Opções de configuração do PDF
 * @returns Promise com o Blob do PDF
 */
export const generatePdfBlob = async (
  htmlContent: string,
  options: PdfExportOptions = {}
): Promise<Blob> => {
  const {
    margin = 10,
    format = 'a4',
    orientation = 'portrait'
  } = options;

  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.width = '100%';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);

  const opt = {
    margin,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format, 
      orientation 
    }
  };

  try {
    const pdf = await html2pdf().set(opt).from(element).toPdf().get('pdf');
    return pdf.output('blob');
  } finally {
    document.body.removeChild(element);
  }
};

/**
 * Envia PDF por email (integração com backend necessária)
 * @param htmlContent - Conteúdo HTML a ser enviado
 * @param emailTo - Email do destinatário
 * @param subject - Assunto do email
 */
export const emailPdf = async (
  htmlContent: string,
  emailTo: string,
  subject: string = 'Relatório Fisioterapêutico'
): Promise<void> => {
  const pdfBlob = await generatePdfBlob(htmlContent);
  
  // Criar FormData para envio
  const formData = new FormData();
  formData.append('pdf', pdfBlob, 'relatorio.pdf');
  formData.append('to', emailTo);
  formData.append('subject', subject);

  // Aqui você deve implementar a chamada para seu backend
  // Exemplo:
  // const response = await fetch('/api/send-report', {
  //   method: 'POST',
  //   body: formData
  // });
  
  console.log('Email PDF - Implementar integração com backend');
  throw new Error('Funcionalidade de email pendente de implementação');
};

/**
 * Imprime o PDF diretamente
 * @param htmlContent - Conteúdo HTML a ser impresso
 */
export const printPdf = (htmlContent: string): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

/**
 * Utilitário para adicionar marca d'água ao PDF
 */
export const addWatermark = (htmlContent: string, watermarkText: string = 'CONFIDENCIAL'): string => {
  const watermarkStyle = `
    <style>
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 80pt;
        color: rgba(200, 200, 200, 0.3);
        font-weight: bold;
        z-index: -1;
        pointer-events: none;
      }
    </style>
    <div class="watermark">${watermarkText}</div>
  `;
  
  // Adicionar marca d'água ao body
  return htmlContent.replace('</body>', `${watermarkStyle}</body>`);
};

