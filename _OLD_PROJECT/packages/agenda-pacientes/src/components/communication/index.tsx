// Communication Components - Main Export File

// Dashboard and Analytics
export { CommunicationDashboard } from './CommunicationDashboard';
export { default as CommunicationDashboardDefault } from './CommunicationDashboard';

// Template Management
export { TemplateManager } from './TemplateManager';
export { default as TemplateManagerDefault } from './TemplateManager';

// Automation Rules
export { AutomationRulesManager } from './AutomationRulesManager';
export { default as AutomationRulesManagerDefault } from './AutomationRulesManager';

// Settings and Configuration
export { CommunicationSettings } from './CommunicationSettings';
export { default as CommunicationSettingsDefault } from './CommunicationSettings';

// Re-export all components as default exports for lazy loading compatibility
import { CommunicationDashboard as Dashboard } from './CommunicationDashboard';
import { TemplateManager as Manager } from './TemplateManager';
import { AutomationRulesManager as RulesManager } from './AutomationRulesManager';
import { CommunicationSettings as Settings } from './CommunicationSettings';

export default {
  CommunicationDashboard: Dashboard,
  TemplateManager: Manager,
  AutomationRulesManager: RulesManager,
  CommunicationSettings: Settings
};