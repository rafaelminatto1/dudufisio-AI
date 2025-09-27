import React, { useState, useEffect } from 'react';
import {
  Bell, Settings, Check, X, Clock, Mail, MessageSquare,
  Smartphone, Monitor, Volume2, VolumeX
} from 'lucide-react';
import { enhancedNotificationService } from '../../services/notificationService';
import { useData } from '../../contexts/AppContext';
import { auditService } from '../../services/auditService';

/**
 * 🔔 NOTIFICATION SETTINGS COMPONENT
 *
 * Interface completa para gerenciar preferências de notificação
 * incluindo push notifications, emails, SMS e configurações avançadas.
 */

interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    appointments: boolean;
    payments: boolean;
    treatments: boolean;
    system: boolean;
    marketing: boolean;
  };
  frequency: 'immediate' | 'batched' | 'daily';
  sound: boolean;
}

const NotificationSettings: React.FC = () => {
  const { user } = useData();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push: false,
    email: true,
    sms: false,
    inApp: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    categories: {
      appointments: true,
      payments: true,
      treatments: true,
      system: true,
      marketing: false
    },
    frequency: 'immediate',
    sound: true
  });

  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [testingPush, setTestingPush] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkNotificationPermission();
  }, []);

  const loadPreferences = () => {
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));

    // Log de auditoria
    if (user) {
      await auditService.createLog({
        user: user.name,
        action: 'UPDATE_NOTIFICATION_PREFERENCES',
        details: 'Atualizou preferências de notificação',
        resourceType: 'settings'
      });
    }
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestPushPermission = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const permission = await enhancedNotificationService.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        const subscription = await enhancedNotificationService.subscribeToPush(user.id);
        setPushSubscription(subscription);

        if (subscription) {
          await savePreferences({
            ...preferences,
            push: true
          });
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testPushNotification = async () => {
    if (!user || !pushSubscription) return;

    setTestingPush(true);

    try {
      await enhancedNotificationService.sendPushNotification(user.id, {
        title: '🔔 Teste de Notificação',
        body: 'Se você está vendo isso, as notificações estão funcionando perfeitamente!',
        icon: '/icon-192x192.png',
        data: { test: true }
      });
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
    } finally {
      setTestingPush(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: any) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    };

    await savePreferences(newPreferences);
  };

  const updateCategoryPreference = async (category: keyof NotificationPreferences['categories'], value: boolean) => {
    const newPreferences = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: value
      }
    };

    await savePreferences(newPreferences);
  };

  const updateQuietHours = async (field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    const newPreferences = {
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [field]: value
      }
    };

    await savePreferences(newPreferences);
  };

  const ChannelToggle: React.FC<{
    icon: React.ComponentType<any>;
    label: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    disabled?: boolean;
    requiresPermission?: boolean;
  }> = ({ icon: Icon, label, description, enabled, onToggle, disabled, requiresPermission }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className={`p-2 rounded-lg ${enabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-medium text-slate-900">{label}</h4>
          <p className="text-sm text-slate-500">{description}</p>
          {requiresPermission && notificationPermission !== 'granted' && (
            <p className="text-xs text-orange-600 mt-1">Requer permissão do navegador</p>
          )}
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  const CategoryToggle: React.FC<{
    label: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
  }> = ({ label, description, enabled, onToggle }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <h5 className="font-medium text-slate-900">{label}</h5>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Bell className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações de Notificação</h1>
          <p className="text-slate-600">Gerencie como e quando você deseja receber notificações</p>
        </div>
      </div>

      {/* Push Notification Setup */}
      {notificationPermission !== 'granted' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Ativar Notificações Push
              </h3>
              <p className="text-slate-600 mb-4">
                Receba lembretes importantes diretamente no seu dispositivo, mesmo quando não estiver usando o aplicativo.
              </p>
              <button
                onClick={requestPushPermission}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {isLoading ? 'Configurando...' : 'Ativar Notificações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Push Notification */}
      {notificationPermission === 'granted' && pushSubscription && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Notificações push ativadas</span>
            </div>
            <button
              onClick={testPushNotification}
              disabled={testingPush}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {testingPush ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Bell className="w-3 h-3" />
              )}
              Testar
            </button>
          </div>
        </div>
      )}

      {/* Channel Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Canais de Notificação
        </h2>

        <div className="space-y-4">
          <ChannelToggle
            icon={Smartphone}
            label="Push Notifications"
            description="Notificações instantâneas no dispositivo"
            enabled={preferences.push}
            onToggle={(enabled) => updatePreference('push', enabled)}
            disabled={notificationPermission !== 'granted'}
            requiresPermission={true}
          />

          <ChannelToggle
            icon={Mail}
            label="Email"
            description="Notificações por email"
            enabled={preferences.email}
            onToggle={(enabled) => updatePreference('email', enabled)}
          />

          <ChannelToggle
            icon={MessageSquare}
            label="SMS"
            description="Mensagens de texto"
            enabled={preferences.sms}
            onToggle={(enabled) => updatePreference('sms', enabled)}
          />

          <ChannelToggle
            icon={Monitor}
            label="No Aplicativo"
            description="Notificações dentro da interface"
            enabled={preferences.inApp}
            onToggle={(enabled) => updatePreference('inApp', enabled)}
          />
        </div>
      </div>

      {/* Category Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Tipos de Notificação
        </h2>

        <div className="space-y-4">
          <CategoryToggle
            label="Consultas"
            description="Lembretes e confirmações de consultas"
            enabled={preferences.categories.appointments}
            onToggle={(enabled) => updateCategoryPreference('appointments', enabled)}
          />

          <CategoryToggle
            label="Pagamentos"
            description="Lembretes de cobrança e faturas"
            enabled={preferences.categories.payments}
            onToggle={(enabled) => updateCategoryPreference('payments', enabled)}
          />

          <CategoryToggle
            label="Tratamentos"
            description="Atualizações sobre progresso e exercícios"
            enabled={preferences.categories.treatments}
            onToggle={(enabled) => updateCategoryPreference('treatments', enabled)}
          />

          <CategoryToggle
            label="Sistema"
            description="Alertas importantes do sistema"
            enabled={preferences.categories.system}
            onToggle={(enabled) => updateCategoryPreference('system', enabled)}
          />

          <CategoryToggle
            label="Marketing"
            description="Promoções e novidades"
            enabled={preferences.categories.marketing}
            onToggle={(enabled) => updateCategoryPreference('marketing', enabled)}
          />
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Configurações Avançadas
        </h2>

        <div className="space-y-6">
          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">Horário de Silêncio</h4>
                <p className="text-sm text-slate-500">Não receber notificações em horários específicos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.quietHours.enabled}
                  onChange={(e) => updateQuietHours('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Início
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => updateQuietHours('start', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fim
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => updateQuietHours('end', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Frequency */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Frequência</h4>
            <p className="text-sm text-slate-500 mb-3">Como agrupar as notificações</p>
            <div className="space-y-2">
              {[
                { value: 'immediate', label: 'Imediata', description: 'Receber assim que acontecer' },
                { value: 'batched', label: 'Agrupada', description: 'Agrupar notificações similares' },
                { value: 'daily', label: 'Diária', description: 'Resumo diário das atividades' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={preferences.frequency === option.value}
                    onChange={(e) => updatePreference('frequency', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-slate-900">{option.label}</span>
                    <p className="text-sm text-slate-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preferences.sound ? (
                <Volume2 className="w-5 h-5 text-slate-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <h4 className="font-medium text-slate-900">Sons</h4>
                <p className="text-sm text-slate-500">Reproduzir som com as notificações</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.sound}
                onChange={(e) => updatePreference('sound', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;