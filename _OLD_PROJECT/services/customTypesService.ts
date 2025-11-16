/**
 * Serviço para Gerenciar Tipos Personalizados
 * Especialidades e tipos de conteúdo customizáveis
 */

// ===== TIPOS BASE =====
export interface CustomSpecialty {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomContentType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  fields: ContentTypeField[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentTypeField {
  id: string;
  name: string;
  displayName: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'url';
  required: boolean;
  options?: string[]; // Para select e multiselect
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// ===== ESPECIALIDADES PADRÃO =====
const DEFAULT_SPECIALTIES: CustomSpecialty[] = [
  {
    id: 'esportiva',
    name: 'esportiva',
    displayName: 'Esportiva',
    description: 'Fisioterapia esportiva e atlética',
    color: '#3B82F6',
    icon: '🏃',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pos-operatoria',
    name: 'pos-operatoria',
    displayName: 'Pós-Operatória',
    description: 'Reabilitação pós-cirúrgica',
    color: '#8B5CF6',
    icon: '🏥',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'geriatrica',
    name: 'geriatrica',
    displayName: 'Gerontológica',
    description: 'Fisioterapia geriátrica',
    color: '#F59E0B',
    icon: '👴',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ortopedica',
    name: 'ortopedica',
    displayName: 'Ortopédica',
    description: 'Fisioterapia ortopédica',
    color: '#10B981',
    icon: '🦴',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'neurologica',
    name: 'neurologica',
    displayName: 'Neurológica',
    description: 'Fisioterapia neurológica',
    color: '#EF4444',
    icon: '🧠',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ===== TIPOS DE CONTEÚDO PADRÃO =====
const DEFAULT_CONTENT_TYPES: CustomContentType[] = [
  {
    id: 'protocols',
    name: 'protocols',
    displayName: 'Protocolos',
    description: 'Protocolos clínicos de tratamento',
    color: '#3B82F6',
    icon: '📋',
    isCustom: false,
    fields: [
      { id: 'title', name: 'title', displayName: 'Título', type: 'text', required: true },
      { id: 'description', name: 'description', displayName: 'Descrição', type: 'textarea', required: true },
      { id: 'summary', name: 'summary', displayName: 'Resumo', type: 'textarea', required: true },
      { id: 'duration', name: 'duration', displayName: 'Duração', type: 'text', required: true },
      { id: 'frequency', name: 'frequency', displayName: 'Frequência', type: 'text', required: true },
      { id: 'evidenceLevel', name: 'evidenceLevel', displayName: 'Nível de Evidência', type: 'select', required: true, options: ['A', 'B', 'C', 'D'] },
      { id: 'objectives', name: 'objectives', displayName: 'Objetivos', type: 'multiselect', required: false },
      { id: 'tags', name: 'tags', displayName: 'Tags', type: 'multiselect', required: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exercises',
    name: 'exercises',
    displayName: 'Exercícios',
    description: 'Exercícios terapêuticos',
    color: '#10B981',
    icon: '💪',
    isCustom: false,
    fields: [
      { id: 'name', name: 'name', displayName: 'Nome', type: 'text', required: true },
      { id: 'description', name: 'description', displayName: 'Descrição', type: 'textarea', required: true },
      { id: 'category', name: 'category', displayName: 'Categoria', type: 'select', required: true, options: ['mobilidade', 'fortalecimento', 'alongamento', 'equilibrio', 'coordenacao', 'propriocepcao', 'resistencia', 'flexibilidade', 'funcional'] },
      { id: 'difficulty', name: 'difficulty', displayName: 'Dificuldade', type: 'select', required: true, options: ['iniciante', 'intermediario', 'avancado'] },
      { id: 'sets', name: 'sets', displayName: 'Séries', type: 'number', required: true, validation: { min: 1 } },
      { id: 'repetitions', name: 'repetitions', displayName: 'Repetições', type: 'text', required: true },
      { id: 'restPeriod', name: 'restPeriod', displayName: 'Descanso', type: 'text', required: true },
      { id: 'tags', name: 'tags', displayName: 'Tags', type: 'multiselect', required: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'assessments',
    name: 'assessments',
    displayName: 'Avaliações',
    description: 'Avaliações especializadas',
    color: '#8B5CF6',
    icon: '📊',
    isCustom: false,
    fields: [
      { id: 'title', name: 'title', displayName: 'Título', type: 'text', required: true },
      { id: 'description', name: 'description', displayName: 'Descrição', type: 'textarea', required: true },
      { id: 'purpose', name: 'purpose', displayName: 'Propósito', type: 'textarea', required: true },
      { id: 'targetPopulation', name: 'targetPopulation', displayName: 'População Alvo', type: 'text', required: true },
      { id: 'duration', name: 'duration', displayName: 'Duração', type: 'text', required: true },
      { id: 'materials', name: 'materials', displayName: 'Materiais', type: 'multiselect', required: false },
      { id: 'tags', name: 'tags', displayName: 'Tags', type: 'multiselect', required: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'materials',
    name: 'materials',
    displayName: 'Materiais',
    description: 'Materiais clínicos e educacionais',
    color: '#F59E0B',
    icon: '📄',
    isCustom: false,
    fields: [
      { id: 'title', name: 'title', displayName: 'Título', type: 'text', required: true },
      { id: 'description', name: 'description', displayName: 'Descrição', type: 'textarea', required: true },
      { id: 'type', name: 'type', displayName: 'Tipo', type: 'select', required: true, options: ['manual', 'form', 'checklist', 'guideline', 'template', 'infographic'] },
      { id: 'category', name: 'category', displayName: 'Categoria', type: 'select', required: true, options: ['patient-education', 'professional-use', 'evaluation', 'documentation'] },
      { id: 'content', name: 'content', displayName: 'Conteúdo', type: 'textarea', required: true },
      { id: 'version', name: 'version', displayName: 'Versão', type: 'text', required: true },
      { id: 'downloadable', name: 'downloadable', displayName: 'Permitir Download', type: 'checkbox', required: false },
      { id: 'printable', name: 'printable', displayName: 'Permitir Impressão', type: 'checkbox', required: false },
      { id: 'tags', name: 'tags', displayName: 'Tags', type: 'multiselect', required: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ===== STORAGE KEYS =====
const STORAGE_KEYS = {
  SPECIALTIES: 'customTypes_specialties',
  CONTENT_TYPES: 'customTypes_contentTypes',
};

// ===== HELPER FUNCTIONS =====
function loadFromStorage<T>(key: string, defaultData: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
  }
  return defaultData;
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===== ESPECIALIDADES SERVICE =====
export class SpecialtiesService {
  private specialties: CustomSpecialty[];

  constructor() {
    this.specialties = loadFromStorage(STORAGE_KEYS.SPECIALTIES, DEFAULT_SPECIALTIES);
  }

  getAll(): CustomSpecialty[] {
    return [...this.specialties];
  }

  getById(id: string): CustomSpecialty | undefined {
    return this.specialties.find(s => s.id === id);
  }

  getCustom(): CustomSpecialty[] {
    return this.specialties.filter(s => s.isCustom);
  }

  create(specialty: Omit<CustomSpecialty, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>): CustomSpecialty {
    const newSpecialty: CustomSpecialty = {
      ...specialty,
      id: generateId(),
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.specialties.push(newSpecialty);
    saveToStorage(STORAGE_KEYS.SPECIALTIES, this.specialties);
    return newSpecialty;
  }

  update(id: string, updates: Partial<CustomSpecialty>): CustomSpecialty | null {
    const index = this.specialties.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.specialties[index] = {
      ...this.specialties[index],
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    saveToStorage(STORAGE_KEYS.SPECIALTIES, this.specialties);
    return this.specialties[index];
  }

  delete(id: string): boolean {
    const specialty = this.specialties.find(s => s.id === id);
    if (!specialty?.isCustom) return false; // Não pode deletar especialidades padrão

    const index = this.specialties.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.specialties.splice(index, 1);
    saveToStorage(STORAGE_KEYS.SPECIALTIES, this.specialties);
    return true;
  }

  search(query: string): CustomSpecialty[] {
    const lowerQuery = query.toLowerCase();
    return this.specialties.filter(s =>
      s.displayName.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// ===== TIPOS DE CONTEÚDO SERVICE =====
export class ContentTypesService {
  private contentTypes: CustomContentType[];

  constructor() {
    this.contentTypes = loadFromStorage(STORAGE_KEYS.CONTENT_TYPES, DEFAULT_CONTENT_TYPES);
  }

  getAll(): CustomContentType[] {
    return [...this.contentTypes];
  }

  getById(id: string): CustomContentType | undefined {
    return this.contentTypes.find(ct => ct.id === id);
  }

  getCustom(): CustomContentType[] {
    return this.contentTypes.filter(ct => ct.isCustom);
  }

  create(contentType: Omit<CustomContentType, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>): CustomContentType {
    const newContentType: CustomContentType = {
      ...contentType,
      id: generateId(),
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.contentTypes.push(newContentType);
    saveToStorage(STORAGE_KEYS.CONTENT_TYPES, this.contentTypes);
    return newContentType;
  }

  update(id: string, updates: Partial<CustomContentType>): CustomContentType | null {
    const index = this.contentTypes.findIndex(ct => ct.id === id);
    if (index === -1) return null;

    this.contentTypes[index] = {
      ...this.contentTypes[index],
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    saveToStorage(STORAGE_KEYS.CONTENT_TYPES, this.contentTypes);
    return this.contentTypes[index];
  }

  delete(id: string): boolean {
    const contentType = this.contentTypes.find(ct => ct.id === id);
    if (!contentType?.isCustom) return false; // Não pode deletar tipos padrão

    const index = this.contentTypes.findIndex(ct => ct.id === id);
    if (index === -1) return false;

    this.contentTypes.splice(index, 1);
    saveToStorage(STORAGE_KEYS.CONTENT_TYPES, this.contentTypes);
    return true;
  }

  search(query: string): CustomContentType[] {
    const lowerQuery = query.toLowerCase();
    return this.contentTypes.filter(ct =>
      ct.displayName.toLowerCase().includes(lowerQuery) ||
      ct.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// ===== UNIFIED SERVICE =====
export class CustomTypesService {
  specialties: SpecialtiesService;
  contentTypes: ContentTypesService;

  constructor() {
    this.specialties = new SpecialtiesService();
    this.contentTypes = new ContentTypesService();
  }

  getStatistics() {
    return {
      totalSpecialties: this.specialties.getAll().length,
      customSpecialties: this.specialties.getCustom().length,
      totalContentTypes: this.contentTypes.getAll().length,
      customContentTypes: this.contentTypes.getCustom().length,
    };
  }

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.SPECIALTIES);
    localStorage.removeItem(STORAGE_KEYS.CONTENT_TYPES);
    
    this.specialties = new SpecialtiesService();
    this.contentTypes = new ContentTypesService();
  }

  exportData() {
    return {
      specialties: this.specialties.getAll(),
      contentTypes: this.contentTypes.getAll(),
      exportedAt: new Date().toISOString(),
    };
  }

  importData(data: { specialties: CustomSpecialty[]; contentTypes: CustomContentType[] }) {
    // Mesclar dados importados com os existentes
    const existingSpecialties = this.specialties.getAll();
    const existingContentTypes = this.contentTypes.getAll();

    const mergedSpecialties = [...existingSpecialties];
    const mergedContentTypes = [...existingContentTypes];

    // Adicionar especialidades que não existem
    data.specialties.forEach(specialty => {
      if (!existingSpecialties.find(s => s.id === specialty.id)) {
        mergedSpecialties.push(specialty);
      }
    });

    // Adicionar tipos de conteúdo que não existem
    data.contentTypes.forEach(contentType => {
      if (!existingContentTypes.find(ct => ct.id === contentType.id)) {
        mergedContentTypes.push(contentType);
      }
    });

    saveToStorage(STORAGE_KEYS.SPECIALTIES, mergedSpecialties);
    saveToStorage(STORAGE_KEYS.CONTENT_TYPES, mergedContentTypes);

    // Recarregar serviços
    this.specialties = new SpecialtiesService();
    this.contentTypes = new ContentTypesService();
  }
}

// Export singleton instance
export const customTypesService = new CustomTypesService();

export default customTypesService;
