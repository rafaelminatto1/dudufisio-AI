/**
 * PDF Generator Lazy
 * Wrapper que carrega bibliotecas PDF apenas quando necessário
 * Reduz o bundle inicial em ~300KB
 */

export interface PDFContent {
  title: string;
  subtitle?: string;
  sections: Array<{
    title: string;
    content: string | string[];
  }>;
  footer?: string;
}

export interface PDFGeneratorOptions {
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm' | 'pt' | 'in';
  format?: string | number[];
  compress?: boolean;
}

/**
 * Gera PDF usando dynamic imports
 * Carrega jsPDF apenas quando necessário
 */
export async function generatePDF(
  content: PDFContent,
  options: PDFGeneratorOptions = {}
): Promise<Blob> {
  try {
    // Dynamic import de jsPDF
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: options.unit || 'mm',
      format: options.format || 'a4',
      compress: options.compress !== false
    });
    
    let yPosition = 20;
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(content.title, 20, yPosition);
    yPosition += 15;
    
    // Add subtitle if provided
    if (content.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(content.subtitle, 20, yPosition);
      yPosition += 15;
    }
    
    // Add sections
    content.sections.forEach((section) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Add section title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, 20, yPosition);
      yPosition += 15;
      
      // Add section content
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (Array.isArray(section.content)) {
        section.content.forEach((line) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 8;
        });
      } else {
        // Split long text into multiple lines
        const lines = doc.splitTextToSize(section.content, 170);
        lines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 8;
        });
      }
      
      yPosition += 10; // Add space between sections
    });
    
    // Add footer if provided
    if (content.footer) {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.text(content.footer, 20, pageHeight - 10);
    }
    
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Falha ao gerar PDF');
  }
}

/**
 * Gera PDF a partir de HTML usando html2canvas
 * Carrega ambas bibliotecas apenas quando necessário
 */
export async function generatePDFFromHTML(
  html: string,
  options: PDFGeneratorOptions = {}
): Promise<Blob> {
  try {
    // Dynamic imports
    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);
    
    // Criar elemento temporário
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    document.body.appendChild(tempDiv);
    
    // Capturar como canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    // Remover elemento temporário
    document.body.removeChild(tempDiv);
    
    // Criar PDF
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: options.unit || 'mm',
      format: options.format || 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw new Error('Falha ao gerar PDF do HTML');
  }
}

/**
 * Download PDF
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  link.click();
  
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Gera e baixa PDF em um único passo
 */
export async function generateAndDownloadPDF(
  content: PDFContent,
  filename: string,
  options?: PDFGeneratorOptions
): Promise<void> {
  try {
    const pdf = await generatePDF(content, options);
    downloadPDF(pdf, filename);
  } catch (error) {
    console.error('Error generating and downloading PDF:', error);
    throw error;
  }
}

