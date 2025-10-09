/**
 * Leads Kanban - Componente de visualização em Kanban dos leads
 * Activity Fisioterapia Integration - Fase 1
 */
import React, { useEffect, useState } from 'react';
import { LeadService } from '@/services/api/crm/leadService';
import { Phone, Mail, Clock, AlertCircle } from 'lucide-react';
const COLUMNS = [
    { status: 'novo', title: 'Novo', color: 'gray' },
    { status: 'contatado', title: 'Contatado', color: 'blue' },
    { status: 'qualificado', title: 'Qualificado', color: 'yellow' },
    { status: 'agendado', title: 'Agendado', color: 'purple' },
    { status: 'convertido', title: 'Convertido', color: 'green' },
];
export const LeadsKanban = ({ clinicId, onLeadClick }) => {
    const [leadsByStatus, setLeadsByStatus] = useState({
        novo: [],
        contatado: [],
        qualificado: [],
        agendado: [],
        convertido: [],
        perdido: [],
    });
    const [loading, setLoading] = useState(true);
    const [draggedLead, setDraggedLead] = useState(null);
    useEffect(() => {
        loadLeads();
    }, [clinicId]);
    const loadLeads = async () => {
        try {
            setLoading(true);
            const { leads } = await LeadService.listLeads({ clinic_id: clinicId }, 1, 200);
            // Agrupar por status
            const grouped = {
                novo: [],
                contatado: [],
                qualificado: [],
                agendado: [],
                convertido: [],
                perdido: [],
            };
            leads.forEach((lead) => {
                if (lead.status in grouped) {
                    grouped[lead.status].push(lead);
                }
            });
            setLeadsByStatus(grouped);
        }
        catch (err) {
            console.error('Erro ao carregar leads:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDragStart = (lead) => {
        setDraggedLead(lead);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleDrop = async (status) => {
        if (!draggedLead || draggedLead.status === status) {
            setDraggedLead(null);
            return;
        }
        try {
            await LeadService.updateLead(draggedLead.id, { status });
            await loadLeads();
        }
        catch (err) {
            console.error('Erro ao atualizar status:', err);
        }
        finally {
            setDraggedLead(null);
        }
    };
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'urgente':
                return 'text-red-600 dark:text-red-400';
            case 'alta':
                return 'text-orange-600 dark:text-orange-400';
            case 'media':
                return 'text-yellow-600 dark:text-yellow-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };
    const getColumnColor = (color) => {
        const colors = {
            gray: 'border-gray-300 bg-gray-50 dark:bg-gray-800',
            blue: 'border-blue-300 bg-blue-50 dark:bg-blue-900/20',
            yellow: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20',
            purple: 'border-purple-300 bg-purple-50 dark:bg-purple-900/20',
            green: 'border-green-300 bg-green-50 dark:bg-green-900/20',
        };
        return colors[color] || colors.gray;
    };
    if (loading) {
        return (<div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (<div key={col.status} className="flex-shrink-0 w-80">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              {[1, 2, 3].map((i) => (<div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded mb-3"></div>))}
            </div>
          </div>))}
      </div>);
    }
    return (<div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => (<div key={column.status} className="flex-shrink-0 w-80" onDragOver={handleDragOver} onDrop={() => handleDrop(column.status)}>
          <div className={`rounded-lg border-2 ${getColumnColor(column.color)} p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {column.title}
              </h3>
              <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                {leadsByStatus[column.status].length}
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {leadsByStatus[column.status].map((lead) => (<div key={lead.id} draggable onDragStart={() => handleDragStart(lead)} onClick={() => onLeadClick?.(lead)} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                  {/* Nome e urgência */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {lead.name}
                    </h4>
                    <AlertCircle className={`w-4 h-4 ${getUrgencyColor(lead.urgency_level)}`}/>
                  </div>

                  {/* Serviço de interesse */}
                  {lead.service_interest && (<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {lead.service_interest}
                    </p>)}

                  {/* Contato */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3"/>
                      <span>{lead.phone}</span>
                    </div>
                    {lead.email && (<div className="flex items-center gap-1">
                        <Mail className="w-3 h-3"/>
                        <span className="truncate">{lead.email}</span>
                      </div>)}
                  </div>

                  {/* Fonte e tempo */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">
                      {lead.source}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3"/>
                      <span>
                        {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                })}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {lead.tags && lead.tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">
                      {lead.tags.slice(0, 3).map((tag, idx) => (<span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                          {tag}
                        </span>))}
                    </div>)}
                </div>))}

              {leadsByStatus[column.status].length === 0 && (<div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  Nenhum lead
                </div>)}
            </div>
          </div>
        </div>))}
    </div>);
};
