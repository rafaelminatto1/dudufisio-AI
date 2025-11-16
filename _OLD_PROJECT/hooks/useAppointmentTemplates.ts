import { useState, useEffect } from 'react';
import { AppointmentTemplate, defaultTemplates } from '../types/appointmentTemplates';
import { appointmentTemplateService } from '../services/appointmentTemplateService';

export const useAppointmentTemplates = () => {
  const [templates, setTemplates] = useState<AppointmentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeTemplates();
  }, []);

  const initializeTemplates = async () => {
    setIsLoading(true);
    
    try {
      // Verificar se já existem templates
      const existing = await appointmentTemplateService.listTemplates();
      
      // Se não houver templates, criar os padrões
      if (existing.length === 0) {
        for (const preset of defaultTemplates) {
          for (const templateData of preset.templates) {
            await appointmentTemplateService.createTemplate({
              ...templateData,
              createdBy: 'system'
            });
          }
        }
        
        setIsInitialized(true);
      }
      
      // Carregar todos os templates
      const allTemplates = await appointmentTemplateService.listTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Erro ao inicializar templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    const allTemplates = await appointmentTemplateService.listTemplates();
    setTemplates(allTemplates);
  };

  const createTemplate = async (
    templateData: Omit<AppointmentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ) => {
    const newTemplate = await appointmentTemplateService.createTemplate(templateData);
    await refetch();
    return newTemplate;
  };

  const deleteTemplate = async (id: string) => {
    const success = await appointmentTemplateService.deleteTemplate(id);
    if (success) {
      await refetch();
    }
    return success;
  };

  const getMostUsed = async (limit: number = 5) => {
    return appointmentTemplateService.getMostUsed(limit);
  };

  return {
    templates,
    isLoading,
    isInitialized,
    refetch,
    createTemplate,
    deleteTemplate,
    getMostUsed
  };
};


