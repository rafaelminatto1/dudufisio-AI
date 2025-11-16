// components/alerts/NotificationSettings.tsx
import React, { useState } from 'react';
import { Bell, BellOff, Mail, MessageSquare, Smartphone, Clock, Save, X, AlertTriangle } from 'lucide-react';

interface NotificationSettingsProps {
  userId: string;
  onClose?: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
  onClose
}) => {
  const { settings, loading, updateSettings } = useUserNotificationSettings(userId);
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const notificationTypes = [
    { key: 'alert', label: 'Alertas de Sistema', icon: Bell },
    { key: 'supply', label: 'Insumos', icon: Bell },
    { key: 'task', label: 'Tarefas', icon: Bell },
    { key: 'order', label: 'Pedidos', icon: Bell },
    { key: 'reminder', label: 'Lembretes', icon: Bell }
  ];

  const channels = [
    { key: 'in_app', label: 'No Aplicativo', icon: Bell },
    { key: 'email', label: 'E-mail', icon: Mail },
    { key: 'sms', label: 'SMS', icon: MessageSquare },
    { key: 'push', label: 'Push Notification', icon: Smartphone }
  ];

  const frequencies = [
    { key: 'immediate', label: 'Imediato' },
    { key: 'hourly', label: 'Por Hora' },
    { key: 'daily', label: 'Diário' },
    { key: 'weekly', label: 'Semanal' }
  ];

  const getSettingValue = (type: string, channel: string, field: string) => {
    const key = `${type}_${channel}_${field}`;
    if (editedSettings[key] !== undefined) {
      return editedSettings[key];
    }

    const setting = settings.find(s => s.notificationType === type && s.channel === channel);
    return setting?.[field as keyof typeof setting] ?? (field === 'isEnabled' ? true : 'immediate');
  };

  const updateSetting = (type: string, channel: string, field: string, value: any) => {
    const key = `${type}_${channel}_${field}`;
    setEditedSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToUpdate: any[] = [];

      // Processar cada combinação de tipo e canal
      notificationTypes.forEach(type => {
        channels.forEach(channel => {
          const isEnabled = getSettingValue(type.key, channel.key, 'isEnabled');
          const frequency = getSettingValue(type.key, channel.key, 'frequency');
          const quietStart = getSettingValue(type.key, channel.key, 'quietHoursStart');
          const quietEnd = getSettingValue(type.key, channel.key, 'quietHoursEnd');

          // Encontrar configuração existente ou criar nova
          const existingSetting = settings.find(
            s => s.notificationType === type.key && s.channel === channel.key
          );

          if (existingSetting) {
            settingsToUpdate.push({
              id: existingSetting.id,
              isEnabled,
              frequency,
              quietHoursStart: quietStart || null,
              quietHoursEnd: quietEnd || null
            });
          } else {
            settingsToUpdate.push({
              notificationType: type.key,
              channel: channel.key,
              isEnabled,
              frequency,
              quietHoursStart: quietStart || null,
              quietHoursEnd: quietEnd || null
            });
          }
        });
      });

      await updateSettings(settingsToUpdate);
      setEditedSettings({});
      onClose?.();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configurações de Notificação</h3>
          <p className="text-sm text-gray-600">Personalize como você recebe notificações</p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Configurações por Tipo e Canal */}
      <div className="space-y-6">
        {notificationTypes.map(type => (
          <div key={type.key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <type.icon className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="text-md font-medium text-gray-900">{type.label}</h4>
            </div>

            <div className="space-y-3">
              {channels.map(channel => (
                <div key={channel.key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center">
                    <channel.icon className="h-4 w-4 text-gray-500 mr-3" />
                    <span className="text-sm font-medium text-gray-700">{channel.label}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Habilitado/Desabilitado */}
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={getSettingValue(type.key, channel.key, 'isEnabled')}
                        onChange={(e) => updateSetting(type.key, channel.key, 'isEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {getSettingValue(type.key, channel.key, 'isEnabled') ? 'Ativo' : 'Inativo'}
                      </span>
                    </label>

                    {/* Frequência */}
                    {getSettingValue(type.key, channel.key, 'isEnabled') && (
                      <select
                        value={getSettingValue(type.key, channel.key, 'frequency')}
                        onChange={(e) => updateSetting(type.key, channel.key, 'frequency', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        {frequencies.map(freq => (
                          <option key={freq.key} value={freq.key}>
                            {freq.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Configurações Globais */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="text-md font-medium text-gray-900">Horário Silencioso</h4>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Configure horários em que você não deseja receber notificações (exceto alertas críticos).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Início do horário silencioso
            </label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fim do horário silencioso
            </label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Informações Importantes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Informações Importantes</h4>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Alertas críticos sempre são enviados independente das configurações</li>
              <li>• Notificações por e-mail podem ter atraso de alguns minutos</li>
              <li>• SMS tem custo adicional e é usado apenas para alertas críticos</li>
              <li>• Push notifications requerem permissão do navegador</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
