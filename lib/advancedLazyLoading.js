import React, { lazy, Suspense, useState, useEffect } from 'react';
import LazyFallback from '../components/ui/LazyFallback';
// 🚀 Sistema Avançado de Lazy Loading
// Implementa estratégias inteligentes de carregamento
// Hook para detectar conexão do usuário
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [connectionSpeed, setConnectionSpeed] = useState('unknown');
    useEffect(() => {
        const updateOnlineStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        // Detectar velocidade da conexão (experimental)
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const speed = connection.effectiveType;
            setConnectionSpeed(speed === 'slow-2g' || speed === '2g' ? 'slow' : 'fast');
        }
        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);
    return { isOnline, connectionSpeed };
};
// 🎯 Lazy Components com Estratégias Inteligentes
export const createSmartLazyComponent = (importFn, options = {}) => {
    const { preload = true, preloadDelay = 2000, fallback: CustomFallback, priority = 'medium', chunkName } = options;
    const LazyComponent = lazy(importFn);
    // Preloading baseado em prioridade
    if (preload) {
        const delay = priority === 'high' ? 1000 : priority === 'low' ? 5000 : preloadDelay;
        setTimeout(() => {
            importFn().catch(() => {
                console.warn(`Failed to preload component: ${chunkName || 'unknown'}`);
            });
        }, delay);
    }
    // Wrapper com Suspense otimizado
    const SmartLazyWrapper = (props) => {
        const FallbackComponent = CustomFallback || LazyFallback;
        return React.createElement(Suspense, { fallback: React.createElement(FallbackComponent) }, React.createElement(LazyComponent, props));
    };
    return SmartLazyWrapper;
};
// 🎯 Componentes Pesados Existentes - Lazy Loading Prioritário
export const HeavyComponents = {
    // Componentes existentes que podem ser otimizados
    ExerciseFormModal: createSmartLazyComponent(() => import('../components/ExerciseFormModal'), { priority: 'medium', chunkName: 'exercise-form' }),
    WhatsappChatInterface: createSmartLazyComponent(() => import('../components/whatsapp/WhatsappChatInterface'), { priority: 'low', chunkName: 'whatsapp-chat' }),
    // Componentes de relatórios
    ReportsDashboard: createSmartLazyComponent(() => import('../components/reports/ReportsDashboard'), { priority: 'low', chunkName: 'reports' }),
    // Componentes de comunicação
    CommunicationDashboard: createSmartLazyComponent(() => import('../components/communication/CommunicationDashboard'), { priority: 'medium', chunkName: 'communication' }),
    // Componentes financeiros
    FinancialDashboard: createSmartLazyComponent(() => import('../components/financial/FinancialDashboard'), { priority: 'low', chunkName: 'financial' }),
    // Componentes de prontuários
    MedicalRecordsDashboard: createSmartLazyComponent(() => import('../components/medical-records/MedicalRecordsDashboard'), { priority: 'medium', chunkName: 'medical-records' }),
    // Componentes de suprimentos
    SuppliesDashboard: createSmartLazyComponent(() => import('../components/supplies/SuppliesDashboard'), { priority: 'low', chunkName: 'supplies' }),
    // Componentes de eventos
    EventFormModal: createSmartLazyComponent(() => import('../components/events/EventFormModal'), { priority: 'medium', chunkName: 'event-form' }),
    EventDetailHeader: createSmartLazyComponent(() => import('../components/events/EventDetailHeader'), { priority: 'medium', chunkName: 'event-detail' }),
    // Componentes de usuários
    UserFormModal: createSmartLazyComponent(() => import('../components/users/UserFormModal'), { priority: 'medium', chunkName: 'user-form' }),
    // Componentes de pacientes
    PatientForm: createSmartLazyComponent(() => import('../components/pacientes/PatientForm'), { priority: 'medium', chunkName: 'patient-form' }),
    // Componentes de sessões
    SessionForm: createSmartLazyComponent(() => import('../components/session/SessionForm'), { priority: 'medium', chunkName: 'session-form' }),
    // Componentes de teleconsulta
    ExerciseSharePanel: createSmartLazyComponent(() => import('../components/teleconsulta/ExerciseSharePanel'), { priority: 'low', chunkName: 'exercise-share' }),
    // Componentes de notificações
    NotificationSettings: createSmartLazyComponent(() => import('../components/notifications/NotificationSettings'), { priority: 'low', chunkName: 'notification-settings' }),
    // Componentes de alertas
    AlertSettings: createSmartLazyComponent(() => import('../components/alerts/NotificationSettings'), { priority: 'low', chunkName: 'alert-settings' }),
    // Componentes de mentoria
    CasesList: createSmartLazyComponent(() => import('../components/mentoria/CasesList'), { priority: 'low', chunkName: 'cases-list' }),
    InternsTable: createSmartLazyComponent(() => import('../components/mentoria/InternsTable'), { priority: 'low', chunkName: 'interns-table' }),
    // Componentes de portal do paciente
    PatientDashboard: createSmartLazyComponent(() => import('../components/patient-portal/PatientDashboard'), { priority: 'medium', chunkName: 'patient-dashboard' }),
    // Componentes de UI
    VirtualizedList: createSmartLazyComponent(() => import('../components/ui/VirtualizedList'), { priority: 'medium', chunkName: 'virtualized-list' })
};
// 🎯 Estratégias de Preloading Inteligente
export const preloadingStrategies = {
    // Preload baseado em horário de uso
    timeBasedPreload: () => {
        const hour = new Date().getHours();
        // Horário comercial (8h-18h) - preload componentes de trabalho
        if (hour >= 8 && hour <= 18) {
            Promise.all([
                import('../components/session/SessionForm'),
                import('../components/medical-records/MedicalRecordsDashboard'),
                import('../components/communication/CommunicationDashboard')
            ]).catch(() => { });
        }
        // Horário noturno - preload componentes de relatórios
        else {
            Promise.all([
                import('../components/reports/ReportsDashboard'),
                import('../components/financial/FinancialDashboard'),
                import('../components/supplies/SuppliesDashboard')
            ]).catch(() => { });
        }
    },
    // Preload baseado em dispositivo
    deviceBasedPreload: () => {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        if (isMobile) {
            // Mobile - preload componentes otimizados
            Promise.all([
                import('../components/patient-portal/PatientDashboard'),
                import('../components/events/EventFormModal')
            ]).catch(() => { });
        }
        else if (isTablet) {
            // Tablet - preload componentes intermediários
            Promise.all([
                import('../components/medical-records/MedicalRecordsDashboard'),
                import('../components/communication/CommunicationDashboard')
            ]).catch(() => { });
        }
        else {
            // Desktop - preload componentes completos
            Promise.all([
                import('../components/reports/ReportsDashboard'),
                import('../components/financial/FinancialDashboard'),
                import('../components/supplies/SuppliesDashboard')
            ]).catch(() => { });
        }
    },
    // Preload baseado em conexão
    connectionBasedPreload: () => {
        // ✅ Detectar velocidade da conexão sem usar hooks
        let connectionSpeed = 'unknown';
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const speed = connection?.effectiveType;
            connectionSpeed = speed === 'slow-2g' || speed === '2g' ? 'slow' : 'fast';
        }
        if (connectionSpeed === 'fast') {
            // Conexão rápida - preload mais componentes
            Promise.all([
                import('../components/reports/ReportsDashboard'),
                import('../components/financial/FinancialDashboard'),
                import('../components/supplies/SuppliesDashboard'),
                import('../components/communication/CommunicationDashboard')
            ]).catch(() => { });
        }
        else if (connectionSpeed === 'slow') {
            // Conexão lenta - preload apenas essenciais
            Promise.all([
                import('../components/session/SessionForm'),
                import('../components/medical-records/MedicalRecordsDashboard')
            ]).catch(() => { });
        }
    }
};
// 🎯 Inicialização do Sistema de Lazy Loading
export const initializeLazyLoading = () => {
    // Preload crítico imediato
    setTimeout(() => {
        preloadingStrategies.timeBasedPreload();
        preloadingStrategies.deviceBasedPreload();
        preloadingStrategies.connectionBasedPreload();
    }, 1000);
    // Preload periódico (a cada 5 minutos)
    setInterval(() => {
        preloadingStrategies.timeBasedPreload();
    }, 5 * 60 * 1000);
};
// 🎯 Hook para Lazy Loading Inteligente
export const useSmartLazyLoading = () => {
    const [loadedComponents, setLoadedComponents] = useState(new Set());
    const { isOnline, connectionSpeed } = useNetworkStatus();
    const loadComponent = async (componentName, importFn) => {
        if (loadedComponents.has(componentName))
            return;
        try {
            await importFn();
            setLoadedComponents(prev => new Set(prev).add(componentName));
        }
        catch (error) {
            console.warn(`Failed to load component: ${componentName}`, error);
        }
    };
    const preloadComponent = (componentName, importFn) => {
        if (loadedComponents.has(componentName))
            return;
        // Delay baseado na velocidade da conexão
        const delay = connectionSpeed === 'slow' ? 5000 : 2000;
        setTimeout(() => {
            loadComponent(componentName, importFn);
        }, delay);
    };
    return {
        loadedComponents,
        loadComponent,
        preloadComponent,
        isOnline,
        connectionSpeed
    };
};
// 🎯 Componente de Fallback Inteligente
export const SmartFallback = ({ componentName, connectionSpeed = 'unknown' }) => {
    const messages = {
        'exercise-form': 'Carregando formulário de exercícios...',
        'whatsapp-chat': 'Conectando WhatsApp...',
        'reports': 'Preparando relatórios...',
        'communication': 'Carregando comunicação...',
        'financial': 'Preparando dados financeiros...',
        'medical-records': 'Carregando prontuários...',
        'supplies': 'Preparando gestão de suprimentos...',
        'event-form': 'Carregando formulário de eventos...',
        'event-detail': 'Preparando detalhes do evento...',
        'user-form': 'Carregando formulário de usuário...',
        'patient-form': 'Preparando formulário de paciente...',
        'session-form': 'Carregando formulário de sessão...',
        'exercise-share': 'Preparando compartilhamento...',
        'notification-settings': 'Carregando configurações...',
        'alert-settings': 'Preparando alertas...',
        'cases-list': 'Carregando casos...',
        'interns-table': 'Preparando tabela de estagiários...',
        'patient-dashboard': 'Carregando dashboard do paciente...',
        'virtualized-list': 'Preparando lista virtualizada...'
    };
    const message = messages[componentName] || 'Carregando...';
    const size = connectionSpeed === 'slow' ? 'sm' : 'md';
    return React.createElement(LazyFallback, { message, size });
};
// 🎯 Exportações
export default {
    HeavyComponents,
    preloadingStrategies,
    initializeLazyLoading,
    useSmartLazyLoading,
    SmartFallback,
    createSmartLazyComponent
};
