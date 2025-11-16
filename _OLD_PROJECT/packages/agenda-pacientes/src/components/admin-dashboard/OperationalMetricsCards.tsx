import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserCheck, UserX, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';

interface OperationalMetrics {
  activePatients: number;
  inactivePatients: number;
  abandonmentRate: number;
  averageSessionsUntilDischarge: number;
}

interface OperationalMetricsCardsProps {
  data: OperationalMetrics;
  isLoading?: boolean;
}

const OperationalMetricsCards: React.FC<OperationalMetricsCardsProps> = ({ data, isLoading = false }) => {
  const totalPatients = data.activePatients + data.inactivePatients;
  const activePercentage = Math.round((data.activePatients / totalPatients) * 100);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pacientes Ativos</CardTitle>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {data.activePatients}
          </div>
          <div className="text-sm text-slate-500 mb-2">
            {activePercentage}% do total de pacientes
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${activePercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pacientes Inativos</CardTitle>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <UserX className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {data.inactivePatients}
          </div>
          <div className="text-sm text-slate-500">
            Sem sessões há 30+ dias
          </div>
          <div className="mt-2 flex items-center text-xs">
            <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
            <span className="text-red-600">Necessita atenção</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Taxa de Abandono</CardTitle>
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-yellow-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {data.abandonmentRate}%
          </div>
          <div className="text-sm text-slate-500 mb-2">
            Pacientes que abandonaram o tratamento
          </div>
          <div className="flex items-center text-xs">
            {data.abandonmentRate > 15 ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-600">Acima da meta (15%)</span>
              </>
            ) : data.abandonmentRate > 10 ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-yellow-600">Próximo da meta</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600">Dentro da meta</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Média Sessões p/ Alta</CardTitle>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {data.averageSessionsUntilDischarge}
          </div>
          <div className="text-sm text-slate-500">
            sessões até alta médica
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Média histórica da clínica
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationalMetricsCards;
