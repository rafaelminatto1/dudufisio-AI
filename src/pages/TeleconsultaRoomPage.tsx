import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { JitsiMeeting } from '../components/teleconsulta/JitsiMeeting';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { H2, Body, Small } from '../components/ui/Typography';
import { Loader2, AlertCircle, Video, ArrowLeft, Wifi, WifiOff } from 'lucide-react';

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
      <div className="flex h-screen items-center justify-center bg-neutral-text">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="flex flex-col items-center justify-center py-5xl">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-lg" />
            <Body className="text-white">Carregando teleconsulta...</Body>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !teleconsulta) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-text p-lg">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="w-16 h-16 bg-error-light rounded-xl flex items-center justify-center mx-auto mb-md">
              <AlertCircle className="h-8 w-8 text-error" />
            </div>
            <H2 className="text-white text-center">Erro ao Acessar</H2>
          </CardHeader>
          <CardContent className="space-y-lg text-center">
            <Body className="text-white/80">{error || 'Teleconsulta não encontrada.'}</Body>
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowLeft size={20} />}
              iconPosition="left"
              onClick={() => navigate('/teleconsultas')}
            >
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
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

  // Configuração de cor para qualidade de conexão
  const connectionQualityConfig = {
    excellent: { color: 'bg-success', textColor: 'text-success', label: 'Excelente', icon: Wifi },
    good: { color: 'bg-info', textColor: 'text-info', label: 'Boa', icon: Wifi },
    fair: { color: 'bg-warning', textColor: 'text-warning', label: 'Regular', icon: Wifi },
    poor: { color: 'bg-error', textColor: 'text-error', label: 'Ruim', icon: WifiOff },
  };

  const qualityConfig = connectionQualityConfig[connectionQuality];
  const QualityIcon = qualityConfig.icon;

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Header Info - Monday.com Style */}
      <div className="absolute left-lg top-lg z-10">
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-cardHover">
          <CardContent className="p-md">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Small className="font-semibold text-neutral-text block">
                  {userRole === 'moderator' ? 'Teleconsulta com' : 'Teleconsulta'}
                </Small>
                <Small className="text-neutral-textSecondary">
                  {userRole === 'moderator'
                    ? teleconsulta.patient.full_name
                    : `Dr(a). ${teleconsulta.therapist.full_name}`}
                </Small>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Quality Indicator - Monday.com Style */}
      <div className="absolute right-lg top-lg z-10">
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-cardHover">
          <CardContent className="p-md">
            <div className="flex items-center gap-sm">
              <div className={`w-3 h-3 rounded-full ${qualityConfig.color} animate-pulse`} />
              <QualityIcon className={`h-4 w-4 ${qualityConfig.textColor}`} />
              <Small className="text-neutral-text font-medium">{qualityConfig.label}</Small>
            </div>
          </CardContent>
        </Card>
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
