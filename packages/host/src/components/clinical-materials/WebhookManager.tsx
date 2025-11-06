import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, Edit, Play, Pause, Activity, CheckCircle, XCircle } from 'lucide-react';
import materialWebhookService from '../../services/materialWebhookService';

export const WebhookManager: React.FC = () => {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [statistics, setStatistics] = useState<Record<string, any>>({});

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const data = await materialWebhookService.listWebhooks();
      setWebhooks(data);

      // Carregar estatísticas para cada webhook
      const stats: Record<string, any> = {};
      for (const webhook of data) {
        const stat = await materialWebhookService.getWebhookStatistics(webhook.id);
        stats[webhook.id] = stat;
      }
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar webhooks:', error);
    }
  };

  const handleTest = async (webhookId: string) => {
    try {
      await materialWebhookService.testWebhook(webhookId);
      alert('Evento de teste enviado! Verifique o endpoint.');
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
    }
  };

  const handleToggle = async (webhook: any) => {
    try {
      await materialWebhookService.updateWebhook(webhook.id, {
        isActive: !webhook.isActive
      });
      await loadWebhooks();
    } catch (error) {
      console.error('Erro ao atualizar webhook:', error);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('Tem certeza que deseja deletar este webhook?')) return;

    try {
      await materialWebhookService.deleteWebhook(webhookId);
      await loadWebhooks();
    } catch (error) {
      console.error('Erro ao deletar webhook:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Webhook className="w-7 h-7 text-emerald-600" />
          Gerenciador de Webhooks
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Webhook
        </button>
      </div>

      {/* Lista de Webhooks */}
      <div className="grid grid-cols-1 gap-6">
        {webhooks.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Nenhum webhook configurado</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Criar Primeiro Webhook
            </button>
          </div>
        ) : (
          webhooks.map(webhook => {
            const stats = statistics[webhook.id];
            
            return (
              <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {webhook.url}
                      </h3>
                      {webhook.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Pause className="w-3 h-3" />
                          Pausado
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {webhook.events.map((event: string) => (
                        <span
                          key={event}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    {webhook.secret && (
                      <p className="text-sm text-gray-500">
                        🔒 Autenticação configurada
                      </p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTest(webhook.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Testar"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleToggle(webhook)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={webhook.isActive ? 'Pausar' : 'Ativar'}
                    >
                      {webhook.isActive ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Estatísticas */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</div>
                      <div className="text-sm text-gray-600">Total de Entregas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-5 h-5" />
                        {stats.successfulDeliveries}
                      </div>
                      <div className="text-sm text-gray-600">Sucesso</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
                        <XCircle className="w-5 h-5" />
                        {stats.failedDeliveries}
                      </div>
                      <div className="text-sm text-gray-600">Falhas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.successRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Adicionar */}
      {showAddModal && (
        <AddWebhookModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadWebhooks();
          }}
        />
      )}
    </div>
  );
};

interface AddWebhookModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddWebhookModal: React.FC<AddWebhookModalProps> = ({ onClose, onSuccess }) => {
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const availableEvents = [
    'material.created',
    'material.updated',
    'material.deleted',
    'material.published',
    'comment.created',
    'collaborator.added',
    'version.created',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await materialWebhookService.registerWebhook(
        url,
        selectedEvents as any[],
        secret || undefined,
        'current-user-id'
      );
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'Erro ao criar webhook');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Novo Webhook</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Webhook *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://seu-dominio.com/webhook"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret (Opcional)
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Chave secreta para assinatura"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Usado para validar a autenticidade das requisições
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eventos *
            </label>
            <div className="space-y-2">
              {availableEvents.map(event => (
                <label key={event} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents([...selectedEvents, event]);
                      } else {
                        setSelectedEvents(selectedEvents.filter(e => e !== event));
                      }
                    }}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!url || selectedEvents.length === 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Criar Webhook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebhookManager;

