import { createServerComponentClient } from '~/lib/supabase/server';

export interface ConductProcedure {
  id: string;
  name: string;
  category: string;
  description?: string;
  duration_minutes?: number;
  equipment?: string[];
  contraindications?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ConductCategory {
  id: string;
  name: string;
  description?: string;
  procedures?: ConductProcedure[];
}

/**
 * Serviço para gerenciar biblioteca de procedimentos/condutas
 */
export class ConductLibraryService {
  private supabase;

  constructor() {
    // Será inicializado no método assíncrono
    this.supabase = null as any;
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createServerComponentClient();
    }
    return this.supabase;
  }

  /**
   * Busca todas as categorias de procedimentos
   */
  async getCategories(): Promise<ConductCategory[]> {
    const supabase = await this.getSupabase();

    // Categorias padrão se não existir tabela
    const defaultCategories: ConductCategory[] = [
      {
        id: 'manual_therapy',
        name: 'Terapia Manual',
        description: 'Técnicas manuais de mobilização e manipulação',
        procedures: [
          {
            id: 'mobilizacao_articular',
            name: 'Mobilização Articular',
            category: 'manual_therapy',
            duration_minutes: 15,
          },
          {
            id: 'manipulacao_vertebral',
            name: 'Manipulação Vertebral',
            category: 'manual_therapy',
            duration_minutes: 10,
          },
          {
            id: 'massagem_terapeutica',
            name: 'Massagem Terapêutica',
            category: 'manual_therapy',
            duration_minutes: 20,
          },
        ],
      },
      {
        id: 'electrotherapy',
        name: 'Eletroterapia',
        description: 'Recursos eletroterapêuticos',
        procedures: [
          {
            id: 'tens',
            name: 'TENS',
            category: 'electrotherapy',
            duration_minutes: 20,
          },
          {
            id: 'ultrassom',
            name: 'Ultrassom',
            category: 'electrotherapy',
            duration_minutes: 10,
          },
          {
            id: 'laser',
            name: 'Laser',
            category: 'electrotherapy',
            duration_minutes: 5,
          },
          {
            id: 'corrente_russa',
            name: 'Corrente Russa',
            category: 'electrotherapy',
            duration_minutes: 15,
          },
        ],
      },
      {
        id: 'exercises',
        name: 'Exercícios',
        description: 'Exercícios terapêuticos e funcionais',
        procedures: [
          {
            id: 'fortalecimento',
            name: 'Fortalecimento',
            category: 'exercises',
            duration_minutes: 20,
          },
          {
            id: 'alongamento',
            name: 'Alongamento',
            category: 'exercises',
            duration_minutes: 15,
          },
          {
            id: 'propriocepcao',
            name: 'Propriocepção',
            category: 'exercises',
            duration_minutes: 15,
          },
          {
            id: 'pilates',
            name: 'Pilates',
            category: 'exercises',
            duration_minutes: 30,
          },
        ],
      },
      {
        id: 'thermotherapy',
        name: 'Termoterapia',
        description: 'Aplicação de calor e frio',
        procedures: [
          {
            id: 'crioterapia',
            name: 'Crioterapia',
            category: 'thermotherapy',
            duration_minutes: 15,
          },
          {
            id: 'termoterapia',
            name: 'Termoterapia',
            category: 'thermotherapy',
            duration_minutes: 20,
          },
        ],
      },
      {
        id: 'other',
        name: 'Outros',
        description: 'Outras técnicas e procedimentos',
        procedures: [],
      },
    ];

    // TODO: Buscar do banco quando tabela existir
    // const { data } = await supabase
    //   .from('conduct_procedures')
    //   .select('*')
    //   .order('category, name');

    return defaultCategories;
  }

  /**
   * Busca procedimentos por categoria
   */
  async getProceduresByCategory(categoryId: string): Promise<ConductProcedure[]> {
    const categories = await this.getCategories();
    const category = categories.find((c) => c.id === categoryId);
    return category?.procedures || [];
  }

  /**
   * Busca procedimento por ID
   */
  async getProcedureById(id: string): Promise<ConductProcedure | null> {
    const categories = await this.getCategories();
    for (const category of categories) {
      const procedure = category.procedures?.find((p) => p.id === id);
      if (procedure) {
        return procedure;
      }
    }
    return null;
  }

  /**
   * Busca procedimentos por nome (busca parcial)
   */
  async searchProcedures(query: string): Promise<ConductProcedure[]> {
    const categories = await this.getCategories();
    const allProcedures: ConductProcedure[] = [];

    categories.forEach((category) => {
      if (category.procedures) {
        allProcedures.push(...category.procedures);
      }
    });

    const lowerQuery = query.toLowerCase();
    return allProcedures.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
    );
  }
}

