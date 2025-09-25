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
export default {
  CommunicationDashboard: CommunicationDashboard,
  TemplateManager: TemplateManager,
  AutomationRulesManager: AutomationRulesManager,
  CommunicationSettings: CommunicationSettings
};