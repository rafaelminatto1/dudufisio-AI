import React from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import { WidgetConfig } from '@/hooks/useDashboardLayout';
import { KPIWidget } from './widgets/KPIWidget';
import { RevenueWidget } from './widgets/RevenueWidget';
import { PatientFlowWidget } from './widgets/PatientFlowWidget';
import { AppointmentsWidget } from './widgets/AppointmentsWidget';
import { TasksWidget } from './widgets/TasksWidget';
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
} from 'lucide-react';

interface DashboardGridProps {
  widgets: WidgetConfig[];
  data?: {
    patients?: any[];
    appointments?: any[];
    stats?: any;
  };
  isEditMode?: boolean;
  onRemoveWidget?: (widgetId: string) => void;
  onExpandWidget?: (widgetId: string) => void;
  expandedWidgets?: Set<string>;
}

export function DashboardGrid({
  widgets,
  data = {},
  isEditMode = false,
  onRemoveWidget,
  onExpandWidget,
  expandedWidgets = new Set(),
}: DashboardGridProps) {
  const renderWidget = (widget: WidgetConfig) => {
    const isExpanded = expandedWidgets.has(widget.id);

    const widgetContent = (() => {
      switch (widget.type) {
        case 'kpi':
          const metric = widget.props?.metric;
          if (metric === 'total_patients') {
            return (
              <KPIWidget
                title="Pacientes Ativos"
                value={data.stats?.totalActivePatients || 0}
                icon={Users}
                variant="primary"
                trend={{ value: 12, period: 'vs mês anterior' }}
              />
            );
          }
          if (metric === 'monthly_revenue') {
            return (
              <KPIWidget
                title="Receita do Mês"
                value={data.stats?.monthlyRevenue || 0}
                icon={DollarSign}
                format="currency"
                variant="success"
                trend={{ value: 8, period: 'vs mês anterior' }}
              />
            );
          }
          if (metric === 'today_appointments') {
            return (
              <KPIWidget
                title="Agendamentos Hoje"
                value={data.stats?.todayAppointments || 0}
                icon={Calendar}
                variant="default"
              />
            );
          }
          if (metric === 'occupancy_rate') {
            return (
              <KPIWidget
                title="Taxa de Ocupação"
                value={data.stats?.occupancyRate || 0}
                icon={TrendingUp}
                format="percentage"
                variant="warning"
              />
            );
          }
          return <div>KPI Widget</div>;

        case 'revenue':
          return <RevenueWidget appointments={data.appointments || []} />;

        case 'patient_flow':
          return <PatientFlowWidget patients={data.patients || []} />;

        case 'appointments':
          return <AppointmentsWidget appointments={data.appointments || []} />;

        case 'tasks':
          return <TasksWidget />;

        default:
          return <div className="text-sm text-muted-foreground">Widget: {widget.type}</div>;
      }
    })();

    return (
      <WidgetWrapper
        key={widget.id}
        id={widget.id}
        title={widget.title}
        icon={getWidgetIcon(widget.type)}
        onRemove={isEditMode ? () => onRemoveWidget?.(widget.id) : undefined}
        onExpand={onExpandWidget ? () => onExpandWidget(widget.id) : undefined}
        isExpanded={isExpanded}
      >
        {widgetContent}
      </WidgetWrapper>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {widgets.filter((w) => w.visible !== false).map(renderWidget)}
    </div>
  );
}

function getWidgetIcon(type: string) {
  switch (type) {
    case 'kpi':
      return <Activity className="h-4 w-4" />;
    case 'revenue':
      return <DollarSign className="h-4 w-4" />;
    case 'patient_flow':
      return <Users className="h-4 w-4" />;
    case 'appointments':
      return <Calendar className="h-4 w-4" />;
    case 'tasks':
      return <Clock className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

