/**
 * CRM Dashboard Page - Página principal do CRM
 * Activity Fisioterapia Integration
 */

import React, { useState } from 'react';
import { DashboardMetrics } from '@/components/crm/DashboardMetrics';
import { LeadsKanban } from '@/components/crm/LeadsKanban';
import { LeadDetailPanel } from '@/components/crm/LeadDetailPanel';
import { Lead } from '@/types/crm';
import { LayoutDashboard, Users, TrendingUp, Settings } from 'lucide-react';

export const CRMDashboardPage: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [view, setView] = useState<'dashboard' | 'kanban' | 'analytics'>('dashboard');
  const [clinicId, setClinicId] = useState<string>(''); // TODO: Get from auth context

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleClosePanel = () => {
    setSelectedLead(null);
  };

  const handleUpdate = () => {
    // Refresh data
    setSelectedLead(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              CRM - Gestão de Leads
            </h1>

            {/* Navegação de views */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  view === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  view === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Pipeline
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  view === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <DashboardMetrics clinicId={clinicId} />
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Pipeline de Leads</h2>
              <LeadsKanban clinicId={clinicId} onLeadClick={handleLeadClick} />
            </div>
          </div>
        )}

        {view === 'kanban' && (
          <LeadsKanban clinicId={clinicId} onLeadClick={handleLeadClick} />
        )}

        {view === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Analytics Avançado</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gráficos de performance, funil de conversão, ROI por canal...
            </p>
            {/* TODO: Implementar componente de analytics */}
          </div>
        )}
      </div>

      {/* Painel lateral de detalhes */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={handleClosePanel}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default CRMDashboardPage;

