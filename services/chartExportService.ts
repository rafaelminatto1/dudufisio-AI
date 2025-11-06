/**
 * Chart Export Service - Serviço para exportar gráficos em diferentes formatos
 * Suporta PNG, PDF e SVG
 *
 * ✅ OTIMIZADO: Usa lazy loading para bibliotecas pesadas
 * - html2canvas (~100KB) carrega apenas ao exportar
 * - jsPDF (~200KB) carrega apenas ao gerar PDF
 * - Reduz bundle inicial em ~300KB
 */

export interface ExportOptions {
  format: 'png' | 'pdf' | 'svg';
  filename?: string;
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

/**
 * Exportar elemento HTML como PNG (com lazy loading)
 */
export async function exportAsPNG(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const {
    filename = 'chart.png',
    quality = 1.0,
    backgroundColor = '#ffffff'
  } = options;

  try {
    // Lazy load html2canvas
    console.log('[ChartExport] Lazy loading html2canvas...');
    const { default: html2canvas } = await import('html2canvas');

    const canvas = await html2canvas(element, {
      scale: quality * 2, // Aumentar qualidade
      backgroundColor,
      logging: false,
      useCORS: true
    });

    // Criar link de download
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();

    console.log('[ChartExport] PNG exported successfully');
  } catch (error) {
    console.error('Erro ao exportar como PNG:', error);
    throw new Error('Falha ao exportar gráfico como PNG');
  }
}

/**
 * Exportar elemento HTML como PDF (com lazy loading)
 */
export async function exportAsPDF(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const {
    filename = 'chart.pdf',
    width = 800,
    height = 600,
    backgroundColor = '#ffffff'
  } = options;

  try {
    // Lazy load html2canvas
    console.log('[ChartExport] Lazy loading html2canvas...');
    const { default: html2canvas } = await import('html2canvas');

    // Lazy load jsPDF
    console.log('[ChartExport] Lazy loading jsPDF...');
    const { default: jsPDF } = await import('jspdf');

    // Criar canvas do elemento
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor,
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');

    // Criar PDF
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height]
    });

    // Adicionar imagem ao PDF
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);

    // Salvar PDF
    pdf.save(filename);

    console.log('[ChartExport] PDF exported successfully');
  } catch (error) {
    console.error('Erro ao exportar como PDF:', error);
    throw new Error('Falha ao exportar gráfico como PDF');
  }
}

/**
 * Exportar elemento SVG como SVG
 */
export async function exportAsSVG(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const {
    filename = 'chart.svg'
  } = options;

  try {
    // Buscar elemento SVG dentro do elemento
    const svgElement = element.querySelector('svg') as SVGElement;
    
    if (!svgElement) {
      throw new Error('Nenhum elemento SVG encontrado');
    }

    // Clonar SVG para não modificar o original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Adicionar namespace se não existir
    if (!clonedSvg.getAttribute('xmlns')) {
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Serializar SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);

    // Criar blob
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    
    // Criar link de download
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    
    // Limpar URL
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Erro ao exportar como SVG:', error);
    throw new Error('Falha ao exportar gráfico como SVG');
  }
}

/**
 * Exportar gráfico em formato específico
 */
export async function exportChart(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  switch (options.format) {
    case 'png':
      await exportAsPNG(element, options);
      break;
    case 'pdf':
      await exportAsPDF(element, options);
      break;
    case 'svg':
      await exportAsSVG(element, options);
      break;
    default:
      throw new Error(`Formato de exportação não suportado: ${options.format}`);
  }
}

/**
 * Exportar múltiplos gráficos em um único PDF (com lazy loading)
 */
export async function exportMultipleChartsAsPDF(
  elements: HTMLElement[],
  options: {
    filename?: string;
    title?: string;
    pageSize?: 'a4' | 'letter';
  }
): Promise<void> {
  const {
    filename = 'relatorio-graficos.pdf',
    title = 'Relatório de Gráficos',
    pageSize = 'a4'
  } = options;

  try {
    // Lazy load html2canvas
    console.log('[ChartExport] Lazy loading html2canvas...');
    const { default: html2canvas } = await import('html2canvas');

    // Lazy load jsPDF
    console.log('[ChartExport] Lazy loading jsPDF...');
    const { default: jsPDF } = await import('jspdf');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: pageSize
    });

    // Adicionar título
    pdf.setFontSize(16);
    pdf.text(title, 10, 10);

    for (let i = 0; i < elements.length; i++) {
      // Adicionar nova página se não for a primeira
      if (i > 0) {
        pdf.addPage();
      }

      const canvas = await html2canvas(elements[i], {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');

      // Calcular dimensões para caber na página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Se a imagem for muito alta, redimensionar
      let finalHeight = imgHeight;
      let finalWidth = imgWidth;

      if (imgHeight > pageHeight - 2 * margin - 20) {
        finalHeight = pageHeight - 2 * margin - 20;
        finalWidth = (canvas.width * finalHeight) / canvas.height;
      }

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin + 10,
        finalWidth,
        finalHeight
      );
    }

    pdf.save(filename);

    console.log('[ChartExport] Multiple charts PDF exported successfully');
  } catch (error) {
    console.error('Erro ao exportar múltiplos gráficos:', error);
    throw new Error('Falha ao exportar relatório de gráficos');
  }
}

/**
 * Gerar nome de arquivo com timestamp
 */
export function generateFilename(baseName: string, format: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${baseName}_${timestamp}.${format}`;
}

export const chartExportService = {
  exportChart,
  exportAsPNG,
  exportAsPDF,
  exportAsSVG,
  exportMultipleChartsAsPDF,
  generateFilename
};

export default chartExportService;

