/**
 * AI SETTINGS PAGE - DUDUFISIO-AI
 *
 * Página de configurações para funcionalidades de IA do sistema.
 */

import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import PermissionGuard from '../components/auth/PermissionGuard';
import { 
  Brain, 
  Settings, 
  Zap, 
  Shield, 
  BarChart3, 
  FileText, 
  Users,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface AISettings {
  geminiApiKey: string;
  enablePredictiveAnalytics: boolean;
  enableAutoReports: boolean;
  enableRiskAnalysis: boolean;
  enableSmartScheduling: boolean;
  confidenceThreshold: number;
  maxTokensPerRequest: number;
  enableDataPrivacy: boolean;
  enableAuditLog: boolean;
}

const AiSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AISettings>({
    geminiApiKey: '',
    enablePredictiveAnalytics: true,
    enableAutoReports: false,
    enableRiskAnalysis: true,
    enableSmartScheduling: false,
    confidenceThreshold: 80,
    maxTokensPerRequest: 1000,
    enableDataPrivacy: true,
    enableAuditLog: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AISettings, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <PermissionGuard permission="admin:settings">
      <div className="space-y-xl">
        <PageHeader
          title="Configurações de IA"
          subtitle="Configure as funcionalidades de inteligência artificial do sistema"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Configurações Principais */}
          <div className="lg:col-span-2 space-y-xl">
            {/* API Configuration */}
            <div className="bg-white rounded-cardLarge shadow-card border border-neutral-border p-lg">
              <div className="flex items-center mb-md">
                <div className="flex-shrink-0 bg-primary-light text-primary rounded-lg p-md">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-neutral-text">Configuração da API</h3>
                  <p className="text-sm text-neutral-textSecondary">Configurações da API do Google Gemini</p>
                </div>
              </div>
              
              <div className="space-y-md">
                <div>
                  <label className="block text-sm font-medium text-neutral-text mb-sm">
                    Chave da API Gemini
                  </label>
                  <input
                    type="password"
                    value={settings.geminiApiKey}
                    onChange={(e) => handleInputChange('geminiApiKey', e.target.value)}
                    placeholder="Insira sua chave da API"
                    aria-label="Chave da API Gemini"
                    className="w-full px-md py-sm border border-neutral-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-neutral-textSecondary mt-xs">
                    Sua chave da API será criptografada e armazenada com segurança
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-sm">
                      Limite de Tokens por Requisição
                    </label>
                    <input
                      type="number"
                      value={settings.maxTokensPerRequest}
                      onChange={(e) => handleInputChange('maxTokensPerRequest', parseInt(e.target.value))}
                      aria-label="Limite de tokens por requisição"
                      className="w-full px-md py-sm border border-neutral-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-text mb-sm">
                      Limiar de Confiança (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.confidenceThreshold}
                      onChange={(e) => handleInputChange('confidenceThreshold', parseInt(e.target.value))}
                      aria-label="Limiar de confiança em porcentagem"
                      className="w-full px-md py-sm border border-neutral-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="bg-white rounded-cardLarge shadow-card border border-neutral-border p-lg">
              <div className="flex items-center mb-md">
                <div className="flex-shrink-0 bg-success-light text-success rounded-lg p-md">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-neutral-text">Funcionalidades de IA</h3>
                  <p className="text-sm text-neutral-textSecondary">Ative ou desative funcionalidades específicas</p>
                </div>
              </div>

              <div className="space-y-md">
                {[
                  { key: 'enablePredictiveAnalytics', label: 'Analytics Preditivos', description: 'Análises preditivas para tendências clínicas' },
                  { key: 'enableAutoReports', label: 'Relatórios Automáticos', description: 'Geração automática de relatórios com IA' },
                  { key: 'enableRiskAnalysis', label: 'Análise de Risco', description: 'Identificação automática de riscos clínicos' },
                  { key: 'enableSmartScheduling', label: 'Agendamento Inteligente', description: 'Otimização automática de horários' }
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-md bg-neutral-bgAlt rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-text">{feature.label}</h4>
                      <p className="text-sm text-neutral-textSecondary">{feature.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[feature.key as keyof AISettings] as boolean}
                        onChange={(e) => handleInputChange(feature.key as keyof AISettings, e.target.checked)}
                        aria-label={`Ativar ${feature.label}`}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-bgDark peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-cardLarge shadow-card border border-neutral-border p-lg">
              <div className="flex items-center mb-md">
                <div className="flex-shrink-0 bg-error-light text-error rounded-lg p-md">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-neutral-text">Privacidade e Segurança</h3>
                  <p className="text-sm text-neutral-textSecondary">Configurações de proteção de dados</p>
                </div>
              </div>

              <div className="space-y-md">
                {[
                  { key: 'enableDataPrivacy', label: 'Proteção de Dados', description: 'Criptografia e anonimização de dados sensíveis' },
                  { key: 'enableAuditLog', label: 'Log de Auditoria', description: 'Registro de todas as operações de IA' }
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-md bg-neutral-bgAlt rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-text">{feature.label}</h4>
                      <p className="text-sm text-neutral-textSecondary">{feature.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[feature.key as keyof AISettings] as boolean}
                        onChange={(e) => handleInputChange(feature.key as keyof AISettings, e.target.checked)}
                        aria-label={`Ativar ${feature.label}`}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-bgDark peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-xl">
            {/* Status */}
            <div className="bg-white rounded-cardLarge shadow-card border border-neutral-border p-lg">
              <h3 className="text-lg font-bold text-neutral-text mb-md">Status da IA</h3>
              <div className="space-y-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-textSecondary">API Conectada</span>
                  <div className="flex items-center text-success">
                    <CheckCircle className="w-4 h-4 mr-xs" />
                    <span className="text-sm font-medium">Ativa</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-textSecondary">Última Atualização</span>
                  <span className="text-sm text-neutral-textSecondary">Há 2 horas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-textSecondary">Requisições Hoje</span>
                  <span className="text-sm text-neutral-textSecondary">1,247</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-cardLarge shadow-card border border-neutral-border p-lg">
              <h3 className="text-lg font-bold text-neutral-text mb-md">Ações Rápidas</h3>
              <div className="space-y-sm">
                <button className="w-full flex items-center justify-center px-md py-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                  <RefreshCw className="w-4 h-4 mr-sm" />
                  Testar Conexão
                </button>
                <button className="w-full flex items-center justify-center px-md py-sm bg-neutral-bgDark text-neutral-text rounded-lg hover:bg-neutral-bgDark transition-colors">
                  <FileText className="w-4 h-4 mr-sm" />
                  Ver Logs
                </button>
                <button className="w-full flex items-center justify-center px-md py-sm bg-neutral-bgDark text-neutral-text rounded-lg hover:bg-neutral-bgDark transition-colors">
                  <BarChart3 className="w-4 h-4 mr-sm" />
                  Estatísticas
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white rounded-cardLarge shadow-card border border-neutral-border p-lg">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`w-full flex items-center justify-center px-md py-3 rounded-lg font-medium transition-colors ${
                  saveStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : saveStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-primary text-white hover:bg-primary-hover'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-sm animate-spin" />
                    Salvando...
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-sm" />
                    Salvo com Sucesso!
                  </>
                ) : saveStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-sm" />
                    Erro ao Salvar
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-sm" />
                    Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default AiSettingsPage;
