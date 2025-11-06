import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Minus, AlertCircle, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { RatingChart } from './RatingChart';
import * as ratingService from '../../services/ratingService';
import { SessionRating, RatingStats } from '../../services/ratingService';
import { getEmojiForValue, getEmojiForAverage } from '../feedback/EmojiRating';

interface RatingHistoryProps {
  patientId: string;
  maxRecentSessions?: number;
}

export function RatingHistory({ 
  patientId, 
  maxRecentSessions = 5 
}: RatingHistoryProps) {
  const [ratings, setRatings] = useState<SessionRating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [ratingsData, statsData] = await Promise.all([
        ratingService.getRatings(patientId),
        ratingService.getStats(patientId),
      ]);
      
      setRatings(ratingsData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar histórico de avaliações:', err);
      setError('Não foi possível carregar o histórico de avaliações');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats || ratings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 font-medium mb-2">
            Nenhuma avaliação registrada ainda
          </p>
          <p className="text-sm text-gray-500">
            As avaliações das sessões aparecerão aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  const patientAvg = stats.avgPatientRating;
  const professionalAvg = stats.avgProfessionalRating;

  return (
    <div className="space-y-6">
      {/* Cards de Médias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Média do Paciente */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">
              Média do Paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {patientAvg > 0 ? (
              <>
                <p className="text-6xl mb-2">{getEmojiForAverage(patientAvg)}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {patientAvg.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.totalSessions} {stats.totalSessions === 1 ? 'sessão' : 'sessões'}
                </p>
              </>
            ) : (
              <p className="text-gray-400 py-4">Sem avaliações</p>
            )}
          </CardContent>
        </Card>

        {/* Média do Profissional */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">
              Média do Profissional
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {professionalAvg > 0 ? (
              <>
                <p className="text-6xl mb-2">{getEmojiForAverage(professionalAvg)}</p>
                <p className="text-3xl font-bold text-green-600">
                  {professionalAvg.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.totalSessions} {stats.totalSessions === 1 ? 'sessão' : 'sessões'}
                </p>
              </>
            ) : (
              <p className="text-gray-400 py-4">Sem avaliações</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.positiveSessions}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Sessões Positivas
              </p>
              <p className="text-xs text-gray-500">(≥ 4)</p>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.totalSessions - stats.positiveSessions - stats.negativeSessions}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Sessões Neutras
              </p>
              <p className="text-xs text-gray-500">(3)</p>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {stats.negativeSessions}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Sessões Negativas
              </p>
              <p className="text-xs text-gray-500">(≤ 2)</p>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {stats.sessionsWithComments}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Com Comentários
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução das Avaliações</CardTitle>
          <CardDescription>
            Acompanhe a tendência ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RatingChart ratings={ratings} height={280} />
        </CardContent>
      </Card>

      {/* Lista de Últimas Sessões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas Sessões</CardTitle>
          <CardDescription>
            {maxRecentSessions} sessões mais recentes com avaliações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratings.slice(0, maxRecentSessions).map((rating) => (
              <div
                key={rating.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(rating.sessionDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  
                  {rating.rating_comment && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                      <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <p className="flex-1">{rating.rating_comment}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 ml-4">
                  {rating.patient_rating && (
                    <div className="text-center">
                      <p className="text-3xl mb-1">
                        {getEmojiForValue(rating.patient_rating)}
                      </p>
                      <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                        Paciente
                      </Badge>
                    </div>
                  )}
                  
                  {rating.professional_rating && (
                    <div className="text-center">
                      <p className="text-3xl mb-1">
                        {getEmojiForValue(rating.professional_rating)}
                      </p>
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                        Profissional
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {ratings.length > maxRecentSessions && (
            <p className="text-center text-sm text-gray-500 mt-4">
              + {ratings.length - maxRecentSessions} {ratings.length - maxRecentSessions === 1 ? 'sessão anterior' : 'sessões anteriores'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente compacto para uso em outras páginas
export function RatingHistoryCompact({ patientId }: { patientId: string }) {
  return <RatingHistory patientId={patientId} maxRecentSessions={3} />;
}

