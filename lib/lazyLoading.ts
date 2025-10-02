import { lazy, ComponentType } from 'react';

// 🚀 Sistema de Lazy Loading Otimizado
// Implementa preloading inteligente para melhor UX

// Função para criar lazy components com preloading
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: { preload?: boolean } = {}
) => {
  const { preload = true } = options;
  
  const LazyComponent = lazy(importFn);

  // Preloading inteligente
  if (preload) {
    // Preload após 2 segundos de inatividade
    setTimeout(() => {
      importFn().catch(() => {
        // Silenciosamente falha no preload
      });
    }, 2000);
  }

  return LazyComponent;
};

// 🎯 Lazy Components Otimizados - Dashboard Pages
export const CompleteDashboard = createLazyComponent(
  () => import('../pages/CompleteDashboard'),
  { preload: true }
);

export const PatientPortalDashboard = createLazyComponent(
  () => import('../pages/PatientPortalDashboard'),
  { preload: false }
);

export const PartnerPortalDashboard = createLazyComponent(
  () => import('../pages/PartnerPortalDashboard'),
  { preload: false }
);

// 🎯 Lazy Components - Páginas de Funcionalidades
export const AcompanhamentoPage = createLazyComponent(
  () => import('../pages/AcompanhamentoPage')
);

export const GroupsPage = createLazyComponent(
  () => import('../pages/GroupsPage')
);

export const NotificationCenterPage = createLazyComponent(
  () => import('../pages/NotificationCenterPage')
);

export const EventsListPage = createLazyComponent(
  () => import('../pages/EventsListPage')
);

export const EventDetailPage = createLazyComponent(
  () => import('../pages/EventDetailPage')
);

// 🎯 Lazy Components - Portal do Paciente
export const PatientDashboardPage = createLazyComponent(
  () => import('../pages/patient-portal/PatientDashboardPage')
);

export const MyAppointmentsPage = createLazyComponent(
  () => import('../pages/patient-portal/MyAppointmentsPage')
);

export const MyExercisesPage = createLazyComponent(
  () => import('../pages/patient-portal/MyExercisesPage')
);

export const PatientProgressPage = createLazyComponent(
  () => import('../pages/patient-portal/PatientProgressPage')
);

export const DocumentsPage = createLazyComponent(
  () => import('../pages/patient-portal/DocumentsPage')
);

// 🎯 Lazy Components - Portal do Parceiro
export const EducatorDashboardPage = createLazyComponent(
  () => import('../pages/partner-portal/EducatorDashboardPage')
);

export const ClientListPage = createLazyComponent(
  () => import('../pages/partner-portal/ClientListPage')
);

export const FinancialsPage = createLazyComponent(
  () => import('../pages/partner-portal/FinancialsPage')
);

// 🎯 Lazy Components - Ferramentas e Integrações
export const IntegrationsTestPage = createLazyComponent(
  () => import('../pages/IntegrationsTestPage')
);

export const BIIntegrationTestPage = createLazyComponent(
  () => import('../pages/BIIntegrationTestPage')
);

// 🎯 Lazy Components - Gamificação
export const GamificationPage = createLazyComponent(
  () => import('../pages/patient-portal/GamificationPage')
);

export const VoucherStorePage = createLazyComponent(
  () => import('../pages/patient-portal/VoucherStorePage')
);

export const MyVouchersPage = createLazyComponent(
  () => import('../pages/patient-portal/MyVouchersPage')
);

// 🎯 Lazy Components - Componentes Pesados
export const ExerciseFormModal = createLazyComponent(
  () => import('../components/ExerciseFormModal')
);

export const WhatsappChatInterface = createLazyComponent(
  () => import('../components/whatsapp/WhatsappChatInterface')
);

// 🎯 Lazy Components - Analytics e Relatórios
export const KanbanPage = createLazyComponent(
  () => import('../pages/KanbanPage')
);

// 🎯 Preloading Strategy
export const preloadCriticalComponents = () => {
  // Preload componentes críticos após carregamento inicial
  setTimeout(() => {
    Promise.all([
      import('../pages/CompleteDashboard'),
      import('../components/Sidebar'),
      import('../components/Breadcrumbs')
    ]).catch(() => {
      // Silenciosamente falha no preload
    });
  }, 3000);
};

// 🎯 Preloading baseado em role do usuário
export const preloadUserRoleComponents = (userRole: string) => {
  setTimeout(() => {
    switch (userRole) {
      case 'Admin':
      case 'Therapist':
        Promise.all([
          import('../pages/AcompanhamentoPage'),
          import('../pages/GroupsPage'),
          import('../pages/NotificationCenterPage')
        ]).catch(() => {});
        break;
      case 'Patient':
        Promise.all([
          import('../pages/patient-portal/PatientDashboardPage'),
          import('../pages/patient-portal/MyAppointmentsPage'),
          import('../pages/patient-portal/MyExercisesPage')
        ]).catch(() => {});
        break;
      case 'EducadorFisico':
        Promise.all([
          import('../pages/partner-portal/EducatorDashboardPage'),
          import('../pages/partner-portal/ClientListPage')
        ]).catch(() => {});
        break;
    }
  }, 5000);
};