// Import jsPDF dynamically to avoid issues
export class PDFService {
    static getInstance() {
        if (!PDFService.instance) {
            PDFService.instance = new PDFService();
        }
        return PDFService.instance;
    }
    async generatePDF(content, filename) {
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
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
            content.sections.forEach((section, index) => {
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
                    section.content.forEach((line, lineIndex) => {
                        if (yPosition > 270) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.text(line, 20, yPosition);
                        yPosition += 8;
                    });
                }
                else {
                    // Split long text into multiple lines
                    const lines = doc.splitTextToSize(section.content, 170);
                    lines.forEach((line) => {
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
        }
        catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw new Error('Falha ao gerar PDF');
        }
    }
    async downloadPDF(content, filename) {
        try {
            const pdfBlob = await this.generatePDF(content, filename);
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
        }
        catch (error) {
            console.error('Erro ao fazer download do PDF:', error);
            throw error;
        }
    }
    createReportPDF(report) {
        return {
            title: report.title || 'Relatório',
            subtitle: `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
            sections: [
                {
                    title: 'Resumo',
                    content: report.summary || report.data?.summary?.description || 'Resumo não disponível'
                },
                {
                    title: 'Métricas',
                    content: report.data?.summary?.metrics?.map((m) => `${m.name}: ${m.value} (${m.trend})`) || ['Métricas não disponíveis']
                },
                {
                    title: 'Análises',
                    content: report.data?.analysis?.map((a) => `${a.title}: ${a.description}`) || ['Análises não disponíveis']
                }
            ],
            footer: `Relatório gerado pelo sistema DuduFisio-AI - ID: ${report.id}`
        };
    }
    createClinicalReportPDF(report) {
        const sections = [
            {
                title: 'Informações do Paciente',
                content: [
                    `Paciente: ${report.patientName || 'N/A'}`,
                    `Data: ${new Date().toLocaleDateString('pt-BR')}`
                ]
            },
            {
                title: 'Resumo do Tratamento',
                content: report.summary || 'Resumo não disponível'
            },
            {
                title: 'Progresso Clínico',
                content: report.clinicalProgress || 'Progresso não documentado'
            }
        ];
        if (report.outcomeMeasures) {
            sections.push({
                title: 'Medidas de Resultado',
                content: [
                    `Dor Inicial: ${report.outcomeMeasures.painInitial || 'N/A'}`,
                    `Dor Atual: ${report.outcomeMeasures.painCurrent || 'N/A'}`,
                    `Funcionalidade: ${report.outcomeMeasures.functionality || 'N/A'}`
                ]
            });
        }
        if (report.recommendations) {
            sections.push({
                title: 'Recomendações',
                content: report.recommendations
            });
        }
        return {
            title: report.title || 'Relatório Clínico',
            sections,
            footer: `Relatório gerado pelo sistema DuduFisio-AI - ID: ${report.id}`
        };
    }
}
export const pdfService = PDFService.getInstance();
