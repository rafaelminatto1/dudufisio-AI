import React, { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import SessionEvolutionModeSelector from '../components/settings/SessionEvolutionModeSelector';
import useSessionEvolutionMode from '../hooks/useSessionEvolutionMode';
import { SessionEvolutionMode } from '../config/sessionEvolutionConfig';
import PageHeader from '../components/PageHeader';

/**
 * Página de Configurações de Evolução de Sessão
 * Permite ao usuário escolher visualmente entre as 4 opções de implementação
 */

const SessionEvolutionSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { mode, setMode, isLoading } = useSessionEvolutionMode();
  const [tempMode, setTempMode] = useState<SessionEvolutionMode>(mode);
  const [hasChanges, setHasChanges] = useState(false);

  const handleModeChange = (newMode: SessionEvolutionMode) => {
    setTempMode(newMode);
    setHasChanges(newMode !== mode);
  };

  const handleSave = () => {
    setMode(tempMode);
    setHasChanges(false);
    showToast('Configuração salva com sucesso!', 'success');
  };

  const handleReset = () => {
    setTempMode(mode);
    setHasChanges(false);
    showToast('Alterações descartadas', 'info');
  };

  const handleTestMode = (testMode: SessionEvolutionMode) => {
    showToast(`Testando modo: ${getModeLabel(testMode)}`, 'info');
    
    // Navegar para uma página de teste baseado no modo
    // Para teste, vamos usar um appointmentId fictício
    const testAppointmentId = 'test_appointment_123';
    
    switch (testMode) {
      case 'page':
        navigate(`/session-evolution/${testAppointmentId}`);
        break;
      case 'modal':
        showToast('Modal será aberto ao clicar em "Iniciar Atendimento" na agenda', 'info');
        navigate('/agenda');
        break;
      case 'expanded':
        navigate(`/atendimento/${testAppointmentId}`);
        break;
      case 'existing':
        navigate(`/atendimento/${testAppointmentId}`);
        break;
    }
  };

  const getModeLabel = (m: SessionEvolutionMode): string => {
    const labels = {
      existing: 'Sistema Existente',
      page: 'Página Nova',
      modal: 'Modal Fullscreen',
      expanded: 'Expansão Integrada',
    };
    return labels[m];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Configurações de Atendimento"
        subtitle="Personalize como você deseja registrar evoluções de sessão"
        icon={<Settings className="w-6 h-6" />}
      />

      {/* Current Mode Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">Modo Atual</p>
            <p className="text-lg font-bold text-slate-900">
              {getModeLabel(mode)}
            </p>
          </div>
          {hasChanges && (
            <div className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
              Alterações não salvas
            </div>
          )}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <SessionEvolutionModeSelector
          currentMode={tempMode}
          onModeChange={handleModeChange}
          onTestMode={handleTestMode}
        />
      </div>

      {/* Save/Reset Buttons */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          {hasChanges
            ? 'Você tem alterações não salvas. Clique em "Salvar Configuração" para aplicar.'
            : 'Suas configurações estão salvas e sincronizadas.'}
        </p>

        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Descartar</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configuração</span>
          </Button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-slate-900 text-sm">
          ℹ️ Informações Adicionais
        </h4>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            • <strong>Sistema Existente:</strong> Continua usando a interface atual que já está funcionando.
          </p>
          <p>
            • <strong>Página Nova:</strong> Interface dedicada com visualização completa de dados históricos, gráficos e objetivos.
          </p>
          <p>
            • <strong>Modal:</strong> Mesma funcionalidade da página nova, mas abre como modal sobre a agenda.
          </p>
          <p>
            • <strong>Expansão:</strong> Combina o sistema atual com as novas funcionalidades de forma integrada.
          </p>
        </div>
      </div>

      {/* Link para voltar */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
        >
          ← Voltar para Configurações
        </Button>
      </div>
    </div>
  );
};

export default SessionEvolutionSettingsPage;

