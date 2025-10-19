// Serviço simples para geração de PDF que funciona de forma mais confiável

export class SimplePDFService {
  public static async generateAndDownloadPDF(
    title: string,
    content: string,
    filename: string
  ): Promise<void> {
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, 30);
      
      // Add content
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Split content into lines that fit the page
      const lines = doc.splitTextToSize(content, 170);
      let yPosition = 50;
      
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 8;
      });
      
      // Add footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.text('Gerado pelo sistema DuduFisio-AI', 20, pageHeight - 10);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, pageHeight - 5);
      
      // Generate blob and download
      const pdfBlob = doc.output('blob');
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      
      // Fallback: create a simple text file
      const textContent = `
${title}
=====================================

${content}

=====================================
Gerado pelo sistema DuduFisio-AI
Data: ${new Date().toLocaleDateString('pt-BR')}
      `;
      
      const textBlob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(textBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.txt`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      throw new Error('PDF não pôde ser gerado, arquivo de texto foi criado como alternativa');
    }
  }

  public static async generateReportPDF(reportData: any): Promise<void> {
    const title = reportData.title || 'Relatório';
    const content = `
INFORMAÇÕES DO RELATÓRIO:
- ID: ${reportData.id || 'N/A'}
- Data de Geração: ${new Date(reportData.generatedAt || Date.now()).toLocaleDateString('pt-BR')}
- Status: ${reportData.status || 'N/A'}

RESUMO:
${reportData.data?.summary?.description || reportData.summary || 'Resumo não disponível'}

MÉTRICAS:
${reportData.data?.summary?.metrics?.map((m: any) => `- ${m.name}: ${m.value} (${m.trend})`).join('\n') || 'Métricas não disponíveis'}

ANÁLISES:
${reportData.data?.analysis?.map((a: any) => `- ${a.title}: ${a.description}`).join('\n') || 'Análises não disponíveis'}
    `;
    
    const filename = `relatorio_${reportData.id || Date.now()}_${new Date().toISOString().split('T')[0]}`;
    
    await this.generateAndDownloadPDF(title, content, filename);
  }

  public static async generateClinicalReportPDF(reportData: any): Promise<void> {
    const title = reportData.title || 'Relatório Clínico';
    const content = `
INFORMAÇÕES DO PACIENTE:
- Paciente: ${reportData.patientName || 'N/A'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

RESUMO DO TRATAMENTO:
${reportData.summary || 'Resumo não disponível'}

PROGRESSO CLÍNICO:
${reportData.clinicalProgress || 'Progresso não documentado'}

MEDIDAS DE RESULTADO:
${reportData.outcomeMeasures ? `
- Dor Inicial: ${reportData.outcomeMeasures.painInitial || 'N/A'}
- Dor Atual: ${reportData.outcomeMeasures.painCurrent || 'N/A'}
- Funcionalidade: ${reportData.outcomeMeasures.functionality || 'N/A'}
` : 'Medidas não disponíveis'}

RECOMENDAÇÕES:
${reportData.recommendations || 'Recomendações não disponíveis'}
    `;
    
    const filename = `relatorio_clinico_${reportData.id || Date.now()}_${new Date().toISOString().split('T')[0]}`;
    
    await this.generateAndDownloadPDF(title, content, filename);
  }
}
