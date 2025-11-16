export interface AppointmentTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  type: string;
  duration: number; // em minutos
  value?: number;
  color?: string;
  isDefault?: boolean;
  settings: {
    allowRecurrence?: boolean;
    defaultRecurrence?: 'weekly' | 'biweekly' | 'monthly';
    requiresRoom?: boolean;
    requiresEquipment?: string[];
    maxSessions?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  usageCount: number;
}

export interface AppointmentTemplatePreset {
  category: 'fisioterapia' | 'pilates' | 'avaliacao' | 'retorno' | 'custom';
  templates: Omit<AppointmentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'usageCount'>[];
}

export const defaultTemplates: AppointmentTemplatePreset[] = [
  {
    category: 'fisioterapia',
    templates: [
      {
        name: 'Fisioterapia - Sessão Padrão',
        description: 'Sessão padrão de fisioterapia motora',
        icon: '🏃',
        type: 'Fisioterapia Motora',
        duration: 50,
        value: 120,
        color: 'blue',
        isDefault: true,
        settings: {
          allowRecurrence: true,
          defaultRecurrence: 'weekly',
          requiresRoom: true,
          maxSessions: 10
        }
      },
      {
        name: 'Fisioterapia - Sessão Longa',
        description: 'Sessão estendida para casos complexos',
        icon: '⏱️',
        type: 'Fisioterapia Motora',
        duration: 90,
        value: 180,
        color: 'purple',
        settings: {
          allowRecurrence: true,
          requiresRoom: true
        }
      },
      {
        name: 'Fisioterapia Respiratória',
        description: 'Sessão de fisioterapia respiratória',
        icon: '🫁',
        type: 'Fisioterapia Respiratória',
        duration: 40,
        value: 100,
        color: 'cyan',
        settings: {
          allowRecurrence: true,
          defaultRecurrence: 'weekly',
          requiresEquipment: ['Nebulizador', 'Oxímetro']
        }
      }
    ]
  },
  {
    category: 'pilates',
    templates: [
      {
        name: 'Pilates - Aula Individual',
        description: 'Aula de pilates individual',
        icon: '🧘',
        type: 'Pilates',
        duration: 50,
        value: 90,
        color: 'green',
        settings: {
          allowRecurrence: true,
          defaultRecurrence: 'biweekly',
          requiresRoom: true,
          requiresEquipment: ['Reformer', 'Bola']
        }
      },
      {
        name: 'Pilates - Aula em Dupla',
        description: 'Aula de pilates para 2 pessoas',
        icon: '👥',
        type: 'Pilates Dupla',
        duration: 50,
        value: 60,
        color: 'teal',
        settings: {
          allowRecurrence: true,
          requiresRoom: true
        }
      }
    ]
  },
  {
    category: 'avaliacao',
    templates: [
      {
        name: 'Avaliação Inicial',
        description: 'Primeira avaliação do paciente',
        icon: '📋',
        type: 'Avaliação',
        duration: 60,
        value: 150,
        color: 'orange',
        settings: {
          allowRecurrence: false,
          requiresRoom: true
        }
      },
      {
        name: 'Reavaliação',
        description: 'Reavaliação de progresso',
        icon: '📊',
        type: 'Reavaliação',
        duration: 45,
        value: 100,
        color: 'amber',
        settings: {
          allowRecurrence: false,
          requiresRoom: true
        }
      }
    ]
  },
  {
    category: 'retorno',
    templates: [
      {
        name: 'Retorno Rápido',
        description: 'Consulta de retorno breve',
        icon: '🔄',
        type: 'Retorno',
        duration: 30,
        value: 80,
        color: 'slate',
        settings: {
          allowRecurrence: false
        }
      },
      {
        name: 'Retorno Completo',
        description: 'Consulta de retorno completa',
        icon: '📝',
        type: 'Retorno',
        duration: 50,
        value: 120,
        color: 'gray',
        settings: {
          allowRecurrence: false,
          requiresRoom: true
        }
      }
    ]
  }
];


