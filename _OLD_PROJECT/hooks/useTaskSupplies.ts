// hooks/useTaskSupplies.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  Task, 
  TaskSupplyUsed, 
  TaskTypeSupplyTemplate,
  TaskCost,
  Supply
} from '../types';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  getTaskSuppliesUsed,
  createTaskSupplyUsed,
  deleteTaskSupplyUsed,
  getTaskTypeSupplyTemplates,
  createTaskTypeSupplyTemplate,
  updateTaskTypeSupplyTemplate,
  getTaskCost,
  calculateTaskCost,
  validateSupplyAvailability,
  getSuggestedSuppliesForTaskType,
  consumeSuppliesForTask,
  TASK_SUPPLY_TEMPLATES
} from '../services/taskSupplyService';

// ============================================================================
// HOOK PARA TAREFAS
// ============================================================================

export const useTasks = (filters?: {
  status?: string;
  assignedUserId?: string;
  patientId?: string;
  taskType?: string;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks(filters);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const addTask = useCallback(async (taskData: any) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tarefa');
      throw err;
    }
  }, []);

  const editTask = useCallback(async (taskData: any) => {
    try {
      const updatedTask = await updateTask(taskData);
      setTasks(prev => prev.map(task => 
        task.id === taskData.id ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    addTask,
    editTask
  };
};

// ============================================================================
// HOOK PARA INSUMOS DE TAREFA
// ============================================================================

export const useTaskSupplies = (taskId: string) => {
  const [taskSupplies, setTaskSupplies] = useState<TaskSupplyUsed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskSupplies = useCallback(async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getTaskSuppliesUsed(taskId);
      setTaskSupplies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar insumos da tarefa');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const addTaskSupply = useCallback(async (supplyData: any) => {
    try {
      const newSupply = await createTaskSupplyUsed({
        ...supplyData,
        taskId
      });
      setTaskSupplies(prev => [newSupply, ...prev]);
      return newSupply;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar insumo');
      throw err;
    }
  }, [taskId]);

  const removeTaskSupply = useCallback(async (supplyId: string) => {
    try {
      await deleteTaskSupplyUsed(supplyId);
      setTaskSupplies(prev => prev.filter(supply => supply.id !== supplyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover insumo');
      throw err;
    }
  }, []);

  const consumeSupplies = useCallback(async (supplies: Array<{
    supplyId: string;
    quantity: number;
    unitCost?: number;
    batchNumber?: string;
    expirationDate?: string;
  }>) => {
    try {
      const results = await consumeSuppliesForTask(taskId, supplies);
      setTaskSupplies(prev => [...prev, ...results]);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consumir insumos');
      throw err;
    }
  }, [taskId]);

  useEffect(() => {
    fetchTaskSupplies();
  }, [fetchTaskSupplies]);

  return {
    taskSupplies,
    loading,
    error,
    refetch: fetchTaskSupplies,
    addTaskSupply,
    removeTaskSupply,
    consumeSupplies
  };
};

// ============================================================================
// HOOK PARA TEMPLATES DE INSUMOS POR TIPO DE TAREFA
// ============================================================================

export const useTaskTypeSupplyTemplates = (taskType?: string) => {
  const [templates, setTemplates] = useState<TaskTypeSupplyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!taskType) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getTaskTypeSupplyTemplates(taskType);
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  }, [taskType]);

  const addTemplate = useCallback(async (templateData: any) => {
    try {
      const newTemplate = await createTaskTypeSupplyTemplate(templateData);
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar template');
      throw err;
    }
  }, []);

  const editTemplate = useCallback(async (id: string, templateData: any) => {
    try {
      const updatedTemplate = await updateTaskTypeSupplyTemplate(id, templateData);
      setTemplates(prev => prev.map(template => 
        template.id === id ? updatedTemplate : template
      ));
      return updatedTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar template');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    addTemplate,
    editTemplate
  };
};

// ============================================================================
// HOOK PARA CUSTOS DE TAREFA
// ============================================================================

export const useTaskCost = (taskId: string) => {
  const [taskCost, setTaskCost] = useState<TaskCost | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskCost = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTaskCost(taskId);
      setTaskCost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar custo da tarefa');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const calculateCost = useCallback(async () => {
    try {
      const cost = await calculateTaskCost(taskId);
      setTaskCost(cost);
      return cost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular custo');
      throw err;
    }
  }, [taskId]);

  useEffect(() => {
    fetchTaskCost();
  }, [fetchTaskCost]);

  return {
    taskCost,
    loading,
    error,
    refetch: fetchTaskCost,
    calculateCost
  };
};

// ============================================================================
// HOOK PARA VALIDAÇÃO DE DISPONIBILIDADE
// ============================================================================

export const useSupplyAvailability = () => {
  const [validating, setValidating] = useState(false);

  const validateAvailability = useCallback(async (supplyId: string, quantity: number) => {
    try {
      setValidating(true);
      const result = await validateSupplyAvailability(supplyId, quantity);
      return result;
    } catch (error) {
      console.error('Erro ao validar disponibilidade:', error);
      return {
        available: false,
        currentStock: 0,
        message: 'Erro ao verificar disponibilidade'
      };
    } finally {
      setValidating(false);
    }
  }, []);

  return {
    validateAvailability,
    validating
  };
};

// ============================================================================
// HOOK PARA SUGESTÕES DE INSUMOS
// ============================================================================

export const useSuggestedSupplies = (taskType?: string) => {
  const [suggestions, setSuggestions] = useState<{
    required: TaskTypeSupplyTemplate[];
    optional: TaskTypeSupplyTemplate[];
  }>({ required: [], optional: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!taskType) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getSuggestedSuppliesForTaskType(taskType);
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sugestões');
    } finally {
      setLoading(false);
    }
  }, [taskType]);

  const getPredefinedTemplates = useCallback(() => {
    if (!taskType) return { required: [], optional: [] };
    
    const templates = TASK_SUPPLY_TEMPLATES[taskType as keyof typeof TASK_SUPPLY_TEMPLATES] || [];
    const required = templates.filter(t => t.required);
    const optional = templates.filter(t => !t.required);
    
    return { required, optional };
  }, [taskType]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    loading,
    error,
    refetch: fetchSuggestions,
    getPredefinedTemplates
  };
};

// ============================================================================
// HOOK PARA TAREFA ESPECÍFICA
// ============================================================================

export const useTask = (taskId: string) => {
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTaskById(taskId);
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefa');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const editTask = useCallback(async (taskData: any) => {
    try {
      const updatedTask = await updateTask({ ...taskData, id: taskId });
      setTask(updatedTask);
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
      throw err;
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return {
    task,
    loading,
    error,
    refetch: fetchTask,
    editTask
  };
};
