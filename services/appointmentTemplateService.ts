import { AppointmentTemplate } from '../types/appointmentTemplates';

const STORAGE_KEY = 'fisioflow_appointment_templates';

// Mock storage usando localStorage
class AppointmentTemplateService {
  private templates: AppointmentTemplate[] = [];

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.templates = JSON.parse(stored).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      this.templates = [];
    }
  }

  private saveTemplates(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.templates));
    } catch (error) {
      console.error('Erro ao salvar templates:', error);
    }
  }

  async listTemplates(): Promise<AppointmentTemplate[]> {
    return [...this.templates].sort((a, b) => b.usageCount - a.usageCount);
  }

  async getTemplate(id: string): Promise<AppointmentTemplate | null> {
    return this.templates.find(t => t.id === id) || null;
  }

  async createTemplate(
    template: Omit<AppointmentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ): Promise<AppointmentTemplate> {
    const newTemplate: AppointmentTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    this.templates.push(newTemplate);
    this.saveTemplates();

    return newTemplate;
  }

  async updateTemplate(
    id: string,
    updates: Partial<Omit<AppointmentTemplate, 'id' | 'createdAt' | 'createdBy' | 'usageCount'>>
  ): Promise<AppointmentTemplate | null> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveTemplates();
    return this.templates[index];
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    this.saveTemplates();
    return true;
  }

  async incrementUsage(id: string): Promise<void> {
    const template = this.templates.find(t => t.id === id);
    if (template) {
      template.usageCount++;
      template.updatedAt = new Date();
      this.saveTemplates();
    }
  }

  async getMostUsed(limit: number = 5): Promise<AppointmentTemplate[]> {
    return [...this.templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  async searchTemplates(query: string): Promise<AppointmentTemplate[]> {
    const lowerQuery = query.toLowerCase();
    return this.templates.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.type.toLowerCase().includes(lowerQuery) ||
      t.description?.toLowerCase().includes(lowerQuery)
    );
  }

  async getDefaultTemplates(): Promise<AppointmentTemplate[]> {
    return this.templates.filter(t => t.isDefault);
  }
}

export const appointmentTemplateService = new AppointmentTemplateService();


