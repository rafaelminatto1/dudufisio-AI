/**
 * AI SETTINGS PAGE - DUDUFISIO-AI
 *
 * Página de configurações para funcionalidades de IA do sistema.
 */
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import PermissionGuard from '../components/auth/PermissionGuard';
import { Brain, Zap, Shield, BarChart3, FileText, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
const AiSettingsPage = () => {
    const [settings, setSettings] = useState({
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
    const [saveStatus, setSaveStatus] = useState('idle');
    const handleSave = async () => {
        setIsLoading(true);
        setSaveStatus('saving');
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
        catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };
    return (<PermissionGuard permission="admin:settings">
      <div className="space-y-6">
        <PageHeader title="Configurações de IA" subtitle="Configure as funcionalidades de inteligência artificial do sistema"/>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configurações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Configuration */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-lg p-3">
                  <Brain className="w-6 h-6"/>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-slate-900">Configuração da API</h3>
                  <p className="text-sm text-slate-500">Configurações da API do Google Gemini</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Chave da API Gemini
                  </label>
                  <input type="password" value={settings.geminiApiKey} onChange={(e) => handleInputChange('geminiApiKey', e.target.value)} placeholder="Insira sua chave da API" aria-label="Chave da API Gemini" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                  <p className="text-xs text-slate-500 mt-1">
                    Sua chave da API será criptografada e armazenada com segurança
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Limite de Tokens por Requisição
                    </label>
                    <input type="number" value={settings.maxTokensPerRequest} onChange={(e) => handleInputChange('maxTokensPerRequest', parseInt(e.target.value))} aria-label="Limite de tokens por requisição" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Limiar de Confiança (%)
                    </label>
                    <input type="number" min="0" max="100" value={settings.confidenceThreshold} onChange={(e) => handleInputChange('confidenceThreshold', parseInt(e.target.value))} aria-label="Limiar de confiança em porcentagem" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-lg p-3">
                  <Zap className="w-6 h-6"/>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-slate-900">Funcionalidades de IA</h3>
                  <p className="text-sm text-slate-500">Ative ou desative funcionalidades específicas</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
            { key: 'enablePredictiveAnalytics', label: 'Analytics Preditivos', description: 'Análises preditivas para tendências clínicas' },
            { key: 'enableAutoReports', label: 'Relatórios Automáticos', description: 'Geração automática de relatórios com IA' },
            { key: 'enableRiskAnalysis', label: 'Análise de Risco', description: 'Identificação automática de riscos clínicos' },
            { key: 'enableSmartScheduling', label: 'Agendamento Inteligente', description: 'Otimização automática de horários' }
        ].map((feature) => (<div key={feature.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{feature.label}</h4>
                      <p className="text-sm text-slate-500">{feature.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings[feature.key]} onChange={(e) => handleInputChange(feature.key, e.target.checked)} aria-label={`Ativar ${feature.label}`} className="sr-only peer"/>
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>))}
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-red-100 text-red-600 rounded-lg p-3">
                  <Shield className="w-6 h-6"/>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-slate-900">Privacidade e Segurança</h3>
                  <p className="text-sm text-slate-500">Configurações de proteção de dados</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
            { key: 'enableDataPrivacy', label: 'Proteção de Dados', description: 'Criptografia e anonimização de dados sensíveis' },
            { key: 'enableAuditLog', label: 'Log de Auditoria', description: 'Registro de todas as operações de IA' }
        ].map((feature) => (<div key={feature.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{feature.label}</h4>
                      <p className="text-sm text-slate-500">{feature.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings[feature.key]} onChange={(e) => handleInputChange(feature.key, e.target.checked)} aria-label={`Ativar ${feature.label}`} className="sr-only peer"/>
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Status da IA</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">API Conectada</span>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1"/>
                    <span className="text-sm font-medium">Ativa</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Última Atualização</span>
                  <span className="text-sm text-slate-500">Há 2 horas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Requisições Hoje</span>
                  <span className="text-sm text-slate-500">1,247</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2"/>
                  Testar Conexão
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  <FileText className="w-4 h-4 mr-2"/>
                  Ver Logs
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  <BarChart3 className="w-4 h-4 mr-2"/>
                  Estatísticas
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <button onClick={handleSave} disabled={isLoading} className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${saveStatus === 'success'
            ? 'bg-green-600 text-white'
            : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isLoading ? (<>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin"/>
                    Salvando...
                  </>) : saveStatus === 'success' ? (<>
                    <CheckCircle className="w-4 h-4 mr-2"/>
                    Salvo com Sucesso!
                  </>) : saveStatus === 'error' ? (<>
                    <AlertCircle className="w-4 h-4 mr-2"/>
                    Erro ao Salvar
                  </>) : (<>
                    <Save className="w-4 h-4 mr-2"/>
                    Salvar Configurações
                  </>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>);
};
export default AiSettingsPage;
