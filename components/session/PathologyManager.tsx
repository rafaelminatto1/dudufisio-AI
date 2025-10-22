import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as pathologyService from '../../services/pathologyService';
import { Pathology } from '../../types';
import PathologyFormModal from './PathologyFormModal';

/**
 * Gerenciador de Patologias
 * Lista patologias ativas e resolvidas
 * Modal CRUD de patologias
 */

interface PathologyManagerProps {
  patientId: string;
}

export const PathologyManager: React.FC<PathologyManagerProps> = ({ patientId }) => {
  const { showToast } = useToast();
  const [activePathologies, setActivePathologies] = useState<Pathology[]>([]);
  const [resolvedPathologies, setResolvedPathologies] = useState<Pathology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPathology, setSelectedPathology] = useState<Pathology | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    loadPathologies();
  }, [patientId]);

  const loadPathologies = async () => {
    setIsLoading(true);
    try {
      const [active, resolved] = await Promise.all([
        pathologyService.getActivePathologies(patientId),
        pathologyService.getResolvedPathologies(patientId),
      ]);
      setActivePathologies(pathologyService.sortPathologiesBySeverity(active));
      setResolvedPathologies(resolved);
    } catch (error) {
      console.error('Erro ao carregar patologias:', error);
      showToast('Erro ao carregar patologias', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedPathology(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pathology: Pathology) => {
    setSelectedPathology(pathology);
    setIsModalOpen(true);
  };

  const handleDelete = async (pathologyId: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta patologia?')) {
      return;
    }

    try {
      await pathologyService.deletePathology(pathologyId);
      showToast('Patologia removida com sucesso', 'success');
      await loadPathologies();
    } catch (error) {
      showToast('Erro ao remover patologia', 'error');
    }
  };

  const handleMarkResolved = async (pathologyId: string) => {
    try {
      await pathologyService.markAsResolved(pathologyId);
      showToast('Patologia marcada como resolvida', 'success');
      await loadPathologies();
    } catch (error) {
      showToast('Erro ao atualizar patologia', 'error');
    }
  };

  const handleMarkActive = async (pathologyId: string) => {
    try {
      await pathologyService.markAsActive(pathologyId);
      showToast('Patologia reativada', 'success');
      await loadPathologies();
    } catch (error) {
      showToast('Erro ao atualizar patologia', 'error');
    }
  };

  const handleModalClose = async (refresh: boolean) => {
    setIsModalOpen(false);
    setSelectedPathology(null);
    if (refresh) {
      await loadPathologies();
    }
  };

  const PathologyCard: React.FC<{ pathology: Pathology; isResolved?: boolean }> = ({
    pathology,
    isResolved = false,
  }) => {
    const info = pathologyService.formatPathologyInfo(pathology);

    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-slate-900">{pathology.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${info.statusColor}`}>
                {info.statusText}
              </span>
              {info.severityText && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${info.severityColor}`}>
                  {info.severityText}
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              {pathology.icdCode && (
                <p>
                  <span className="font-medium">CID:</span> {pathology.icdCode}
                </p>
              )}
              <p>
                <span className="font-medium">Diagnosticado:</span> {info.timeSinceDiagnosis}
              </p>
              {pathology.affectedRegion && (
                <p>
                  <span className="font-medium">Região:</span> {pathology.affectedRegion}
                </p>
              )}
              {pathology.description && (
                <p className="mt-2 text-slate-700">{pathology.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            {!isResolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkResolved(pathology.id)}
                className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                title="Marcar como resolvida"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </Button>
            )}
            {isResolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkActive(pathology.id)}
                className="h-7 w-7 p-0 text-orange-600 hover:bg-orange-50"
                title="Reativar"
              >
                <AlertCircle className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(pathology)}
              className="h-7 w-7 p-0"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(pathology.id)}
              className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
              title="Remover"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-24 bg-slate-200 rounded-lg"></div>
        <div className="h-24 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Patologias</h3>
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

      {/* Patologias Ativas (Em Tratamento) */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>Em Tratamento</span>
          {activePathologies.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
              {activePathologies.length}
            </span>
          )}
        </h4>

        {activePathologies.length === 0 ? (
          <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <p className="text-sm">Nenhuma patologia ativa</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activePathologies.map(pathology => (
              <PathologyCard key={pathology.id} pathology={pathology} />
            ))}
          </div>
        )}
      </div>

      {/* Patologias Resolvidas/Tratadas */}
      {resolvedPathologies.length > 0 && (
        <div>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2 hover:text-blue-600 transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Tratadas/Resolvidas</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
              {resolvedPathologies.length}
            </span>
            <span className="text-xs text-slate-500">
              ({showResolved ? 'ocultar' : 'mostrar'})
            </span>
          </button>

          {showResolved && (
            <div className="space-y-2">
              {resolvedPathologies.map(pathology => (
                <PathologyCard key={pathology.id} pathology={pathology} isResolved />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <PathologyFormModal
          isOpen={isModalOpen}
          patientId={patientId}
          pathology={selectedPathology}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default PathologyManager;

