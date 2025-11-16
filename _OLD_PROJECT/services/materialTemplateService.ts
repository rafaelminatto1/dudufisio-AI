import { v4 as uuidv4 } from 'uuid';
import { MaterialTemplate } from '../types';

// Mock data para desenvolvimento
const mockTemplates: MaterialTemplate[] = [
  {
    id: '1',
    name: 'Avaliação Inicial - Ortopedia',
    description: 'Template padrão para avaliação inicial em casos ortopédicos',
    category: 'Escala de Avaliação',
    content: '<h2>Anamnese</h2><p>História clínica do paciente...</p><h2>Exame Físico</h2><p>Inspeção, palpação, testes especiais...</p>',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    tags: ['ortopedia', 'avaliação', 'inicial'],
    isPublic: true,
    isSystemTemplate: true,
    usageCount: 45,
    createdBy: 'system',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '2',
    name: 'Protocolo Pós-Operatório LCA',
    description: 'Protocolo completo para reabilitação pós reconstrução de LCA',
    category: 'Protocolo Clínico',
    content: '<h2>Fase 1 (0-2 semanas)</h2><p>Objetivos: controle de dor e edema...</p>',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    tags: ['pós-operatório', 'lca', 'joelho'],
    isPublic: true,
    isSystemTemplate: true,
    usageCount: 32,
    createdBy: 'system',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '3',
    name: 'Orientações Домаашних Exercícios - Lombar',
    description: 'Material de orientação para exercícios domiciliares em dor lombar',
    category: 'Material de Orientação',
    content: '<h2>Exercícios Recomendados</h2><p>1. Alongamento de isquiotibiais...</p>',
    thumbnail: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
    tags: ['lombar', 'exercícios', 'domiciliares'],
    isPublic: true,
    isSystemTemplate: false,
    usageCount: 67,
    createdBy: 'user-1',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
  },
];

class MaterialTemplateService {
  private templates: MaterialTemplate[] = [...mockTemplates];

  // Listar todos os templates
  async listTemplates(): Promise<MaterialTemplate[]> {
    return [...this.templates].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Buscar templates por categoria
  async getTemplatesByCategory(category: string): Promise<MaterialTemplate[]> {
    return this.templates.filter(t => t.category === category);
  }

  // Buscar templates públicos
  async getPublicTemplates(): Promise<MaterialTemplate[]> {
    return this.templates.filter(t => t.isPublic);
  }

  // Buscar templates do sistema
  async getSystemTemplates(): Promise<MaterialTemplate[]> {
    return this.templates.filter(t => t.isSystemTemplate);
  }

  // Buscar template por ID
  async getTemplateById(id: string): Promise<MaterialTemplate | null> {
    return this.templates.find(t => t.id === id) || null;
  }

  // Criar novo template
  async createTemplate(data: Omit<MaterialTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<MaterialTemplate> {
    const newTemplate: MaterialTemplate = {
      ...data,
      id: uuidv4(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.push(newTemplate);
    return newTemplate;
  }

  // Atualizar template
  async updateTemplate(id: string, data: Partial<MaterialTemplate>): Promise<MaterialTemplate | null> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.templates[index] = {
      ...this.templates[index],
      ...data,
      id, // Garantir que o ID não muda
      updatedAt: new Date().toISOString(),
    };

    return this.templates[index];
  }

  // Deletar template
  async deleteTemplate(id: string): Promise<boolean> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return false;

    // Não permitir deletar templates do sistema
    if (this.templates[index].isSystemTemplate) {
      throw new Error('Templates do sistema não podem ser deletados');
    }

    this.templates.splice(index, 1);
    return true;
  }

  // Incrementar contador de uso
  async incrementUsageCount(id: string): Promise<void> {
    const template = this.templates.find(t => t.id === id);
    if (template) {
      template.usageCount++;
    }
  }

  // Duplicar template
  async duplicateTemplate(id: string, userId: string): Promise<MaterialTemplate | null> {
    const original = await this.getTemplateById(id);
    if (!original) return null;

    const duplicated: MaterialTemplate = {
      ...original,
      id: uuidv4(),
      name: `${original.name} (Cópia)`,
      isSystemTemplate: false,
      usageCount: 0,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.push(duplicated);
    return duplicated;
  }

  // Buscar templates (search)
  async searchTemplates(query: string): Promise<MaterialTemplate[]> {
    const lowerQuery = query.toLowerCase();
    return this.templates.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description?.toLowerCase().includes(lowerQuery) ||
      t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Obter templates mais usados
  async getMostUsedTemplates(limit: number = 10): Promise<MaterialTemplate[]> {
    return [...this.templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Obter estatísticas
  async getTemplateStatistics() {
    return {
      total: this.templates.length,
      public: this.templates.filter(t => t.isPublic).length,
      system: this.templates.filter(t => t.isSystemTemplate).length,
      totalUsage: this.templates.reduce((sum, t) => sum + t.usageCount, 0),
      byCategory: this.templates.reduce((acc, t) => {
        const category = typeof t.category === 'string' ? t.category : t.category.name;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const materialTemplateService = new MaterialTemplateService();
export default materialTemplateService;

