import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  props?: Record<string, any>;
  visible?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  isDefault?: boolean;
}

interface UseDashboardLayoutConfig {
  userId: string;
  role: string;
  storageKey?: string;
}

export function useDashboardLayout({
  userId,
  role,
  storageKey = 'dashboard_layout',
}: UseDashboardLayoutConfig) {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayoutId, setCurrentLayoutId] = useState<string>('default');
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load layouts from localStorage
  useEffect(() => {
    if (!userId) return;
    
    try {
      const stored = localStorage.getItem(`${storageKey}_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        setLayouts(data.layouts || []);
        setCurrentLayoutId(data.currentLayoutId || 'default');
        
        const currentLayout = data.layouts.find(
          (l: DashboardLayout) => l.id === (data.currentLayoutId || 'default')
        );
        if (currentLayout) {
          setWidgets(currentLayout.widgets);
        }
      } else {
        // Initialize with default layout
        const defaultLayout = getDefaultLayout(role);
        setLayouts([defaultLayout]);
        setWidgets(defaultLayout.widgets);
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error);
    }
  }, [userId, role, storageKey]);

  // Save layouts to localStorage
  const saveLayouts = useCallback(
    (newLayouts: DashboardLayout[], newCurrentLayoutId?: string) => {
      try {
        const data = {
          layouts: newLayouts,
          currentLayoutId: newCurrentLayoutId || currentLayoutId,
        };
        localStorage.setItem(`${storageKey}_${userId}`, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving dashboard layout:', error);
        toast.error('Erro ao salvar layout');
      }
    },
    [userId, currentLayoutId, storageKey]
  );

  // Update widget position
  const updateWidgetPosition = useCallback(
    (widgetId: string, position: { x: number; y: number }) => {
      setWidgets((prev) =>
        prev.map((w) => (w.id === widgetId ? { ...w, position } : w))
      );
    },
    []
  );

  // Update widget size
  const updateWidgetSize = useCallback(
    (widgetId: string, size: { w: number; h: number }) => {
      setWidgets((prev) =>
        prev.map((w) => (w.id === widgetId ? { ...w, size } : w))
      );
    },
    []
  );

  // Add widget
  const addWidget = useCallback(
    (widget: Omit<WidgetConfig, 'id'>) => {
      const newWidget: WidgetConfig = {
        ...widget,
        id: `widget_${Date.now()}`,
      };
      setWidgets((prev) => [...prev, newWidget]);
      toast.success('Widget adicionado');
    },
    []
  );

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    toast.success('Widget removido');
  }, []);

  // Save current layout
  const saveCurrentLayout = useCallback(() => {
    const currentLayout = layouts.find((l) => l.id === currentLayoutId);
    if (currentLayout) {
      const updatedLayout = { ...currentLayout, widgets };
      const newLayouts = layouts.map((l) =>
        l.id === currentLayoutId ? updatedLayout : l
      );
      setLayouts(newLayouts);
      saveLayouts(newLayouts);
      toast.success('Layout salvo com sucesso');
    }
  }, [layouts, currentLayoutId, widgets, saveLayouts]);

  // Reset to default layout
  const resetToDefault = useCallback(() => {
    const defaultLayout = getDefaultLayout(role);
    setWidgets(defaultLayout.widgets);
    toast.success('Layout restaurado para o padrão');
  }, [role]);

  // Switch layout
  const switchLayout = useCallback(
    (layoutId: string) => {
      const layout = layouts.find((l) => l.id === layoutId);
      if (layout) {
        setCurrentLayoutId(layoutId);
        setWidgets(layout.widgets);
        saveLayouts(layouts, layoutId);
      }
    },
    [layouts, saveLayouts]
  );

  // Create new layout
  const createLayout = useCallback(
    (name: string) => {
      const newLayout: DashboardLayout = {
        id: `layout_${Date.now()}`,
        name,
        widgets: getDefaultLayout(role).widgets,
      };
      const newLayouts = [...layouts, newLayout];
      setLayouts(newLayouts);
      saveLayouts(newLayouts, newLayout.id);
      setCurrentLayoutId(newLayout.id);
      setWidgets(newLayout.widgets);
      toast.success(`Layout "${name}" criado`);
    },
    [layouts, role, saveLayouts]
  );

  // Delete layout
  const deleteLayout = useCallback(
    (layoutId: string) => {
      if (layoutId === 'default') {
        toast.error('Não é possível excluir o layout padrão');
        return;
      }

      const newLayouts = layouts.filter((l) => l.id !== layoutId);
      setLayouts(newLayouts);
      
      if (currentLayoutId === layoutId) {
        setCurrentLayoutId('default');
        const defaultLayout = newLayouts.find((l) => l.id === 'default');
        if (defaultLayout) {
          setWidgets(defaultLayout.widgets);
        }
      }
      
      saveLayouts(newLayouts, currentLayoutId === layoutId ? 'default' : currentLayoutId);
      toast.success('Layout excluído');
    },
    [layouts, currentLayoutId, saveLayouts]
  );

  return {
    layouts,
    currentLayoutId,
    widgets,
    isEditMode,
    setIsEditMode,
    updateWidgetPosition,
    updateWidgetSize,
    addWidget,
    removeWidget,
    saveCurrentLayout,
    resetToDefault,
    switchLayout,
    createLayout,
    deleteLayout,
  };
}

function getDefaultLayout(role: string): DashboardLayout {
  const defaultWidgets: WidgetConfig[] = [
    {
      id: 'kpi_patients',
      type: 'kpi',
      title: 'Total de Pacientes',
      position: { x: 0, y: 0 },
      size: { w: 1, h: 1 },
      props: { metric: 'total_patients' },
    },
    {
      id: 'kpi_revenue',
      type: 'kpi',
      title: 'Receita Mensal',
      position: { x: 1, y: 0 },
      size: { w: 1, h: 1 },
      props: { metric: 'monthly_revenue' },
    },
    {
      id: 'kpi_appointments',
      type: 'kpi',
      title: 'Agendamentos Hoje',
      position: { x: 2, y: 0 },
      size: { w: 1, h: 1 },
      props: { metric: 'today_appointments' },
    },
    {
      id: 'kpi_occupancy',
      type: 'kpi',
      title: 'Taxa de Ocupação',
      position: { x: 3, y: 0 },
      size: { w: 1, h: 1 },
      props: { metric: 'occupancy_rate' },
    },
    {
      id: 'revenue_chart',
      type: 'revenue',
      title: 'Evolução da Receita',
      position: { x: 0, y: 1 },
      size: { w: 2, h: 2 },
    },
    {
      id: 'patient_flow',
      type: 'patient_flow',
      title: 'Fluxo de Pacientes',
      position: { x: 2, y: 1 },
      size: { w: 2, h: 2 },
    },
    {
      id: 'appointments_list',
      type: 'appointments',
      title: 'Próximos Agendamentos',
      position: { x: 0, y: 3 },
      size: { w: 2, h: 2 },
    },
    {
      id: 'tasks_list',
      type: 'tasks',
      title: 'Tarefas Pendentes',
      position: { x: 2, y: 3 },
      size: { w: 2, h: 2 },
    },
  ];

  return {
    id: 'default',
    name: 'Layout Padrão',
    widgets: defaultWidgets,
    isDefault: true,
  };
}

