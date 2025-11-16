# 💻 EXEMPLOS DE CÓDIGO PRONTOS

## 📋 PÁGINA DE LISTA COMPLETA

```typescript
// pages/MyEntityListPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Grid3x3, List } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { SearchBar } from '@/components/common/SearchBar';
import { FilterPanel } from '@/components/common/FilterPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTableFilters } from '@/hooks/useTableFilters';
import { useBulkActions } from '@/hooks/useBulkActions';
import { useExportData } from '@/hooks/useExportData';
import { useConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from 'sonner';

const MyEntityListPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters
  const {
    filters,
    setFilter,
    clearAllFilters,
    activeFiltersCount,
    applyFilters,
    searchQuery,
    setSearchQuery,
  } = useTableFilters({
    filters: [
      { key: 'status', type: 'select', label: 'Status' },
      { key: 'category', type: 'multiselect', label: 'Categoria' },
    ],
  });

  // Bulk actions
  const bulkActions = useBulkActions({
    actions: [
      {
        id: 'export',
        label: 'Exportar',
        action: async (items) => {
          exportToCSV(items);
        },
      },
    ],
  });

  const { exportToCSV } = useExportData();
  const { confirm, dialog } = useConfirmDialog();

  // Filtered data
  const filteredData = useMemo(() => {
    return applyFilters(rawData);
  }, [rawData, applyFilters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minha Entidade</h1>
          <p className="text-muted-foreground">Gerencie suas entidades</p>
        </div>
        <Button onClick={() => navigate('/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{filteredData.length}</p>
          </div>
        </Card>
        {/* mais cards... */}
      </div>

      {/* Filters and View Toggle */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterPanel
            filters={filters}
            onFilterChange={setFilter}
            onClearFilters={clearAllFilters}
            activeFiltersCount={activeFiltersCount}
          >
            {/* Filtros customizados */}
          </FilterPanel>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredData)}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="table">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid3x3 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={isLoading}
        onRowClick={handleView}
      />

      {dialog}
    </div>
  );
};

export default MyEntityListPage;
```

---

## 🎨 CARD DE VISUALIZAÇÃO

```typescript
// components/MyEntityCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ActionMenu } from '@/components/common/ActionMenu';
import { Edit, Trash2 } from 'lucide-react';

interface MyEntityCardProps {
  item: MyEntity;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MyEntityCard({
  item,
  onClick,
  onEdit,
  onDelete,
}: MyEntityCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={onClick}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={item.imageUrl} />
              <AvatarFallback>{item.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <ActionMenu
              items={[
                {
                  label: 'Editar',
                  icon: <Edit className="h-4 w-4" />,
                  onClick: onEdit,
                },
                {
                  label: 'Excluir',
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: onDelete,
                  variant: 'destructive',
                },
              ]}
            />
          </div>
        </div>

        {/* Status */}
        <Badge variant="default">{item.status}</Badge>

        {/* Tags */}
        {item.tags && (
          <div className="mt-4 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 📊 WIDGET PERSONALIZADO

```typescript
// components/dashboard/widgets/MyCustomWidget.tsx
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MyCustomWidgetProps {
  data: Array<{ date: string; value: number }>;
}

export function MyCustomWidget({ data }: MyCustomWidgetProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div>
        <p className="text-sm text-muted-foreground">Total</p>
        <p className="text-2xl font-bold">{total}</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Adicionar no DashboardGrid
const renderWidget = (widget: WidgetConfig) => {
  if (widget.type === 'my_custom') {
    return <MyCustomWidget data={widget.props.data} />;
  }
  // ...
};
```

---

## 🔄 FORMULÁRIO WIZARD

```typescript
// components/MyForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSection } from '@/components/common/FormSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Building } from 'lucide-react';

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string(),
});

function MyForm() {
  const [step, setStep] = useState(1);
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded ${
              s <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <FormSection
          title="Dados Pessoais"
          icon={<User className="h-5 w-5" />}
          variant="bordered"
        >
          <div>
            <Label>Nome</Label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          {/* mais campos... */}
        </FormSection>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <FormSection
          title="Contato"
          icon={<Phone className="h-5 w-5" />}
        >
          {/* campos de contato */}
        </FormSection>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          Anterior
        </Button>
        {step < 3 ? (
          <Button
            type="button"
            onClick={() => setStep(step + 1)}
          >
            Próximo
          </Button>
        ) : (
          <Button type="submit">
            Salvar
          </Button>
        )}
      </div>
    </form>
  );
}
```

---

## 🎯 FILTROS CUSTOMIZADOS

```typescript
// Componente de Filtros
import { FilterPanel, FilterSection } from '@/components/common/FilterPanel';
import { Select } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { Slider } from '@/components/ui/slider';

<FilterPanel
  title="Filtros Avançados"
  activeFiltersCount={activeFiltersCount}
  onClearFilters={clearFilters}
>
  {/* Select simples */}
  <FilterSection title="Status">
    <Select
      value={filters.status}
      onValueChange={(v) => setFilter('status', v)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">Ativo</SelectItem>
        <SelectItem value="inactive">Inativo</SelectItem>
      </SelectContent>
    </Select>
  </FilterSection>

  {/* Multi-select */}
  <FilterSection title="Tags">
    <MultiSelect
      options={tagOptions}
      selected={filters.tags || []}
      onChange={(tags) => setFilter('tags', tags)}
    />
  </FilterSection>

  {/* Date range */}
  <FilterSection title="Período">
    <DateRangePicker
      date={filters.dateRange}
      onDateChange={(range) => setFilter('dateRange', range)}
    />
  </FilterSection>

  {/* Slider */}
  <FilterSection title="Idade">
    <Slider
      min={0}
      max={100}
      step={1}
      value={filters.ageRange || [0, 100]}
      onValueChange={(v) => setFilter('ageRange', v)}
    />
  </FilterSection>
</FilterPanel>
```

---

## 📊 DASHBOARD COMPLETO

```typescript
// pages/MyDashboard.tsx
import React, { useState } from 'react';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Edit, Save, RotateCcw } from 'lucide-react';

function MyDashboard() {
  const { user } = useApp();
  const layout = useDashboardLayout({
    userId: user?.id || '',
    role: user?.role || '',
  });

  const [filters, setFilters] = useState({});
  const [expandedWidgets, setExpandedWidgets] = useState(new Set());

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => layout.setIsEditMode(!layout.isEditMode)}
          >
            {layout.isEditMode ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </>
            )}
          </Button>
          <Button variant="outline" onClick={layout.resetToDefault}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <DashboardFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={() => setFilters({})}
      />

      {/* Widgets Grid */}
      <DashboardGrid
        widgets={layout.widgets}
        data={{ patients, appointments, stats }}
        isEditMode={layout.isEditMode}
        onRemoveWidget={layout.removeWidget}
        onExpandWidget={(id) => {
          setExpandedWidgets((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
          });
        }}
        expandedWidgets={expandedWidgets}
      />
    </div>
  );
}

export default MyDashboard;
```

---

## 🔍 BUSCA GLOBAL

```typescript
// Já integrado na SidebarV2
// Para adicionar itens customizados, edite navigationConfig.tsx

// components/navigation/navigationConfig.tsx
export function getNavigationConfig(role: Role, unreadCount: number) {
  return {
    sections: [
      {
        title: 'Minha Seção',
        items: [
          {
            id: 'meu-item',
            to: '/meu-item',
            icon: MyIcon,
            label: 'Meu Item',
            badge: 5, // opcional
            isNew: true, // opcional
            children: [ // submenu opcional
              {
                id: 'sub-item-1',
                to: '/sub-item-1',
                icon: SubIcon,
                label: 'Sub Item 1',
              },
            ],
            defaultExpanded: true, // opcional
          },
        ],
      },
    ],
  };
}
```

---

## 📱 RESPONSIVE COMPONENT

```typescript
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/useMediaQuery';
import { MobileDrawer } from '@/components/mobile/MobileDrawer';
import { BottomSheet } from '@/components/mobile/BottomSheet';

function MyResponsiveComponent() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={setOpen}>
        {/* Mobile content */}
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Desktop content */}
    </Dialog>
  );
}
```

---

## 🎯 AÇÕES EM LOTE

```typescript
import { useBulkActions } from '@/hooks/useBulkActions';
import { PatientBulkActions } from '@/components/patients/PatientBulkActions';

function MyList() {
  const bulkActions = useBulkActions({
    actions: [
      {
        id: 'export',
        label: 'Exportar',
        action: async (items) => {
          exportToCSV(items);
        },
      },
      {
        id: 'delete',
        label: 'Excluir',
        action: async (items) => {
          for (const item of items) {
            await deleteItem(item.id);
          }
        },
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationTitle: 'Excluir itens selecionados?',
      },
    ],
  });

  return (
    <>
      {/* Checkbox nas linhas da tabela */}
      <Checkbox
        checked={bulkActions.isSelected(item.id)}
        onCheckedChange={() => bulkActions.toggleItem(item.id)}
      />

      {/* Barra de ações em lote */}
      {bulkActions.selectedCount > 0 && (
        <PatientBulkActions
          selectedPatients={bulkActions.getSelectedItems(items)}
          onExport={() => bulkActions.executeAction(actions[0], items)}
          onDelete={() => bulkActions.executeAction(actions[1], items)}
          // ...
        />
      )}
    </>
  );
}
```

---

## 🎨 NOVO WIDGET PARA DASHBOARD

```typescript
// 1. Criar o widget
// components/dashboard/widgets/MyNewWidget.tsx
export function MyNewWidget({ data }: MyNewWidgetProps) {
  return (
    <div className="space-y-4">
      <p className="text-2xl font-bold">{data.total}</p>
      {/* seu conteúdo */}
    </div>
  );
}

// 2. Adicionar no DashboardGrid
// components/dashboard/DashboardGrid.tsx
const renderWidget = (widget: WidgetConfig) => {
  if (widget.type === 'my_new_widget') {
    return <MyNewWidget data={widget.props.data} />;
  }
  // ...
};

// 3. Adicionar no layout padrão
// hooks/useDashboardLayout.ts
function getDefaultLayout(role: string): DashboardLayout {
  return {
    widgets: [
      {
        id: 'my_widget',
        type: 'my_new_widget',
        title: 'Meu Widget',
        position: { x: 0, y: 0 },
        size: { w: 2, h: 2 },
        props: { data: myData },
      },
      // ...
    ],
  };
}
```

---

## 🔐 SERVIÇO CRUD CUSTOMIZADO

```typescript
// services/myEntityCRUDService.ts
import { supabase } from '@/lib/supabaseClient';

export class MyEntityCRUDService {
  static async getAll(filters?: any): Promise<MyEntity[]> {
    let query = supabase
      .from('my_entities')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<MyEntity | null> {
    const { data, error } = await supabase
      .from('my_entities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(entity: Partial<MyEntity>): Promise<MyEntity> {
    const { data, error } = await supabase
      .from('my_entities')
      .insert([entity])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, entity: Partial<MyEntity>): Promise<MyEntity> {
    const { data, error } = await supabase
      .from('my_entities')
      .update(entity)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('my_entities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// Usar com hook CRUD
const crud = useCRUD({
  queryKey: ['my_entities'],
  fetchFn: () => MyEntityCRUDService.getAll(),
  createFn: (data) => MyEntityCRUDService.create(data),
  updateFn: (id, data) => MyEntityCRUDService.update(id, data),
  deleteFn: (id) => MyEntityCRUDService.delete(id),
});
```

---

## 🎨 TEMA E CORES

### Usando Variantes do shadcn/ui

```typescript
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Cores Customizadas

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'rounded-lg p-4',
  status === 'active' && 'bg-green-100 text-green-700',
  status === 'inactive' && 'bg-gray-100 text-gray-700',
)}>
  Status
</div>
```

---

## 🚀 OTIMIZAÇÕES

### Lazy Load de Componente Pesado

```typescript
import { LazyComponent } from '@/components/common/LazyComponent';

<LazyComponent threshold={0.1} rootMargin="100px">
  <HeavyChart data={bigData} />
</LazyComponent>
```

### Virtualização de Lista Grande

```typescript
import { VirtualizedTable } from '@/components/common/VirtualizedTable';

<VirtualizedTable
  data={largeArray} // 1000+ items
  columns={[
    {
      key: 'name',
      header: 'Nome',
      cell: (item) => <span>{item.name}</span>,
    },
  ]}
  height={600}
  rowHeight={52}
  onRowClick={handleClick}
/>
```

### Memoização de Valores Caros

```typescript
import { useMemoWithExpiration } from '@/components/common/MemoizedComponent';

const expensiveCalculation = useMemoWithExpiration(
  () => {
    return calculateExpensiveStuff(data);
  },
  [data],
  60000 // TTL: 60 segundos
);
```

---

## 💡 DICAS E TRUQUES

### 1. Auto-save de Formulário

```typescript
import { useFormPersist } from '@/hooks/useFormPersist';

const form = useForm();

useFormPersist(form, {
  key: 'my-form',
  enabled: true,
  debounceDelay: 1000,
});
```

### 2. Exportar Dados Filtrados

```typescript
const { exportToCSV, exportToJSON } = useExportData();

// Exportar apenas selecionados
const selected = bulkActions.getSelectedItems(data);
exportToCSV(selected.length > 0 ? selected : filteredData);
```

### 3. Atalho de Teclado Customizado

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      openCreateDialog();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 4. Debounce de Busca

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

useEffect(() => {
  if (debouncedSearch) {
    fetchResults(debouncedSearch);
  }
}, [debouncedSearch]);
```

### 5. Persistir Estado no localStorage

```typescript
const [viewMode, setViewMode] = useState(() => {
  const stored = localStorage.getItem('view_mode');
  return stored || 'table';
});

useEffect(() => {
  localStorage.setItem('view_mode', viewMode);
}, [viewMode]);
```

---

## 🎯 BOAS PRÁTICAS

### ✅ DO's

```typescript
// ✅ Use TypeScript
interface MyProps {
  data: Patient[];
  onSelect: (patient: Patient) => void;
}

// ✅ Memoize componentes pesados
const HeavyComponent = memo(MyComponent);

// ✅ Use hooks customizados
const crud = useCRUD(config);

// ✅ Virtualize listas grandes
<VirtualizedTable data={largeArray} />

// ✅ Use lazy loading
<LazyComponent><HeavyChart /></LazyComponent>

// ✅ Debounce em buscas
const debouncedSearch = useDebounce(search, 300);

// ✅ Use shadcn/ui components
<Button variant="default">Salvar</Button>
```

### ❌ DON'Ts

```typescript
// ❌ Não use any
function MyComponent(props: any) { }

// ❌ Não renderize listas grandes sem virtualização
{largeArray.map(item => <Row {...item} />)}

// ❌ Não carregue componentes pesados sem lazy
import HeavyChart from './HeavyChart';

// ❌ Não use inline functions em props
<Component onClick={() => doSomething()} />

// ❌ Não ignore acessibilidade
<div onClick={handleClick}>Click me</div>
// Use <button> em vez de <div>
```

---

## 📚 RECURSOS ADICIONAIS

### Componentes shadcn/ui Disponíveis

Você tem acesso a 70+ componentes shadcn/ui:
- Button, Input, Select, Checkbox, Switch
- Dialog, Sheet, Drawer, Popover, Tooltip
- Table, Card, Badge, Avatar, Separator
- Tabs, Accordion, Collapsible
- Calendar, DatePicker, Command
- E muitos mais...

### Documentação shadcn/ui
https://ui.shadcn.com/docs/components

### TanStack Table
https://tanstack.com/table/latest

### Recharts
https://recharts.org/en-US/

---

## 🎉 CONCLUSÃO

Todos os componentes estão prontos e seguem as melhores práticas de:
- ✅ React 19
- ✅ TypeScript
- ✅ Performance
- ✅ Acessibilidade
- ✅ Responsividade
- ✅ UX moderna

**Copie, cole e customize! 🚀**

