import React, { useEffect, useState } from 'react';
import { useSupabasePatients } from '../../hooks/supabase/useSupabasePatients';
import { useSupabaseAppointments } from '../../hooks/supabase/useSupabaseAppointments';
import { subscriptions } from '../../services/supabase/realtimeService';
import { useAuth } from "../contexts/AppContext"';
import { Loader2, AlertCircle, CheckCircle, Users, Calendar, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Componente de exemplo mostrando a integração completa com Supabase
 * Demonstra:
 * - Autenticação
 * - CRUD operations
 * - Real-time updates
 * - Loading states
 * - Error handling
 */
export const SupabaseExample: React.FC = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const { patients, loading: patientsLoading, error: patientsError, createPatient } = useSupabasePatients();
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useSupabaseAppointments();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to notifications
    const notificationSub = subscriptions.userNotifications(user.id, (payload) => {
      setNotifications(prev => [payload.new, ...prev]);
      setOperationStatus({
        type: 'info',
        message: 'Nova notificação recebida!',
      });
    });

    // Subscribe to therapist presence
    const presenceSub = subscriptions.therapistPresence(
      user.id,
      { name: profile?.fullName, role: profile?.role },
      {
        onSync: () => {
          setRealtimeStatus('connected');
        },
        onJoin: (event: any) => {
          setOnlineUsers(prev => [...prev, event.newPresences[0].user_id]);
        },
        onLeave: (event: any) => {
          setOnlineUsers(prev => prev.filter(id => id !== event.leftPresences[0].user_id));
        },
      }
    );

    return () => {
      notificationSub.unsubscribe();
      presenceSub.unsubscribe();
    };
  }, [user, profile]);

  // Example: Create a new patient with error handling
  const handleCreatePatient = async () => {
    setOperationStatus({ type: null, message: '' });
    
    try {
      const result = await createPatient({
        full_name: 'Paciente Teste',
        email: `teste${Date.now()}@example.com`,
        phone: '+55 11 98765-4321',
        cpf: `${Date.now()}`.slice(-11),
        birth_date: '1990-01-01',
        gender: 'male',
        address_city: 'São Paulo',
        address_state: 'SP',
      });

      if (result.success) {
        setOperationStatus({
          type: 'success',
          message: 'Paciente criado com sucesso!',
        });
      } else {
        setOperationStatus({
          type: 'error',
          message: result.error || 'Erro ao criar paciente',
        });
      }
    } catch (error) {
      setOperationStatus({
        type: 'error',
        message: 'Erro inesperado ao criar paciente',
      });
    }
  };

  // Loading state component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-600">Carregando...</span>
    </div>
  );

  // Error component
  const ErrorMessage = ({ error }: { error: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">Erro</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    </div>
  );

  // Status message component
  const StatusMessage = () => {
    if (!operationStatus.type) return null;

    const icons = {
      success: <CheckCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      info: <Bell className="w-5 h-5" />,
    };

    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
      <div className={`border rounded-lg p-4 mb-4 flex items-center ${colors[operationStatus.type]}`}>
        {icons[operationStatus.type]}
        <span className="ml-2">{operationStatus.message}</span>
        <button
          onClick={() => setOperationStatus({ type: null, message: '' })}
          className="ml-auto text-sm underline"
        >
          Fechar
        </button>
      </div>
    );
  };

  if (!isAuthenticated()) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Por favor, faça login para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with connection status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Exemplo de Integração Supabase</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="ml-2 text-sm text-gray-600">
                Real-time: {realtimeStatus === 'connected' ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="ml-1 text-sm text-gray-600">{onlineUsers.length} online</span>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="bg-gray-50 rounded p-4">
          <p className="text-sm text-gray-600">
            Logado como: <strong>{profile?.fullName}</strong> ({profile?.role})
          </p>
        </div>
      </div>

      {/* Status messages */}
      <StatusMessage />

      {/* Patients section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pacientes</h2>
            <button
              onClick={handleCreatePatient}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Paciente Teste
            </button>
          </div>
        </div>

        <div className="p-6">
          {patientsLoading ? (
            <LoadingSpinner />
          ) : patientsError ? (
            <ErrorMessage error={patientsError} />
          ) : patients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum paciente encontrado</p>
          ) : (
            <div className="space-y-3">
              {patients.slice(0, 5).map(patient => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{patient.full_name}</p>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      {patient.status}
                    </span>
                  </div>
                </div>
              ))}
              {patients.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  E mais {patients.length - 5} pacientes...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appointments section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Agendamentos de Hoje</h2>
          </div>
        </div>

        <div className="p-6">
          {appointmentsLoading ? (
            <LoadingSpinner />
          ) : appointmentsError ? (
            <ErrorMessage error={appointmentsError} />
          ) : appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum agendamento para hoje</p>
          ) : (
            <div className="space-y-3">
              {appointments.map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(new Date(`${appointment.appointment_date}T${appointment.start_time}`), 'HH:mm', { locale: ptBR })}
                      {' - '}
                      {format(new Date(`${appointment.appointment_date}T${appointment.end_time}`), 'HH:mm', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(appointment as any).patient?.full_name || 'Paciente'}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                      ${appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Notificações em Tempo Real</h2>
            {notifications.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma notificação nova</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(notification.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Technical info */}
      <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Informações Técnicas:</p>
        <ul className="space-y-1">
          <li>• Autenticação via Supabase Auth</li>
          <li>• Dados sincronizados em tempo real</li>
          <li>• Row Level Security (RLS) ativo</li>
          <li>• Tratamento de erros e estados de carregamento</li>
          <li>• Presença online de usuários</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseExample;
