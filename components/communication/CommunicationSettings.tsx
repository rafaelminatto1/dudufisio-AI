import React, { useState, useEffect } from 'react';
import {
  Save, RefreshCw, AlertCircle, CheckCircle, Eye, EyeOff,
  MessageSquare, Mail, Smartphone, Bell, Key, Globe,
  Settings, Shield, Clock, Database, Zap
} from 'lucide-react';

interface CommunicationSettingsProps {
  className?: string;
}

interface ChannelConfig {
  whatsapp: {
    enabled: boolean;
    businessApiToken?: string;
    webhookVerifyToken?: string;
    phoneNumberId?: string;
    useWebClient: boolean;
    qrCodeExpiry: number;
  };
  sms: {
    enabled: boolean;
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioPhoneNumber?: string;
    rateLimitPerHour: number;
  };
  email: {
    enabled: boolean;
    smtpHost?: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail?: string;
    fromName?: string;
    rateLimitPerHour: number;
  };
  push: {
    enabled: boolean;
    vapidPublicKey?: string;
    vapidPrivateKey?: string;
    fcmServerKey?: string;
    enableBrowserPush: boolean;
    enableMobilePush: boolean;
  };
}

interface GeneralSettings {
  defaultTimezone: string;
  defaultLanguage: string;
  retryAttempts: number;
  retryDelay: number;
  enableAnalytics: boolean;
  enableWebhooks: boolean;
  webhookTimeout: number;
  rateLimitGlobal: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const timezones = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'UTC', label: 'UTC (GMT+0)' }
];

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' }
];

export const CommunicationSettings: React.FC<CommunicationSettingsProps> = ({
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'success' | 'error' | null>>({});

  const [channelConfig, setChannelConfig] = useState<ChannelConfig>({
    whatsapp: {
      enabled: false,
      useWebClient: true,
      qrCodeExpiry: 300
    },
    sms: {
      enabled: false,
      rateLimitPerHour: 100
    },
    email: {
      enabled: false,
      smtpPort: 587,
      smtpSecure: true,
      rateLimitPerHour: 1000
    },
    push: {
      enabled: false,
      enableBrowserPush: true,
      enableMobilePush: false
    }
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    defaultTimezone: 'America/Sao_Paulo',
    defaultLanguage: 'pt-BR',
    retryAttempts: 3,
    retryDelay: 1000,
    enableAnalytics: true,
    enableWebhooks: true,
    webhookTimeout: 30000,
    rateLimitGlobal: 10000,
    enableLogging: true,
    logLevel: 'info'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/communication/settings');
      if (response.ok) {
        const data = await response.json();
        setChannelConfig(data.channels || channelConfig);
        setGeneralSettings(data.general || generalSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/communication/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: channelConfig,
          general: generalSettings
        })
      });

      if (response.ok) {
        // Show success notification
        alert('Configurações salvas com sucesso!');
      } else {
        throw new Error('Falha ao salvar configurações');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (channel: string) => {
    try {
      setTestingConnection(channel);
      setConnectionStatus(prev => ({ ...prev, [channel]: null }));

      const response = await fetch(`/api/communication/test/${channel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelConfig[channel as keyof ChannelConfig])
      });

      const result = await response.json();
      setConnectionStatus(prev => ({
        ...prev,
        [channel]: response.ok ? 'success' : 'error'
      }));

      if (!response.ok) {
        alert(`Erro no teste de conexão: ${result.error}`);
      } else {
        alert('Conexão testada com sucesso!');
      }
    } catch (error) {
      console.error(`Error testing ${channel}:`, error);
      setConnectionStatus(prev => ({ ...prev, [channel]: 'error' }));
      alert('Erro ao testar conexão');
    } finally {
      setTestingConnection(null);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const updateChannelConfig = (channel: keyof ChannelConfig, updates: Partial<ChannelConfig[keyof ChannelConfig]>) => {
    setChannelConfig(prev => ({
      ...prev,
      [channel]: { ...prev[channel], ...updates }
    }));
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações de Comunicação</h1>
          <p className="text-gray-600 mt-1">
            Configure os canais de comunicação e parâmetros gerais do sistema
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Recarregar</span>
          </button>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Configurações Gerais</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuso Horário Padrão
            </label>
            <select
              value={generalSettings.defaultTimezone}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultTimezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma Padrão
            </label>
            <select
              value={generalSettings.defaultLanguage}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tentativas de Retry
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={generalSettings.retryAttempts}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, retryAttempts: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delay entre Retries (ms)
            </label>
            <input
              type="number"
              min="100"
              max="30000"
              step="100"
              value={generalSettings.retryDelay}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, retryDelay: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Limit Global (por hora)
            </label>
            <input
              type="number"
              min="100"
              max="100000"
              value={generalSettings.rateLimitGlobal}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, rateLimitGlobal: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout de Webhook (ms)
            </label>
            <input
              type="number"
              min="5000"
              max="120000"
              step="1000"
              value={generalSettings.webhookTimeout}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, webhookTimeout: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={generalSettings.enableAnalytics}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, enableAnalytics: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Habilitar Analytics</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={generalSettings.enableWebhooks}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, enableWebhooks: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Habilitar Webhooks</span>
            </label>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={generalSettings.enableLogging}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, enableLogging: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Habilitar Logging</span>
            </label>

            {generalSettings.enableLogging && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Log
                </label>
                <select
                  value={generalSettings.logLevel}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, logLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">WhatsApp</h2>
            {connectionStatus.whatsapp && (
              <div className={`flex items-center space-x-1 ${
                connectionStatus.whatsapp === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus.whatsapp === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {connectionStatus.whatsapp === 'success' ? 'Conectado' : 'Erro na conexão'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channelConfig.whatsapp.enabled}
                onChange={(e) => updateChannelConfig('whatsapp', { enabled: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Habilitado</span>
            </label>

            <button
              onClick={() => testConnection('whatsapp')}
              disabled={!channelConfig.whatsapp.enabled || testingConnection === 'whatsapp'}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {testingConnection === 'whatsapp' ? 'Testando...' : 'Testar'}
            </button>
          </div>
        </div>

        {channelConfig.whatsapp.enabled && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={channelConfig.whatsapp.useWebClient}
                  onChange={() => updateChannelConfig('whatsapp', { useWebClient: true })}
                  className="border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">WhatsApp Web Client</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!channelConfig.whatsapp.useWebClient}
                  onChange={() => updateChannelConfig('whatsapp', { useWebClient: false })}
                  className="border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Business API</span>
              </label>
            </div>

            {!channelConfig.whatsapp.useWebClient && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business API Token
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.whatsappToken ? 'text' : 'password'}
                      value={channelConfig.whatsapp.businessApiToken || ''}
                      onChange={(e) => updateChannelConfig('whatsapp', { businessApiToken: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Token da API do WhatsApp Business"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('whatsappToken')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.whatsappToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={channelConfig.whatsapp.phoneNumberId || ''}
                    onChange={(e) => updateChannelConfig('whatsapp', { phoneNumberId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="ID do número de telefone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Verify Token
                  </label>
                  <input
                    type="text"
                    value={channelConfig.whatsapp.webhookVerifyToken || ''}
                    onChange={(e) => updateChannelConfig('whatsapp', { webhookVerifyToken: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Token de verificação do webhook"
                  />
                </div>
              </div>
            )}

            {channelConfig.whatsapp.useWebClient && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Expiry (segundos)
                </label>
                <input
                  type="number"
                  min="60"
                  max="600"
                  value={channelConfig.whatsapp.qrCodeExpiry}
                  onChange={(e) => updateChannelConfig('whatsapp', { qrCodeExpiry: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* SMS Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">SMS (Twilio)</h2>
            {connectionStatus.sms && (
              <div className={`flex items-center space-x-1 ${
                connectionStatus.sms === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus.sms === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {connectionStatus.sms === 'success' ? 'Conectado' : 'Erro na conexão'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channelConfig.sms.enabled}
                onChange={(e) => updateChannelConfig('sms', { enabled: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Habilitado</span>
            </label>

            <button
              onClick={() => testConnection('sms')}
              disabled={!channelConfig.sms.enabled || testingConnection === 'sms'}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {testingConnection === 'sms' ? 'Testando...' : 'Testar'}
            </button>
          </div>
        </div>

        {channelConfig.sms.enabled && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account SID
              </label>
              <input
                type="text"
                value={channelConfig.sms.twilioAccountSid || ''}
                onChange={(e) => updateChannelConfig('sms', { twilioAccountSid: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Twilio Account SID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auth Token
              </label>
              <div className="relative">
                <input
                  type={showPasswords.twilioAuthToken ? 'text' : 'password'}
                  value={channelConfig.sms.twilioAuthToken || ''}
                  onChange={(e) => updateChannelConfig('sms', { twilioAuthToken: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Twilio Auth Token"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('twilioAuthToken')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.twilioAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Telefone
              </label>
              <input
                type="text"
                value={channelConfig.sms.twilioPhoneNumber || ''}
                onChange={(e) => updateChannelConfig('sms', { twilioPhoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="+5511999999999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Limit (por hora)
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                value={channelConfig.sms.rateLimitPerHour}
                onChange={(e) => updateChannelConfig('sms', { rateLimitPerHour: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold">Email (SMTP)</h2>
            {connectionStatus.email && (
              <div className={`flex items-center space-x-1 ${
                connectionStatus.email === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus.email === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {connectionStatus.email === 'success' ? 'Conectado' : 'Erro na conexão'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channelConfig.email.enabled}
                onChange={(e) => updateChannelConfig('email', { enabled: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Habilitado</span>
            </label>

            <button
              onClick={() => testConnection('email')}
              disabled={!channelConfig.email.enabled || testingConnection === 'email'}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {testingConnection === 'email' ? 'Testando...' : 'Testar'}
            </button>
          </div>
        </div>

        {channelConfig.email.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  value={channelConfig.email.smtpHost || ''}
                  onChange={(e) => updateChannelConfig('email', { smtpHost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porta
                </label>
                <input
                  type="number"
                  min="25"
                  max="65535"
                  value={channelConfig.email.smtpPort}
                  onChange={(e) => updateChannelConfig('email', { smtpPort: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário
                </label>
                <input
                  type="text"
                  value={channelConfig.email.smtpUser || ''}
                  onChange={(e) => updateChannelConfig('email', { smtpUser: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.smtpPassword ? 'text' : 'password'}
                    value={channelConfig.email.smtpPassword || ''}
                    onChange={(e) => updateChannelConfig('email', { smtpPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Senha do email"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('smtpPassword')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.smtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do Remetente
                </label>
                <input
                  type="email"
                  value={channelConfig.email.fromEmail || ''}
                  onChange={(e) => updateChannelConfig('email', { fromEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="noreply@fisioflow.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Remetente
                </label>
                <input
                  type="text"
                  value={channelConfig.email.fromName || ''}
                  onChange={(e) => updateChannelConfig('email', { fromName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="FisioFlow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate Limit (por hora)
                </label>
                <input
                  type="number"
                  min="50"
                  max="50000"
                  value={channelConfig.email.rateLimitPerHour}
                  onChange={(e) => updateChannelConfig('email', { rateLimitPerHour: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channelConfig.email.smtpSecure}
                  onChange={(e) => updateChannelConfig('email', { smtpSecure: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Usar SSL/TLS</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Push Notifications Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Push Notifications</h2>
            {connectionStatus.push && (
              <div className={`flex items-center space-x-1 ${
                connectionStatus.push === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus.push === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {connectionStatus.push === 'success' ? 'Conectado' : 'Erro na conexão'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channelConfig.push.enabled}
                onChange={(e) => updateChannelConfig('push', { enabled: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Habilitado</span>
            </label>

            <button
              onClick={() => testConnection('push')}
              disabled={!channelConfig.push.enabled || testingConnection === 'push'}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {testingConnection === 'push' ? 'Testando...' : 'Testar'}
            </button>
          </div>
        </div>

        {channelConfig.push.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAPID Public Key
                </label>
                <textarea
                  value={channelConfig.push.vapidPublicKey || ''}
                  onChange={(e) => updateChannelConfig('push', { vapidPublicKey: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Chave pública VAPID para Web Push"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAPID Private Key
                </label>
                <textarea
                  value={channelConfig.push.vapidPrivateKey || ''}
                  onChange={(e) => updateChannelConfig('push', { vapidPrivateKey: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Chave privada VAPID para Web Push"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FCM Server Key (opcional)
              </label>
              <div className="relative">
                <input
                  type={showPasswords.fcmServerKey ? 'text' : 'password'}
                  value={channelConfig.push.fcmServerKey || ''}
                  onChange={(e) => updateChannelConfig('push', { fcmServerKey: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Server Key do Firebase Cloud Messaging"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('fcmServerKey')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.fcmServerKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channelConfig.push.enableBrowserPush}
                  onChange={(e) => updateChannelConfig('push', { enableBrowserPush: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Habilitar Push no Browser</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channelConfig.push.enableMobilePush}
                  onChange={(e) => updateChannelConfig('push', { enableMobilePush: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Habilitar Push Mobile</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationSettings;