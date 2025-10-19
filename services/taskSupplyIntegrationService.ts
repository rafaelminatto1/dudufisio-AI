// services/taskSupplyIntegrationService.ts
import { supabase } from '../lib/supabase';
import { 
  TaskSupplyUsed,
  CreateTaskSupplyUsedData,
  TaskTypeSupplyTemplate,
  Supply,
  TaskCostSummary,
  SupplyCategory
} from '../types';

// ============================================================================
// TEMPLATES DE INSUMOS POR TIPO DE TAREFA
// ============================================================================

const defaultTemplates: Record<string, Partial<TaskTypeSupplyTemplate>[]> = {
  'eletroterapia': [
    { taskType: 'eletroterapia', supplyName: 'Eletrodos Autoadesivos', defaultQuantity: 2, isRequired: true },
    { taskType: 'eletroterapia', supplyName: 'Gel Condutor', defaultQuantity: 1, isRequired: true },
    { taskType: 'eletroterapia', supplyName: 'Algodão', defaultQuantity: 3, isRequired: false }
  ],
  'exercicios_terapeuticos': [
    { taskType: 'exercicios_terapeuticos', supplyName: 'Theraband Verde', defaultQuantity: 1, isRequired: false },
    { taskType: 'exercicios_terapeuticos', supplyName: 'Bola Suíça', defaultQuantity: 1, isRequired: false },
    { taskType: 'exercicios_terapeuticos', supplyName: 'Halteres 2kg', defaultQuantity: 2, isRequired: false }
  ],
  'terapia_manual': [
    { taskType: 'terapia_manual', supplyName: 'Óleo de Massagem', defaultQuantity: 1, isRequired: true },
    { taskType: 'terapia_manual', supplyName: 'Toalha Descartável', defaultQuantity: 2, isRequired: true },
    { taskType: 'terapia_manual', supplyName: 'Luvas Descartáveis', defaultQuantity: 1, isRequired: false }
  ],
  'ultrassom': [
    { taskType: 'ultrassom', supplyName: 'Gel Condutor', defaultQuantity: 1, isRequired: true },
    { taskType: 'ultrassom', supplyName: 'Papel Toalha', defaultQuantity: 2, isRequired: true }
  ],
  'crioterapia': [
    { taskType: 'crioterapia', supplyName: 'Gelo Reutilizável', defaultQuantity: 2, isRequired: true },
    { taskType: 'crioterapia', supplyName: 'Toalha Descartável', defaultQuantity: 1, isRequired: true }
  ],
  'termoterapia': [
    { taskType: 'termoterapia', supplyName: 'Compressa Quente', defaultQuantity: 1, isRequired: true },
    { taskType: 'termoterapia', supplyName: 'Toalha Descartável', defaultQuantity: 2, isRequired: true }
  ],
  'avaliacao': [
    { taskType: 'avaliacao', supplyName: 'Ficha de Avaliação', defaultQuantity: 1, isRequired: true },
    { taskType: 'avaliacao', supplyName: 'Caneta', defaultQuantity: 1, isRequired: true },
    { taskType: 'avaliacao', supplyName: 'Luvas Descartáveis', defaultQuantity: 1, isRequired: false }
  ]
};

// ============================================================================
// FUNÇÕES DE MAPEAMENTO
// ============================================================================

const mapSupabaseToTaskSupplyUsed = (data: any): TaskSupplyUsed => ({
  id: data.id,
  taskId: data.task_id,
  supplyId: data.supply_id,
  supply: data.supply ? {
    id: data.supply.id,
    name: data.supply.name,
    description: data.supply.description,
    category: data.supply.category,
    subcategory: data.supply.subcategory,
    brand: data.supply.brand,
    model: data.supply.model,
    unitOfMeasure: data.supply.unit_of_measure,
    currentStock: data.supply.current_stock,
    minimumStock: data.supply.minimum_stock,
    maximumStock: data.supply.maximum_stock,
    unitCost: data.supply.unit_cost,
    supplierId: data.supply.supplier_id,
    barcode: data.supply.barcode,
    expirationDate: data.supply.expiration_date,
    storageLocation: data.supply.storage_location,
    isActive: data.supply.is_active,
    requiresPrescription: data.supply.requires_prescription,
    createdBy: data.supply.created_by,
    createdAt: data.supply.created_at,
    updatedAt: data.supply.updated_at
  } : undefined,
  quantityUsed: data.quantity_used,
  unitCost: data.unit_cost,
  totalCost: data.total_cost,
  usedBy: data.used_by,
  patientId: data.patient_id,
  usageDate: data.usage_date,
  notes: data.notes
});

const mapSupabaseToTemplate = (data: any): TaskTypeSupplyTemplate => ({
  id: data.id,
  taskType: data.task_type,
  supplyId: data.supply_id,
  supply: data.supply ? {
    id: data.supply.id,
    name: data.supply.name,
    description: data.supply.description,
    category: data.supply.category,
    subcategory: data.supply.subcategory,
    brand: data.supply.brand,
    model: data.supply.model,
    unitOfMeasure: data.supply.unit_of_measure,
    currentStock: data.supply.current_stock,
    minimumStock: data.supply.minimum_stock,
    maximumStock: data.supply.maximum_stock,
    unitCost: data.supply.unit_cost,
    supplierId: data.supply.supplier_id,
    barcode: data.supply.barcode,
    expirationDate: data.supply.expiration_date,
    storageLocation: data.supply.storage_location,
    isActive: data.supply.is_active,
    requiresPrescription: data.supply.requires_prescription,
    createdBy: data.supply.created_by,
    createdAt: data.supply.created_at,
    updatedAt: data.supply.updated_at
  } : undefined,
  defaultQuantity: data.default_quantity,
  isRequired: data.is_required,
  notes: data.notes,
  isActive: data.is_active !== false,
  createdAt: data.created_at,
  updatedAt: data.updated_at
});

// ============================================================================
// SERVIÇO DE TEMPLATES
// ============================================================================

/**
 * Busca templates de insumos para um tipo de tarefa específico
 */
export const getTaskTypeSupplyTemplates = async (taskType: string): Promise<TaskTypeSupplyTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('task_type_supply_templates')
      .select(`
        *,
        supply:supplies(*)
      `)
      .eq('task_type', taskType)
      .eq('is_active', true);

    if (error) throw error;

    if (data?.length === 0) {
      // Retornar templates padrão se não houver templates cadastrados
      
      return [];
    }

    return data.map(mapSupabaseToTemplate);
  } catch (error) {
    console.error('Erro ao buscar templates de insumos:', error);
    throw error;
  }
};

/**
 * Cria ou atualiza templates de insumos para um tipo de tarefa
 */
export const saveTaskTypeSupplyTemplates = async (
  taskType: string,
  templates: Omit<TaskTypeSupplyTemplate, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<TaskTypeSupplyTemplate[]> => {
  try {
    // Primeiro, desativar templates existentes
    await supabase
      .from('task_type_supply_templates')
      .update({ is_active: false })
      .eq('task_type', taskType);

    // Inserir novos templates
    const { data, error } = await supabase
      .from('task_type_supply_templates')
      .insert(templates.map(template => ({
        task_type: taskType,
        supply_id: template.supplyId,
        default_quantity: template.defaultQuantity,
        is_required: template.isRequired,
        notes: template.notes,
        is_active: true,
        created_by: (supabase.auth.getUser()).then(u => u.data.user?.id)
      })))
      .select(`
        *,
        supply:supplies(*)
      `);

    if (error) throw error;
    return (data || []).map(mapSupabaseToTemplate);
  } catch (error) {
    console.error('Erro ao salvar templates de insumos:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE INSUMOS UTILIZADOS EM TAREFAS
// ============================================================================

/**
 * Registra o uso de insumos em uma tarefa
 */
export const recordTaskSupplyUsage = async (
  taskId: string,
  supplies: CreateTaskSupplyUsedData[]
): Promise<TaskSupplyUsed[]> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    // Preparar dados para inserção
    const dataToInsert = supplies.map(supply => ({
      task_id: taskId,
      supply_id: supply.supplyId,
      quantity_used: supply.quantityUsed,
      unit_cost: supply.unitCost,
      total_cost: supply.unitCost ? supply.unitCost * supply.quantityUsed : null,
      used_by: userId,
      patient_id: supply.patientId,
      notes: supply.notes
    }));

    // Inserir registros de uso
    const { data: insertedData, error: insertError } = await supabase
      .from('task_supplies_used')
      .insert(dataToInsert)
      .select(`
        *,
        supply:supplies(*)
      `);

    if (insertError) throw insertError;

    // Criar movimentações de estoque para cada insumo
    for (const supply of dataToInsert) {
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          supply_id: supply.supply_id,
          movement_type: 'saida',
          quantity: supply.quantity_used,
          unit_cost: supply.unit_cost,
          total_cost: supply.total_cost,
          reason: `Uso em tarefa #${taskId}`,
          moved_by: userId,
          patient_id: supply.patient_id,
          task_id: taskId
        });

      if (movementError) {
        console.error('Erro ao criar movimentação de estoque:', movementError);
      }
    }

    return (insertedData || []).map(mapSupabaseToTaskSupplyUsed);
  } catch (error) {
    console.error('Erro ao registrar uso de insumos:', error);
    throw error;
  }
};

/**
 * Busca insumos utilizados em uma tarefa específica
 */
export const getTaskSuppliesUsed = async (taskId: string): Promise<TaskSupplyUsed[]> => {
  try {
    const { data, error } = await supabase
      .from('task_supplies_used')
      .select(`
        *,
        supply:supplies(*)
      `)
      .eq('task_id', taskId)
      .order('usage_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapSupabaseToTaskSupplyUsed);
  } catch (error) {
    console.error('Erro ao buscar insumos utilizados:', error);
    throw error;
  }
};

/**
 * Calcula o custo total de insumos de uma tarefa
 */
export const calculateTaskSupplyCost = async (taskId: string): Promise<TaskCostSummary> => {
  try {
    const supplies = await getTaskSuppliesUsed(taskId);
    
    const totalSupplyCost = supplies.reduce((sum, item) => 
      sum + (item.totalCost || 0), 0
    );

    // Valores fictícios para outros custos (pode ser expandido futuramente)
    const laborCost = 50; // Custo de mão de obra padrão
    const overheadCost = totalSupplyCost * 0.2; // 20% de overhead
    
    const totalCost = totalSupplyCost + laborCost + overheadCost;

    const user = await supabase.auth.getUser();

    return {
      id: `cost-${taskId}`,
      taskId,
      totalSupplyCost,
      laborCost,
      overheadCost,
      totalCost,
      calculatedAt: new Date().toISOString(),
      calculatedBy: user.data.user?.id
    };
  } catch (error) {
    console.error('Erro ao calcular custo da tarefa:', error);
    throw error;
  }
};

/**
 * Verifica disponibilidade de insumos antes de iniciar uma tarefa
 */
export const validateSupplyAvailability = async (
  supplies: { supplyId: string; quantity: number }[]
): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  try {
    for (const item of supplies) {
      const { data: supply, error } = await supabase
        .from('supplies')
        .select('id, name, current_stock')
        .eq('id', item.supplyId)
        .single();

      if (error || !supply) {
        errors.push(`Insumo não encontrado: ${item.supplyId}`);
        continue;
      }

      if (supply.current_stock < item.quantity) {
        errors.push(
          `Estoque insuficiente de ${supply.name}: ` +
          `disponível ${supply.current_stock}, necessário ${item.quantity}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Erro ao validar disponibilidade:', error);
    return {
      isValid: false,
      errors: ['Erro ao validar disponibilidade de insumos']
    };
  }
};

/**
 * Sugere insumos substitutos quando um item está em falta
 */
export const suggestAlternativeSupplies = async (
  supplyId: string
): Promise<Supply[]> => {
  try {
    // Buscar o insumo original
    const { data: originalSupply, error: originalError } = await supabase
      .from('supplies')
      .select('category, subcategory')
      .eq('id', supplyId)
      .single();

    if (originalError || !originalSupply) {
      throw new Error('Insumo original não encontrado');
    }

    // Buscar insumos similares (mesma categoria e subcategoria)
    const { data: alternatives, error: altError } = await supabase
      .from('supplies')
      .select('*')
      .eq('category', originalSupply.category)
      .eq('subcategory', originalSupply.subcategory)
      .neq('id', supplyId)
      .gt('current_stock', 0)
      .eq('is_active', true)
      .limit(5);

    if (altError) throw altError;

    return (alternatives || []).map(supply => ({
      id: supply.id,
      name: supply.name,
      description: supply.description,
      category: supply.category as SupplyCategory,
      subcategory: supply.subcategory,
      brand: supply.brand,
      model: supply.model,
      unitOfMeasure: supply.unit_of_measure,
      currentStock: supply.current_stock,
      minimumStock: supply.minimum_stock,
      maximumStock: supply.maximum_stock,
      unitCost: supply.unit_cost,
      supplierId: supply.supplier_id,
      barcode: supply.barcode,
      expirationDate: supply.expiration_date,
      storageLocation: supply.storage_location,
      isActive: supply.is_active,
      requiresPrescription: supply.requires_prescription,
      createdBy: supply.created_by,
      createdAt: supply.created_at,
      updatedAt: supply.updated_at
    }));
  } catch (error) {
    console.error('Erro ao buscar alternativas:', error);
    return [];
  }
};

/**
 * Busca histórico de consumo de insumos por paciente
 */
export const getPatientSupplyHistory = async (
  patientId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<TaskSupplyUsed[]> => {
  try {
    let query = supabase
      .from('task_supplies_used')
      .select(`
        *,
        supply:supplies(*)
      `)
      .eq('patient_id', patientId);

    if (dateFrom) {
      query = query.gte('usage_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('usage_date', dateTo);
    }

    const { data, error } = await query.order('usage_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapSupabaseToTaskSupplyUsed);
  } catch (error) {
    console.error('Erro ao buscar histórico de consumo do paciente:', error);
    throw error;
  }
};

/**
 * Calcula estatísticas de consumo por tipo de tarefa
 */
export const getTaskTypeConsumptionStats = async (
  taskType: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{
  totalTasks: number;
  totalSuppliesUsed: number;
  averageCostPerTask: number;
  mostUsedSupplies: { supplyName: string; totalQuantity: number }[];
}> => {
  try {
    // Esta função precisaria de uma integração mais profunda com a tabela de tarefas
    // Por enquanto, retornando dados simulados
    return {
      totalTasks: 0,
      totalSuppliesUsed: 0,
      averageCostPerTask: 0,
      mostUsedSupplies: []
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas de consumo:', error);
    throw error;
  }
};

// ============================================================================
// FUNÇÕES DE INICIALIZAÇÃO
// ============================================================================

/**
 * Inicializa templates padrão no banco de dados
 */
export const initializeDefaultTemplates = async (): Promise<void> => {
  try {
    // Verificar se já existem templates
    const { data: existingTemplates } = await supabase
      .from('task_type_supply_templates')
      .select('id')
      .limit(1);

    if (existingTemplates && existingTemplates.length > 0) {
      
      return;
    }

    // Buscar IDs dos insumos pelos nomes
    const { data: supplies } = await supabase
      .from('supplies')
      .select('id, name');

    if (supplies?.length === 0) {
      
      return;
    }

    const supplyMap = new Map(supplies.map(s => [s.name, s.id]));

    // Criar templates baseados nos defaultTemplates
    for (const [taskType, templates] of Object.entries(defaultTemplates)) {
      const templatesWithIds = templates
        .filter(t => t.supplyName && supplyMap.has(t.supplyName))
        .map(t => ({
          task_type: taskType,
          supply_id: supplyMap.get(t.supplyName!),
          default_quantity: t.defaultQuantity || 1,
          is_required: t.isRequired || false
        }));

      if (templatesWithIds.length > 0) {
        await supabase
          .from('task_type_supply_templates')
          .insert(templatesWithIds);
      }
    }

    
  } catch (error) {
    console.error('Erro ao inicializar templates:', error);
  }
};