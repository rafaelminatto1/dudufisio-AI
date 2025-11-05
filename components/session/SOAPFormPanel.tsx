import React, { useState, useEffect } from 'react';
import { Save, Copy, RotateCcw, AlertTriangle, MessageSquare, Eye, ClipboardCheck, ListChecks, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import { SoapNote, MandatoryTestAlert } from '../../types';
import * as conductReplicationService from '../../services/conductReplicationService';
import * as mandatoryTestAlertService from '../../services/mandatoryTestAlertService';
import { format } from 'date-fns';

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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Auto-save key
  const AUTOSAVE_KEY = `evolution_draft_${patientId}_${sessionNumber}`;

  // Load mandatory alerts
  useEffect(() => {
    loadMandatoryAlerts();
  }, [patientId, sessionNumber]);

  // Auto-save effect
  useEffect(() => {
    if (!isDirty) return;
    
    const timer = setTimeout(() => {
      const draftData = {
        subjective,
        objective,
        assessment,
        plan,
        painScale,
        bodyParts,
        lastSaved: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draftData));
        setLastSaved(new Date());
        console.log('✅ Auto-save realizado');
      } catch (error) {
        console.error('❌ Erro no auto-save:', error);
      }
    }, 30000); // 30 segundos
    
    return () => clearTimeout(timer);
  }, [subjective, objective, assessment, plan, painScale, bodyParts, isDirty, AUTOSAVE_KEY]);

  // Recuperar rascunho ao carregar
  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
    
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const lastSavedDate = new Date(draft.lastSaved);
        const hoursSince = (Date.now() - lastSavedDate.getTime()) / (1000 * 60 * 60);
        
        // Só recupera se tiver menos de 24 horas
        if (hoursSince < 24) {
          const shouldRestore = window.confirm(
            `Encontramos um rascunho salvo em ${lastSavedDate.toLocaleString('pt-BR')}. Deseja recuperá-lo?`
          );
          
          if (shouldRestore) {
            setSubjective(draft.subjective || '');
            setObjective(draft.objective || '');
            setAssessment(draft.assessment || '');
            setPlan(draft.plan || '');
            setPainScale(draft.painScale);
            setBodyParts(draft.bodyParts || []);
            setLastSaved(lastSavedDate);
            showToast('Rascunho recuperado!', 'success');
          } else {
            localStorage.removeItem(AUTOSAVE_KEY);
          }
        } else {
          // Remove rascunhos antigos automaticamente
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      } catch (error) {
        console.error('Erro ao recuperar rascunho:', error);
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    }
  }, []); // Executa apenas na montagem

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
    // 1. Validar se pelo menos um campo SOAP está preenchido
    const hasContent = subjective.trim() || objective.trim() || 
                       assessment.trim() || plan.trim();
    
    if (!hasContent) {
      showToast('Preencha pelo menos um campo do SOAP', 'error');
      return;
    }
    
    // 2. Validar campos obrigatórios (S, O, A, P devem ter mínimo de caracteres)
    const minChars = 10;
    const errors: string[] = [];
    
    if (subjective.trim().length > 0 && subjective.trim().length < minChars) {
      errors.push('Subjetivo deve ter pelo menos 10 caracteres');
    }
    if (objective.trim().length > 0 && objective.trim().length < minChars) {
      errors.push('Objetivo deve ter pelo menos 10 caracteres');
    }
    if (assessment.trim().length > 0 && assessment.trim().length < minChars) {
      errors.push('Avaliação deve ter pelo menos 10 caracteres');
    }
    if (plan.trim().length > 0 && plan.trim().length < minChars) {
      errors.push('Plano deve ter pelo menos 10 caracteres');
    }
    
    if (errors.length > 0) {
      showToast(errors.join(' | '), 'error');
      return;
    }
    
    // 3. Validar EVA se preenchida
    if (painScale !== undefined && (painScale < 0 || painScale > 10)) {
      showToast('Escala de dor deve estar entre 0 e 10', 'error');
      return;
    }
    
    // 4. Verificar alertas críticos
    const incompleteCritical = criticalAlerts.filter(a => !a.isCompleted);
    if (incompleteCritical.length > 0) {
      showToast(
        `${incompleteCritical.length} teste(s) obrigatório(s) não realizado(s)`,
        'error'
      );
      return;
    }

    // 5. Salvar
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
      
      // Limpar rascunho após sucesso
      localStorage.removeItem(AUTOSAVE_KEY);
      setLastSaved(null);

      showToast('Sessão salva com sucesso!', 'success');
      setIsDirty(false);
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      showToast('Erro ao salvar sessão. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    const hasContent = subjective || objective || assessment || plan;
    
    if (hasContent) {
      const confirmed = window.confirm(
        '⚠️ Tem certeza que deseja limpar todos os campos?\n\n' +
        'Esta ação não pode ser desfeita e o rascunho será removido.'
      );
      if (!confirmed) return;
    }

    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setPainScale(undefined);
    setBodyParts([]);
    setIsDirty(false);
    
    // Limpar rascunho também
    localStorage.removeItem(AUTOSAVE_KEY);
    setLastSaved(null);
    
    showToast('Formulário limpo', 'info');
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
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              S - Subjetivo
              <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${subjective.length < 10 ? 'text-red-500' : subjective.length > 4500 ? 'text-amber-600' : 'text-slate-400'}`}>
              {subjective.length} caracteres
            </span>
          </div>
          <textarea
            value={subjective}
            onChange={(e) => handleFieldChange(setSubjective)(e.target.value)}
            placeholder="Ex: Paciente relata melhora da dor lombar após última sessão. Refere desconforto em trapézio direito durante elevação do braço acima de 90°. Nega dor em repouso. Escala de dor atual: 5/10 (era 7/10 na última sessão)."
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm"
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Objetivo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Eye className="w-4 h-4 text-gray-400" />
              O - Objetivo
              <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${objective.length < 10 ? 'text-red-500' : objective.length > 4500 ? 'text-amber-600' : 'text-slate-400'}`}>
              {objective.length} caracteres
            </span>
          </div>
          <textarea
            value={objective}
            onChange={(e) => handleFieldChange(setObjective)(e.target.value)}
            placeholder="Ex: ROM ombro D: flexão 120° (era 105°), abdução 110° (era 95°) | Força: trapézio 4/5, deltóide 4/5 | Palpação: tensão em trapézio superior D, trigger points ativos | Edema: leve em região patelar E | Marcha: simétrica, sem claudicação"
            rows={5}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm"
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Avaliação */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ClipboardCheck className="w-4 h-4 text-gray-400" />
              A - Avaliação
              <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${assessment.length < 10 ? 'text-red-500' : assessment.length > 4500 ? 'text-amber-600' : 'text-slate-400'}`}>
              {assessment.length} caracteres
            </span>
          </div>
          <textarea
            value={assessment}
            onChange={(e) => handleFieldChange(setAssessment)(e.target.value)}
            placeholder="Ex: Paciente apresenta evolução positiva, com redução de 30% da dor (EVA 7→5) e ganho de 15° em flexão de ombro. Responde bem ao tratamento proposto. Mantem limitação funcional para atividades acima da cabeça."
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm"
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Plano */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ListChecks className="w-4 h-4 text-gray-400" />
              P - Plano
              <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${plan.length < 10 ? 'text-red-500' : plan.length > 4500 ? 'text-amber-600' : 'text-slate-400'}`}>
              {plan.length} caracteres
            </span>
          </div>
          <textarea
            value={plan}
            onChange={(e) => handleFieldChange(setPlan)(e.target.value)}
            placeholder="Ex: 1) Liberação miofascial em trapézio D (10min) | 2) Mobilização glenoumeral (3 séries) | 3) Fortalecimento de manguito rotador: rotação externa com elástico (3x12) | 4) Alongamento de peitoral (3x30s) | 5) TENS em trapézio (20min, 100Hz) | 6) Orientações: aplicar gelo 2x/dia, evitar movimentos repetitivos"
            rows={8}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm"
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
          {isDirty && !lastSaved && (
            <span className="text-xs text-orange-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
              Alterações não salvas
            </span>
          )}
          {lastSaved && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Auto-save: {format(lastSaved, 'HH:mm:ss')}
            </span>
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

