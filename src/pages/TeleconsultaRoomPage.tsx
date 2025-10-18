import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { JitsiMeeting } from '../components/teleconsulta/JitsiMeeting';
import { supabase } from '../../lib/supabaseClient';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Loader2, AlertCircle, Video } from 'lucide-react';

interface TeleconsultaData {
  id: string;
  room_name: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  patient_id: string;
  therapist_id: string;
  moderator_password?: string;
  participant_password?: string;
  patient: {
    full_name: string;
    email: string;
  };
  therapist: {
    full_name: string;
    email: string;
  };
}

export default function TeleconsultaRoomPage() {
  const { teleconsultaId } = useParams<{ teleconsultaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { showToast } = useToast();

  const [teleconsulta, setTeleconsulta] = useState<TeleconsultaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'moderator' | 'participant'>('participant');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  // Buscar dados da teleconsulta
  useEffect(() => {
    const fetchTeleconsulta = async () => {
      if (!teleconsultaId || !user) {
        setError('ID da teleconsulta ou usuário não encontrado.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('teleconsultas')
          .select(`
            *,
            patient:users!patient_id(full_name, email),
            therapist:users!therapist_id(full_name, email)
          `)
          .eq('id', teleconsultaId)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          throw new Error('Teleconsulta não encontrada.');
        }

        // Verificar se o usuário tem permissão
        if (data.patient_id !== user.id && data.therapist_id !== user.id) {
          throw new Error('Você não tem permissão para acessar esta teleconsulta.');
        }

        // Verificar status
        if (data.status === 'cancelled') {
          throw new Error('Esta teleconsulta foi cancelada.');
        }

        if (data.status === 'completed') {
          throw new Error('Esta teleconsulta já foi concluída.');
        }

        // Determinar role do usuário
        const isTherapist = data.therapist_id === user.id;
        setUserRole(isTherapist ? 'moderator' : 'participant');

        setTeleconsulta(data);
        setLoading(false);

        // Marcar entrada na teleconsulta
        await supabase.rpc('start_teleconsulta', {
          p_teleconsulta_id: teleconsultaId,
          p_user_id: user.id,
          p_user_type: isTherapist ? 'therapist' : 'patient',
        });
      } catch (err: any) {
        console.error('Erro ao buscar teleconsulta:', err);
        setError(err.message || 'Erro ao carregar teleconsulta.');
        setLoading(false);
      }
    };

    fetchTeleconsulta();
  }, [teleconsultaId, user]);

  // Handler para fim da reunião
  const handleMeetingEnd = useCallback(async () => {
    if (!teleconsulta || !user) return;

    try {
      // Se for terapeuta, finalizar oficialmente
      if (userRole === 'moderator') {
        await supabase.rpc('end_teleconsulta', {
          p_teleconsulta_id: teleconsulta.id,
          p_connection_quality: connectionQuality,
        });

        showToast('Teleconsulta finalizada com sucesso!', 'success');
      }

      // Navegar de volta
      navigate('/teleconsultas', { replace: true });
    } catch (err) {
      console.error('Erro ao finalizar teleconsulta:', err);
      showToast('Erro ao finalizar teleconsulta.', 'error');
    }
  }, [teleconsulta, user, userRole, connectionQuality, navigate, showToast]);

  const handleParticipantJoined = useCallback((participantId: string) => {
    console.log('Participante entrou:', participantId);
    showToast('Participante entrou na chamada', 'info');
  }, [showToast]);

  const handleParticipantLeft = useCallback((participantId: string) => {
    console.log('Participante saiu:', participantId);
    showToast('Participante saiu da chamada', 'info');
  }, [showToast]);

  const handleConnectionQualityChanged = useCallback(
    (quality: 'excellent' | 'good' | 'fair' | 'poor') => {
      setConnectionQuality(quality);

      // Alertar se conexão estiver ruim
      if (quality === 'poor') {
        showToast('Qualidade de conexão ruim. Verifique sua internet.', 'warning');
      }
    },
    [showToast]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-sky-500" />
          <p className="text-white">Carregando teleconsulta...</p>
        </div>
      </div>
    );
  }

  if (error || !teleconsulta) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="max-w-md rounded-lg bg-slate-800 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-white">Erro</h2>
          <p className="mb-6 text-slate-300">{error || 'Teleconsulta não encontrada.'}</p>
          <button
            onClick={() => navigate('/teleconsultas')}
            className="rounded-lg bg-sky-600 px-6 py-2 text-white hover:bg-sky-700"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    userRole === 'moderator'
      ? teleconsulta.therapist.full_name
      : teleconsulta.patient.full_name;

  const userEmail =
    userRole === 'moderator'
      ? teleconsulta.therapist.email
      : teleconsulta.patient.email;

  const password =
    userRole === 'moderator'
      ? teleconsulta.moderator_password
      : teleconsulta.participant_password;

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Header Info */}
      <div className="absolute left-4 top-4 z-10 rounded-lg bg-slate-800/90 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Video className="h-5 w-5 text-sky-500" />
          <div>
            <p className="text-sm font-semibold text-white">
              {userRole === 'moderator' ? 'Teleconsulta com' : 'Teleconsulta'}
            </p>
            <p className="text-xs text-slate-300">
              {userRole === 'moderator'
                ? teleconsulta.patient.full_name
                : `Dr(a). ${teleconsulta.therapist.full_name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Connection Quality Indicator */}
      <div className="absolute right-4 top-4 z-10 rounded-lg bg-slate-800/90 p-2 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              connectionQuality === 'excellent'
                ? 'bg-green-500'
                : connectionQuality === 'good'
                ? 'bg-yellow-500'
                : connectionQuality === 'fair'
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-white capitalize">{connectionQuality}</span>
        </div>
      </div>

      {/* Jitsi Meeting */}
      <JitsiMeeting
        roomName={teleconsulta.room_name}
        displayName={displayName}
        userEmail={userEmail}
        userRole={userRole}
        password={password}
        onMeetingEnd={handleMeetingEnd}
        onParticipantJoined={handleParticipantJoined}
        onParticipantLeft={handleParticipantLeft}
        onConnectionQualityChanged={handleConnectionQualityChanged}
      />
    </div>
  );
}
