/**
 * Patient Portal Page - Página do Portal do Paciente
 * Activity Fisioterapia Integration - Fase 4
 */

import React, { useState } from 'react';
import { PatientDashboard } from '@/components/patient-portal/PatientDashboard';
import { GamificationDashboard } from '@/components/patient-portal/GamificationDashboard';
import { Home, Award, Calendar, FileText, CreditCard, LogOut } from 'lucide-react';

export const PatientPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gamification' | 'appointments' | 'documents' | 'payment'>('dashboard');
  const [patientId, setPatientId] = useState<string>(''); // TODO: Get from auth

  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'appointments', label: 'Consultas', icon: Calendar },
    { id: 'gamification', label: 'Conquistas', icon: Award },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'payment', label: 'Pagamentos', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-neutral-bgAlt dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-md">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-text dark:text-white">
              Portal do Paciente
            </h1>
            <button className="flex items-center gap-sm px-md py-sm text-gray-700 dark:text-gray-300 hover:bg-neutral-bgDark dark:hover:bg-gray-700 rounded-lg">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl">
          <nav className="flex gap-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-sm px-md py-md border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-primary dark:text-blue-400'
                      : 'border-transparent text-neutral-textSecondary dark:text-neutral-textTertiary hover:text-neutral-text dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'dashboard' && <PatientDashboard patientId={patientId} />}
        {activeTab === 'gamification' && <GamificationDashboard patientId={patientId} />}
        {activeTab === 'appointments' && (
          <div className="p-lg">
            <h2 className="text-2xl font-bold mb-md">Minhas Consultas</h2>
            <p className="text-neutral-textSecondary dark:text-neutral-textTertiary">
              Histórico de consultas e agendamentos futuros
            </p>
            {/* TODO: Implementar componente de consultas */}
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="p-lg">
            <h2 className="text-2xl font-bold mb-md">Meus Documentos</h2>
            <p className="text-neutral-textSecondary dark:text-neutral-textTertiary">
              Prontuários, exames, orientações
            </p>
            {/* TODO: Implementar componente de documentos */}
          </div>
        )}
        {activeTab === 'payment' && (
          <div className="p-lg">
            <h2 className="text-2xl font-bold mb-md">Pagamentos</h2>
            <p className="text-neutral-textSecondary dark:text-neutral-textTertiary">
              Histórico de pagamentos e faturas
            </p>
            {/* TODO: Implementar componente de pagamentos */}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientPortalPage;

