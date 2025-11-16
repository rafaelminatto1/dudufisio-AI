import { Material } from '../types';

interface ExportOptions {
  includeMetadata?: boolean;
  includeComments?: boolean;
  includeVersionHistory?: boolean;
  format: 'pdf' | 'docx' | 'xlsx' | 'markdown' | 'html';
}

interface ExportResult {
  success: boolean;
  data?: Blob | string;
  filename: string;
  error?: string;
}

class MaterialExportService {
  // Exportar material para PDF
  async exportToPDF(material: Material, options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    try {
      // Simulação de exportação para PDF
      // Em produção, usar biblioteca como jsPDF ou PDFKit
      
      const content = this.generateHTMLContent(material, options);
      
      // Simular geração de PDF
      const blob = new Blob([content], { type: 'application/pdf' });
      
      return {
        success: true,
        data: blob,
        filename: `${this.sanitizeFilename(material.name)}.pdf`,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Erro ao exportar para PDF',
      };
    }
  }

  // Exportar material para Word (DOCX)
  async exportToWord(material: Material, options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    try {
      // Simulação de exportação para DOCX
      // Em produção, usar biblioteca como docx ou mammoth
      
      const content = this.generateHTMLContent(material, options);
      
      // Simular geração de DOCX
      const blob = new Blob([content], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      return {
        success: true,
        data: blob,
        filename: `${this.sanitizeFilename(material.name)}.docx`,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Erro ao exportar para Word',
      };
    }
  }

  // Exportar lista de materiais para Excel
  async exportToExcel(materials: Material[]): Promise<ExportResult> {
    try {
      // Simulação de exportação para Excel
      // Em produção, usar biblioteca como xlsx ou exceljs
      
      const csvContent = this.generateCSVContent(materials);
      
      // Simular geração de Excel
      const blob = new Blob([csvContent], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      return {
        success: true,
        data: blob,
        filename: `materiais_${new Date().toISOString().split('T')[0]}.xlsx`,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Erro ao exportar para Excel',
      };
    }
  }

  // Exportar para Markdown
  async exportToMarkdown(material: Material): Promise<ExportResult> {
    try {
      const markdown = this.convertHTMLToMarkdown(material.content || '');
      
      const fullContent = `# ${material.name}\n\n` +
        (material.description ? `${material.description}\n\n` : '') +
        `**Categoria:** ${typeof material.category === 'string' ? material.category : material.category.name}\n\n` +
        `**Atualizado em:** ${new Date(material.updatedAt).toLocaleDateString()}\n\n` +
        `---\n\n${markdown}`;
      
      return {
        success: true,
        data: fullContent,
        filename: `${this.sanitizeFilename(material.name)}.md`,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Erro ao exportar para Markdown',
      };
    }
  }

  // Exportar para HTML
  async exportToHTML(material: Material, options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    try {
      const html = this.generateHTMLContent(material, options);
      
      return {
        success: true,
        data: html,
        filename: `${this.sanitizeFilename(material.name)}.html`,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Erro ao exportar para HTML',
      };
    }
  }

  // Exportar múltiplos materiais
  async exportMultiple(
    materials: Material[], 
    format: ExportOptions['format']
  ): Promise<ExportResult> {
    try {
      if (format === 'xlsx') {
        return await this.exportToExcel(materials);
      }

      // Para outros formatos, criar um arquivo ZIP
      // Em produção, usar biblioteca como JSZip
      
      const filename = `materiais_${new Date().toISOString().split('T')[0]}.zip`;
      
      return {
        success: true,
        filename,
        error: 'Exportação múltipla em ZIP não implementada ainda',
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Erro ao exportar múltiplos materiais',
      };
    }
  }

  // Helpers privados

  private generateHTMLContent(material: Material, options: Partial<ExportOptions> = {}): string {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${material.name}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .content { line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>${material.name}</h1>
    `;

    if (options.includeMetadata) {
      html += `
        <div class="metadata">
          <p><strong>Categoria:</strong> ${typeof material.category === 'string' ? material.category : material.category.name}</p>
          ${material.description ? `<p><strong>Descrição:</strong> ${material.description}</p>` : ''}
          <p><strong>Criado por:</strong> ${material.createdBy || 'N/A'}</p>
          <p><strong>Atualizado em:</strong> ${new Date(material.updatedAt).toLocaleString()}</p>
          ${material.tags ? `<p><strong>Tags:</strong> ${material.tags.join(', ')}</p>` : ''}
        </div>
      `;
    }

    html += `
        <div class="content">
          ${material.content || ''}
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private generateCSVContent(materials: Material[]): string {
    const headers = ['ID', 'Nome', 'Categoria', 'Tags', 'Status', 'Criado Por', 'Atualizado Em'];
    const rows = materials.map(m => [
      m.id,
      m.name,
      typeof m.category === 'string' ? m.category : m.category.name,
      m.tags?.join('; ') || '',
      m.status || 'N/A',
      m.createdBy || 'N/A',
      new Date(m.updatedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  private convertHTMLToMarkdown(html: string): string {
    // Conversão simplificada de HTML para Markdown
    // Em produção, usar biblioteca como turndown
    
    let markdown = html;
    
    // Substituições básicas
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
    markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
    markdown = markdown.replace(/<ul>/g, '\n');
    markdown = markdown.replace(/<\/ul>/g, '\n');
    markdown = markdown.replace(/<li>(.*?)<\/li>/g, '- $1\n');
    
    // Remover tags HTML restantes
    markdown = markdown.replace(/<[^>]*>/g, '');
    
    return markdown.trim();
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}

export const materialExportService = new MaterialExportService();
export default materialExportService;

