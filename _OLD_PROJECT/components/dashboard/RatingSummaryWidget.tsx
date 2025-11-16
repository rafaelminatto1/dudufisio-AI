import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronRight,
  AlertCircle,
  Smile 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import * as ratingService from '../../services/ratingService';
import { SessionRating } from '../../services/ratingService';
import { getEmojiForValue, getEmojiForAverage } from '../feedback/EmojiRating';

interface RatingSummaryWidgetProps {
  limit?: number;
  showActions?: boolean;
}

export function RatingSummaryWidget({ 
  limit = 10,
  showActions = true 
}: RatingSummaryWidgetProps) {
  const navigate = useNavigate();
  const [recentRatings, setRecentRatings] = useState<SessionRating[]>([]);
  const [globalAverage, setGlobalAverage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [ratingsData, averageData] = await Promise.all([
        ratingService.getRecentRatings(limit),
        ratingService.getGlobalAverageRating(),
      ]);
      
      setRecentRatings(ratingsData);
      setGlobalAverage(averageData.patient);
    } catch (err) {
      console.error('Erro ao carregar dados de satisfação:', err);
      setError('Não foi possível carregar os dados');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (recentRatings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5" />
            Satisfação dos Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-6xl mb-3">📊</div>
          <p className="text-gray-600 text-sm">
            Nenhuma avaliação registrada ainda
          </p>
          <p className="text-gray-500 text-xs mt-1">
            As avaliações aparecerão aqui após as sessões
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Smile className="h-5 w-5" />
          Satisfação dos Pacientes
        </CardTitle>
        <CardDescription>
          Média das últimas {recentRatings.length} sessões
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Média Geral */}
        <div className="text-center p-6 bg-white rounded-lg border border-blue-200">
          <p className="text-7xl mb-3">{getEmojiForAverage(globalAverage)}</p>
          <p className="text-4xl font-bold text-blue-600 mb-1">
            {globalAverage.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">
            Média geral de satisfação
          </p>
        </div>

        {/* Lista de Avaliações Recentes */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Avaliações Recentes
          </p>
          
          {recentRatings.slice(0, 5).map((rating) => (
            <div
              key={rating.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              onClick={() => {
                if (rating.patientId) {
                  navigate(`/patients/${rating.patientId}`);
                }
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {rating.patientName || 'Paciente'}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(rating.sessionDate), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {rating.patient_rating && (
                  <div className="text-center">
                    <p className="text-2xl">
                      {getEmojiForValue(rating.patient_rating)}
                    </p>
                  </div>
                )}
                
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-100">
          <div className="text-center p-2 bg-white rounded">
            <p className="text-lg font-bold text-green-600">
              {recentRatings.filter(r => r.patient_rating && r.patient_rating >= 4).length}
            </p>
            <p className="text-xs text-gray-600">Positivas</p>
          </div>
          
          <div className="text-center p-2 bg-white rounded">
            <p className="text-lg font-bold text-yellow-600">
              {recentRatings.filter(r => r.patient_rating === 3).length}
            </p>
            <p className="text-xs text-gray-600">Neutras</p>
          </div>
          
          <div className="text-center p-2 bg-white rounded">
            <p className="text-lg font-bold text-red-600">
              {recentRatings.filter(r => r.patient_rating && r.patient_rating <= 2).length}
            </p>
            <p className="text-xs text-gray-600">Negativas</p>
          </div>
        </div>

        {/* Ação */}
        {showActions && (
          <Button
            variant="outline"
            className="w-full border-blue-200 hover:bg-blue-100 text-blue-700"
            onClick={() => navigate('/relatorios')}
          >
            Ver Relatório Completo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Variante compacta para uso em espaços menores
export function RatingSummaryWidgetCompact() {
  return <RatingSummaryWidget limit={5} showActions={false} />;
}

