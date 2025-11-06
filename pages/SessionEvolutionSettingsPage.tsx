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
    <div className="space-y-xl">
      {/* Header */}
      <PageHeader
        title="Configurações de Atendimento"
        subtitle="Personalize como você deseja registrar evoluções de sessão"
        icon={<Settings className="w-6 h-6" />}
      />

      {/* Current Mode Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-primary rounded-lg p-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-textSecondary mb-1">Modo Atual</p>
            <p className="text-lg font-bold text-neutral-text">
              {getModeLabel(mode)}
            </p>
          </div>
          {hasChanges && (
            <div className="px-md py-1 bg-warning-light text-warning text-xs font-medium rounded-full">
              Alterações não salvas
            </div>
          )}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-white border border-neutral-border rounded-card p-lg">
        <SessionEvolutionModeSelector
          currentMode={tempMode}
          onModeChange={handleModeChange}
          onTestMode={handleTestMode}
        />
      </div>

      {/* Save/Reset Buttons */}
      <div className="flex items-center justify-between bg-white border border-neutral-border rounded-lg p-md">
        <p className="text-sm text-neutral-textSecondary">
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
            className="flex items-center space-x-2 bg-primary hover:bg-primary-hover"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configuração</span>
          </Button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-neutral-bgAlt border border-neutral-border rounded-lg p-md space-y-sm">
        <h4 className="font-semibold text-neutral-text text-sm">
          ℹ️ Informações Adicionais
        </h4>
        <div className="space-y-sm text-sm text-neutral-text">
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

