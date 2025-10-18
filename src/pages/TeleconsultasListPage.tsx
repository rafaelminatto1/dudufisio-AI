import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Video,
  Calendar,
  Clock,
  Plus,
  Check,
  X,
  Loader2,
  ExternalLink,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Teleconsulta {
  id: string;
  room_name: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  patient_name: string;
  therapist_name: string;
  duration_minutes: number | null;
  patient_rating: number | null;
}

const statusConfig = {
  scheduled: { label: 'Agendada', color: 'bg-blue-100 text-blue-800', icon: Calendar },
  waiting: { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { label: 'Em Andamento', color: 'bg-green-100 text-green-800', icon: Video },
  completed: { label: 'Concluída', color: 'bg-gray-100 text-gray-800', icon: Check },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: X },
  no_show: { label: 'Não Compareceu', color: 'bg-orange-100 text-orange-800', icon: X },
};

export default function TeleconsultasListPage() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { showToast } = useToast();

  const [teleconsultas, setTeleconsultas] = useState<Teleconsulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  // Buscar teleconsultas
  useEffect(() => {
    const fetchTeleconsultas = async () => {
      if (!user) return;

      try {
        const statusFilter =
          filter === 'upcoming'
            ? ['scheduled', 'waiting', 'in_progress']
            : filter === 'completed'
            ? ['completed', 'cancelled', 'no_show']
            : null;

        const { data, error } = await supabase.rpc('get_user_teleconsultas', {
          p_user_id: user.id,
          p_status: statusFilter ? null : null,
          p_limit: 50,
        });

        if (error) throw error;

        // Filtrar no cliente se necessário
        let filteredData = data || [];
        if (statusFilter) {
          filteredData = filteredData.filter((t: Teleconsulta) =>
            statusFilter.includes(t.status)
          );
        }

        setTeleconsultas(filteredData);
      } catch (err) {
        console.error('Erro ao buscar teleconsultas:', err);
        showToast('Erro ao carregar teleconsultas.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTeleconsultas();
  }, [user, filter, showToast]);

  const handleJoinMeeting = (teleconsultaId: string) => {
    navigate(`/teleconsulta/${teleconsultaId}`);
  };

  const handleCancelTeleconsulta = async (teleconsultaId: string) => {
    if (!user) return;

    const confirmed = window.confirm('Tem certeza que deseja cancelar esta teleconsulta?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.rpc('cancel_teleconsulta', {
        p_teleconsulta_id: teleconsultaId,
        p_user_id: user.id,
        p_reason: 'Cancelado pelo usuário',
      });

      if (error) throw error;

      showToast('Teleconsulta cancelada com sucesso!', 'success');

      // Atualizar lista
      setTeleconsultas((prev) =>
        prev.map((t) =>
          t.id === teleconsultaId ? { ...t, status: 'cancelled' as const } : t
        )
      );
    } catch (err) {
      console.error('Erro ao cancelar teleconsulta:', err);
      showToast('Erro ao cancelar teleconsulta.', 'error');
    }
  };

  const canJoin = (teleconsulta: Teleconsulta) => {
    const now = new Date();
    const scheduledStart = new Date(teleconsulta.scheduled_start);
    const scheduledEnd = new Date(teleconsulta.scheduled_end);

    // Permitir entrar 15 minutos antes até o horário de fim
    const fifteenMinBefore = new Date(scheduledStart.getTime() - 15 * 60 * 1000);

    return (
      teleconsulta.status !== 'cancelled' &&
      teleconsulta.status !== 'completed' &&
      teleconsulta.status !== 'no_show' &&
      now >= fifteenMinBefore &&
      now <= scheduledEnd
    );
  };

  const canCancel = (teleconsulta: Teleconsulta) => {
    return teleconsulta.status === 'scheduled' || teleconsulta.status === 'waiting';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Teleconsultas</h1>
              <p className="mt-1 text-slate-600">Gerencie suas consultas online</p>
            </div>
            {user?.role === 'therapist' && (
              <button
                onClick={() => navigate('/teleconsultas/new')}
                className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
              >
                <Plus className="h-5 w-5" />
                Nova Teleconsulta
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Concluídas
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todas
            </button>
          </div>
        </div>

        {/* Lista de Teleconsultas */}
        {teleconsultas.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <Video className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Nenhuma teleconsulta encontrada
            </h3>
            <p className="text-slate-600">
              {filter === 'upcoming'
                ? 'Você não tem teleconsultas agendadas.'
                : 'Nenhuma teleconsulta encontrada nesta categoria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {teleconsultas.map((teleconsulta) => {
              const StatusIcon = statusConfig[teleconsulta.status].icon;
              const isJoinable = canJoin(teleconsulta);
              const isCancellable = canCancel(teleconsulta);

              return (
                <div
                  key={teleconsulta.id}
                  className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status Badge */}
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            statusConfig[teleconsulta.status].color
                          }`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig[teleconsulta.status].label}
                        </span>

                        {teleconsulta.status === 'in_progress' && (
                          <span className="flex items-center gap-1.5 text-xs text-red-600">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
                            Ao Vivo
                          </span>
                        )}
                      </div>

                      {/* Participantes */}
                      <div className="mb-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {teleconsulta.patient_name}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">
                            Dr(a). {teleconsulta.therapist_name}
                          </span>
                        </div>
                      </div>

                      {/* Data e Hora */}
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(teleconsulta.scheduled_start), "dd 'de' MMMM", {
                            locale: ptBR,
                          })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {format(new Date(teleconsulta.scheduled_start), 'HH:mm')} -{' '}
                          {format(new Date(teleconsulta.scheduled_end), 'HH:mm')}
                        </div>
                        {teleconsulta.duration_minutes && (
                          <span className="text-slate-500">
                            ({teleconsulta.duration_minutes} min)
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {teleconsulta.patient_rating && (
                        <div className="mt-2 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < teleconsulta.patient_rating!
                                  ? 'text-yellow-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isJoinable && (
                        <button
                          onClick={() => handleJoinMeeting(teleconsulta.id)}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          <Video className="h-4 w-4" />
                          Entrar
                        </button>
                      )}

                      {isCancellable && (
                        <button
                          onClick={() => handleCancelTeleconsulta(teleconsulta.id)}
                          className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
