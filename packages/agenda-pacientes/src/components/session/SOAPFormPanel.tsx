import React, { useState, useEffect } from 'react';
import { Save, Copy, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import { SoapNote, MandatoryTestAlert } from '../../types';
import * as conductReplicationService from '../../services/conductReplicationService';
import * as mandatoryTestAlertService from '../../services/mandatoryTestAlertService';

/**
 * Painel de Formulário SOAP
 * Formulário completo com validações e integração com replicação de condutas
 */

interface SOAPFormPanelProps {
  patientId: string;
  sessionNumber: number;
  previousNote?: SoapNote | null;
  onSave: (data: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const SOAPFormPanel: React.FC<SOAPFormPanelProps> = ({
  patientId,
  sessionNumber,
  previousNote,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const { showToast } = useToast();

  // Form state
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [painScale, setPainScale] = useState<number | undefined>();
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  
  // UI state
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mandatoryAlerts, setMandatoryAlerts] = useState<MandatoryTestAlert[]>([]);
  const [showConductReplicationDialog, setShowConductReplicationDialog] = useState(false);

  // Load mandatory alerts
  useEffect(() => {
    loadMandatoryAlerts();
  }, [patientId, sessionNumber]);

  const loadMandatoryAlerts = async () => {
    try {
      const alerts = await mandatoryTestAlertService.generateMandatoryTestAlerts(
        patientId,
        sessionNumber
      );
      setMandatoryAlerts(alerts);
    } catch (error) {
      console.error('Erro ao carregar alertas obrigatórios:', error);
    }
  };

  const criticalAlerts = mandatoryAlerts.filter(a => a.severity === 'critical');
  const importantAlerts = mandatoryAlerts.filter(a => a.severity === 'important');

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (value: string) => {
      setter(value);
      setIsDirty(true);
    };

  const handleReplicatePreviousConduct = () => {
    if (!previousNote) {
      showToast('Nenhuma sessão anterior encontrada', 'info');
      return;
    }

    // Confirmar antes de substituir
    if (isDirty) {
      const confirmed = window.confirm(
        'Isso irá substituir o conteúdo atual. Deseja continuar?'
      );
      if (!confirmed) return;
    }

    // Aplicar conduta anterior
    if (previousNote.subjective) setSubjective(previousNote.subjective);
    if (previousNote.objective) setObjective(previousNote.objective);
    if (previousNote.assessment) setAssessment(previousNote.assessment);
    if (previousNote.plan) setPlan(previousNote.plan);

    showToast('Conduta anterior replicada com sucesso', 'success');
    setIsDirty(true);
  };

  const handleOpenConductReplication = () => {
    setShowConductReplicationDialog(true);
  };

  const handleSave = async () => {
    // Validações
    if (!subjective.trim() && !objective.trim() && !assessment.trim() && !plan.trim()) {
      showToast('Preencha pelo menos um campo do formulário SOAP', 'error');
      return;
    }

    // Verificar alertas críticos
    const incompleteCritical = criticalAlerts.filter(a => !a.isCompleted);
    if (incompleteCritical.length > 0) {
      showToast(
        `${incompleteCritical.length} teste(s) obrigatório(s) não realizado(s). Sessão não pode ser salva.`,
        'error'
      );
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        date: new Date().toISOString(),
        subjective: subjective.trim(),
        objective: objective.trim(),
        assessment: assessment.trim(),
        plan: plan.trim(),
        painScale,
        bodyParts,
      });

      showToast('Sessão salva com sucesso!', 'success');
      setIsDirty(false);
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      showToast('Erro ao salvar sessão', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (isDirty) {
      const confirmed = window.confirm('Tem certeza que deseja limpar todos os campos?');
      if (!confirmed) return;
    }

    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setPainScale(undefined);
    setBodyParts([]);
    setIsDirty(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header com título e ações rápidas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Formulário SOAP</h2>
          <p className="text-sm text-slate-600">Sessão #{sessionNumber}</p>
        </div>

        <div className="flex items-center space-x-2">
          {previousNote && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReplicatePreviousConduct}
              disabled={isLoading || isSaving}
              className="flex items-center space-x-2"
              title="Replicar conduta da sessão anterior"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden md:inline">Replicar Anterior</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenConductReplication}
            disabled={isLoading || isSaving}
            className="flex items-center space-x-2"
            title="Escolher conduta específica para replicar"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Replicar Conduta</span>
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">
                🚨 Testes Obrigatórios Não Realizados
              </h4>
              <ul className="space-y-1 text-sm text-red-800">
                {criticalAlerts.map(alert => (
                  <li key={alert.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{alert.message}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-red-700">
                A sessão não poderá ser salva sem realizar estes testes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alertas Importantes */}
      {importantAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-orange-900 text-sm mb-1">
                ⚠️ Testes Recomendados
              </h4>
              <ul className="space-y-0.5 text-xs text-orange-800">
                {importantAlerts.map(alert => (
                  <li key={alert.id}>{alert.testName}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Formulário SOAP */}
      <div className="flex-1 overflow-y-auto space-y-5">
        {/* Subjetivo */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            S - Subjetivo
            <span className="text-xs font-normal text-slate-500 ml-2">
              (Queixas e sintomas relatados pelo paciente)
            </span>
          </label>
          <textarea
            value={subjective}
            onChange={(e) => handleFieldChange(setSubjective)(e.target.value)}
            placeholder="Ex: Paciente relata dor no joelho direito, intensidade 6/10, que piora ao subir escadas..."
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Objetivo */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            O - Objetivo
            <span className="text-xs font-normal text-slate-500 ml-2">
              (Observações e avaliações do profissional)
            </span>
          </label>
          <textarea
            value={objective}
            onChange={(e) => handleFieldChange(setObjective)(e.target.value)}
            placeholder="Ex: ROM joelho direito: 0-110°, edema leve em região patelar, força quadríceps 4/5..."
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Avaliação */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            A - Avaliação
            <span className="text-xs font-normal text-slate-500 ml-2">
              (Análise e interpretação clínica)
            </span>
          </label>
          <textarea
            value={assessment}
            onChange={(e) => handleFieldChange(setAssessment)(e.target.value)}
            placeholder="Ex: Paciente apresenta evolução positiva, com redução de dor e ganho de amplitude. Responde adequadamente ao tratamento proposto..."
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Plano */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            P - Plano
            <span className="text-xs font-normal text-slate-500 ml-2">
              (Conduta e intervenções realizadas)
            </span>
          </label>
          <textarea
            value={plan}
            onChange={(e) => handleFieldChange(setPlan)(e.target.value)}
            placeholder="Ex: Mobilização patelar, fortalecimento de quadríceps (3x15), alongamento de isquiotibiais, crioterapia 15min..."
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Escala de Dor */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Escala de Dor (EVA)
            <span className="text-xs font-normal text-slate-500 ml-2">
              (0 = sem dor, 10 = dor máxima)
            </span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="10"
              value={painScale || 0}
              onChange={(e) => {
                setPainScale(Number(e.target.value));
                setIsDirty(true);
              }}
              className="flex-1"
              disabled={isLoading || isSaving}
            />
            <div className="w-16 text-center">
              <span className="text-2xl font-bold text-blue-600">
                {painScale !== undefined ? painScale : '-'}
              </span>
              <span className="text-xs text-slate-500">/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com botões de ação */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center space-x-2">
          {isDirty && (
            <span className="text-xs text-orange-600">• Alterações não salvas</span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isLoading || isSaving || !isDirty}
          >
            Limpar
          </Button>

          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading || isSaving}
            >
              Cancelar
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading || isSaving || criticalAlerts.some(a => !a.isCompleted)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar Sessão'}
          </Button>
        </div>
      </div>

      {/* Dialog de Replicação de Conduta */}
      {showConductReplicationDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Replicar Conduta</h3>
            <p className="text-slate-600 mb-4">
              Componente ConductReplicationDialog será inserido aqui
            </p>
            <Button onClick={() => setShowConductReplicationDialog(false)}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOAPFormPanel;

