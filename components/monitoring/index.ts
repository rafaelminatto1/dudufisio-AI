// components/monitoring/index.ts
// Exportações centralizadas dos componentes de monitoramento

export { KPICards } from './KPICards';
export { PresenceEvolutionChart } from './PresenceEvolutionChart';
export { PainDistributionChart } from './PainDistributionChart';
export { FilterToolbar } from './FilterToolbar';
export { PatientMonitoringTable } from './PatientMonitoringTable';
export { QuickActionDialog } from './QuickActionDialog';
export { RiskBadge } from './RiskBadge';
export { ExportMenu } from './ExportMenu';
export { 
  KPICardsSkeleton, 
  ChartSkeleton, 
  TableSkeleton, 
  MonitoringPageSkeleton,
  ProgressiveLoader 
} from './LoadingStates';
export { 
  EmptyState, 
  TableEmptyState, 
  ChartEmptyState, 
  LoadingState,
  ErrorState 
} from './EmptyStates';
export { AlertCenter, AlertBadge } from './AlertCenter';
export { CommunicationTimeline, type CommunicationLog } from './CommunicationTimeline';
export { TrendAnalysisChart, type TrendDataPoint } from './TrendAnalysisChart';
export { HeatmapAttendanceChart, type HeatmapData } from './HeatmapAttendanceChart';
export { TherapistComparisonChart, type TherapistStats } from './TherapistComparisonChart';
export { RetentionFunnelChart, type FunnelStage } from './RetentionFunnelChart';
export { SmartSuggestions, type Suggestion } from './SmartSuggestions';
export { InsightsDashboard, type AdvancedInsights } from './InsightsDashboard';
export { SavedFilters } from './SavedFilters';
export { PeriodComparison } from './PeriodComparison';
export { VirtualizedPatientTable } from './VirtualizedPatientTable';

