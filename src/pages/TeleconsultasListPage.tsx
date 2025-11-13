import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/contexts/ToastContext';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/card'
import Button from '../components/ui/button'
import StatsCard from '../components/ui/StatsCard'
import Section from '../components/layout/Section'
import { H1, H2, Body, Small } from '../components/ui/Typography'
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
  Users,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type TeleconsultaStatus = 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

interface Teleconsulta {
  id: string
  room_name: string
  scheduled_start: string
  scheduled_end: string
  status: TeleconsultaStatus
  patient_name: string
  therapist_name: string
  duration_minutes: number | null
  patient_rating: number | null
}

interface SupabaseTeleconsultaRecord {
  id?: string | null
  room_name?: string | null
  scheduled_start?: string | null
  scheduled_end?: string | null
  status?: string | null
  patient_name?: string | null
  therapist_name?: string | null
  duration_minutes?: number | null
  patient_rating?: number | null
}

const sanitizeTeleconsultaStatus = (status: string | null | undefined): TeleconsultaStatus => {
  const validStatuses: TeleconsultaStatus[] = [
    'scheduled',
    'waiting',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
  ]
  return validStatuses.includes(status as TeleconsultaStatus) ? (status as TeleconsultaStatus) : 'scheduled'
}

const mapSupabaseTeleconsulta = (row: SupabaseTeleconsultaRecord): Teleconsulta => ({
  id: row.id ?? '',
  room_name: row.room_name ?? '',
  scheduled_start: row.scheduled_start ?? new Date().toISOString(),
  scheduled_end: row.scheduled_end ?? new Date().toISOString(),
  status: sanitizeTeleconsultaStatus(row.status),
  patient_name: row.patient_name ?? 'Paciente',
  therapist_name: row.therapist_name ?? 'Profissional',
  duration_minutes: row.duration_minutes ?? null,
  patient_rating: row.patient_rating ?? null,
})

const statusConfig: Record<
  TeleconsultaStatus,
  { label: string; color: string; icon: typeof Calendar }
> = {
  scheduled: { label: 'Agendada', color: 'bg-info-light text-info', icon: Calendar },
  waiting: { label: 'Aguardando', color: 'bg-warning-light text-warning', icon: Clock },
  in_progress: { label: 'Em Andamento', color: 'bg-success-light text-success', icon: Video },
  completed: { label: 'Concluída', color: 'bg-neutral-bgAlt text-neutral-text', icon: Check },
  cancelled: { label: 'Cancelada', color: 'bg-error-light text-error', icon: X },
  no_show: { label: 'Não Compareceu', color: 'bg-accent-orange-light text-accent-orange', icon: X },
}

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
        const statusFilter: TeleconsultaStatus[] | null =
          filter === 'upcoming'
            ? ['scheduled', 'waiting', 'in_progress']
            : filter === 'completed'
            ? ['completed', 'cancelled', 'no_show']
            : null

        const statusFilterParam: string[] | null = statusFilter ?? null

        const { data, error } = await supabase.rpc('get_user_teleconsultas', {
          p_user_id: user.id,
          p_status: statusFilterParam,
          p_limit: 50,
        })

        if (error) throw error;

        const normalizedData = ((data ?? []) as SupabaseTeleconsultaRecord[]).map(mapSupabaseTeleconsulta)

        const filteredData = statusFilter
          ? normalizedData.filter(teleconsulta => statusFilter.includes(teleconsulta.status))
          : normalizedData

        setTeleconsultas(filteredData)
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
      <Section variant="white" paddingY="5xl">
        <div className="flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Section>
    );
  }

  // Calcular estatísticas
  const stats = {
    total: teleconsultas.length,
    upcoming: teleconsultas.filter(t => ['scheduled', 'waiting', 'in_progress'].includes(t.status)).length,
    completed: teleconsultas.filter(t => t.status === 'completed').length,
    cancelled: teleconsultas.filter(t => ['cancelled', 'no_show'].includes(t.status)).length,
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <Section variant="white" paddingY="lg">
        <div className="flex items-center justify-between">
          <div>
            <H1>Teleconsultas</H1>
            <Body className="text-neutral-textSecondary mt-sm">
              Gerencie suas consultas online com facilidade
            </Body>
          </div>
          {user?.role === 'therapist' && (
            <Button
              variant="primary"
              size="lg"
              icon={<Plus size={20} />}
              onClick={() => navigate('/teleconsultas/new')}
            >
              Nova Teleconsulta
            </Button>
          )}
        </div>
      </Section>

      {/* Stats Section */}
      <Section variant="gray" paddingY="lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-xl">
          <StatsCard
            title="Total"
            value={stats.total}
            icon={Video}
            variant="primary"
            comparison={`${stats.upcoming} agendadas`}
            comparisonType="neutral"
          />
          <StatsCard
            title="Próximas"
            value={stats.upcoming}
            icon={Calendar}
            variant="info"
            comparison="Aguardando"
            comparisonType="neutral"
          />
          <StatsCard
            title="Concluídas"
            value={stats.completed}
            icon={CheckCircle2}
            variant="success"
            comparison="Finalizadas"
            comparisonType="positive"
          />
          <StatsCard
            title="Canceladas"
            value={stats.cancelled}
            icon={X}
            variant="error"
            comparison="Não realizadas"
            comparisonType="neutral"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-md">
          <Button
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            size="md"
            onClick={() => setFilter('upcoming')}
          >
            Próximas
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="md"
            onClick={() => setFilter('completed')}
          >
            Concluídas
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="md"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
        </div>
      </Section>

      {/* Lista de Teleconsultas */}
      <Section variant="white" paddingY="lg">
        {teleconsultas.length === 0 ? (
          <Card className="text-center py-5xl">
            <CardContent>
              <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-lg">
                <Video className="h-10 w-10 text-primary" />
              </div>
              <H2 className="text-h3 mb-sm">Nenhuma teleconsulta encontrada</H2>
              <Body className="text-neutral-textSecondary mb-lg">
                {filter === 'upcoming'
                  ? 'Você não tem teleconsultas agendadas no momento.'
                  : 'Nenhuma teleconsulta encontrada nesta categoria.'}
              </Body>
              {user?.role === 'therapist' && filter === 'upcoming' && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Plus size={20} />}
                  onClick={() => navigate('/teleconsultas/new')}
                >
                  Agendar Primeira Teleconsulta
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-lg">
            {teleconsultas.map((teleconsulta) => {
              const StatusIcon = statusConfig[teleconsulta.status].icon;
              const isJoinable = canJoin(teleconsulta);
              const isCancellable = canCancel(teleconsulta);

              return (
                <Card key={teleconsulta.id} hoverable>
                  <CardContent className="p-lg">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-lg">
                      <div className="flex-1 space-y-md">
                        {/* Status Badge */}
                        <div className="flex items-center gap-md flex-wrap">
                          <span
                            className={`inline-flex items-center gap-sm rounded-full px-md py-xs text-small font-medium ${
                              statusConfig[teleconsulta.status].color
                            }`}
                          >
                            <StatusIcon className="h-4 w-4" />
                            {statusConfig[teleconsulta.status].label}
                          </span>

                          {teleconsulta.status === 'in_progress' && (
                            <span className="flex items-center gap-sm text-small text-error">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-error" />
                              <Small className="font-medium">Ao Vivo</Small>
                            </span>
                          )}
                        </div>

                        {/* Participantes */}
                        <div className="space-y-sm">
                          <div className="flex items-center gap-sm">
                            <User className="h-4 w-4 text-neutral-textTertiary" />
                            <Body className="font-medium">{teleconsulta.patient_name}</Body>
                            <Small className="text-neutral-textTertiary">•</Small>
                            <Small className="text-neutral-textSecondary">
                              Dr(a). {teleconsulta.therapist_name}
                            </Small>
                          </div>

                          {/* Data e Hora */}
                          <div className="flex items-center gap-lg flex-wrap">
                            <div className="flex items-center gap-sm">
                              <Calendar className="h-4 w-4 text-neutral-textTertiary" />
                              <Small className="text-neutral-textSecondary">
                                {format(new Date(teleconsulta.scheduled_start), "dd 'de' MMMM", {
                                  locale: ptBR,
                                })}
                              </Small>
                            </div>
                            <div className="flex items-center gap-sm">
                              <Clock className="h-4 w-4 text-neutral-textTertiary" />
                              <Small className="text-neutral-textSecondary">
                                {format(new Date(teleconsulta.scheduled_start), 'HH:mm')} -{' '}
                                {format(new Date(teleconsulta.scheduled_end), 'HH:mm')}
                              </Small>
                            </div>
                            {teleconsulta.duration_minutes && (
                              <Small className="text-neutral-textTertiary">
                                ({teleconsulta.duration_minutes} min)
                              </Small>
                            )}
                          </div>

                          {/* Rating */}
                          {teleconsulta.patient_rating && (
                            <div className="flex items-center gap-xs">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < teleconsulta.patient_rating!
                                      ? 'text-warning'
                                      : 'text-neutral-border'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-md flex-wrap md:flex-col md:min-w-[150px]">
                        {isJoinable && (
                          <Button
                            variant="secondary"
                            size="md"
                            icon={<Video size={16} />}
                            onClick={() => handleJoinMeeting(teleconsulta.id)}
                            className="flex-1 md:flex-initial"
                          >
                            Entrar
                          </Button>
                        )}

                        {isCancellable && (
                          <Button
                            variant="outline"
                            size="md"
                            icon={<X size={16} />}
                            onClick={() => handleCancelTeleconsulta(teleconsulta.id)}
                            className="flex-1 md:flex-initial border-error text-error hover:bg-error-light"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
