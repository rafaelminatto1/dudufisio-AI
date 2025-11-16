import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as surgeryService from '../../services/surgeryService';
import { Surgery } from '../../types';
import SurgeryFormModal from './SurgeryFormModal';

/**
 * Timeline visual de cirurgias
 * Badge com tempo decorrido
 * Modal CRUD de cirurgias
 */

interface SurgeryTimelineProps {
  patientId: string;
}

export const SurgeryTimeline: React.FC<SurgeryTimelineProps> = ({ patientId }) => {
  const { showToast } = useToast();
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);

  useEffect(() => {
    loadSurgeries();
  }, [patientId]);

  const loadSurgeries = async () => {
    setIsLoading(true);
    try {
      const data = await surgeryService.getSurgeriesByPatientId(patientId);
      const sorted = surgeryService.sortSurgeriesByDate(data);
      setSurgeries(sorted);
    } catch (error) {
      console.error('Erro ao carregar cirurgias:', error);
      showToast('Erro ao carregar histórico de cirurgias', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedSurgery(null);
    setIsModalOpen(true);
  };

  const handleEdit = (surgery: Surgery) => {
    setSelectedSurgery(surgery);
    setIsModalOpen(true);
  };

  const handleDelete = async (surgeryId: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta cirurgia do histórico?')) {
      return;
    }

    try {
      await surgeryService.deleteSurgery(surgeryId);
      showToast('Cirurgia removida com sucesso', 'success');
      await loadSurgeries();
    } catch (error) {
      showToast('Erro ao remover cirurgia', 'error');
    }
  };

  const handleModalClose = async (refresh: boolean) => {
    setIsModalOpen(false);
    setSelectedSurgery(null);
    if (refresh) {
      await loadSurgeries();
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-16 bg-slate-200 rounded-lg"></div>
        <div className="h-16 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Cirurgias</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar</span>
        </Button>
      </div>

      {/* Timeline */}
      {surgeries.length === 0 ? (
        <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma cirurgia registrada</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            className="mt-2 text-blue-600"
          >
            Adicionar Cirurgia
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {surgeries.map((surgery, index) => {
            const info = surgeryService.formatSurgeryInfo(surgery);
            
            return (
              <div
                key={surgery.id}
                className={`relative pl-8 pb-4 ${
                  index < surgeries.length - 1 ? 'border-l-2 border-slate-200 ml-2' : ''
                }`}
              >
                {/* Timeline Dot */}
                <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-2 ${
                  info.isCritical
                    ? 'bg-red-500 border-red-600'
                    : info.isRecent
                    ? 'bg-orange-500 border-orange-600'
                    : 'bg-blue-500 border-blue-600'
                }`} />

                {/* Surgery Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {surgery.name}
                      </h4>
                      
                      <div className="flex items-center space-x-2 text-xs text-slate-600 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(surgery.date).toLocaleDateString('pt-BR')}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          info.isCritical
                            ? 'bg-red-100 text-red-800'
                            : info.isRecent
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {info.timeSince}
                        </span>
                      </div>

                      {surgery.surgeon && (
                        <p className="text-xs text-slate-600 mb-1">
                          Cirurgião: {surgery.surgeon}
                        </p>
                      )}

                      {surgery.hospital && (
                        <div className="flex items-center space-x-1 text-xs text-slate-600">
                          <MapPin className="w-3 h-3" />
                          <span>{surgery.hospital}</span>
                        </div>
                      )}

                      {surgery.description && (
                        <p className="text-xs text-slate-600 mt-2">
                          {surgery.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(surgery)}
                        className="h-7 w-7 p-0"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(surgery.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de CRUD */}
      {isModalOpen && (
        <SurgeryFormModal
          isOpen={isModalOpen}
          patientId={patientId}
          surgery={selectedSurgery}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default SurgeryTimeline;

